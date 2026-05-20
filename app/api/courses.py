from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session, aliased

from app.core.security import get_current_student, require_admin, require_advisor
from app.database import get_db
from app.models import Course, CoursePrerequisite, Major, Skill, Student, StudyPlan, User
from app.schemas import CourseCreate, CourseRead, MajorCreate, MajorRead, SavedCourseCreate, SavedCourseRead, SkillCreate, SkillRead
from app.services.search_service import SearchService
from app.utils.helpers import sanitize_model

router = APIRouter(tags=['courses'])


def _course_payload(course: Course, plan_rows: list[StudyPlan]) -> dict:
    placements = [
        {
            "level": row.recommended_level_no,
            "semester": row.semester,
            "major_id": row.major_id,
        }
        for row in plan_rows
        if row.course_id == course.id and row.is_active
    ]
    primary = next((p for p in placements if p["major_id"] == course.major_id), None)
    if primary is None and placements:
        primary = placements[0]

    level = primary.get("level") if primary else None
    semester = primary.get("semester") if primary else None
    semester_label = f"Level {level} - {semester}" if level and semester else semester

    return {
        "id": course.id,
        "code": course.code,
        "name": course.name,
        "credits": course.credits,
        "major_id": course.major_id,
        "description": course.description,
        "level": course.level,
        "semester": semester_label,
        "study_plan_level": level,
        "study_plan_semester": semester,
        "study_plan_placements": placements,
        "prerequisites": [
            {"id": prereq.id, "code": prereq.code, "name": prereq.name}
            for prereq in (course.prerequisites or [])
        ],
    }


def _courses_with_study_plan_semesters(db: Session, major_id: int | None = None) -> list[dict]:
    courses = SearchService(db).list_courses(major_id)
    course_ids = [course.id for course in courses]
    if not course_ids:
        return []

    plan_query = db.query(StudyPlan).filter(
        StudyPlan.course_id.in_(course_ids),
        StudyPlan.is_active.is_(True),
    )
    if major_id is not None:
        plan_query = plan_query.filter(StudyPlan.major_id == major_id)

    plan_rows = plan_query.order_by(
        StudyPlan.course_id,
        StudyPlan.recommended_level_no,
        text("FIELD(study_plan.semester, 'Fall', 'Spring', 'Summer')"),
        StudyPlan.display_order,
    ).all()

    return [_course_payload(course, plan_rows) for course in courses]


def _normalize_study_semester(semester: str | None) -> str | None:
    if not semester:
        return None

    value = semester.strip().lower()
    if value == 'fail':
        value = 'fall'

    allowed = {'fall': 'Fall', 'spring': 'Spring', 'summer': 'Summer'}
    if value not in allowed:
        raise HTTPException(status_code=400, detail='Semester must be Fall, Spring or Summer')
    return allowed[value]


def _sync_course_study_plan(db: Session, course: Course, level: int | None, semester: str | None) -> None:
    semester_value = _normalize_study_semester(semester)
    if not semester_value:
        return

    major_id = course.major_id
    if major_id is None:
        first_major = db.query(Major).order_by(Major.id.asc()).first()
        if not first_major:
            raise HTTPException(status_code=400, detail='Create a major before assigning a course semester')
        major_id = first_major.id
        course.major_id = major_id

    plan = db.query(StudyPlan).filter(
        StudyPlan.major_id == major_id,
        StudyPlan.course_id == course.id,
    ).first()
    if not plan:
        plan = StudyPlan(major_id=major_id, course_id=course.id, display_order=1, is_active=True)
        db.add(plan)

    plan.recommended_level_no = level or course.level or 1
    plan.semester = semester_value
    plan.is_active = True


