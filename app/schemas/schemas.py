from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.course import StudentCourseRead, CourseRead

# Add these new schemas AFTER your existing schemas

# ==============================
# NEW PLANNING SCHEMAS
# ==============================

class SemesterSummary(BaseModel):
    semester_name: str
    level: int
    total_credits: int
    completed_credits: int
    courses: list[StudentCourseRead] = []
    gpa: Optional[float] = None
    status: str = "upcoming"  # completed, current, upcoming


class CareerPathTimeline(BaseModel):
    career_path: str
    major_name: str
    semesters: list[SemesterSummary] = []
    total_progress: float = 0.0
    estimated_graduation: str = ""


class GPACalculation(BaseModel):
    term_gpa: float = 0.0
    cumulative_gpa: float = 0.0
    total_graded_courses: int = 0
    total_credits: int = 0
    quality_points: float = 0.0
    distribution: dict = {}


class SummerCourseRequest(BaseModel):
    student_id: int
    course_id: int
    course_name: Optional[str] = None
    type: str = "summer_course"
    notes: Optional[str] = None


class ChatMessage(BaseModel):
    student_id: int
    channel: str = "planning_advisor"
    message: str


class ChatMessageRead(BaseModel):
    id: int
    student_id: int
    channel: str
    user_message: str
    assistant_message: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AdvisorResponse(BaseModel):
    message: str
    suggestions: list[str] = []
    summer_courses: list[dict] = []
    relevant_courses: list[dict] = []


class StudyPlanRead(BaseModel):
    id: int
    major_id: int
    course_id: int
    semester: str
    recommended_level_no: Optional[int] = None
    display_order: int = 1
    is_active: bool = True
    course: Optional[CourseRead] = None
    
    model_config = ConfigDict(from_attributes=True)


class MajorRead(BaseModel):
    id: int
    name: str
    department: str
    
    model_config = ConfigDict(from_attributes=True)


class AcademicRuleRead(BaseModel):
    id: int
    semester_type: str
    min_gpa: float
    max_gpa: float
    max_credits: int
    
    model_config = ConfigDict(from_attributes=True)


class CoursePrerequisiteRead(BaseModel):
    id: int
    course_id: int
    prerequisite_course_id: int
    
    model_config = ConfigDict(from_attributes=True)


class SummerCourseEligibility(BaseModel):
    eligible: bool
    missing_prerequisites: list[dict] = []
    current_gpa: float = 0.0
    max_summer_credits: int = 0
    course_credits: int = 0
    can_take: bool = False


class PlanningOverview(BaseModel):
    total_credits: int = 0
    completed_credits: int = 0
    remaining_credits: int = 0
    completed_courses: int = 0
    planned_courses: int = 0
    total_courses: int = 0
    current_gpa: float = 0.0
    progress_percentage: float = 0.0
    career_path: str = ""
    estimated_graduation: str = ""
    enrollments: list[StudentCourseRead] = []