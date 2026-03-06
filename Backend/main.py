
import os
import socket
from datetime import datetime, timedelta
from collections import Counter

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from sqlalchemy import func, text
from sqlalchemy.exc import SQLAlchemyError

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from database import (
    SessionLocal,
    URLCheck,
    MessageCheck,
    ReportContent,
    User,
    ApiKey,
    ApiUsage,
    init_db,
)
from detection.risk_engine import calculate_risk_score
from detection.message_risk_engine import calculate_message_risk_score
from detection.fraud_monitor import FraudMonitor
from detection.domain_utils import extract_domain

from auth import hash_password, verify_password, create_access_token, require_admin, get_db as _auth_get_db
from api_keys import create_api_key, require_api_key, record_usage
from ml.model_loader import load_pipelines, ModelLoadError

from utils.logger import logger
from utils.middleware import RequestIdLoggingMiddleware


# ---------------- App ----------------

app = FastAPI(title="CounterScam API", version="1.0.0")

# Request ID + structured logs
app.add_middleware(RequestIdLoggingMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key", "X-Request-ID"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


@app.exception_handler(SQLAlchemyError)
def _db_error_handler(request: Request, exc: SQLAlchemyError):
    logger.error("db_error", extra={"path": request.url.path}, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Database error"})


@app.exception_handler(Exception)
def _unhandled_error_handler(request: Request, exc: Exception):
    logger.error("unhandled_error", extra={"path": request.url.path}, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Model loading (versioned) ----------------

URL_PIPE = None
MSG_PIPE = None
MODEL_VERSION = None
MODEL_STATUS = "not_loaded"
MODEL_ERROR = None


@app.on_event("startup")
def _startup() -> None:
    global URL_PIPE, MSG_PIPE, MODEL_VERSION, MODEL_STATUS, MODEL_ERROR

    # Dev convenience only. In prod use Alembic migrations.
    try:
        init_db()
        logger.info("db_init_ok")
    except Exception:
        logger.error("db_init_failed", exc_info=True)

    # Load pipelines (safe loader)
    try:
        URL_PIPE, MSG_PIPE, MODEL_VERSION = load_pipelines()
        MODEL_STATUS = "loaded"
        MODEL_ERROR = None
    except ModelLoadError as e:
        MODEL_STATUS = "error"
        MODEL_ERROR = str(e)
        logger.error(f"model_load_failed: {e}")
    except Exception as e:
        MODEL_STATUS = "error"
        MODEL_ERROR = "Unexpected model load error"
        logger.error("model_load_failed_unexpected", exc_info=True)


# ---------------- Schemas ----------------

class URLRequest(BaseModel):
    url: str


class MessageRequest(BaseModel):
    message: str


class ReportRequest(BaseModel):
    content_type: str
    content: str


class MonitorRequest(BaseModel):
    url: str


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class CreateUserRequest(BaseModel):
    email: str
    password: str
    role: str = "admin"


class CreateApiKeyRequest(BaseModel):
    owner_email: str
    plan: str = "free"


# ---------------- Health / readiness ----------------

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.get("/ready")
def ready(db=Depends(get_db)):
    # DB check
    db.execute(text('SELECT 1'))
    return {"status": "ready"}


@app.get("/model/info")
def model_info():
    return {
        "status": MODEL_STATUS,
        "version": MODEL_VERSION,
        "error": MODEL_ERROR,
        "expected_path": f"Backend/{settings.MODEL_DIR}/{settings.MODEL_VERSION}/(url_pipeline.pkl, message_pipeline.pkl)",
    }


# ---------------- Public API (customer-facing) ----------------

@app.post("/check_url/")
@limiter.limit("30/minute")
def check_url(request: Request, payload: URLRequest, api_key=Depends(require_api_key), db=Depends(get_db)):
    if MODEL_STATUS != "loaded":
        raise HTTPException(status_code=503, detail=f"Model not loaded: {MODEL_ERROR or 'unknown'}")

    try:
        result = calculate_risk_score(payload.url, URL_PIPE)
        flagged = str(result.get("flagged"))
        reason = result.get("reason", "")
        db.add(URLCheck(url=payload.url, flagged=flagged, reason=reason))
        db.commit()

        record_usage(db, api_key, endpoint="/check_url/", method="POST", status_code=200, units=1)
        return {**result, "model_version": MODEL_VERSION}
    except Exception as e:
        record_usage(db, api_key, endpoint="/check_url/", method="POST", status_code=500, units=1)
        raise


@app.post("/check_message/")
@limiter.limit("30/minute")
def check_message(request: Request, payload: MessageRequest, api_key=Depends(require_api_key), db=Depends(get_db)):
    if MODEL_STATUS != "loaded":
        raise HTTPException(status_code=503, detail=f"Model not loaded: {MODEL_ERROR or 'unknown'}")

    try:
        result = calculate_message_risk_score(payload.message, MSG_PIPE)
        flagged = str(result.get("flagged"))
        reason = result.get("reason", "")
        db.add(MessageCheck(message=payload.message, flagged=flagged, reason=reason))
        db.commit()

        record_usage(db, api_key, endpoint="/check_message/", method="POST", status_code=200, units=1)
        return {**result, "model_version": MODEL_VERSION}
    except Exception:
        record_usage(db, api_key, endpoint="/check_message/", method="POST", status_code=500, units=1)
        raise


@app.post("/report/")
@limiter.limit("20/minute")
def report(request: Request, payload: ReportRequest, api_key=Depends(require_api_key), db=Depends(get_db)):
    try:
        db.add(ReportContent(content_type=payload.content_type, content=payload.content))
        db.commit()
        record_usage(db, api_key, endpoint="/report/", method="POST", status_code=200, units=1)
        return {"status": "received"}
    except Exception:
        record_usage(db, api_key, endpoint="/report/", method="POST", status_code=500, units=1)
        raise


@app.post("/monitor/")
@limiter.limit("20/minute")
def monitor(request: Request, payload: MonitorRequest, api_key=Depends(require_api_key), db=Depends(get_db)):
    domain = extract_domain(payload.url)
    monitor = FraudMonitor()
    verdict = monitor.check_domain(domain)
    record_usage(db, api_key, endpoint="/monitor/", method="POST", status_code=200, units=1)
    return verdict


# ---------------- Admin API (dashboard) ----------------
@app.post("/bootstrap-admin")
def bootstrap_admin(db=Depends(get_db)):
    email = "admin@test.com"
    password = "password123"

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return {"status": "exists", "email": email}

    user = User(
        email=email,
        password_hash=hash_password(password),
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.commit()

    return {
        "status": "created",
        "email": email,
        "password": password,
    }


@app.post("/admin/login")
def admin_login(payload: AdminLoginRequest, db=Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.is_active == True).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


@app.post("/admin/users")
def create_user(payload: CreateUserRequest, db=Depends(get_db), _=Depends(require_admin)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    user = User(email=payload.email, password_hash=hash_password(payload.password), role=payload.role, is_active=True)
    db.add(user)
    db.commit()
    return {"status": "created", "email": user.email, "role": user.role}


@app.post("/admin/api-keys")
def admin_create_api_key(payload: CreateApiKeyRequest, db=Depends(get_db), _=Depends(require_admin)):
    raw, row = create_api_key(owner_email=payload.owner_email, plan=payload.plan)
    db.add(row)
    db.commit()
    return {"api_key": raw, "owner_email": row.owner_email, "plan": row.plan, "created_at": row.created_at.isoformat()}


@app.get("/admin/api-keys")
def list_api_keys(db=Depends(get_db), _=Depends(require_admin)):
    rows = db.query(ApiKey).order_by(ApiKey.created_at.desc()).limit(200).all()
    return [
        {
            "id": r.id,
            "key_prefix": r.key_prefix,
            "owner_email": r.owner_email,
            "plan": r.plan,
            "is_active": r.is_active,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@app.get("/admin/usage")
def usage_summary(days: int = 30, db=Depends(get_db), _=Depends(require_admin)):
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(ApiUsage.endpoint, func.count(ApiUsage.id).label("calls"), func.sum(ApiUsage.units).label("units"))
        .filter(ApiUsage.used_at >= since)
        .group_by(ApiUsage.endpoint)
        .all()
    )
    return [{"endpoint": r[0], "calls": int(r[1] or 0), "units": int(r[2] or 0)} for r in rows]


@app.get("/admin/stats")
def get_stats(db=Depends(get_db), _=Depends(require_admin)):
    total_urls = db.query(URLCheck).count()
    total_messages = db.query(MessageCheck).count()
    total_reports = db.query(ReportContent).count()

    flagged_urls = db.query(URLCheck).filter(URLCheck.flagged == "True").count()
    flagged_messages = db.query(MessageCheck).filter(MessageCheck.flagged == "True").count()

    return {
        "total_urls": total_urls,
        "total_messages": total_messages,
        "total_reports": total_reports,
        "flagged_urls": flagged_urls,
        "flagged_messages": flagged_messages,
    }


@app.get("/admin/recent-checks")
def recent_checks(db=Depends(get_db), _=Depends(require_admin)):
    recent_urls = db.query(URLCheck).order_by(URLCheck.checked_at.desc()).limit(10).all()
    recent_msgs = db.query(MessageCheck).order_by(MessageCheck.checked_at.desc()).limit(10).all()

    return {
        "urls": [
            {"url": u.url, "flagged": u.flagged, "reason": u.reason, "checked_at": u.checked_at.isoformat()}
            for u in recent_urls
        ],
        "messages": [
            {"message": m.message, "flagged": m.flagged, "reason": m.reason, "checked_at": m.checked_at.isoformat()}
            for m in recent_msgs
        ],
    }


@app.get("/admin/analytics")
def analytics(db=Depends(get_db), _=Depends(require_admin)):
    # Top reasons
    url_reasons = [r[0] for r in db.query(URLCheck.reason).all() if r and r[0]]
    msg_reasons = [r[0] for r in db.query(MessageCheck.reason).all() if r and r[0]]

    url_counts = Counter(url_reasons).most_common(10)
    msg_counts = Counter(msg_reasons).most_common(10)

    return {
        "url_reason_top": [{"reason": k, "count": v} for k, v in url_counts],
        "message_reason_top": [{"reason": k, "count": v} for k, v in msg_counts],
    }
