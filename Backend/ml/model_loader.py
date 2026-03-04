from __future__ import annotations

import os
import joblib
from pathlib import Path
from typing import Any, Tuple

from config import settings
from utils.logger import logger


class ModelLoadError(RuntimeError):
    pass


def _safe_load_joblib(path: Path) -> Any:
    if not path.exists() or not path.is_file():
        raise ModelLoadError(f"Model file not found: {path}")
    # Optional: size guard
    max_mb = 200
    size_mb = path.stat().st_size / (1024 * 1024)
    if size_mb > max_mb:
        raise ModelLoadError(f"Model file too large ({size_mb:.1f}MB): {path}")
    return joblib.load(str(path))


def load_pipelines() -> Tuple[Any, Any, str]:
    """Load URL + message pipelines from a versioned folder.

    Expected structure:
      Backend/models/v1/url_pipeline.pkl
      Backend/models/v1/message_pipeline.pkl
      Backend/models/v1/metadata.json (optional)
    """
    base = Path(__file__).resolve().parent.parent  # Backend/
    model_dir = base / settings.MODEL_DIR / settings.MODEL_VERSION

    url_path = model_dir / "url_pipeline.pkl"
    msg_path = model_dir / "message_pipeline.pkl"

    url_pipe = _safe_load_joblib(url_path)
    msg_pipe = _safe_load_joblib(msg_path)

    version = settings.MODEL_VERSION
    logger.info(f"Models loaded", extra={"model_version": version})

    return url_pipe, msg_pipe, version
