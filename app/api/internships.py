from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_student, require_admin
from app.database import get_db
from app.models import Internship, InternshipApplication, Student
from app.schemas import InternshipApplicationCreate, InternshipApplicationRead, InternshipCreate, InternshipRead, SavedInternshipCreate, SavedInternshipRead, SavedInternshipUpdate
from app.services.search_service import SearchService
from app.utils.helpers import sanitize_model

router = APIRouter(prefix='/internships', tags=['internships'])


@router.get('', response_model=list[InternshipRead])
def list_internships(active_only: bool = True, position: str | None = Query(default=None), db: Session = Depends(get_db)):
    return SearchService(db).list_internships(active_only, position)


@router.post('', response_model=InternshipRead, status_code=status.HTTP_201_CREATED)
def create_internship(payload: InternshipCreate, db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    payload = sanitize_model(payload)
    internship = Internship(**payload.model_dump())
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship


@router.get('/applications/me', response_model=list[InternshipApplicationRead])
def list_my_applications(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return SearchService(db).list_student_applications(current_student.id)


@router.post('/applications/me', response_model=InternshipApplicationRead, status_code=status.HTTP_201_CREATED)
def apply_for_internship(payload: InternshipApplicationCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    internship = db.query(Internship).filter(Internship.id == payload.internship_id, Internship.is_active.is_(True)).first()
    if not internship:
        raise HTTPException(status_code=404, detail='Internship not found')
    application = InternshipApplication(student_id=current_student.id, internship_id=payload.internship_id, application_date=payload.application_date)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get('/saved/me', response_model=list[SavedInternshipRead])
def list_saved_internships(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return SearchService(db).list_saved_internships(current_student.id)


@router.post('/saved/me', response_model=SavedInternshipRead, status_code=status.HTTP_201_CREATED)
def save_internship(payload: SavedInternshipCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return SearchService(db).save_internship(current_student.id, payload)


@router.patch('/saved/me/{saved_id}', response_model=SavedInternshipRead)
def update_saved_internship(saved_id: int, payload: SavedInternshipUpdate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    item = SearchService(db).update_saved_internship(current_student.id, saved_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail='Saved internship not found')
    return item


@router.delete('/saved/me/{saved_id}', response_model=dict)
def delete_saved_internship(saved_id: int, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    item = SearchService(db).delete_saved_internship(current_student.id, saved_id)
    if not item:
        raise HTTPException(status_code=404, detail='Saved internship not found')
    return {'deleted': True}
