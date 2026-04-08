from typing import Any

import bleach
from pydantic import BaseModel

SUSPICIOUS_PATTERNS = ('<script', 'javascript:', 'onerror=', 'onload=')


class SuspiciousInputError(ValueError):
    pass


def sanitize_text(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    raw = value.strip()
    lowered = raw.lower()
    if any(pattern in lowered for pattern in SUSPICIOUS_PATTERNS):
        raise SuspiciousInputError('Input contains forbidden script content')
    return bleach.clean(raw, tags=[], attributes={}, strip=True)


def sanitize_model(model: BaseModel) -> BaseModel:
    cleaned = {key: sanitize_text(value) for key, value in model.model_dump().items()}
    return model.__class__(**cleaned)
