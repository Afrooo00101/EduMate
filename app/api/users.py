from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_student
from app.database import get_db
from app.models import Student, User
from app.schemas import StudentRead, StudentUpdate
from app.services.auth_service import (
    build_student_email,
    derive_graduation_year_from_student_code,
    normalize_sut_email,
    parse_student_identity_from_email,
)
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
    next_full_name = updates.get('full_name', current_student.full_name or '')
    next_student_code = updates.get('student_code', current_student.student_code)

    if 'email' in updates:
        try:
            updates['email'] = normalize_sut_email(updates['email'])
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        parsed_identity = parse_student_identity_from_email(updates['email'])
        if parsed_identity:
            updates['student_code'] = parsed_identity['student_code']
            updates['full_name'] = parsed_identity['full_name']
            updates['graduation_year'] = derive_graduation_year_from_student_code(parsed_identity['student_code'])
            next_full_name = updates['full_name']
            next_student_code = updates['student_code']
        expected_email = build_student_email(next_full_name, next_student_code)
        if updates['email'] != expected_email:
            raise HTTPException(status_code=400, detail=f'Student email must be {expected_email}')
        existing_email = db.query(User).filter(User.email == updates['email'], User.id != current_student.user_id).first()
        if existing_email:
            raise HTTPException(status_code=409, detail='Email already in use')

    if 'student_code' in updates:
        derived_year = derive_graduation_year_from_student_code(updates['student_code'])
        if derived_year is None:
            raise HTTPException(status_code=400, detail='Student code must begin with the admission year')
        updates['graduation_year'] = derived_year
        existing_code = db.query(Student).filter(Student.student_code == updates['student_code'], Student.id != current_student.id).first()
        if existing_code:
            raise HTTPException(status_code=409, detail='Student code already in use')

    if 'full_name' in updates or 'student_code' in updates:
        expected_email = build_student_email(next_full_name, next_student_code)
        updates['email'] = expected_email
        existing_email = db.query(User).filter(User.email == updates['email'], User.id != current_student.user_id).first()
        if existing_email:
            raise HTTPException(status_code=409, detail='Email already in use')

    for key, value in updates.items():
        setattr(current_student, key, value)
    db.add(current_student)
    if current_student.user is not None:
        db.add(current_student.user)
    db.commit()
    db.refresh(current_student)
    return current_student
