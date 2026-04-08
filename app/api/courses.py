from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_student, require_admin
from app.database import get_db
from app.models import Course, Major, Skill, Student
from app.schemas import CourseCreate, CourseRead, MajorCreate, MajorRead, SavedCourseCreate, SavedCourseRead, SkillCreate, SkillRead
from app.services.search_service import SearchService
from app.utils.helpers import sanitize_model

router = APIRouter(tags=['courses'])


@router.get('/majors', response_model=list[MajorRead])
def list_majors(db: Session = Depends(get_db)):
    return db.query(Major).order_by(Major.name.asc()).all()


@router.post('/majors', response_model=MajorRead, status_code=status.HTTP_201_CREATED)
def create_major(payload: MajorCreate, db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    payload = sanitize_model(payload)
    major = Major(**payload.model_dump())
    db.add(major)
    db.commit()
    db.refresh(major)
    return major


@router.get('/skills', response_model=list[SkillRead])
def list_skills(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.name.asc()).all()


@router.post('/skills', response_model=SkillRead, status_code=status.HTTP_201_CREATED)
def create_skill(payload: SkillCreate, db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    payload = sanitize_model(payload)
    skill = Skill(**payload.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get('/courses', response_model=list[CourseRead])
def list_courses(major_id: int | None = None, db: Session = Depends(get_db)):
    return SearchService(db).list_courses(major_id)


@router.get('/courses/search', response_model=list[CourseRead])
def search_courses(q: str | None = Query(default=None), category: str | None = Query(default=None), db: Session = Depends(get_db)):
    return SearchService(db).search_courses(q, category)


@router.post('/courses', response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), _: Student = Depends(require_admin)):
    payload = sanitize_model(payload)
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get('/courses/saved/me', response_model=list[SavedCourseRead])
def list_saved_courses(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return SearchService(db).list_saved_courses(current_student.id)


@router.post('/courses/saved/me', response_model=SavedCourseRead, status_code=status.HTTP_201_CREATED)
def save_course(payload: SavedCourseCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return SearchService(db).save_course(current_student.id, payload)


@router.delete('/courses/saved/me/{saved_course_id}', response_model=dict)
def delete_saved_course(saved_course_id: int, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    item = SearchService(db).delete_saved_course(current_student.id, saved_course_id)
    if not item:
        raise HTTPException(status_code=404, detail='Saved course not found')
    return {'deleted': True}
