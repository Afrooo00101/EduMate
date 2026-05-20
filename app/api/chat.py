from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import Student, User
from app.models.chat import ChatMessage
from app.core.security import get_current_user

router = APIRouter(prefix='/chat', tags=['chat'])


# ─── Schemas ────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    content: str


class MessageRead(BaseModel):
    id: int
    advisor_id: int
    student_id: int
    sender_role: str
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationPartner(BaseModel):
    student_id: int
    student_name: str
    student_code: str
    unread_count: int

    class Config:
        from_attributes = True


class StudentAdvisorInfo(BaseModel):
    advisor_id: int | None = None
    advisor_name: str | None = None
    advisor_email: str | None = None


# ─── Helpers ────────────────────────────────────────────────────────────────

def _get_advisor_or_403(db: Session, user: User) -> User:
    if user.role not in ('advisor', 'admin'):
        raise HTTPException(status_code=403, detail='Advisor access required')
    if user.role == 'advisor' and not user.is_active:
        raise HTTPException(status_code=404, detail='Advisor profile not found')
    return user


def _get_student_or_404(db: Session, student_id: int) -> Student:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail='Student not found')
    return student


def _current_student_or_403(db: Session, user: User) -> Student:
    student = db.query(Student).options(joinedload(Student.user)).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=403, detail='Student profile required')
    return student


def _student_advisor_id(db: Session, student_id: int) -> int | None:
    return db.execute(
        text('SELECT advisor_id FROM student_advisors WHERE student_id = :student_id ORDER BY assigned_at DESC LIMIT 1'),
        {'student_id': student_id},
    ).scalar()


def _student_advisor_user(db: Session, student_id: int) -> User | None:
    advisor_id = _student_advisor_id(db, student_id)
    if not advisor_id:
        return None
    return db.query(User).filter(User.id == advisor_id, User.role == 'advisor', User.is_active == True).first()


def _assigned_student_ids(db: Session, advisor_user_id: int) -> list[int]:
    rows = db.execute(
        text('SELECT student_id FROM student_advisors WHERE advisor_id = :advisor_id'),
        {'advisor_id': advisor_user_id},
    ).fetchall()
    return [int(row[0]) for row in rows]


def _next_chat_id(db: Session) -> int:
    return (db.execute(text('SELECT COALESCE(MAX(id), 0) + 1 FROM advisor_chat')).scalar() or 1)


def _unread_count(db: Session, advisor_id: int, student_id: int, sender_role: str) -> int:
    return int(db.execute(
        text(
            """
            SELECT COUNT(*)
            FROM advisor_chat
            WHERE advisor_id = :advisor_id
              AND student_id = :student_id
              AND sender_role = :sender_role
              AND is_read = 0
            """
        ),
        {'advisor_id': advisor_id, 'student_id': student_id, 'sender_role': sender_role},
    ).scalar() or 0)


def _assert_relationship(db: Session, advisor: User, student: Student, user: User):
    """Make sure the advisor owns this student (admins bypass)."""
    if user.role == 'admin':
        return
    if _student_advisor_id(db, student.id) != advisor.id:
        raise HTTPException(status_code=403, detail='This student is not assigned to you')


# ─── Advisor endpoints ───────────────────────────────────────────────────────

@router.get('/advisor/conversations', response_model=List[ConversationPartner])
def advisor_list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all students assigned to the logged-in advisor with unread counts."""
    advisor = _get_advisor_or_403(db, current_user)
    student_ids = _assigned_student_ids(db, advisor.id)
    if not student_ids:
        return []
    students = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.id.in_(student_ids))
        .all()
    )
    result = []
    for s in students:
        unread = _unread_count(db, advisor.id, s.id, 'student')
        result.append(ConversationPartner(
            student_id=s.id,
            student_name=s.full_name or s.student_code,
            student_code=s.student_code,
            unread_count=unread,
        ))
    return result


@router.get('/advisor/messages/{student_id}', response_model=List[MessageRead])
def advisor_get_messages(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all messages in the thread between the advisor and a student. Marks student messages as read."""
    advisor = _get_advisor_or_403(db, current_user)
    student = _get_student_or_404(db, student_id)
    _assert_relationship(db, advisor, student, current_user)

    # Mark student messages as read
    db.query(ChatMessage).filter(
        ChatMessage.advisor_id == advisor.id,
        ChatMessage.student_id == student_id,
        ChatMessage.sender_role == 'student',
        ChatMessage.is_read == False,
    ).update({'is_read': True})
    db.commit()

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.advisor_id == advisor.id,
            ChatMessage.student_id == student_id,
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return messages


@router.post('/advisor/messages/{student_id}', response_model=MessageRead, status_code=201)
def advisor_send_message(
    student_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Advisor sends a message to a student."""
    advisor = _get_advisor_or_403(db, current_user)
    student = _get_student_or_404(db, student_id)
    _assert_relationship(db, advisor, student, current_user)

    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail='Message content cannot be empty')

    msg = ChatMessage(
        id=_next_chat_id(db),
        advisor_id=advisor.id,
        student_id=student_id,
        sender_role='advisor',
        content=content,
        is_read=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ─── Student endpoints ───────────────────────────────────────────────────────

@router.get('/student/messages', response_model=List[MessageRead])
def student_get_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all messages between the logged-in student and their advisor. Marks advisor messages as read."""
    student = _current_student_or_403(db, current_user)
    advisor = _student_advisor_user(db, student.id)
    if not advisor:
        raise HTTPException(status_code=404, detail='No advisor assigned yet')

    # Mark advisor messages as read
    db.query(ChatMessage).filter(
        ChatMessage.advisor_id == advisor.id,
        ChatMessage.student_id == student.id,
        ChatMessage.sender_role == 'advisor',
        ChatMessage.is_read == False,
    ).update({'is_read': True})
    db.commit()

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.advisor_id == advisor.id,
            ChatMessage.student_id == student.id,
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return messages


@router.post('/student/messages', response_model=MessageRead, status_code=201)
def student_send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student sends a message to their advisor."""
    student = _current_student_or_403(db, current_user)
    advisor = _student_advisor_user(db, student.id)
    if not advisor:
        raise HTTPException(status_code=404, detail='No advisor assigned yet')

    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail='Message content cannot be empty')

    msg = ChatMessage(
        id=_next_chat_id(db),
        advisor_id=advisor.id,
        student_id=student.id,
        sender_role='student',
        content=content,
        is_read=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get('/student/unread-count')
def student_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the number of unread advisor messages for the student."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return {'unread': 0}
    advisor = _student_advisor_user(db, student.id)
    if not advisor:
        return {'unread': 0}
    count = _unread_count(db, advisor.id, student.id, 'advisor')
    return {'unread': count}


@router.get('/student/advisor', response_model=StudentAdvisorInfo)
def student_advisor_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = _current_student_or_403(db, current_user)
    advisor = _student_advisor_user(db, student.id)
    if not advisor:
        return StudentAdvisorInfo()
    return StudentAdvisorInfo(
        advisor_id=advisor.id,
        advisor_name=advisor.name,
        advisor_email=advisor.email,
    )
