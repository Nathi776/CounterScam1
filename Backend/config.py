from __future__ import annotations

import json
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_json_list(value: str | None, default: List[str]) -> List[str]:
    if value is None:
        return default
    value = value.strip()
    if not value:
        return default
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list) and all(isinstance(x, str) for x in parsed):
            return parsed
    except Exception:
        pass
    # Fallback: comma-separated
    return [v.strip() for v in value.split(",") if v.strip()]


class Settings(BaseSettings):
    """Central app configuration loaded from environment variables.

    In production (Render), set these vars in the dashboard.
    In development, you can use a local .env file.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENV: str = "dev"  # dev|prod

    # Database
    DATABASE_URL: str = "postgresql://counterscam_db_user:8uuSOihc9HqJqjwaV73dwyFwpuWa8LYl@dpg-d6jur0i4d50c73d13gc0-a/counterscam_db"

    # JWT
    JWT_SECRET_KEY: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: str = "[\"http://localhost:3000\"]"  # JSON list or comma-separated

    # Rate limiting
    RATE_LIMIT_DEFAULT: str = "60/minute"

    # Networking / timeouts
    SOCKET_TIMEOUT_SECONDS: float = 5.0

    # Models
    MODEL_DIR: str = "models"
    MODEL_VERSION: str = "v1"

    # Logging
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins_list(self) -> List[str]:
        return _parse_json_list(self.CORS_ORIGINS, ["http://localhost:3000"])

    def require_jwt_secret(self) -> None:
        if self.ENV.lower() == "prod" and not self.JWT_SECRET_KEY:
            raise ValueError("JWT_SECRET_KEY must be set in production")


settings = Settings()
