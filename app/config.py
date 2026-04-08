from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'EduMate API'
    app_env: str = 'development'
    debug: bool = True
    api_v1_prefix: str = '/api/v1'
    secret_key: str = Field(default='dev-secret-key-change-in-production', min_length=16)
    access_token_expire_minutes: int = 120
    database_url: str = 'mysql+pymysql://root:password@localhost:3306/edumate'
    recaptcha_secret_key: str = ''
    allow_test_captcha: bool = True
    cors_origins: List[str] = Field(default_factory=lambda: ['null', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5501', 'http://127.0.0.1:5501'])

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')


@lru_cache
def get_settings() -> Settings:
    return Settings()