@router.get('/courses/curriculum-map')
def get_curriculum_map(db: Session = Depends(get_db)):
    """Return courses grouped by major and semester for Hany's academic-plan map."""
    target_names = ['Computer Science', 'Cyber Security', 'Data Science']
    majors = db.query(Major).filter(Major.name.in_(target_names)).all()
    if not majors:
        majors = db.query(Major).order_by(Major.id.asc()).all()

    result = {}
    prereq_course = aliased(Course)

    for major in majors:
        rows = (
            db.query(
                StudyPlan.recommended_level_no,
                StudyPlan.semester,
                Course.id.label('course_id'),
                Course.code.label('course_code'),
                Course.name.label('course_name'),
                Course.credits.label('course_credits'),
                Course.description.label('course_desc'),
                prereq_course.code.label('prereq_code'),
            )
            .join(Course, StudyPlan.course_id == Course.id)
            .outerjoin(CoursePrerequisite, Course.id == CoursePrerequisite.course_id)
            .outerjoin(prereq_course, CoursePrerequisite.prerequisite_course_id == prereq_course.id)
            .filter(StudyPlan.major_id == major.id, StudyPlan.is_active.is_(True))
            .order_by(
                StudyPlan.recommended_level_no,
                text("FIELD(study_plan.semester, 'Fall', 'Spring', 'Summer')"),
                Course.code,
            )
            .all()
        )

        semesters = {}
        course_dict = {}
        for row in rows:
            level = row.recommended_level_no or 1
            sem_name = (row.semester or 'Fall').capitalize()
            sem_num = str((level - 1) * 2 + (1 if sem_name == 'Fall' else 2))
            if row.course_id not in course_dict:
                course_dict[row.course_id] = {
                    'id': row.course_id,
                    'code': row.course_code,
                    'name': row.course_name,
                    'credits': row.course_credits,
                    'description': row.course_desc or '',
                    'semester_name': sem_name,
                    'prerequisites': [],
                    'sem_num': sem_num,
                }
            if row.prereq_code and row.prereq_code not in course_dict[row.course_id]['prerequisites']:
                course_dict[row.course_id]['prerequisites'].append(row.prereq_code)

        for course in course_dict.values():
            sem_num = course.pop('sem_num')
            semesters.setdefault(sem_num, []).append(course)

        result[major.name] = semesters

    return result


@router.get('/majors', response_model=list[MajorRead])
def list_majors(db: Session = Depends(get_db)):
    return db.query(Major).order_by(Major.name.asc()).all()


@router.post('/majors', response_model=MajorRead, status_code=status.HTTP_201_CREATED)
def create_major(payload: MajorCreate, db: Session = Depends(get_db), _: User = Depends(require_advisor)):
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
def create_skill(payload: SkillCreate, db: Session = Depends(get_db), _: User = Depends(require_advisor)):
    payload = sanitize_model(payload)
    skill = Skill(**payload.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get('/courses')
def list_courses(major_id: int | None = None, db: Session = Depends(get_db)):
    return _courses_with_study_plan_semesters(db, major_id)


@router.get('/courses/search', response_model=list[CourseRead])
def search_courses(q: str | None = Query(default=None), category: str | None = Query(default=None), db: Session = Depends(get_db)):
    return SearchService(db).search_courses(q, category)


@router.post('/courses', response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), _: User = Depends(require_advisor)):
    payload = sanitize_model(payload)
    payload_data = payload.model_dump()
    prereq_ids = payload_data.pop('prerequisite_ids', [])
    semester = payload_data.pop('semester', None)
    
    course = Course(**payload_data)
    
    if prereq_ids:
        prereqs = db.query(Course).filter(Course.id.in_(prereq_ids)).all()
        course.prerequisites = prereqs
        
    db.add(course)
    db.flush()
    _sync_course_study_plan(db, course, payload.level, semester)
    db.commit()
    db.refresh(course)
    return course


@router.put('/courses/{course_id}', response_model=CourseRead)
def update_course(course_id: int, payload: CourseCreate, db: Session = Depends(get_db), _: User = Depends(require_advisor)):
    payload_data = payload.model_dump()
    prereq_ids = payload_data.pop('prerequisite_ids', [])
    semester = payload_data.pop('semester', None)
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    
    for key, value in payload_data.items():
        setattr(course, key, value)
    
    if prereq_ids is not None:
        prereqs = db.query(Course).filter(Course.id.in_(prereq_ids)).all()
        course.prerequisites = prereqs

    _sync_course_study_plan(db, course, payload.level, semester)
    
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


@router.delete('/courses/{course_id}', response_model=dict)
def delete_course(course_id: int, db: Session = Depends(get_db), _: User = Depends(require_advisor)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    
    db.delete(course)
    db.commit()
    return {'deleted': True}
