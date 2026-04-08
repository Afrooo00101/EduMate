from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_student
from app.database import get_db
from app.models import Student
from app.schemas import StudentRead, StudentUpdate
from app.utils.helpers import SuspiciousInputError, sanitize_model

router = APIRouter(prefix='/users', tags=['users'])


@router.get('/me', response_model=StudentRead)
def read_current_student(current_student: Student = Depends(get_current_student)):
    return current_student


@router.put('/me', response_model=StudentRead)
def update_current_student(payload: StudentUpdate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    try:
        payload = sanitize_model(payload)
    except SuspiciousInputError:
        raise HTTPException(status_code=400, detail='Input rejected')

    updates = payload.model_dump(exclude_unset=True)

    if 'email' in updates:
        existing_email = db.query(Student).filter(Student.email == updates['email'], Student.id != current_student.id).first()
        if existing_email:
            raise HTTPException(status_code=409, detail='Email already in use')

    if 'student_code' in updates:
        existing_code = db.query(Student).filter(Student.student_code == updates['student_code'], Student.id != current_student.id).first()
        if existing_code:
            raise HTTPException(status_code=409, detail='Student code already in use')

    for key, value in updates.items():
        setattr(current_student, key, value)
    db.add(current_student)
    db.commit()
    db.refresh(current_student)
    return current_student

