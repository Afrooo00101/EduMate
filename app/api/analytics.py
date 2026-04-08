from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_student, require_admin
from app.database import get_db
from app.models import Student
from app.schemas import ActivityLogCreate, ActivityLogRead, AnalyticsEventCreate, AnalyticsEventRead, DashboardResponse
from app.services.analytics_service import AnalyticsService
from app.utils.helpers import sanitize_model

router = APIRouter(prefix='/analytics', tags=['analytics'])


@router.post('/events', response_model=AnalyticsEventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: AnalyticsEventCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return AnalyticsService(db).create_event(current_student.id, payload)


@router.get('/events/me', response_model=list[AnalyticsEventRead])
def list_my_events(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return AnalyticsService(db).list_events(current_student.id)


@router.get('/events', response_model=list[AnalyticsEventRead])
def list_all_events(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return AnalyticsService(db).list_events()


@router.post('/activity/me', response_model=ActivityLogRead, status_code=status.HTTP_201_CREATED)
def log_activity(payload: ActivityLogCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return AnalyticsService(db).log_activity(current_student.id, payload)


@router.get('/activity/me', response_model=list[ActivityLogRead])
def list_activity(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return AnalyticsService(db).list_activity(current_student.id)


@router.get('/dashboard/me', response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return AnalyticsService(db).build_dashboard(current_student)
