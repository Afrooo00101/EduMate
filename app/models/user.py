from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class Major(TimestampMixin, Base):
    __tablename__ = 'majors'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    department = Column(String(150), nullable=False)
    description = Column(Text)

    students = relationship('Student', back_populates='major')
    courses = relationship('Course', back_populates='major')


class Student(TimestampMixin, Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String(50), nullable=False, unique=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    gpa = Column(Float, default=0.0)
    major_id = Column(Integer, ForeignKey('majors.id', ondelete='SET NULL'))
    graduation_year = Column(Integer)
    skills_summary = Column(Text)
    profile_image_url = Column(String(500))
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    major = relationship('Major', back_populates='students')
    student_skills = relationship('StudentSkill', back_populates='student', cascade='all, delete-orphan')
    course_enrollments = relationship('StudentCourse', back_populates='student', cascade='all, delete-orphan')
    cvs = relationship('ResumeDocument', back_populates='student', cascade='all, delete-orphan')
    resume_profile = relationship('ResumeProfile', back_populates='student', uselist=False, cascade='all, delete-orphan')
    saved_courses = relationship('SavedCourse', back_populates='student', cascade='all, delete-orphan')
    saved_internships = relationship('SavedInternship', back_populates='student', cascade='all, delete-orphan')
    internship_applications = relationship('InternshipApplication', back_populates='student', cascade='all, delete-orphan')
    recommendations = relationship('Recommendation', back_populates='student', cascade='all, delete-orphan')
    analytics_events = relationship('AnalyticsEvent', back_populates='student', cascade='all, delete-orphan')
    activity_logs = relationship('ActivityLog', back_populates='student', cascade='all, delete-orphan')
    ai_chat_messages = relationship('AIChatMessage', back_populates='student', cascade='all, delete-orphan')
    planner_state = relationship('PlannerState', back_populates='student', uselist=False, cascade='all, delete-orphan')


class Skill(TimestampMixin, Base):
    __tablename__ = 'skills'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, unique=True)
    category = Column(String(100), nullable=False)

    student_skills = relationship('StudentSkill', back_populates='skill', cascade='all, delete-orphan')


class StudentSkill(TimestampMixin, Base):
    __tablename__ = 'student_skills'
    __table_args__ = (UniqueConstraint('student_id', 'skill_id', name='uq_student_skill'),)

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    skill_id = Column(Integer, ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    level = Column(String(50), nullable=False)

    student = relationship('Student', back_populates='student_skills')
    skill = relationship('Skill', back_populates='student_skills')
