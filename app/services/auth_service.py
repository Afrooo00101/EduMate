from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import SecurityAudit, Student
from app.schemas.auth import RegisterRequest
from app.core.security import get_password_hash, verify_password


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_student(self, payload: RegisterRequest) -> Student:
        existing = self.db.query(Student).filter(or_(Student.email == payload.email, Student.student_code == payload.student_code)).first()
        if existing:
            raise ValueError('Student already exists')
        student = Student(
            student_code=payload.student_code,
            full_name=payload.full_name,
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            major_id=payload.major_id,
            graduation_year=payload.graduation_year,
            skills_summary=payload.skills_summary,
        )
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student

    def authenticate(self, email: str, password: str) -> Student | None:
        student = self.db.query(Student).filter(Student.email == email).first()
        if not student or not verify_password(password, student.password_hash):
            return None
        return student

    def log_security_event(self, ip_address: str, event_type: str, identifier: str | None, details: str) -> None:
        self.db.add(SecurityAudit(ip_address=ip_address, event_type=event_type, identifier=identifier, details=details))
        self.db.commit()
