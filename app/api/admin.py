from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models import SecurityAudit, Student
from app.schemas import StudentRead
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix='/admin', tags=['admin'])


@router.get('/users', response_model=list[StudentRead])
def list_users(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return db.query(Student).order_by(Student.full_name.asc()).all()


@router.get('/security-logs')
def list_security_logs(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return db.query(SecurityAudit).order_by(SecurityAudit.created_at.desc()).limit(100).all()


@router.get('/dashboard')
def admin_dashboard(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return {
        'students': db.query(Student).count(),
        'security_logs': db.query(SecurityAudit).count(),
        'events': len(AnalyticsService(db).list_events()),
    }
