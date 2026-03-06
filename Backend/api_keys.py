from __future__ import annotations

import secrets
from passlib.context import CryptContext
from fastapi import Header, HTTPException, Depends

from database import SessionLocal, ApiKey, ApiUsage

pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _hash(raw: str) -> str:
    return pwd_context.hash(raw)


def _verify(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)


def create_api_key(owner_email: str, plan: str = "free") -> tuple[str, ApiKey]:
    """Returns (raw_key, db_row). Only show raw_key once to the customer."""
    raw = secrets.token_urlsafe(32)
    prefix = raw[:12]
    row = ApiKey(
        key_prefix=prefix,
        key_hash=_hash(raw),
        owner_email=owner_email,
        plan=plan,
        is_active=True,
    )
    return raw, row


def require_api_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    db=Depends(get_db),
) -> ApiKey:
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing X-API-Key header")

    prefix = x_api_key[:12]
    row = db.query(ApiKey).filter(ApiKey.key_prefix == prefix, ApiKey.is_active == True).first()
    if not row or not _verify(x_api_key, row.key_hash):
        raise HTTPException(status_code=401, detail="Invalid API key")

    return row


def record_usage(db, api_key: ApiKey, endpoint: str, method: str, status_code: int | None, units: int = 1) -> None:
    usage = ApiUsage(
        api_key_id=api_key.id,
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        units=units,
    )
    db.add(usage)
    db.commit()
