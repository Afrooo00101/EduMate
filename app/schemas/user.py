from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class MajorBase(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    department: str = Field(min_length=2, max_length=150)
    description: Optional[str] = None


class MajorCreate(MajorBase):
    pass


class MajorRead(MajorBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class StudentBase(BaseModel):
    student_code: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    gpa: Optional[float] = Field(default=0.0, ge=0, le=4)
    major_id: Optional[int] = None
    graduation_year: Optional[int] = Field(default=None, ge=2000, le=2100)
    skills_summary: Optional[str] = None
    profile_image_url: Optional[str] = None


class StudentRead(StudentBase):
    id: int
    is_active: bool
    is_admin: bool
    major: Optional[MajorRead] = None
    model_config = ConfigDict(from_attributes=True)


class StudentUpdate(BaseModel):
    student_code: Optional[str] = Field(default=None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    gpa: Optional[float] = Field(default=None, ge=0, le=4)
    major_id: Optional[int] = None
    graduation_year: Optional[int] = Field(default=None, ge=2000, le=2100)
    skills_summary: Optional[str] = None
    profile_image_url: Optional[str] = None


class SkillBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=100)


class SkillCreate(SkillBase):
    pass


class SkillRead(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

