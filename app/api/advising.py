"""
FastAPI router for the Academic Advising Appointment Scheduling system.

Endpoints:
  POST   /advising/slots                          - Advisor creates/replaces their weekly slot
  GET    /advising/slots                          - All active slots (students/admin view)
  GET    /advising/slots/me                       - Advisor views their own slot
  DELETE /advising/slots/me                       - Advisor deactivates their slot

  GET    /advising/slots/{slot_id}/availability   - Available 10-min windows for a date
  POST   /advising/appointments                   - Student books an appointment
  GET    /advising/appointments/me                - Student's own appointments
  GET    /advising/appointments/advisor/me        - Advisor's incoming appointments
  DELETE /advising/appointments/{id}              - Student cancels (if >24h away)

  PATCH  /advising/appointments/{id}/outcome/advisor  - Advisor marks resolved/pending
  PATCH  /advising/appointments/{id}/outcome/student  - Student rates the session

  GET    /advising/admin/appointments             - Admin: all appointments
  GET    /advising/admin/advisors/performance     - Admin: per-advisor stats
"""
from datetime import date, datetime, time, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_advisor, get_current_student, get_current_user, require_admin
from app.database import get_db
from app.models.advising import AdvisorSlot, Appointment, AppointmentOutcome
from app.models.user import Student, User
from app.schemas.advising import (
    AdvisorOutcomeSubmit,
    AdvisorPerformance,
    AdvisorSlotCreate,
    AdvisorSlotRead,
    AppointmentCreate,
    AppointmentRead,
    OutcomeRead,
    SlotAvailability,
    StudentOutcomeSubmit,
    TimeWindow,
)
from pydantic import BaseModel

router = APIRouter(prefix='/advising', tags=['advising'])

SLOT_DURATION_MINUTES = 60       # default admin-created block
BOOKING_WINDOW_MINUTES = 15      # each student booking window


class AdminAdvisorSlotCreate(BaseModel):
    advisor_user_id: int
    day_of_week: str
    start_time: str
    end_time: Optional[str] = None
    location: str


# ─────────────────────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _parse_hhmm(value: str) -> time:
    """Parse 'HH:MM' string into a time object."""
    try:
        dt = datetime.strptime(value, '%H:%M')
        return dt.time()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid time format '{value}'. Use HH:MM.")


def _time_to_str(t: time) -> str:
    return t.strftime('%H:%M')


def _add_minutes(t: time, minutes: int) -> time:
    dt = datetime.combine(date.today(), t) + timedelta(minutes=minutes)
    return dt.time()


def _generate_windows(slot: AdvisorSlot, target_date: date, db: Session) -> List[TimeWindow]:
    """Generate all 15-min booking windows for a slot on a given date."""
    # Fetch all booked start_times for this slot on this date
    booked_times = {
        row.start_time
        for row in db.query(Appointment.start_time)
        .filter(
            Appointment.slot_id == slot.id,
            Appointment.appointment_date == target_date,
            Appointment.status.in_(['booked', 'completed']),
        )
        .all()
    }

    windows = []
    current = slot.start_time
    while current < slot.end_time:
        end = _add_minutes(current, BOOKING_WINDOW_MINUTES)
        if end > slot.end_time:
            break
        windows.append(TimeWindow(
            start=_time_to_str(current),
            end=_time_to_str(end),
            available=(current not in booked_times),
        ))
        current = end

    return windows


def _next_occurrence(day_name: str, from_date: Optional[date] = None) -> date:
    """Return the next date (from today) that falls on the given day name."""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    target_weekday = days.index(day_name)
    base = from_date or date.today()
    days_ahead = (target_weekday - base.weekday() + 7) % 7
    if days_ahead == 0:
        days_ahead = 7  # Next week if today is the same day
    return base + timedelta(days=days_ahead)


def _slot_to_read(slot: AdvisorSlot) -> AdvisorSlotRead:
    return AdvisorSlotRead(
        id=slot.id,
        advisor_id=slot.advisor_id,
        advisor_name=slot.advisor.name if slot.advisor else None,
        day_of_week=slot.day_of_week,
        start_time=_time_to_str(slot.start_time),
        end_time=_time_to_str(slot.end_time),
        location=slot.location,
        is_active=slot.is_active,
        created_at=slot.created_at,
    )


