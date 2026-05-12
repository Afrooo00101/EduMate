import json
from functools import lru_cache
from pathlib import Path
from typing import List


from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'EduMate API'
    app_env: str = 'development'
    debug: bool = True
    api_v1_prefix: str = '/api/v1'
    secret_key: str = Field(min_length=32)
    access_token_expire_minutes: int = 120
    database_url: str = 'mysql+pymysql://root:password@localhost:3306/edumate'
    recaptcha_secret_key: str = ''
    allow_test_captcha: bool = False
    cors_origins: List[str] = Field(default_factory=lambda: ['null', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5501', 'http://127.0.0.1:5501'])
    cors_origin_regex: str = r'^null$|^https?://(localhost|127\.0\.0\.1)(:\d+)?$'

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / '.env'),
        env_file_encoding='utf-8',
        extra='ignore'
    )


    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith('['):
                return json.loads(stripped)
            return [item.strip() for item in stripped.split(',') if item.strip()]
        return value

    @model_validator(mode='after')
    def validate_security_settings(self):
        insecure_defaults = {
            'change-this-secret-key',
            'dev-secret-key-change-in-production',
        }
        if self.secret_key in insecure_defaults:
            raise ValueError('SECRET_KEY must be replaced with a strong random value before starting the API')

        if self.allow_test_captcha and self.app_env.lower() not in {'development', 'dev', 'local'}:
            raise ValueError('ALLOW_TEST_CAPTCHA can only be enabled in a local development environment')

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
