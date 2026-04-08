from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResumeCreate(BaseModel):
    file_url: str = Field(min_length=3, max_length=500)
    file_name: str = Field(min_length=1, max_length=255)
    ats_score: int | None = Field(default=None, ge=0, le=100)


class ResumeRead(BaseModel):
    id: int
    file_url: str
    file_name: str
    ats_score: int | None
    last_updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ResumeProfileUpsert(BaseModel):
    full_name: str | None = None
    title: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None
    skills: str | None = None
    summary: str | None = None
    template_name: str = 'modern'
    education_json: str | None = None
    experience_json: str | None = None
    projects_json: str | None = None


class ResumeProfileRead(ResumeProfileUpsert):
    id: int
    ats_score: int | None = None
    model_config = ConfigDict(from_attributes=True)


class ResumePreviewRequest(ResumeProfileUpsert):
    pass


class ResumePreviewResponse(BaseModel):
    html: str
    template_name: str


class ATSCheckResponse(BaseModel):
    score: int
    strengths: list[str]
    missing_keywords: list[str]


class RecommendationCreate(BaseModel):
    recommendation_type: str = Field(min_length=2, max_length=50)
    description: str = Field(min_length=2)


class RecommendationRead(BaseModel):
    id: int
    recommendation_type: str
    description: str
    generated_at: datetime
    model_config = ConfigDict(from_attributes=True)