def _appointment_to_read(appt: Appointment) -> AppointmentRead:
    outcome_dict = None
    if appt.outcome:
        o = appt.outcome
        outcome_dict = {
            'resolved_by_advisor': o.resolved_by_advisor,
            'advisor_rating': o.resolved_by_advisor,
            'advisor_notes': o.advisor_notes,
            'student_rating': o.student_rating,
            'student_feedback': o.student_feedback,
        }
    return AppointmentRead(
        id=appt.id,
        slot_id=appt.slot_id,
        student_id=appt.student_id,
        advisor_id=appt.advisor_id,
        appointment_date=appt.appointment_date,
        start_time=_time_to_str(appt.start_time),
        end_time=_time_to_str(appt.end_time),
        purpose=appt.purpose,
        purpose_notes=appt.purpose_notes,
        status=appt.status,
        location=appt.slot.location if appt.slot else None,
        advisor_name=appt.advisor.name if appt.advisor else None,
        student_name=appt.student.full_name if appt.student else None,
        student_code=appt.student.student_code if appt.student else None,
        created_at=appt.created_at,
        outcome=outcome_dict,
    )


def _assigned_advisor_ids(db: Session, student_id: int) -> set[int]:
    rows = db.execute(
        text('SELECT advisor_id FROM student_advisors WHERE student_id = :student_id'),
        {'student_id': student_id},
    ).fetchall()
    return {int(row[0]) for row in rows}


def _student_can_use_slot(db: Session, student_id: int, advisor_id: int) -> bool:
    """Restrict to assigned advisors when assignments exist; otherwise allow active slots."""
    advisor_ids = _assigned_advisor_ids(db, student_id)
    return not advisor_ids or advisor_id in advisor_ids


def _current_student(db: Session, user: User) -> Student | None:
    return db.query(Student).filter(Student.user_id == user.id).first()


