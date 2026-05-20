from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.mysql import INTEGER as UNSIGNED_INTEGER
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class Course(TimestampMixin, Base):
    __tablename__ = 'courses'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    credits = Column(Integer, nullable=False)
    major_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('majors.id', ondelete='SET NULL'))
    description = Column(Text)
    level = Column(Integer, default=1)

    @property
    def semester(self) -> str | None:
        return None

    @semester.setter
    def semester(self, _value: str | None) -> None:
        pass

    major = relationship('Major', back_populates='courses')
    enrollments = relationship('StudentCourse', back_populates='course', cascade='all, delete-orphan')
    offerings = relationship('CourseOffering', back_populates='course', cascade='all, delete-orphan')
    prerequisites = relationship(
        'Course',
        secondary='course_prerequisites',
        primaryjoin='Course.id == CoursePrerequisite.course_id',
        secondaryjoin='Course.id == CoursePrerequisite.prerequisite_course_id',
        backref='required_for',
    )


class CoursePrerequisite(TimestampMixin, Base):
    __tablename__ = 'course_prerequisites'
    __table_args__ = (UniqueConstraint('course_id', 'prerequisite_course_id', name='uq_course_prerequisite'),)

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True)
    course_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    prerequisite_course_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)


class StudentCourse(TimestampMixin, Base):
    __tablename__ = 'student_courses'
    __table_args__ = (UniqueConstraint('student_id', 'course_id', 'semester', name='uq_student_course_semester'),)

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    course_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    semester = Column(String(50), nullable=False)
    grade = Column(String(10))
    status = Column(String(30), nullable=False, default='planned')

    student = relationship('Student', back_populates='course_enrollments')
    course = relationship('Course', back_populates='enrollments')


class SavedCourse(TimestampMixin, Base):
    __tablename__ = 'saved_courses'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)
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


class CourseOffering(TimestampMixin, Base):
    __tablename__ = 'course_offerings'
    __table_args__ = (UniqueConstraint('course_id', 'semester', 'academic_year', name='uq_course_offering'),)

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    course_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True)
    semester = Column(String(20), nullable=False, index=True)
    academic_year = Column(String(20), nullable=True, index=True)
    is_open = Column(Boolean, nullable=False, default=True)

    course = relationship('Course', back_populates='offerings')
