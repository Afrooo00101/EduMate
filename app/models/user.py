from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.mysql import INTEGER, DECIMAL
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class Major(TimestampMixin, Base):
    __tablename__ = 'majors'

    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False, unique=True)
    department = Column(String(150), nullable=False)
    description = Column(Text)

    students = relationship('Student', back_populates='major')
    courses = relationship('Course', back_populates='major')


class User(TimestampMixin, Base):
    __tablename__ = 'users'

    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    role = Column(String(20), nullable=False, default='student')
    password_hash = Column(String(255), nullable=False)
    remember_token = Column(String(255), nullable=True)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    student = relationship('Student', back_populates='user', uselist=False, cascade='all, delete-orphan')


class Student(TimestampMixin, Base):
    __tablename__ = 'students'

    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True)
    user_id = Column(INTEGER(unsigned=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    student_code = Column(String(50), nullable=False, unique=True)
    gpa = Column(DECIMAL(3, 2), default=0.0)
    major_id = Column(INTEGER(unsigned=True), ForeignKey('majors.id', ondelete='SET NULL'))
    graduation_year = Column(Integer)
    skills_summary = Column(Text)
    profile_image_url = Column(Text)

    user = relationship('User', back_populates='student')
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
    advisor_messages = relationship('AdvisorMessage', back_populates='student', cascade='all, delete-orphan')
    planner_state = relationship('PlannerState', back_populates='student', uselist=False, cascade='all, delete-orphan')

    @property
    def full_name(self) -> str | None:
        return self.user.name if self.user else None

    @full_name.setter
    def full_name(self, value: str | None) -> None:
        if self.user is not None:
            self.user.name = value

    @property
    def email(self) -> str | None:
        return self.user.email if self.user else None

    @email.setter
    def email(self, value: str | None) -> None:
        if self.user is not None:
            self.user.email = value

    @property
    def password_hash(self) -> str | None:
        return self.user.password_hash if self.user else None

    @password_hash.setter
    def password_hash(self, value: str | None) -> None:
        if self.user is not None:
            self.user.password_hash = value

    @property
    def is_active(self) -> bool:
        return bool(self.user.is_active) if self.user else False

    @is_active.setter
    def is_active(self, value: bool) -> None:
        if self.user is not None:
            self.user.is_active = value

    @property
    def is_admin(self) -> bool:
        return bool(self.user and self.user.role == 'admin')

    @property
    def role(self) -> str:
        return self.user.role if self.user else 'student'

    @property
    def last_login(self):
        return self.user.last_login if self.user else None


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