# ─────────────────────────────────────────────────────────────────────────────
#  ADVISOR SLOT ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.post('/slots', response_model=AdvisorSlotRead, status_code=status.HTTP_201_CREATED)
def create_or_replace_slot(
    payload: AdvisorSlotCreate,
    db: Session = Depends(get_db),
    current_advisor: User = Depends(get_current_advisor),
):
    """
    Advisor creates (or replaces) their weekly office-hour slot.
    Deactivates any existing active slot first, then creates a fresh one.
    """
    advisor_user_id = current_advisor.id

    # Deactivate any existing active slot for this advisor
    db.query(AdvisorSlot).filter(
        AdvisorSlot.advisor_id == advisor_user_id,
        AdvisorSlot.is_active == True,
    ).update({'is_active': False})

    start = _parse_hhmm(payload.start_time)
    end = _parse_hhmm(payload.end_time)
    if end <= start:
        raise HTTPException(status_code=400, detail='End time must be after start time')

    slot = AdvisorSlot(
        advisor_id=advisor_user_id,
        day_of_week=payload.day_of_week,
        start_time=start,
        end_time=end,
        location=payload.location,
        is_active=True,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return _slot_to_read(slot)


@router.get('/slots/me', response_model=AdvisorSlotRead)
def get_my_slot(
    db: Session = Depends(get_db),
    current_advisor: User = Depends(get_current_advisor),
):
    """Advisor views their own active slot."""
    slot = db.query(AdvisorSlot).options(joinedload(AdvisorSlot.advisor)).filter(
        AdvisorSlot.advisor_id == current_advisor.id,
        AdvisorSlot.is_active == True,
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail='No active slot found. Please create one.')
    return _slot_to_read(slot)


@router.get('/slots', response_model=List[AdvisorSlotRead])
def list_all_slots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Authenticated users view all active advisor slots."""
    q = db.query(AdvisorSlot).join(User, User.id == AdvisorSlot.advisor_id).options(
        joinedload(AdvisorSlot.advisor)
    ).filter(
        AdvisorSlot.is_active == True,
        User.role == 'advisor',
        User.is_active == True,
    )
    if current_user.role == 'student':
        student = _current_student(db, current_user)
        if not student:
            return []
        advisor_ids = _assigned_advisor_ids(db, student.id)
        if advisor_ids:
            q = q.filter(AdvisorSlot.advisor_id.in_(advisor_ids))
    elif current_user.role == 'advisor':
        q = q.filter(AdvisorSlot.advisor_id == current_user.id)
    slots = q.order_by(AdvisorSlot.day_of_week, AdvisorSlot.start_time).all()
    return [_slot_to_read(s) for s in slots]


@router.get('/student/slots')
def list_student_slots_from_table(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Student meetup page: read assigned advisor slots, falling back to all active slots."""
    advisor_ids = _assigned_advisor_ids(db, current_student.id)
    q = (
        db.query(AdvisorSlot)
        .join(User, User.id == AdvisorSlot.advisor_id)
        .options(joinedload(AdvisorSlot.advisor))
        .filter(
            AdvisorSlot.is_active == True,
            User.role == 'advisor',
            User.is_active == True,
        )
    )
    if advisor_ids:
        q = q.filter(AdvisorSlot.advisor_id.in_(advisor_ids))

    slots = q.order_by(AdvisorSlot.day_of_week, AdvisorSlot.start_time).all()
    return [_slot_to_read(slot) for slot in slots]


@router.post('/admin/slots', response_model=AdvisorSlotRead, status_code=status.HTTP_201_CREATED)
def admin_create_or_replace_slot(
    payload: AdminAdvisorSlotCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin creates or replaces an advisor's weekly office-hour slot."""
    advisor = db.query(User).filter(User.id == payload.advisor_user_id, User.role == 'advisor').first()
    if not advisor:
        raise HTTPException(status_code=404, detail='Advisor not found')

    db.query(AdvisorSlot).filter(
        AdvisorSlot.advisor_id == payload.advisor_user_id,
        AdvisorSlot.is_active == True,
    ).update({'is_active': False})

    start = _parse_hhmm(payload.start_time)
    end = _parse_hhmm(payload.end_time) if payload.end_time else _add_minutes(start, SLOT_DURATION_MINUTES)
    if end <= start:
        raise HTTPException(status_code=400, detail='End time must be after start time')
    slot = AdvisorSlot(
        advisor_id=payload.advisor_user_id,
        day_of_week=payload.day_of_week,
        start_time=start,
        end_time=end,
        location=payload.location,
        is_active=True,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return _slot_to_read(slot)


@router.delete('/slots/me', status_code=status.HTTP_204_NO_CONTENT)
def deactivate_my_slot(
    db: Session = Depends(get_db),
    current_advisor: User = Depends(get_current_advisor),
):
    """Advisor deactivates (pauses) their slot."""
    updated = db.query(AdvisorSlot).filter(
        AdvisorSlot.advisor_id == current_advisor.id,
        AdvisorSlot.is_active == True,
    ).update({'is_active': False})
    db.commit()

    if not updated:
        raise HTTPException(status_code=404, detail='No active slot to deactivate')


# ─────────────────────────────────────────────────────────────────────────────
#  AVAILABILITY
# ─────────────────────────────────────────────────────────────────────────────

@router.get('/slots/{slot_id}/availability', response_model=SlotAvailability)
def get_slot_availability(
    slot_id: int,
    target_date: date = Query(..., alias='date', description='YYYY-MM-DD'),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    Returns the 15-min booking windows for a slot on a given date.
    The date must match the slot's day_of_week.
    """
    slot = db.query(AdvisorSlot).options(joinedload(AdvisorSlot.advisor)).filter(
        AdvisorSlot.id == slot_id,
        AdvisorSlot.is_active == True,
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail='Slot not found or inactive')
    if _current_user.role == 'student':
        student = _current_student(db, _current_user)
        if not student or not _student_can_use_slot(db, student.id, slot.advisor_id):
            raise HTTPException(status_code=403, detail='This advisor slot is not available to you')

    # Validate the requested date matches the slot's day
    day_map = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if day_map[target_date.weekday()] != slot.day_of_week:
        raise HTTPException(
            status_code=400,
            detail=f"This slot is on {slot.day_of_week}. The requested date falls on {day_map[target_date.weekday()]}."
        )

    windows = _generate_windows(slot, target_date, db)
    return SlotAvailability(
        slot_id=slot.id,
        date=str(target_date),
        advisor_name=slot.advisor.name if slot.advisor else None,
        location=slot.location,
        windows=windows,
    )


# ─────────────────────────────────────────────────────────────────────────────
#  APPOINTMENT BOOKING
# ─────────────────────────────────────────────────────────────────────────────

@router.post('/appointments', response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def book_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Student books a 15-minute appointment window."""
    slot = db.query(AdvisorSlot).options(joinedload(AdvisorSlot.advisor)).filter(
        AdvisorSlot.id == payload.slot_id,
        AdvisorSlot.is_active == True,
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail='Advisor slot not found or inactive')
    if not _student_can_use_slot(db, current_student.id, slot.advisor_id):
        raise HTTPException(status_code=403, detail='This advisor slot is not available to you')

    # Validate the date matches the slot's day
    day_map = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if day_map[payload.appointment_date.weekday()] != slot.day_of_week:
        raise HTTPException(
            status_code=400,
            detail=f"The selected date doesn't fall on {slot.day_of_week}."
        )

    # Validate the date is not in the past
    if payload.appointment_date < date.today():
        raise HTTPException(status_code=400, detail='Cannot book an appointment in the past')

    start = _parse_hhmm(payload.start_time)

    # Validate the start_time is within the slot's window
    if not (slot.start_time <= start < slot.end_time):
        raise HTTPException(
            status_code=400,
            detail=f"start_time must be within {_time_to_str(slot.start_time)} – {_time_to_str(slot.end_time)}"
        )

    end = _add_minutes(start, BOOKING_WINDOW_MINUTES)

    # Check for conflicts
    existing = db.query(Appointment).filter(
        Appointment.slot_id == slot.id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.start_time == start,
        Appointment.status.in_(['booked', 'completed']),
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail='This time window is already booked')

    # Prevent a student from double-booking the same advisor on the same day
    student_existing = db.query(Appointment).filter(
        Appointment.student_id == current_student.id,
        Appointment.advisor_id == slot.advisor_id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.status.in_(['booked']),
    ).first()

    if student_existing:
        raise HTTPException(
            status_code=409,
            detail='You already have a booked appointment with this advisor on that day'
        )

    appt = Appointment(
        slot_id=slot.id,
        student_id=current_student.id,
        advisor_id=slot.advisor_id,
        appointment_date=payload.appointment_date,
        start_time=start,
        end_time=end,
        purpose=payload.purpose,
        purpose_notes=payload.purpose_notes,
        status='booked',
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    # Eagerly load relationships for the response
    appt = db.query(Appointment).options(
        joinedload(Appointment.slot),
        joinedload(Appointment.advisor),
        joinedload(Appointment.student).joinedload(Student.user),
    ).filter(Appointment.id == appt.id).first()

    return _appointment_to_read(appt)


@router.get('/appointments/me', response_model=List[AppointmentRead])
def get_my_appointments(
    upcoming_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Student views their own appointments (all or upcoming only)."""
    q = db.query(Appointment).options(
        joinedload(Appointment.slot),
        joinedload(Appointment.advisor),
        joinedload(Appointment.outcome),
    ).filter(Appointment.student_id == current_student.id)

    if upcoming_only:
        q = q.filter(
            Appointment.appointment_date >= date.today(),
            Appointment.status == 'booked',
        )

    appointments = q.order_by(Appointment.appointment_date, Appointment.start_time).all()
    return [_appointment_to_read(a) for a in appointments]


@router.get('/appointments/advisor/me', response_model=List[AppointmentRead])
def get_advisor_appointments(
    appt_date: Optional[date] = Query(None, alias='date'),
    appt_status: Optional[str] = Query(None, alias='status'),
    all_advisors: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Advisor views appointments for their slot (or all slots if admin)."""
    if current_user.role not in {'admin', 'advisor'}:
        raise HTTPException(status_code=403, detail='Only advisors/admins can access this')

    q = db.query(Appointment).options(
        joinedload(Appointment.slot),
        joinedload(Appointment.student).joinedload(Student.user),
        joinedload(Appointment.outcome),
    )
    
    if not (all_advisors and current_user.role == 'admin'):
        q = q.filter(Appointment.advisor_id == current_user.id)

    if appt_date:
        q = q.filter(Appointment.appointment_date == appt_date)
    if appt_status:
        q = q.filter(Appointment.status == appt_status)

    appointments = q.order_by(Appointment.appointment_date.desc(), Appointment.start_time.asc()).all()
    return [_appointment_to_read(a) for a in appointments]


@router.delete('/appointments/{appointment_id}', status_code=status.HTTP_204_NO_CONTENT)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Student cancels their appointment (only if it's more than 24 hours away)."""
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.student_id == current_student.id,
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail='Appointment not found')
    if appt.status != 'booked':
        raise HTTPException(status_code=400, detail=f"Cannot cancel an appointment with status '{appt.status}'")

    # Must be more than 24 hours in the future
    appointment_datetime = datetime.combine(appt.appointment_date, appt.start_time)
    now = datetime.now()
    if appointment_datetime - now < timedelta(hours=24):
        raise HTTPException(status_code=400, detail='Appointments can only be cancelled more than 24 hours in advance')

    appt.status = 'cancelled'
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
#  POST-MEETING OUTCOMES
# ─────────────────────────────────────────────────────────────────────────────

@router.patch('/appointments/{appointment_id}/outcome/advisor', response_model=OutcomeRead)
def submit_advisor_outcome(
    appointment_id: int,
    payload: AdvisorOutcomeSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Advisor marks whether the meeting issue was resolved or still pending."""
    if current_user.role not in {'admin', 'advisor'}:
        raise HTTPException(status_code=403, detail='Only advisors/admins can access this')

    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.advisor_id == current_user.id,
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail='Appointment not found')

    # Update the appointment status
    if payload.status in ('completed', 'no_show'):
        appt.status = payload.status
    elif appt.status == 'booked':
        appt.status = 'completed'

    outcome = appt.outcome
    if not outcome:
        outcome = AppointmentOutcome(appointment_id=appt.id)
        db.add(outcome)

    advisor_rating = payload.rating
    if advisor_rating is None and payload.resolved is not None:
        advisor_rating = 5 if payload.resolved else 1
    if advisor_rating is None:
        raise HTTPException(status_code=400, detail='Advisor rating is required')

    outcome.resolved_by_advisor = advisor_rating
    outcome.advisor_notes = payload.notes
    outcome.advisor_submitted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(outcome)
    return outcome


@router.patch('/appointments/{appointment_id}/outcome/student', response_model=OutcomeRead)
def submit_student_rating(
    appointment_id: int,
    payload: StudentOutcomeSubmit,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Student rates the meeting after the advisor completes it or after the date has passed."""
    appt = db.query(Appointment).options(joinedload(Appointment.outcome)).filter(
        Appointment.id == appointment_id,
        Appointment.student_id == current_student.id,
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail='Appointment not found')

    if appt.status not in ('completed', 'booked'):
        raise HTTPException(status_code=400, detail=f"Cannot rate an appointment with status '{appt.status}'")
    if appt.status != 'completed' and appt.appointment_date >= date.today():
        raise HTTPException(status_code=400, detail='You can only rate after the advisor completes the meeting or after the meeting date')

    outcome = appt.outcome
    if not outcome:
        outcome = AppointmentOutcome(appointment_id=appt.id)
        db.add(outcome)

    outcome.student_rating = payload.rating
    outcome.student_feedback = payload.feedback

    db.commit()
    db.refresh(outcome)
    return outcome


# ─────────────────────────────────────────────────────────────────────────────
#  ADMIN ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get('/admin/appointments', response_model=List[AppointmentRead])
def admin_list_appointments(
    advisor_id: Optional[int] = Query(None),
    appt_status: Optional[str] = Query(None, alias='status'),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin views all appointments with optional filters."""
    q = db.query(Appointment).options(
        joinedload(Appointment.slot),
        joinedload(Appointment.advisor),
        joinedload(Appointment.student).joinedload(Student.user),
        joinedload(Appointment.outcome),
    )

    if advisor_id:
        q = q.filter(Appointment.advisor_id == advisor_id)
    if appt_status:
        q = q.filter(Appointment.status == appt_status)
    if from_date:
        q = q.filter(Appointment.appointment_date >= from_date)
    if to_date:
        q = q.filter(Appointment.appointment_date <= to_date)

    appointments = q.order_by(Appointment.appointment_date.desc(), Appointment.start_time).all()
    return [_appointment_to_read(a) for a in appointments]


@router.get('/admin/advisors/performance', response_model=List[AdvisorPerformance])
def admin_advisor_performance(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin views per-advisor statistics for performance monitoring."""
    # Get all advisors who have active slots
    advisor_users = db.query(User).join(
        AdvisorSlot, AdvisorSlot.advisor_id == User.id
    ).filter(AdvisorSlot.is_active == True).distinct().all()

    results = []
    for advisor in advisor_users:
        appointments = db.query(Appointment).options(
            joinedload(Appointment.outcome)
        ).filter(Appointment.advisor_id == advisor.id).all()

        total = len(appointments)
        completed = [a for a in appointments if a.status == 'completed']
        no_show = sum(1 for a in appointments if a.status == 'no_show')
        cancelled = sum(1 for a in appointments if a.status == 'cancelled')

        # Resolution rate: % of completed appointments marked as resolved
        resolved_count = sum(
            1 for a in completed
            if a.outcome and a.outcome.resolved_by_advisor is True
        )
        resolution_rate = (resolved_count / len(completed) * 100) if completed else None

        # Average student rating
        ratings = [
            a.outcome.student_rating
            for a in appointments
            if a.outcome and a.outcome.student_rating is not None
        ]
        avg_rating = (sum(ratings) / len(ratings)) if ratings else None

        results.append(AdvisorPerformance(
            advisor_id=advisor.id,
            advisor_name=advisor.name,
            total_appointments=total,
            completed=len(completed),
            no_show=no_show,
            cancelled=cancelled,
            resolution_rate=round(resolution_rate, 1) if resolution_rate is not None else None,
            avg_student_rating=round(avg_rating, 2) if avg_rating is not None else None,
        ))

    return results
