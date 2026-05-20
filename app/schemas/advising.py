"""
Pydantic schemas for the Academic Advising Appointment Scheduling system.
"""
from datetime import date, datetime, time
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


# ─────────────────────────────────────────
#  ADVISOR SLOT
# ─────────────────────────────────────────

class AdvisorSlotCreate(BaseModel):
    day_of_week: str = Field(..., description="Sunday / Monday / Tuesday / Wednesday / Thursday")
    start_time: str = Field(..., description="HH:MM  e.g. 08:00")
    end_time: str = Field(..., description="HH:MM  e.g. 10:00")
    location: str = Field(..., description="e.g. Room 101, Building A")

    @field_validator('day_of_week')
    @classmethod
    def validate_day(cls, v: str) -> str:
        allowed = {'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'}
        if v not in allowed:
            raise ValueError(f"day_of_week must be one of {allowed}")
        return v

    @field_validator('start_time', 'end_time')
    @classmethod
    def validate_time(cls, v: str) -> str:
        try:
            datetime.strptime(v, '%H:%M')
        except ValueError:
            raise ValueError("start_time must be in HH:MM format")
        return v


class AdvisorSlotRead(BaseModel):
    id: int
    advisor_id: int
    advisor_name: Optional[str] = None
    day_of_week: str
    start_time: str
    end_time: str
    location: str
    is_active: bool
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────
#  AVAILABILITY WINDOW
# ─────────────────────────────────────────

class TimeWindow(BaseModel):
    start: str          # "08:00"
    end: str            # "08:10"
    available: bool


class SlotAvailability(BaseModel):
    slot_id: int
    date: str
    advisor_name: Optional[str] = None
    location: str
    windows: List[TimeWindow]


# ─────────────────────────────────────────
#  APPOINTMENT
# ─────────────────────────────────────────

class AppointmentCreate(BaseModel):
    slot_id: int
    appointment_date: date
    start_time: str = Field(..., description="HH:MM  e.g. 08:00")
    purpose: str = Field(default='inquiry', description="inquiry / complaint / request / other")
    purpose_notes: Optional[str] = None

    @field_validator('purpose')
    @classmethod
    def validate_purpose(cls, v: str) -> str:
        allowed = {'inquiry', 'complaint', 'request', 'other'}
        if v not in allowed:
            raise ValueError(f"purpose must be one of {allowed}")
        return v

    @field_validator('start_time')
    @classmethod
    def validate_time(cls, v: str) -> str:
        try:
            datetime.strptime(v, '%H:%M')
        except ValueError:
            raise ValueError("start_time must be in HH:MM format")
        return v


class AppointmentRead(BaseModel):
    id: int
    slot_id: int
    student_id: int
    advisor_id: int
    appointment_date: date
    start_time: str
    end_time: str
    purpose: str
    purpose_notes: Optional[str] = None
    status: str
    location: Optional[str] = None
    advisor_name: Optional[str] = None
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    created_at: Optional[datetime] = None
    outcome: Optional[dict] = None
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────
#  POST-MEETING OUTCOME
# ─────────────────────────────────────────

class AdvisorOutcomeSubmit(BaseModel):
    rating: Optional[int] = Field(default=None, ge=1, le=5, description="Advisor rating from 1 (worst) to 5 (best)")
    resolved: Optional[bool] = None
    status: Optional[str] = Field(default='completed', description="completed / no_show")
    notes: Optional[str] = None


class StudentOutcomeSubmit(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 (worst) to 5 (best)")
    feedback: Optional[str] = None


class OutcomeRead(BaseModel):
    id: int
    appointment_id: int
    resolved_by_advisor: Optional[int] = None
    advisor_rating: Optional[int] = None
    advisor_notes: Optional[str] = None
    advisor_submitted_at: Optional[datetime] = None
    student_rating: Optional[int] = None
    student_feedback: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────
#  ADMIN PERFORMANCE
# ─────────────────────────────────────────

class AdvisorPerformance(BaseModel):
    advisor_id: int
    advisor_name: str
    total_appointments: int
    completed: int
    no_show: int
    cancelled: int
    resolution_rate: Optional[float] = None    # % of completed that were resolved
    avg_student_rating: Optional[float] = None
