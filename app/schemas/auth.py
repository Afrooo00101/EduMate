from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import StudentRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    captcha_token: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    student_code: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    major_id: int | None = None
    graduation_year: int | None = None
    skills_summary: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    expires_in_minutes: int
    student: StudentRead
