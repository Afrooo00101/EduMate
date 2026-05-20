import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.core.security import get_current_advisor, get_current_student
from app.database import get_db
from app.models.course import Course, StudentCourse, CoursePrerequisite
from app.models.user import Student, Major, User
from app.models.analytics import AIChatMessage
from app.models.planning import (
    AcademicRule, StudyPlan, PlannerState, SummerRequest, AdvisorMessage
)
from app.schemas.planning import (
    GPASummary, PlannerStateRead, PlannerStateUpsert, PlanningOverview,
    StudentCourseRead, StudentCourseUpsert, SummerRequestRead, SummerRequestCreate,
    AdvisorMessageRead, AdvisorMessageCreate
)
from app.services.planning_service import PlanningService
from app.services.search_service import SearchService
from app.utils.helpers import SuspiciousInputError, sanitize_model

SUMMER_REQUESTS_JSON_KEY = "summer_requests"


def _state_for_student(db: Session, student_id: int) -> PlannerState:
    return PlanningService(db).get_or_create_state(student_id)


def _state_payload(state: PlannerState) -> dict:
    try:
        data = json.loads(state.skills_progress_json or "{}")
        return data if isinstance(data, dict) else {}
    except (TypeError, ValueError):
        return {}


def _save_state_payload(db: Session, state: PlannerState, payload: dict) -> None:
    state.skills_progress_json = json.dumps(payload)
    db.add(state)
    db.commit()


def _fallback_summer_requests(db: Session, student: Student) -> list[dict]:
    state = _state_for_student(db, student.id)
    payload = _state_payload(state)
    requests = payload.get(SUMMER_REQUESTS_JSON_KEY, [])
    if not isinstance(requests, list):
        return []
    courses = {c.id: c for c in db.query(Course).filter(Course.id.in_([int(r.get("course_id", 0)) for r in requests if r.get("course_id")])).all()} if requests else {}
    results = []
    for r in sorted(requests, key=lambda item: item.get("requested_at") or "", reverse=True):
        course = courses.get(int(r.get("course_id", 0)))
        results.append({
            "id": int(r.get("id", 0)),
            "student_id": student.id,
            "course_id": int(r.get("course_id", 0)),
            "semester": r.get("semester") or "Summer",
            "reason": r.get("reason"),
            "status": r.get("status") or "pending",
            "admin_notes": r.get("admin_notes"),
            "requested_at": r.get("requested_at"),
            "course": {"code": course.code, "name": course.name, "credits": course.credits} if course else None,
        })
    return results


def _add_fallback_summer_request(db: Session, student: Student, payload: SummerRequestCreate, course: Course) -> dict:
    state = _state_for_student(db, student.id)
    data = _state_payload(state)
    requests = data.get(SUMMER_REQUESTS_JSON_KEY, [])
    if not isinstance(requests, list):
        requests = []
    next_id = max([int(r.get("id", 0)) for r in requests] + [0]) + 1
    item = {
        "id": next_id,
        "student_id": student.id,
        "course_id": payload.course_id,
        "semester": payload.semester or "Summer",
        "reason": payload.reason,
        "status": "pending",
        "admin_notes": None,
        "requested_at": datetime.now().isoformat(timespec="seconds"),
    }
    requests.append(item)
    data[SUMMER_REQUESTS_JSON_KEY] = requests
    _save_state_payload(db, state, data)
    return item


def _delete_fallback_summer_request(db: Session, student: Student, request_id: int) -> bool:
    state = _state_for_student(db, student.id)
    data = _state_payload(state)
    requests = data.get(SUMMER_REQUESTS_JSON_KEY, [])
    if not isinstance(requests, list):
        return False
    kept = [r for r in requests if int(r.get("id", 0)) != request_id]
    if len(kept) == len(requests):
        return False
    data[SUMMER_REQUESTS_JSON_KEY] = kept
    _save_state_payload(db, state, data)
    return True


def _assigned_student_ids_for_advisor(db: Session, advisor_id: int) -> set[int]:
    rows = db.execute(
        text("SELECT student_id FROM student_advisors WHERE advisor_id = :advisor_id"),
        {"advisor_id": advisor_id},
    ).fetchall()
    return {int(row[0]) for row in rows}


