from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models import Student, User, Course, StudentCourse
from app.schemas import AdvisorRead, AdvisorCreate, AdvisorUpdate, StudentRead, StudentCourseRead
from app.core.security import get_current_user, require_admin, get_current_advisor
from app.core.security import get_password_hash
from app.services.planning_service import PlanningService

router = APIRouter(prefix='/advisors', tags=['advisors'])

ADVISOR_META_PREFIX = 'advisor|'


def _pack_advisor_meta(employee_code: str | None, department: str | None) -> str:
    code = (employee_code or '').strip()
    dept = (department or '').strip()
    return f'{ADVISOR_META_PREFIX}{code}|{dept}'


def _unpack_advisor_meta(user: User) -> tuple[str, str | None]:
    token = user.remember_token or ''
    if token.startswith(ADVISOR_META_PREFIX):
        _, code, dept = (token.split('|', 2) + ['', ''])[:3]
        return code or f'ADV{user.id}', dept or None
    return f'ADV{user.id}', None


def _advisor_read(user: User) -> dict:
    employee_code, department = _unpack_advisor_meta(user)
    return {
        'id': user.id,
        'user_id': user.id,
        'employee_code': employee_code,
        'full_name': user.name,
        'email': user.email,
        'department': department,
        'is_active': bool(user.is_active),
    }


def _assigned_student_ids(db: Session, advisor_user_id: int) -> list[int]:
    rows = db.execute(
        text('SELECT student_id FROM student_advisors WHERE advisor_id = :advisor_id'),
        {'advisor_id': advisor_user_id},
    ).fetchall()
    return [row[0] for row in rows]


