from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import Course, Internship, InternshipApplication, SavedCourse, SavedInternship, StudentCourse
from app.schemas.course import SavedCourseCreate
from app.schemas.internship import SavedInternshipCreate, SavedInternshipUpdate


class SearchService:
    def __init__(self, db: Session):
        self.db = db

    def list_courses(self, major_id: int | None = None):
        query = self.db.query(Course).options(joinedload(Course.prerequisites))
        if major_id is not None:
            query = query.filter(Course.major_id == major_id)
        return query.order_by(Course.code.asc()).all()

    def search_courses(self, query_text: str | None = None, category: str | None = None):
        query = self.db.query(Course).options(joinedload(Course.prerequisites))
        if query_text:
            like = f'%{query_text}%'
            query = query.filter(or_(Course.name.ilike(like), Course.code.ilike(like), Course.description.ilike(like)))
        if category:
            query = query.filter(Course.description.ilike(f'%{category}%'))
        return query.order_by(Course.name.asc()).all()

    def save_course(self, student_id: int, payload: SavedCourseCreate):
        item = SavedCourse(student_id=student_id, **payload.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def list_saved_courses(self, student_id: int):
        return self.db.query(SavedCourse).filter(SavedCourse.student_id == student_id).order_by(SavedCourse.created_at.desc()).all()

    def delete_saved_course(self, student_id: int, saved_course_id: int):
        item = self.db.query(SavedCourse).filter(SavedCourse.student_id == student_id, SavedCourse.id == saved_course_id).first()
        if item:
            self.db.delete(item)
            self.db.commit()
        return item

    def get_student_planning(self, student_id: int):
        return (
            self.db.query(StudentCourse)
            .options(joinedload(StudentCourse.course))
            .filter(StudentCourse.student_id == student_id)
            .order_by(StudentCourse.semester.asc())
            .all()
        )

    def list_internships(self, active_only: bool = True, position: str | None = None):
        query = self.db.query(Internship)
        if active_only:
            query = query.filter(Internship.is_active.is_(True))
        if position:
            position_key = position.strip().lower()
            position_terms = {
                'software': ['software', 'frontend', 'front-end', 'backend', 'back-end', 'full stack', 'developer', 'engineer'],
                'marketing': ['marketing', 'digital marketing', 'social media', 'content'],
                'finance': ['finance', 'financial', 'accounting', 'banking'],
                'hr': ['hr', 'human resources', 'recruitment', 'talent'],
                'sales': ['sales', 'business development', 'account'],
                'design': ['design', 'designer', 'ui', 'ux', 'graphic'],
                'data': ['data', 'analytics', 'analyst', 'business intelligence', 'machine learning'],
                'project': ['project', 'coordinator', 'scrum', 'product'],
            }
            terms = position_terms.get(position_key, [position_key])
            query = query.filter(or_(*[Internship.position.ilike(f'%{term}%') for term in terms]))
        return query.order_by(Internship.company_name.asc()).all()

    def list_student_applications(self, student_id: int):
        return (
            self.db.query(InternshipApplication)
            .options(joinedload(InternshipApplication.internship))
            .filter(InternshipApplication.student_id == student_id)
            .order_by(InternshipApplication.application_date.desc())
            .all()
        )

    def save_internship(self, student_id: int, payload: SavedInternshipCreate):
        item = SavedInternship(student_id=student_id, **payload.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def list_saved_internships(self, student_id: int):
        return self.db.query(SavedInternship).filter(SavedInternship.student_id == student_id).order_by(SavedInternship.created_at.desc()).all()

    def update_saved_internship(self, student_id: int, saved_id: int, payload: SavedInternshipUpdate):
        item = self.db.query(SavedInternship).filter(SavedInternship.student_id == student_id, SavedInternship.id == saved_id).first()
        if not item:
            return None
        item.status = payload.status
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete_saved_internship(self, student_id: int, saved_id: int):
        item = self.db.query(SavedInternship).filter(SavedInternship.student_id == student_id, SavedInternship.id == saved_id).first()
        if item:
            self.db.delete(item)
            self.db.commit()
        return item
