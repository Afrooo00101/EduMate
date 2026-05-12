from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models import SecurityAudit, Student, User
from app.models.planning import Request
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
    return db.query(Student).join(User, Student.user_id == User.id).order_by(User.name.asc()).all()


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


@router.get('/requests')
def list_requests(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    reqs = db.query(Request).order_by(Request.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "student": r.student,
            "course": r.course,
            "status": r.status,
            "date": r.created_at.isoformat() if r.created_at else None
        }
        for r in reqs
    ]


@router.post('/requests/{request_id}/status')
def update_request_status(request_id: int, status: str, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    req.status = status
    
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='request_status_updated',
        identifier=current_admin.email,
        details=f'Updated request #{request_id} to {status}',
    ))
    db.commit()
    db.refresh(req)
    return {"message": "Status updated successfully", "status": req.status}


@router.get('/ai-chats')
def list_ai_chats(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    from app.models.analytics import AIChatMessage
    chats = db.query(AIChatMessage).order_by(AIChatMessage.created_at.desc()).limit(100).all()
    return [
        {
            "id": c.id,
            "student_id": c.student_id,
            "user_message": c.user_message,
            "assistant_message": c.assistant_message,
            "date": c.created_at.isoformat() if c.created_at else None
        }
        for c in chats
    ]


@router.get('/advisor-messages')
def list_advisor_chat_summaries(db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    """List all students who have sent advisor messages with their last message"""
    from app.models.planning import AdvisorMessage
    from sqlalchemy import func
    
    # Subquery to get max created_at for each student
    subq = db.query(
        AdvisorMessage.student_id,
        func.max(AdvisorMessage.created_at).label('max_date')
    ).group_by(AdvisorMessage.student_id).subquery()
    
    # Query to get the last message for each student
    msgs = db.query(AdvisorMessage).join(
        subq, 
        (AdvisorMessage.student_id == subq.c.student_id) & (AdvisorMessage.created_at == subq.c.max_date)
    ).all()
    
    result = []
    for m in msgs:
        student = db.query(Student).filter(Student.id == m.student_id).first()
        result.append({
            "student_id": m.student_id,
            "student_name": student.full_name if student else "Unknown",
            "last_message": m.content,
            "date": m.created_at.isoformat() if m.created_at else None,
            "is_read": m.is_read
        })
    return result


@router.get('/advisor-messages/{student_id}')
def get_advisor_messages_for_student(student_id: int, db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    """Get all messages for a specific student"""
    from app.models.planning import AdvisorMessage
    msgs = db.query(AdvisorMessage).filter(AdvisorMessage.student_id == student_id).order_by(AdvisorMessage.created_at.asc()).all()
    
    # Mark as read
    for m in msgs:
        if m.sender_role == 'student':
            m.is_read = True
    db.commit()
    
    return [
        {
            "id": m.id,
            "sender_role": m.sender_role,
            "content": m.content,
            "date": m.created_at.isoformat() if m.created_at else None
        }
        for m in msgs
    ]


@router.post('/advisor-messages/{student_id}')
def send_advisor_message_to_student(student_id: int, payload: dict, db: Session = Depends(get_db), current_admin: Student = Depends(require_admin)):
    """Send a message to a student from the advisor/admin"""
    from app.models.planning import AdvisorMessage
    content = payload.get('content')
    if not content:
        raise HTTPException(status_code=400, detail='Message content is required')
        
    msg = AdvisorMessage(
        student_id=student_id,
        sender_role='admin',
        content=content,
        is_read=True
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"message": "Message sent", "id": msg.id}
