from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.mysql import INTEGER as UNSIGNED_INTEGER
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class ResumeDocument(TimestampMixin, Base):
    __tablename__ = 'cvs'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    ats_score = Column(Integer)
    last_updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    student = relationship('Student', back_populates='cvs')


class ResumeProfile(TimestampMixin, Base):
    __tablename__ = 'resume_profiles'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, unique=True)
    full_name = Column(String(150), nullable=True)
    title = Column(String(150), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(80), nullable=True)
    location = Column(String(150), nullable=True)
    linkedin = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    skills = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    template_name = Column(String(80), nullable=False, default='modern')
    education_json = Column(Text, nullable=True)
    experience_json = Column(Text, nullable=True)
    projects_json = Column(Text, nullable=True)
    ats_score = Column(Integer, nullable=True)

    student = relationship('Student', back_populates='resume_profile')


class Recommendation(TimestampMixin, Base):
    __tablename__ = 'recommendations'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    recommendation_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    generated_at = Column(DateTime, server_default=func.now(), nullable=False)

    student = relationship('Student', back_populates='recommendations')
