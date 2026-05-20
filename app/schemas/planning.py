from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

from app.schemas.course import StudentCourseRead, StudentCourseUpsert


class SemesterSummary(BaseModel):
    level: int
    semester: str
    semester_name: str
    courses: list[dict] = []
    total_credits: int = 0
    completed_credits: int = 0
    progress: float = 0.0


class CareerPathTimeline(BaseModel):
    career_path: str = ""
    semesters: list[SemesterSummary | dict] = []
    total_progress: float = 0.0
    current_gpa: float = 0.0
    estimated_graduation: str = ""


class GPACalculation(BaseModel):
    semester_gpa: float = 0.0
    cumulative_gpa: float = 0.0
    total_credits: int = 0
    completed_credits: int = 0
    grade_points: float = 0.0
    distribution: dict[str, int] = {}


class PlanningOverview(BaseModel):
    total_credits: int
    completed_courses: int
    planned_courses: int
    enrollments: list[StudentCourseRead]


class PlannerStateUpsert(BaseModel):
    career_path: str = 'Cyber Security'
    mode: str = 'preview'
    semesters_json: str | None = None
    taken_subjects_json: str | None = None
    grades_json: str | None = None
    roadmap_json: str | None = None
    goals_json: str | None = None
    skills_progress_json: str | None = None


class PlannerStateRead(PlannerStateUpsert):
    id: int
    model_config = ConfigDict(from_attributes=True)


class GPASummary(BaseModel):
    term_gpa: float
    cumulative_gpa: float
    total_graded_courses: int
    distribution: dict[str, int]


class SummerRequestCreate(BaseModel):
    course_id: int
    semester: Optional[str] = "Summer"
    reason: str | None = None

class SummerRequestRead(BaseModel):
    id: int
    student_id: int
    course_id: int
    semester: Optional[str]
    reason: str | None
    status: str
    admin_notes: str | None = None
    requested_at: Optional[object] = None
    course: Optional[dict] = None
    model_config = ConfigDict(from_attributes=True)


class AdvisorMessageBase(BaseModel):
    content: str


class AdvisorMessageCreate(AdvisorMessageBase):
    pass


from datetime import datetime

class AdvisorMessageRead(AdvisorMessageBase):
    id: int
    sender_role: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
