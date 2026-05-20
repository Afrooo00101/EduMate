from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.mysql import INTEGER as UNSIGNED_INTEGER
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class Internship(TimestampMixin, Base):
    __tablename__ = 'internships'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    company_name = Column(String(150), nullable=False)
    position = Column(String(150), nullable=False)
    description = Column(Text)
    location = Column(String(150))
    work_mode = Column(String(50), default='hybrid')
    application_deadline = Column(Date)
    is_active = Column(Boolean, default=True, nullable=False)

    applications = relationship('InternshipApplication', back_populates='internship', cascade='all, delete-orphan')


class InternshipApplication(TimestampMixin, Base):
    __tablename__ = 'internship_applications'
    __table_args__ = (UniqueConstraint('student_id', 'internship_id', name='uq_student_internship_application'),)

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    internship_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('internships.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(50), nullable=False, default='submitted')
    application_date = Column(Date, nullable=False)

    student = relationship('Student', back_populates='internship_applications')
    internship = relationship('Internship', back_populates='applications')


class SavedInternship(TimestampMixin, Base):
    __tablename__ = 'saved_internships'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    company_name = Column(String(150), nullable=False)
    position_code = Column(String(80), nullable=True)
    match_score = Column(Integer, nullable=True)
    match_reason = Column(Text, nullable=True)
    salary = Column(String(120), nullable=True)
    apply_url = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default='saved')

    student = relationship('Student', back_populates='saved_internships')
