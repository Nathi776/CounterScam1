"""Backward-compatible logger.

Existing code imports: from utils.logger import logger
This now emits structured JSON logs to stdout (Render-friendly).
"""

from utils.structured_logger import build_logger

logger = build_logger()
