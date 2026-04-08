import random

from sqlalchemy.orm import Session

from app.models import ActivityLog, AnalyticsEvent, ResumeProfile, SavedCourse, SavedInternship, Student, StudentCourse
from app.schemas.analytics import ActivityLogCreate, AnalyticsEventCreate, DashboardResponse, DashboardStats, UpcomingEvent


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def create_event(self, student_id: int | None, payload: AnalyticsEventCreate):
        event = AnalyticsEvent(student_id=student_id, **payload.model_dump())
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
        item = ActivityLog(student_id=student_id, **payload.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def list_activity(self, student_id: int, limit: int = 20):
        return self.db.query(ActivityLog).filter(ActivityLog.student_id == student_id).order_by(ActivityLog.created_at.desc()).limit(limit).all()

    def build_dashboard(self, student: Student) -> DashboardResponse:
        saved_courses = self.db.query(SavedCourse).filter(SavedCourse.student_id == student.id).count()
        saved_internships = self.db.query(SavedInternship).filter(SavedInternship.student_id == student.id).count()
        planned_courses = self.db.query(StudentCourse).filter(StudentCourse.student_id == student.id).count()
        resume_profile = self.db.query(ResumeProfile).filter(ResumeProfile.student_id == student.id).first()

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
