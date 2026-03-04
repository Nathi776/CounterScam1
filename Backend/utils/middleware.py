from __future__ import annotations

import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from utils.structured_logger import build_logger

logger = build_logger()


class RequestIdLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        start = time.perf_counter()
        client_ip = request.client.host if request.client else None
        response = None

        try:
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            duration_ms = int((time.perf_counter() - start) * 1000)
            status_code = getattr(response, "status_code", None)

            logger.info(
                "request",
                extra={
                    "request_id": request_id,
                    "path": request.url.path,
                    "method": request.method,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                    "client_ip": client_ip,
                },
            )
