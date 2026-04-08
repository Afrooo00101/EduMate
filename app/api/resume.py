from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_student
from app.database import get_db
from app.models import ResumeDocument, Student
from app.schemas import ATSCheckResponse, RecommendationCreate, RecommendationRead, ResumeCreate, ResumePreviewRequest, ResumePreviewResponse, ResumeProfileRead, ResumeProfileUpsert, ResumeRead
from app.services.ai_service import AIService
from app.services.resume_service import ResumeService
from app.utils.helpers import sanitize_model

router = APIRouter(prefix='/resume', tags=['resume'])


@router.get('/documents/me', response_model=list[ResumeRead])
def list_my_resumes(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return db.query(ResumeDocument).filter(ResumeDocument.student_id == current_student.id).order_by(ResumeDocument.last_updated_at.desc()).all()


@router.post('/documents/me', response_model=ResumeRead, status_code=status.HTTP_201_CREATED)
def create_resume(payload: ResumeCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    resume = ResumeDocument(student_id=current_student.id, **payload.model_dump())
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get('/profile/me', response_model=ResumeProfileRead)
def get_resume_profile(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return ResumeService(db).get_or_create_profile(current_student.id)


@router.put('/profile/me', response_model=ResumeProfileRead)
def upsert_resume_profile(payload: ResumeProfileUpsert, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return ResumeService(db).upsert_profile(current_student.id, payload)


@router.get('/templates')
def list_templates(db: Session = Depends(get_db), _: Student = Depends(get_current_student)):
    return {'templates': ResumeService(db).list_templates()}


@router.post('/preview', response_model=ResumePreviewResponse)
def generate_preview(payload: ResumePreviewRequest, db: Session = Depends(get_db), _: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return ResumePreviewResponse(html=ResumeService(db).render_preview(payload), template_name=payload.template_name)


@router.post('/ats-check', response_model=ATSCheckResponse)
def ats_check(payload: ResumePreviewRequest, db: Session = Depends(get_db), _: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return ResumeService(db).ats_check(payload)


@router.get('/recommendations/me', response_model=list[RecommendationRead])
def list_recommendations(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return AIService(db).list_recommendations(current_student.id)


@router.post('/recommendations/me', response_model=RecommendationRead, status_code=status.HTTP_201_CREATED)
def create_recommendation(payload: RecommendationCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return AIService(db).create_recommendation(current_student.id, payload)