def _advisor_fallback_summer_requests(db: Session, advisor: User) -> list[dict]:
    assigned_ids = _assigned_student_ids_for_advisor(db, advisor.id)
    if not assigned_ids:
        return []
    students = db.query(Student).filter(Student.id.in_(assigned_ids)).all()
    results = []
    for student in students:
        for request in _fallback_summer_requests(db, student):
            request["student_name"] = student.full_name
            request["student_code"] = student.student_code
            results.append(request)
    return sorted(results, key=lambda item: item.get("requested_at") or "", reverse=True)


def _update_fallback_summer_request_status(
    db: Session,
    advisor: User,
    student_id: int,
    request_id: int,
    status_value: str,
    admin_notes: str | None,
) -> dict:
    assigned_ids = _assigned_student_ids_for_advisor(db, advisor.id)
    if student_id not in assigned_ids:
        raise HTTPException(status_code=403, detail="This student is not assigned to you")
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    state = _state_for_student(db, student_id)
    data = _state_payload(state)
    requests = data.get(SUMMER_REQUESTS_JSON_KEY, [])
    if not isinstance(requests, list):
        requests = []
    for item in requests:
        if int(item.get("id", 0)) == request_id:
            item["status"] = status_value
            item["admin_notes"] = admin_notes
            item["reviewed_at"] = datetime.now().isoformat(timespec="seconds")
            data[SUMMER_REQUESTS_JSON_KEY] = requests
            _save_state_payload(db, state, data)
            updated = _fallback_summer_requests(db, student)
            return next(r for r in updated if r["id"] == request_id)
    raise HTTPException(status_code=404, detail="Request not found")

# ---- New Pydantic models ----
class CareerPathTimeline(BaseModel):
    career_path: str = ""
    semesters: list[dict] = []
    total_progress: float = 0.0
    estimated_graduation: str = ""

# Pydantic models for specific payloads
class ChatMessage(BaseModel):
    message: str
    channel: str = "planning_advisor"

class AdvisorResponse(BaseModel):
    message: str
    suggestions: list[str] = []


class SummerRequestDecision(BaseModel):
    status: str
    admin_notes: str | None = None

# ----

router = APIRouter(prefix='/planning', tags=['planning'])

