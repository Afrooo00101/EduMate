import json
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the .env path relative to this file so it's always found
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "EduMate API"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # لازم 32 حرف على الأقل
    secret_key: str = "12345678901234567890123456789012"

    access_token_expire_minutes: int = 120

    # ✅ DATABASE CONNECTION (FIXED)
    database_url: str = "mysql+pymysql://root:1234@127.0.0.1:3306/edumate"
    create_database_schema: bool = False

    recaptcha_secret_key: str = ""
    allow_test_captcha: bool = True

    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "null",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:5501",
            "http://127.0.0.1:5501",
        ]
    )

    cors_origin_regex: str = r"^null$|^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                return json.loads(stripped)
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return value

    @model_validator(mode="after")
    def validate_security_settings(self):
        insecure_defaults = {
            "change-this-secret-key",
            "dev-secret-key-change-in-production",
        }

        if self.secret_key in insecure_defaults:
            raise ValueError(
                "SECRET_KEY must be replaced with a strong random value"
            )

        if self.allow_test_captcha and self.app_env.lower() not in {
            "development",
            "dev",
            "local",
        }:
            raise ValueError(
                "ALLOW_TEST_CAPTCHA only allowed in development"
            )

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
