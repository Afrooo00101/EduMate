from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class InternshipBase(BaseModel):
    company_name: str = Field(min_length=2, max_length=150)
    position: str = Field(min_length=2, max_length=150)
    description: str | None = None
    location: str | None = None
    work_mode: str | None = Field(default='hybrid', max_length=50)
    application_deadline: date | None = None
    is_active: bool = True


class InternshipCreate(InternshipBase):
    pass


class InternshipRead(InternshipBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class InternshipApplicationCreate(BaseModel):
    internship_id: int
    application_date: date


class InternshipApplicationRead(BaseModel):
    id: int
    status: str
    application_date: date
    internship: InternshipRead
    model_config = ConfigDict(from_attributes=True)


class SavedInternshipCreate(BaseModel):
    title: str
    company_name: str
    position_code: str | None = None
    match_score: int | None = None
    match_reason: str | None = None
    salary: str | None = None
    apply_url: str | None = None
    status: str = 'saved'


class SavedInternshipUpdate(BaseModel):
    status: str


class SavedInternshipRead(SavedInternshipCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
