"""
SQLAlchemy models for the Academic Advising Appointment Scheduling system.
Tables: advisor_slots, appointments, appointment_feedback
"""
from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, ForeignKey,
    Integer, SmallInteger, Text, Time, UniqueConstraint, func
)
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class AdvisorSlot(TimestampMixin, Base):
    """
    The one weekly hour an advisor designates for student meetings.
    An advisor can only have one ACTIVE slot at a time.
    """
    __tablename__ = 'advisor_slots'
    # Removed unique constraint on (advisor_id, is_active) to allow multiple historical inactive slots


    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True)
    # Links to students.id (advisors are also stored as students with role='admin' or a dedicated advisor role)
    # We link to users.id directly since advisors may not have a students record
    advisor_id = Column(INTEGER(unsigned=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    day_of_week = Column(
        Enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'),
        nullable=False
    )
    start_time = Column(Time, nullable=False)       # e.g. 08:00:00
    end_time = Column(Time, nullable=False)         # e.g. 09:00:00 (always start + 1hr)
    location = Column(Text, nullable=False)         # e.g. "Room 101, Building A"
    is_active = Column(Boolean, default=True, nullable=False)

    advisor = relationship('User', foreign_keys=[advisor_id])
    appointments = relationship('Appointment', back_populates='slot', cascade='all, delete-orphan')


class Appointment(TimestampMixin, Base):
    """
    A specific 10-minute booking within an advisor's weekly slot.
    """
    __tablename__ = 'appointments'
    __table_args__ = (
        # Prevent double-booking the same slot on the same date+time
        UniqueConstraint('slot_id', 'appointment_date', 'start_time', name='uq_appointment_booking'),
    )

    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True)
    slot_id = Column(INTEGER(unsigned=True), ForeignKey('advisor_slots.id', ondelete='CASCADE'), nullable=False, index=True)
    student_id = Column(INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)
    advisor_id = Column(INTEGER(unsigned=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

    appointment_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)       # e.g. 08:00:00
    end_time = Column(Time, nullable=False)         # e.g. 08:10:00 (always +10 min)

    purpose = Column(
        Enum('inquiry', 'complaint', 'request', 'other'),
        nullable=False,
        default='inquiry'
    )
    purpose_notes = Column(Text, nullable=True)     # Student's brief description

    status = Column(
        Enum('booked', 'completed', 'cancelled', 'no_show'),
        nullable=False,
        default='booked'
    )

    slot = relationship('AdvisorSlot', back_populates='appointments')
    student = relationship('Student', foreign_keys=[student_id])
    advisor = relationship('User', foreign_keys=[advisor_id])
    outcome = relationship('AppointmentOutcome', back_populates='appointment', uselist=False, cascade='all, delete-orphan')


class AppointmentOutcome(TimestampMixin, Base):
    """
    Post-meeting feedback submitted by both the advisor and the student.
    Sent to admin for performance monitoring.
    """
    __tablename__ = 'appointment_feedback'

    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True)
    appointment_id = Column(
        INTEGER(unsigned=True),
        ForeignKey('appointments.id', ondelete='CASCADE'),
        nullable=False,
        unique=True     # One outcome per appointment
    )

    # Advisor side
    resolved_by_advisor = Column('advisor_rating', SmallInteger, nullable=True)        # 1-5 advisor rating
    advisor_notes = Column(Text, nullable=True)
    advisor_submitted_at = Column(DateTime, nullable=True)

    # Student side
    student_rating = Column(SmallInteger, nullable=True)        # 1–5 stars
    student_feedback = Column('student_notes', Text, nullable=True)
    appointment = relationship('Appointment', back_populates='outcome')

    @property
    def advisor_rating(self) -> int | None:
        return self.resolved_by_advisor
