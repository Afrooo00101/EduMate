from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_student
from app.database import get_db
from app.models import Course, Student, StudentCourse
from app.schemas import GPASummary, PlannerStateRead, PlannerStateUpsert, PlanningOverview, StudentCourseRead, StudentCourseUpsert
from app.services.planning_service import PlanningService
from app.services.search_service import SearchService
from app.utils.helpers import SuspiciousInputError, sanitize_model

router = APIRouter(prefix='/planning', tags=['planning'])


@router.get('/me', response_model=PlanningOverview)
def get_my_planning(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    enrollments = SearchService(db).get_student_planning(current_student.id)
    total_credits = sum(item.course.credits for item in enrollments if item.course)
    completed_courses = sum(1 for item in enrollments if item.status == 'completed')
    planned_courses = sum(1 for item in enrollments if item.status != 'completed')
    return PlanningOverview(total_credits=total_credits, completed_courses=completed_courses, planned_courses=planned_courses, enrollments=enrollments)


@router.post('/me/courses', response_model=StudentCourseRead, status_code=status.HTTP_201_CREATED)
def add_course_to_plan(payload: StudentCourseUpsert, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    try:
        payload = sanitize_model(payload)
    except SuspiciousInputError:
        raise HTTPException(status_code=400, detail='Input rejected')
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    enrollment = StudentCourse(student_id=current_student.id, **payload.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get('/state/me', response_model=PlannerStateRead)
def get_planner_state(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return PlanningService(db).get_or_create_state(current_student.id)


@router.put('/state/me', response_model=PlannerStateRead)
def upsert_planner_state(payload: PlannerStateUpsert, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return PlanningService(db).upsert_state(current_student.id, payload)


@router.get('/gpa/me', response_model=GPASummary)
def get_gpa_summary(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return PlanningService(db).calculate_gpa_summary(current_student.id)
