import random

from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.orm import Session

from app.models import ActivityLog, AnalyticsEvent, ResumeProfile, SavedCourse, SavedInternship, Student, StudentCourse
from app.schemas.analytics import ActivityLogCreate, AnalyticsEventCreate, DashboardResponse, DashboardStats, UpcomingEvent


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def _safe_count(self, model, *criteria) -> int:
        try:
            query = self.db.query(model)
            if criteria:
                query = query.filter(*criteria)
            return query.count()
        except (OperationalError, ProgrammingError):
            self.db.rollback()
            return 0

    def _safe_first(self, model, *criteria):
        try:
            query = self.db.query(model)
            if criteria:
                query = query.filter(*criteria)
            return query.first()
        except (OperationalError, ProgrammingError):
            self.db.rollback()
            return None

    def _next_id(self, table_name: str) -> int:
        return int(self.db.execute(text(f'SELECT COALESCE(MAX(id), 0) + 1 FROM {table_name}')).scalar() or 1)

    def create_event(self, student_id: int | None, payload: AnalyticsEventCreate):
        event = AnalyticsEvent(id=self._next_id('analytics_events'), student_id=student_id, **payload.model_dump())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def list_events(self, student_id: int | None = None):
        query = self.db.query(AnalyticsEvent)
        if student_id is not None:
            query = query.filter(AnalyticsEvent.student_id == student_id)
        return query.order_by(AnalyticsEvent.created_at.desc()).all()

    def log_activity(self, student_id: int, payload: ActivityLogCreate):
        item = ActivityLog(id=self._next_id('activity_logs'), student_id=student_id, **payload.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def list_activity(self, student_id: int, limit: int = 20):
        return self.db.query(ActivityLog).filter(ActivityLog.student_id == student_id).order_by(ActivityLog.created_at.desc()).limit(limit).all()

    def build_dashboard(self, student: Student) -> DashboardResponse:
        saved_courses = self._safe_count(SavedCourse, SavedCourse.student_id == student.id)
        saved_internships = self._safe_count(SavedInternship, SavedInternship.student_id == student.id)
        planned_courses = self._safe_count(StudentCourse, StudentCourse.student_id == student.id)
        resume_profile = self._safe_first(ResumeProfile, ResumeProfile.student_id == student.id)

        profile_completion = 20
        if student.full_name: profile_completion += 15
        if student.major_id: profile_completion += 15
        if student.skills_summary: profile_completion += 15
        if student.profile_image_url: profile_completion += 15
        if resume_profile and resume_profile.summary: profile_completion += 20

        career_score = min(100, 40 + (saved_courses * 5) + (saved_internships * 7) + (planned_courses * 3))
        skill_growth = min(100, 10 + saved_courses * 4 + (1 if student.skills_summary else 0) * 15)
        learning_time_hours = max(5, planned_courses * 2 + random.randint(0, 4))

        activity = self.list_activity(student.id, limit=10)
        upcoming = [
            UpcomingEvent(title='Resume review reminder', date_label='This week', type='workshop'),
            UpcomingEvent(title='Planning checkpoint', date_label='Next week', type='conference'),
            UpcomingEvent(title='Internship applications follow-up', date_label='This month', type='fair'),
        ]

        return DashboardResponse(
            stats=DashboardStats(
                career_score=career_score,
                skill_growth=skill_growth,
                learning_time_hours=learning_time_hours,
                profile_completion=min(profile_completion, 100),
            ),
            recent_activity=activity,
            upcoming_events=upcoming,
        )
