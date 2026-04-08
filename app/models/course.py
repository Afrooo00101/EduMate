from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class Course(TimestampMixin, Base):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    credits = Column(Integer, nullable=False)
    major_id = Column(Integer, ForeignKey('majors.id', ondelete='SET NULL'))
    description = Column(Text)

    major = relationship('Major', back_populates='courses')
    enrollments = relationship('StudentCourse', back_populates='course', cascade='all, delete-orphan')


class CoursePrerequisite(TimestampMixin, Base):
    __tablename__ = 'course_prerequisites'
    __table_args__ = (UniqueConstraint('course_id', 'prerequisite_course_id', name='uq_course_prerequisite'),)

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    prerequisite_course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)


class StudentCourse(TimestampMixin, Base):
    __tablename__ = 'student_courses'
    __table_args__ = (UniqueConstraint('student_id', 'course_id', 'semester', name='uq_student_course_semester'),)

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    semester = Column(String(50), nullable=False)
    grade = Column(String(10))
    status = Column(String(30), nullable=False, default='planned')

    student = relationship('Student', back_populates='course_enrollments')
    course = relationship('Course', back_populates='enrollments')


class SavedCourse(TimestampMixin, Base):
    __tablename__ = 'saved_courses'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)
    external_id = Column(String(255), nullable=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(120), nullable=True)
    category = Column(String(120), nullable=True)
    difficulty = Column(String(80), nullable=True)
    duration = Column(String(80), nullable=True)
    progress = Column(Integer, default=0, nullable=False)
    enrolled = Column(Boolean, default=False, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    course_url = Column(String(500), nullable=True)
    source = Column(String(80), default='custom', nullable=False)

    student = relationship('Student', back_populates='saved_courses')
