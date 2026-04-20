from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class PlannerState(TimestampMixin, Base):
    __tablename__ = 'planner_states'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False, unique=True)
    career_path = Column(String(150), nullable=False, default='Cyber Security')
    mode = Column(String(50), nullable=False, default='preview')
    semesters_json = Column(Text, nullable=True)
    taken_subjects_json = Column(Text, nullable=True)
    grades_json = Column(Text, nullable=True)
    roadmap_json = Column(Text, nullable=True)
    goals_json = Column(Text, nullable=True)
    skills_progress_json = Column(Text, nullable=True)

    student = relationship('Student', back_populates='planner_state')


class AcademicRule(TimestampMixin, Base):
    __tablename__ = 'academic_rules'
    __table_args__ = (UniqueConstraint('semester_type', 'min_gpa', 'max_gpa', name='uq_academic_rules_range'),)

    id = Column(Integer, primary_key=True, index=True)
    semester_type = Column(String(20), nullable=False, index=True)
    min_gpa = Column(Numeric(3, 2), nullable=False)
    max_gpa = Column(Numeric(3, 2), nullable=False)
    max_credits = Column(Integer, nullable=False)


class StudyPlan(TimestampMixin, Base):
    __tablename__ = 'study_plan'
    __table_args__ = (UniqueConstraint('major_id', 'course_id', name='uq_study_plan_major_course'),)

    id = Column(Integer, primary_key=True, index=True)
    major_id = Column(Integer, ForeignKey('majors.id', ondelete='CASCADE'), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True)
    semester = Column(String(20), nullable=False, index=True)
    recommended_level_no = Column(Integer, nullable=True)
    display_order = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)

    major = relationship('Major')
    course = relationship('Course')
