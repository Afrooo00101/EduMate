from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models import SecurityAudit, Student, User
from app.schemas import (
    AdminCreateRequest,
    BlockedIPRuleCreate,
    BlockedIPRuleRead,
    CountryAccessRead,
    CountryAccessUpdate,
    PlatformSettingsRead,
    PlatformSettingsUpdate,
    StudentRead,
)
from app.services.admin_settings_service import (
    create_admin_user,
    create_ip_rule,
    delete_admin_user,
    delete_ip_rule,
    get_country_access,
    get_platform_settings,
    list_ip_rules,
    update_country_access,
    update_platform_settings,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix='/admin', tags=['admin'])


@router.get('/users', response_model=list[StudentRead])
def list_users(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    students = db.query(Student).join(User, Student.user_id == User.id).order_by(User.name.asc()).all()
    advisor_rows = db.execute(
        text(
            """
            SELECT student_id, advisor_id
            FROM student_advisors
            ORDER BY assigned_at DESC, id DESC
            """
        )
    ).fetchall()
    advisor_by_student = {}
    for row in advisor_rows:
        values = row._mapping
        advisor_by_student.setdefault(int(values['student_id']), int(values['advisor_id']))

    return [
        {
            'id': student.id,
            'user_id': student.user_id,
            'student_code': student.student_code,
            'full_name': student.full_name,
            'email': student.email,
            'gpa': student.gpa,
            'major_id': student.major_id,
            'graduation_year': student.graduation_year,
            'skills_summary': student.skills_summary,
            'profile_image_url': student.profile_image_url,
            'advisor_id': advisor_by_student.get(student.id),
            'is_active': student.is_active,
            'is_admin': student.is_admin,
            'last_login': student.last_login,
            'major': student.major,
        }
        for student in students
    ]


@router.post('/users/{student_id}/toggle-active', response_model=StudentRead)
def toggle_user_active(student_id: int, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    student = db.query(Student).join(User, Student.user_id == User.id).filter(Student.id == student_id).first()
    if not student or not student.user:
        raise HTTPException(status_code=404, detail='User not found')
    if current_admin.id == student.id:
        raise HTTPException(status_code=400, detail='You cannot block your own account')

    student.user.is_active = not bool(student.user.is_active)
    db.add(student.user)
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='user_status_changed',
        identifier=student.email,
        details=f'Admin {current_admin.email} set account to {"active" if student.user.is_active else "blocked"}',
    ))
    db.commit()
    db.refresh(student)
    return student


@router.get('/security-logs')
def list_security_logs(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return db.query(SecurityAudit).order_by(SecurityAudit.created_at.desc()).limit(100).all()


@router.get('/platform-events')
def list_platform_events(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return AnalyticsService(db).list_events()


@router.get('/settings', response_model=PlatformSettingsRead)
def read_platform_settings(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return get_platform_settings(db)


@router.put('/settings', response_model=PlatformSettingsRead)
def save_platform_settings(payload: PlatformSettingsUpdate, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    settings = update_platform_settings(
        db,
        maintenance_mode=payload.maintenance_mode,
        session_timeout_minutes=payload.session_timeout_minutes,
        max_login_attempts=payload.max_login_attempts,
        country_access_mode=payload.country_access_mode,
    )
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='settings_updated',
        identifier=current_admin.email,
        details='Admin settings updated from settings panel',
    ))
    db.commit()
    db.refresh(settings)
    return settings


@router.post('/admin-users', response_model=StudentRead)
def add_admin_user(payload: AdminCreateRequest, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    student = create_admin_user(db, full_name=payload.full_name, email=payload.email, password=payload.password)
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='admin_created',
        identifier=current_admin.email,
        details=f'Created admin account for {student.email}',
    ))
    db.commit()
    db.refresh(student)
    return student


@router.delete('/admin-users/{student_id}')
def remove_admin_user(student_id: int, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    student = db.query(Student).join(User, Student.user_id == User.id).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail='Admin user not found')
    deleted_email = student.email
    delete_admin_user(db, student_id=student_id, current_admin_id=current_admin.id)
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='admin_deleted',
        identifier=current_admin.email,
        details=f'Deleted admin account for {deleted_email}',
    ))
    db.commit()
    return {'message': 'Admin user deleted'}


@router.get('/ip-rules', response_model=list[BlockedIPRuleRead])
def read_ip_rules(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return list_ip_rules(db)


@router.post('/ip-rules', response_model=BlockedIPRuleRead)
def add_ip_rule(payload: BlockedIPRuleCreate, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    rule = create_ip_rule(db, ip_value=payload.ip_address, reason=payload.reason)
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='ip_rule_created',
        identifier=current_admin.email,
        details=f'Blocked IP {rule.ip_address}',
    ))
    db.commit()
    db.refresh(rule)
    return rule


@router.delete('/ip-rules/{rule_id}')
def remove_ip_rule(rule_id: int, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    delete_ip_rule(db, rule_id=rule_id)
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='ip_rule_deleted',
        identifier=current_admin.email,
        details=f'Removed IP rule #{rule_id}',
    ))
    db.commit()
    return {'message': 'IP rule removed'}


@router.get('/country-access', response_model=CountryAccessRead)
def read_country_access(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return get_country_access(db)


@router.put('/country-access', response_model=CountryAccessRead)
def save_country_access(payload: CountryAccessUpdate, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    result = update_country_access(db, mode=payload.mode, blocked_countries=payload.blocked_countries)
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='country_access_updated',
        identifier=current_admin.email,
        details=f'Country access mode set to {payload.mode}',
    ))
    db.commit()
    return result


@router.get('/dashboard')
def admin_dashboard(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    return {
        'students': db.query(Student).count(),
        'security_logs': db.query(SecurityAudit).count(),
        'events': len(AnalyticsService(db).list_events()),
    }