@router.get('', response_model=List[AdvisorRead])
def list_advisors(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    users = db.query(User).filter(User.role == 'advisor').order_by(User.name.asc()).all()
    return [_advisor_read(user) for user in users]


@router.post('', response_model=AdvisorRead)
def create_advisor(
    payload: AdvisorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Enforce @sut.edu.eg domain
    email = payload.email
    if not email.endswith('@sut.edu.eg'):
        if '@' in email:
            # Replace domain
            username = email.split('@')[0]
            email = f"{username}@sut.edu.eg"
        else:
            # Append domain
            email = f"{email}@sut.edu.eg"

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if employee code already exists
    existing_code = db.query(User).filter(
        User.role == 'advisor',
        User.remember_token.like(f'{ADVISOR_META_PREFIX}{payload.employee_code}|%'),
    ).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Employee code already in use")

    # Create User
    new_user = User(
        name=payload.full_name,
        email=email,
        password_hash=get_password_hash(payload.password),
        role='advisor',
        is_active=True,
        remember_token=_pack_advisor_meta(payload.employee_code, payload.department),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return _advisor_read(new_user)


@router.get('/my-students', response_model=List[StudentRead])
def get_my_students(
    db: Session = Depends(get_db),
    current_advisor: User = Depends(get_current_advisor)
):
    student_ids = _assigned_student_ids(db, current_advisor.id)
    if not student_ids:
        return []
    return db.query(Student).filter(Student.id.in_(student_ids)).options(joinedload(Student.user)).all()


@router.post('/{advisor_id}/assign/{student_id}')
def assign_student_to_advisor(
    advisor_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    advisor = db.query(User).filter(User.id == advisor_id, User.role == 'advisor').first()
    if not advisor:
        raise HTTPException(status_code=404, detail="Advisor not found")

    existing = db.execute(
        text('SELECT id FROM student_advisors WHERE student_id = :student_id AND advisor_id = :advisor_id'),
        {'student_id': student_id, 'advisor_id': advisor_id},
    ).first()
    if not existing:
        next_id = (db.execute(text('SELECT COALESCE(MAX(id), 0) + 1 FROM student_advisors')).scalar() or 1)
        db.execute(
            text('INSERT INTO student_advisors (id, student_id, advisor_id) VALUES (:id, :student_id, :advisor_id)'),
            {'id': next_id, 'student_id': student_id, 'advisor_id': advisor_id},
        )
    db.commit()
    return {"message": "Student assigned successfully"}


@router.delete('/{advisor_id}/assign/{student_id}')
def unassign_student_from_advisor(
    advisor_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.execute(
        text('DELETE FROM student_advisors WHERE student_id = :student_id AND advisor_id = :advisor_id'),
        {'student_id': student_id, 'advisor_id': advisor_id},
    )
    db.commit()
    return {"message": "Student unassigned successfully"}


@router.put('/{advisor_id}', response_model=AdvisorRead)
def update_advisor(
    advisor_id: int,
    payload: AdvisorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    advisor = db.query(User).filter(User.id == advisor_id, User.role == 'advisor').first()
    if not advisor:
        raise HTTPException(status_code=404, detail="Advisor not found")
    
    if payload.employee_code is not None:
        # Check if code is taken by another advisor
        existing = db.query(User).filter(
            User.role == 'advisor',
            User.id != advisor_id,
            User.remember_token.like(f'{ADVISOR_META_PREFIX}{payload.employee_code}|%'),
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Employee code already in use")
    current_code, current_department = _unpack_advisor_meta(advisor)
    advisor.remember_token = _pack_advisor_meta(
        payload.employee_code if payload.employee_code is not None else current_code,
        payload.department if payload.department is not None else current_department,
    )
        
    # Update associated User fields
    user = advisor
    if payload.full_name is not None:
        user.name = payload.full_name
    if payload.email is not None:
        # Check if email is taken
        existing_user = db.query(User).filter(
            User.email == payload.email,
            User.id != user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = payload.email
    if payload.is_active is not None:
        user.is_active = payload.is_active
        
    db.commit()
    db.refresh(advisor)
    return _advisor_read(advisor)


@router.get('/{advisor_id}/students', response_model=List[StudentRead])
def get_advisor_students(
    advisor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    advisor = db.query(User).filter(User.id == advisor_id, User.role == 'advisor').first()
    if not advisor:
        raise HTTPException(status_code=404, detail="Advisor not found")

    student_ids = _assigned_student_ids(db, advisor_id)
    if not student_ids:
        return []
    return db.query(Student).filter(Student.id.in_(student_ids)).options(joinedload(Student.user)).all()


@router.get('/students/{student_id}/courses', response_model=List[StudentCourseRead])
def get_student_courses(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    is_admin = current_user.role == 'admin'
    is_advisor = current_user.role == 'advisor' and student_id in _assigned_student_ids(db, current_user.id)
    
    if not (is_admin or is_advisor):
        raise HTTPException(status_code=403, detail="Not authorized to view this student's courses")
    
    enrollments = db.query(StudentCourse).filter(
        StudentCourse.student_id == student_id
    ).options(
        joinedload(StudentCourse.course).joinedload(Course.prerequisites)
    ).all()
    
    return enrollments


@router.post('/students/{student_id}/enroll')
def enroll_student_in_course(
    student_id: int,
    course_id: int,
    semester: str = 'Fall 2026',
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    is_admin = current_user.role == 'admin'
    is_advisor = current_user.role == 'advisor' and student_id in _assigned_student_ids(db, current_user.id)
    
    if not (is_admin or is_advisor):
        raise HTTPException(status_code=403, detail="Not authorized to manage this student's courses")
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # ── Rule 1: block re-enrollment if the student already COMPLETED this course ──
    completed = db.query(StudentCourse).filter(
        StudentCourse.student_id == student_id,
        StudentCourse.course_id == course_id,
        StudentCourse.status == 'completed'
    ).first()
    if completed:
        raise HTTPException(
            status_code=400,
            detail=f"Student has already completed '{course.name}'. Cannot enroll again."
        )

    # ── Rule 2: block enrollment if prerequisites are not all completed ──
    # Load prerequisites for this course
    course_with_prereqs = (
        db.query(Course)
        .filter(Course.id == course_id)
        .options(joinedload(Course.prerequisites))
        .first()
    )
    if course_with_prereqs.prerequisites:
        # Get IDs of courses the student has completed
        completed_ids = {
            row.course_id
            for row in db.query(StudentCourse).filter(
                StudentCourse.student_id == student_id,
                StudentCourse.status == 'completed'
            ).all()
        }
        missing = [
            prereq.name
            for prereq in course_with_prereqs.prerequisites
            if prereq.id not in completed_ids
        ]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Student has not completed the required prerequisites: {', '.join(missing)}"
            )

    # ── Check if already enrolled in this semester ──
    existing = db.query(StudentCourse).filter(
        StudentCourse.student_id == student_id,
        StudentCourse.course_id == course_id,
        StudentCourse.semester == semester
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this course for this semester")

    enrollment = StudentCourse(student_id=student_id, course_id=course_id, semester=semester, status='enrolled')
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.put('/enrollments/{enrollment_id}', response_model=StudentCourseRead)
def update_enrollment(
    enrollment_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # For now, let's keep this admin only or restricted to the student's advisor
    enrollment = db.query(StudentCourse).filter(StudentCourse.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    student = db.query(Student).filter(Student.id == enrollment.student_id).first()
    is_admin = current_user.role == 'admin'
    is_advisor = current_user.role == 'advisor' and student.id in _assigned_student_ids(db, current_user.id)
    
    if not (is_admin or is_advisor):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if 'grade' in payload:
        enrollment.grade = payload['grade']
        if payload['grade']:
             enrollment.status = 'completed'
    if 'status' in payload:
        enrollment.status = payload['status']
    if 'semester' in payload:
        enrollment.semester = payload['semester']
        
    db.commit()
    PlanningService(db).calculate_gpa_summary(student.id)
    db.refresh(enrollment)
    return enrollment


@router.delete('/enrollments/{enrollment_id}')
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    enrollment = db.query(StudentCourse).filter(StudentCourse.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    student = db.query(Student).filter(Student.id == enrollment.student_id).first()
    is_admin = current_user.role == 'admin'
    is_advisor = current_user.role == 'advisor' and student.id in _assigned_student_ids(db, current_user.id)
    
    if not (is_admin or is_advisor):
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(enrollment)
    db.commit()
    PlanningService(db).calculate_gpa_summary(student.id)
    return {"message": "Enrollment deleted successfully"}
