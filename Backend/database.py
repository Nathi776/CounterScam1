import os
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

from config import settings


"""Database configuration.

- In production, DATABASE_URL is provided by Render Postgres.
- In development, we fall back to a local SQLite database.
"""

BASE_DIR = os.path.dirname(__file__)
DEFAULT_SQLITE_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "test.db"))

DATABASE_URL = os.getenv("DATABASE_URL") or settings.DATABASE_URL or f"sqlite:///{DEFAULT_SQLITE_PATH}"

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, pool_pre_ping=True, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ---------------- Existing tables ----------------

class URLCheck(Base):
    __tablename__ = "url_checks"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    flagged = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)


class MessageCheck(Base):
    __tablename__ = "message_checks"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    flagged = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)


class ReportContent(Base):
    __tablename__ = "report_contents"
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    reported_at = Column(DateTime, default=datetime.utcnow)


# ---------------- New production tables ----------------

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="admin")  # admin|user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ApiKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True, index=True)
    key_prefix = Column(String(12), index=True, nullable=False)
    key_hash = Column(String(255), nullable=False)
    owner_email = Column(String(255), index=True, nullable=False)
    plan = Column(String(50), default="free")  # free|pro|biz
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usage = relationship("ApiUsage", back_populates="api_key", cascade="all,delete-orphan")


class ApiUsage(Base):
    __tablename__ = "api_usage"
    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), index=True, nullable=False)
    endpoint = Column(String(255), nullable=False)
    method = Column(String(16), nullable=False)
    status_code = Column(Integer, nullable=True)
    units = Column(Integer, default=1)
    used_at = Column(DateTime, default=datetime.utcnow, index=True)

    api_key = relationship("ApiKey", back_populates="usage")


def init_db() -> None:
    """Dev convenience only. In production, use Alembic migrations."""
    Base.metadata.create_all(bind=engine)
