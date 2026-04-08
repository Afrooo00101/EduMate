from pydantic import BaseModel, ConfigDict

from app.schemas.course import StudentCourseRead


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