GRADE_POINTS = {'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0}

SEMESTER_ORDER = [
    (1, "Fall", "Foundations"), (1, "Spring", "Core Basics"), (1, "Summer", "Summer Term 1"),
    (2, "Fall", "Core & Data"), (2, "Spring", "Web & Software"), (2, "Summer", "Summer Internship"),
    (3, "Fall", "Advanced Topics"), (3, "Spring", "Specialization"), (3, "Summer", "Summer Term 2"),
    (4, "Fall", "Capstone Prep"), (4, "Spring", "Final Project"),
]


# ========== EXISTING ENDPOINTS ==========

@router.get('/me', response_model=PlanningOverview)
def get_my_planning(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    enrollments = SearchService(db).get_student_planning(current_student.id)
    total_credits = sum(item.course.credits for item in enrollments if item.course)
    completed_courses = sum(1 for item in enrollments if item.status == 'completed')
    planned_courses = sum(1 for item in enrollments if item.status != 'completed')
    return PlanningOverview(total_credits=total_credits, completed_courses=completed_courses, planned_courses=planned_courses, enrollments=enrollments)


@router.get('/overview/me')
def get_planning_overview(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Get comprehensive planning overview for dashboard"""
    return PlanningService(db).get_planning_overview(current_student.id)


@router.post('/me/courses', response_model=StudentCourseRead, status_code=status.HTTP_201_CREATED)
def add_course_to_plan(payload: StudentCourseUpsert, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    try:
        payload = sanitize_model(payload)
    except SuspiciousInputError:
        raise HTTPException(status_code=400, detail='Input rejected')
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    existing = db.query(StudentCourse).filter(
        StudentCourse.student_id == current_student.id,
        StudentCourse.course_id == payload.course_id,
        StudentCourse.semester == payload.semester,
    ).first()
    if existing:
        existing.status = payload.status
        existing.grade = payload.grade
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    next_id = db.execute(text("SELECT COALESCE(MAX(id), 0) + 1 FROM student_courses")).scalar() or 1
    enrollment = StudentCourse(id=next_id, student_id=current_student.id, **payload.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get('/state/me', response_model=PlannerStateRead)
def get_planner_state(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return PlanningService(db).get_or_create_state(current_student.id)


@router.put('/state/me', response_model=PlannerStateRead)
def upsert_planner_state(payload: PlannerStateUpsert, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    payload = sanitize_model(payload)
    return PlanningService(db).upsert_state(current_student.id, payload)


@router.get('/gpa/me', response_model=GPASummary)
def get_gpa_summary(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    return PlanningService(db).calculate_gpa_summary(current_student.id)


@router.delete('/enroll/{course_id}')
def delete_enrollment(course_id: int, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Remove a course enrollment/planning record"""
    result = PlanningService(db).remove_enrollment(current_student.id, course_id)
    if not result:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"success": True, "message": "Enrollment removed"}


@router.put('/enroll/{course_id}')
def update_enrollment(course_id: int, status: str = Query('planned'), grade: str = Query(None), db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Update course status or grade"""
    result = PlanningService(db).update_enrollment(current_student.id, course_id, status, grade)
    if not result:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"success": True, "message": "Enrollment updated"}


@router.post('/enroll')
def bulk_enroll(payload: List[dict], db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Bulk enroll/plan multiple courses"""
    PlanningService(db).bulk_enroll(current_student.id, payload)
    return {"success": True, "message": f"{len(payload)} courses added to plan"}


# ========== NEW ENDPOINTS ==========

@router.get('/career-path/me', response_model=CareerPathTimeline)
def get_career_path(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Enhanced Career Path Visualization endpoint"""
    major_id = current_student.major_id or 1
    # Algorithm: Get all courses from study_plan for major ordered by display_order
    study_plan = db.query(StudyPlan).filter(StudyPlan.major_id == major_id, StudyPlan.is_active == True).order_by(StudyPlan.display_order).all()
    student_courses = db.query(StudentCourse).filter(StudentCourse.student_id == current_student.id).all()
    all_courses = {c.id: c for c in db.query(Course).all()}
    major = db.query(Major).filter(Major.id == major_id).first()
    career_path = major.name if major else "Academic Path"
    
    sc_map = {sc.course_id: sc for sc in student_courses}
    
    # Grouping by Year and Semester
    semesters_data = {} # Key: (Year, Semester)
    
    for sp in study_plan:
        course = all_courses.get(sp.course_id)
        if not course: continue
        
        year = sp.recommended_level_no or 1
        sem = sp.semester
        key = (year, sem)
        
        if key not in semesters_data:
            semesters_data[key] = {
                "semester_name": sem, 
                "level": year, 
                "total_credits": 0, 
                "completed_credits": 0,
                "courses": [], 
                "status": "upcoming",
                "gpa": None
            }
        
        sc = sc_map.get(sp.course_id)
        status = "upcoming"
        icon = "⏳"
        grade = None
        
        if sc:
            if sc.status == 'completed':
                status = "completed"
                icon = "✅"
                grade = sc.grade
                semesters_data[key]["completed_credits"] += course.credits
            elif sc.status in ['enrolled', 'in_progress', 'planned']:
                status = sc.status
                icon = "🔄"
        
        semesters_data[key]["total_credits"] += course.credits
        semesters_data[key]["courses"].append({
            "id": course.id, 
            "code": course.code, 
            "name": course.name,
            "name_ar": getattr(course, "name_ar", None),
            "credits": course.credits, 
            "status": status, 
            "icon": icon, 
            "grade": grade,
            "semester": sem,
            # Add nested course object for frontend compatibility with loadAcademicPlan
            "course": {
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "name_ar": getattr(course, "name_ar", None),
                "credits": course.credits
            }
        })

    # Convert map to list and sort by SEMESTER_ORDER
    sorted_keys = sorted(semesters_data.keys())
    semesters = []
    for k in sorted_keys:
        sd = semesters_data[k]
        # Set overall semester status based on courses
        if sd["total_credits"] > 0:
            if sd["completed_credits"] >= sd["total_credits"]:
                sd["status"] = "completed"
            elif any(c["status"] == "in-progress" for c in sd["courses"]):
                sd["status"] = "in-progress"
        semesters.append(sd)

    total_credits = sum(s["total_credits"] for s in semesters)
    completed_credits = sum(s["completed_credits"] for s in semesters)
    progress = round((completed_credits / total_credits * 100), 1) if total_credits > 0 else 0
    gpa_summary = PlanningService(db).calculate_gpa_summary(current_student.id)
    
    return CareerPathTimeline(
        career_path=career_path, semesters=semesters,
        total_progress=progress,
        current_gpa=gpa_summary.cumulative_gpa,
        estimated_graduation=str(current_student.graduation_year or "N/A")
    )

@router.get('/timeline/me', response_model=CareerPathTimeline)
def get_career_timeline_alias(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Alias for career-path/me"""
    return get_career_path(db, current_student)


@router.get('/summer-courses/me')
def get_summer_courses(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Recommended summer courses"""
    major_id = current_student.major_id or 1
    study_plan = db.query(StudyPlan).filter(
        StudyPlan.major_id == major_id, StudyPlan.is_active == True
    ).all()
    student_courses = db.query(StudentCourse).filter(StudentCourse.student_id == current_student.id).all()
    all_courses = {c.id: c for c in db.query(Course).all()}
    prereqs = db.query(CoursePrerequisite).all()
    completed_ids = {sc.course_id for sc in student_courses if sc.status == 'completed'}
    
    result = []
    for sp in study_plan:
        if sp.course_id in completed_ids:
            continue
        course = all_courses.get(sp.course_id)
        if not course:
            continue
        
        prereq = next((p for p in prereqs if p.course_id == sp.course_id), None)
        prereq_met = True
        prereq_info = None
        if prereq and prereq.prerequisite_course_id not in completed_ids:
            prereq_met = False
            pc = all_courses.get(prereq.prerequisite_course_id)
            prereq_info = {"code": pc.code, "name": pc.name} if pc else None
        
        result.append({
            "id": course.id, "code": course.code, "name": course.name,
            "credits": course.credits, "prerequisite_met": prereq_met, "prerequisite": prereq_info
        })
    
    return result


@router.get('/courses')
def get_all_courses(db: Session = Depends(get_db)):
    """Get all courses in the database"""
    courses = db.query(Course).all()
    return [
        {"id": c.id, "code": c.code, "name": c.name, "credits": c.credits}
        for c in courses
    ]


@router.post('/summer-courses/request')
def submit_summer_request(payload: SummerRequestCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Submit summer course request to the database."""
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')

    try:
        req = SummerRequest(
            student_id=current_student.id,
            course_id=payload.course_id,
            semester=payload.semester or "Summer",
            reason=payload.reason,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return {"success": True, "message": f"Summer course request for '{course.name}' submitted", "request_id": req.id}
    except (OperationalError, ProgrammingError):
        db.rollback()
        item = _add_fallback_summer_request(db, current_student, payload, course)
        return {"success": True, "message": f"Summer course request for '{course.name}' submitted", "request_id": item["id"]}


@router.get('/requests/me')
def get_my_requests(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Get my summer course requests with course details."""
    try:
        reqs = db.query(SummerRequest).filter(
            SummerRequest.student_id == current_student.id
        ).order_by(SummerRequest.requested_at.desc()).all()
    except (OperationalError, ProgrammingError):
        db.rollback()
        return _fallback_summer_requests(db, current_student)

    results = []
    for r in reqs:
        results.append({
            "id": r.id,
            "student_id": r.student_id,
            "course_id": r.course_id,
            "semester": r.semester,
            "reason": r.reason,
            "status": r.status,
            "admin_notes": r.admin_notes,
            "requested_at": r.requested_at.isoformat() if r.requested_at else None,
            "course": {"code": r.course.code, "name": r.course.name, "credits": r.course.credits} if r.course else None
        })
    return results

@router.delete('/requests/{request_id}')
def cancel_request(request_id: int, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Cancel a pending summer course request"""
    try:
        req = db.query(SummerRequest).filter(SummerRequest.id == request_id, SummerRequest.student_id == current_student.id).first()
    except (OperationalError, ProgrammingError):
        db.rollback()
        if _delete_fallback_summer_request(db, current_student, request_id):
            return {"message": "Request cancelled successfully"}
        raise HTTPException(status_code=404, detail='Request not found')

    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    if req.status != 'pending':
        raise HTTPException(status_code=400, detail='Only pending requests can be cancelled')
    
    db.delete(req)
    db.commit()
    return {"message": "Request cancelled successfully"}


@router.get('/advisor/requests')
def get_advisor_summer_requests(db: Session = Depends(get_db), current_advisor: User = Depends(get_current_advisor)):
    """Advisor views summer course requests submitted by assigned students."""
    assigned_ids = _assigned_student_ids_for_advisor(db, current_advisor.id)
    if not assigned_ids:
        return []
    try:
        reqs = db.query(SummerRequest).filter(
            SummerRequest.student_id.in_(assigned_ids)
        ).order_by(SummerRequest.requested_at.desc()).all()
    except (OperationalError, ProgrammingError):
        db.rollback()
        return _advisor_fallback_summer_requests(db, current_advisor)

    students = {s.id: s for s in db.query(Student).filter(Student.id.in_(assigned_ids)).all()}
    results = []
    for r in reqs:
        student = students.get(r.student_id)
        results.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": student.full_name if student else None,
            "student_code": student.student_code if student else None,
            "course_id": r.course_id,
            "semester": r.semester,
            "reason": r.reason,
            "status": r.status,
            "admin_notes": r.admin_notes,
            "requested_at": r.requested_at.isoformat() if r.requested_at else None,
            "course": {"code": r.course.code, "name": r.course.name, "credits": r.course.credits} if r.course else None,
        })
    return results


@router.patch('/advisor/requests/{student_id}/{request_id}')
def decide_advisor_summer_request(
    student_id: int,
    request_id: int,
    payload: SummerRequestDecision,
    db: Session = Depends(get_db),
    current_advisor: User = Depends(get_current_advisor),
):
    """Advisor approves or rejects an assigned student's summer course request."""
    status_value = payload.status.lower().strip()
    if status_value not in {"approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Status must be approved or rejected")

    assigned_ids = _assigned_student_ids_for_advisor(db, current_advisor.id)
    if student_id not in assigned_ids:
        raise HTTPException(status_code=403, detail="This student is not assigned to you")

    try:
        req = db.query(SummerRequest).filter(
            SummerRequest.id == request_id,
            SummerRequest.student_id == student_id,
        ).first()
    except (OperationalError, ProgrammingError):
        db.rollback()
        return _update_fallback_summer_request_status(
            db, current_advisor, student_id, request_id, status_value, payload.admin_notes
        )

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req.status = status_value
    req.admin_notes = payload.admin_notes
    db.add(req)
    db.commit()
    db.refresh(req)
    student = db.query(Student).filter(Student.id == student_id).first()
    return {
        "id": req.id,
        "student_id": req.student_id,
        "student_name": student.full_name if student else None,
        "student_code": student.student_code if student else None,
        "course_id": req.course_id,
        "semester": req.semester,
        "reason": req.reason,
        "status": req.status,
        "admin_notes": req.admin_notes,
        "requested_at": req.requested_at.isoformat() if req.requested_at else None,
        "course": {"code": req.course.code, "name": req.course.name, "credits": req.course.credits} if req.course else None,
    }


@router.get('/advisor-messages')
def get_advisor_messages(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Get messages between student and advisor (admin)"""
    msgs = db.query(AdvisorMessage).filter(
        AdvisorMessage.student_id == current_student.id
    ).order_by(AdvisorMessage.created_at.asc()).all()
    return [
        {
            "id": m.id,
            "sender_role": m.sender_role,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "is_read": m.is_read
        }
        for m in msgs
    ]


@router.post('/advisor-messages')
def send_advisor_message(payload: AdvisorMessageCreate, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Send a message to the advisor (admin)"""
    msg = AdvisorMessage(
        student_id=current_student.id,
        sender_role='student',
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "sender_role": msg.sender_role,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
        "is_read": msg.is_read
    }


@router.post('/advisor/chat', response_model=AdvisorResponse)
def advisor_chat(payload: ChatMessage, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """AI Advisor chat for planning page"""
    major_id = current_student.major_id or 1
    study_plan = db.query(StudyPlan).filter(StudyPlan.major_id == major_id, StudyPlan.is_active == True).all()
    student_courses = db.query(StudentCourse).filter(StudentCourse.student_id == current_student.id).all()
    all_courses = {c.id: c for c in db.query(Course).all()}
    completed_ids = {sc.course_id for sc in student_courses if sc.status == 'completed'}
    gpa = float(current_student.gpa) if current_student.gpa else 0.0
    major = db.query(Major).filter(Major.id == major_id).first()
    major_name = major.name if major else "your program"
    
    msg = payload.message.lower()
    
    if any(w in msg for w in ["next", "recommend", "course", "take"]):
        not_taken = [sp for sp in study_plan if sp.course_id not in completed_ids][:5]
        if not_taken:
            courses = [f"• **{all_courses[sp.course_id].code}** - {all_courses[sp.course_id].name} ({all_courses[sp.course_id].credits}cr)" for sp in not_taken if sp.course_id in all_courses]
            response = f"📚 Recommended courses for **{major_name}**:\n\n" + "\n".join(courses)
        else:
            response = f"🎉 You've completed all courses! Focus on capstone and internships."
        suggestions = ["Show summer courses", "Check graduation timeline", "My progress"]
    elif any(w in msg for w in ["summer"]):
        summer = [sp for sp in study_plan if sp.semester == 'Summer' and sp.course_id not in completed_ids][:4]
        if summer:
            courses = [f"• **{all_courses[sp.course_id].code}** - {all_courses[sp.course_id].name} ({all_courses[sp.course_id].credits}cr)" for sp in summer if sp.course_id in all_courses]
            response = f"☀️ Summer courses available:\n\n" + "\n".join(courses)
        else:
            response = "No summer courses needed. You're on track!"
        suggestions = ["Request summer course", "Next semester", "Graduation timeline"]
    elif any(w in msg for w in ["graduate", "timeline", "progress"]):
        total = sum(all_courses[sp.course_id].credits for sp in study_plan if sp.course_id in all_courses)
        earned = sum(all_courses[sc.course_id].credits for sc in student_courses if sc.status == 'completed' and sc.course_id in all_courses)
        pct = round((earned / total * 100), 1) if total > 0 else 0
        response = f"🎓 **Progress**: {pct}%\n• Credits: {earned}/{total}\n• GPA: {gpa:.2f}\n• Graduate: {current_student.graduation_year or 'N/A'}"
        suggestions = ["Next courses", "Summer courses", "Prerequisites"]
    else:
        response = f"👋 Hello! I'm your **{major_name}** advisor. GPA: {gpa:.2f}. Ask me about courses, summer, or graduation!"
        suggestions = ["Recommend courses", "Summer courses", "Graduation timeline", "My progress"]
    
    # Save to database
    try:
        chat = AIChatMessage(
            student_id=current_student.id, channel="planning_advisor",
            user_message=payload.message, assistant_message=response
        )
        db.add(chat)
        db.commit()
    except:
        pass
    
    return AdvisorResponse(message=response, suggestions=suggestions)


@router.get('/majors')
def list_majors(db: Session = Depends(get_db)):
    return [{"id": m.id, "name": m.name, "department": m.department} for m in db.query(Major).all()]


@router.get('/study-plan')
def get_study_plan_data(major_id: int = Query(None), db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    mid = major_id or current_student.major_id or 1
    plans = db.query(StudyPlan).filter(StudyPlan.major_id == mid, StudyPlan.is_active == True).order_by(StudyPlan.recommended_level_no, StudyPlan.display_order).all()
    all_courses = {c.id: c for c in db.query(Course).all()}
    return [{
        "id": sp.id, "major_id": sp.major_id, "course_id": sp.course_id,
        "semester": sp.semester, "level": sp.recommended_level_no,
        "course": {"code": all_courses[sp.course_id].code, "name": all_courses[sp.course_id].name, "credits": all_courses[sp.course_id].credits} if sp.course_id in all_courses else None
    } for sp in plans]
