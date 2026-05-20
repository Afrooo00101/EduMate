from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserRead, StudentRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=3, max_length=128)
    captcha_token: str = Field(default='')


class RegisterRequest(BaseModel):
    student_code: str | None = Field(default=None, min_length=3, max_length=50)
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    major_id: int | None = None
    graduation_year: int | None = None
    skills_summary: str | None = None

    @field_validator('email')
    @classmethod
    def validate_sut_email(cls, value: EmailStr) -> str:
        normalized = str(value).strip().lower()
        if not normalized.endswith('@sut.edu.eg'):
            raise ValueError('email must end with @sut.edu.eg')
        return normalized





class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    expires_in_minutes: int
    user: UserRead


class SocialLoginRequest(BaseModel):
    email: EmailStr
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    provider: str = Field(min_length=2, max_length=50)
    provider_uid: str | None = Field(default=None, max_length=255)
    profile_image_url: str | None = None
    id_token: str | None = None

    @field_validator('email')
    @classmethod
    def validate_social_email(cls, value: EmailStr) -> str:
        normalized = str(value).strip().lower()
        if not normalized.endswith('@sut.edu.eg'):
            raise ValueError('email must end with @sut.edu.eg')
        return normalized
