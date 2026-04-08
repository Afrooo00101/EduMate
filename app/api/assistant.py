from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_student
from app.database import get_db
from app.models import Student
from app.schemas.assistant import ChatMessageRead, ChatRequest
from app.services.ai_service import AIService
from app.utils.helpers import sanitize_model

router = APIRouter(prefix='/assistant', tags=['assistant'])


@router.post('/chat/me', response_model=ChatMessageRead, status_code=status.HTTP_201_CREATED)
def create_chat_message(payload: ChatRequest, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return AIService(db).create_chat_message(current_student.id, payload)


@router.get('/chat/me', response_model=list[ChatMessageRead])
def list_chat_messages(channel: str | None = Query(default=None), db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return AIService(db).list_chat_history(current_student.id, channel)
