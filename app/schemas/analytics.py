from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsEventCreate(BaseModel):
    event_type: str = Field(min_length=2, max_length=100)
    source: str = Field(default='web', min_length=2, max_length=100)
    payload: str | None = None


class AnalyticsEventRead(BaseModel):
    id: int
    event_type: str
    source: str
    payload: str | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ActivityLogCreate(BaseModel):
    action: str
    text: str


class ActivityLogRead(ActivityLogCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    career_score: int
    skill_growth: int
    learning_time_hours: int
    profile_completion: int


class UpcomingEvent(BaseModel):
    title: str
    date_label: str
    type: str


class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_activity: list[ActivityLogRead]
    upcoming_events: list[UpcomingEvent]
