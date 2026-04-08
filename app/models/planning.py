from sqlalchemy import Column, ForeignKey, Integer, String, Text
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
