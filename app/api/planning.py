from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.core.security import get_current_student
from app.database import get_db
from app.models import (
    Course, Student, StudentCourse, StudyPlan, CoursePrerequisite,
    AcademicRule, Major, AIChatMessage, Request, PlannerState
)
from app.schemas.planning import (
    GPASummary, PlannerStateRead, PlannerStateUpsert, PlanningOverview,
    StudentCourseRead, StudentCourseUpsert, SummerRequestRead,
    AdvisorMessageRead, AdvisorMessageCreate
)
from app.models.planning import AdvisorMessage
from app.services.planning_service import PlanningService
from app.services.search_service import SearchService
from app.utils.helpers import SuspiciousInputError, sanitize_model

# ---- New Pydantic models ----
class CareerPathTimeline(BaseModel):
    career_path: str = ""
    semesters: list[dict] = []
    total_progress: float = 0.0
    estimated_graduation: str = ""

class ChatMessage(BaseModel):
    message: str
    channel: str = "planning_advisor"

class AdvisorResponse(BaseModel):
    message: str
    suggestions: list[str] = []

class SummerCourseRequest(BaseModel):
    course_id: int
    course_name: str = ""

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


@router.post('/me/courses', response_model=StudentCourseRead, status_code=status.HTTP_201_CREATED)
def add_course_to_plan(payload: StudentCourseUpsert, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    try:
        payload = sanitize_model(payload)
    except SuspiciousInputError:
        raise HTTPException(status_code=400, detail='Input rejected')
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    enrollment = StudentCourse(student_id=current_student.id, **payload.model_dump())
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


# ========== NEW ENDPOINTS ==========

@router.get('/timeline/me', response_model=CareerPathTimeline)
def get_career_timeline(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Career path timeline for preview page"""
    major_id = current_student.major_id or 1
    study_plan = db.query(StudyPlan).filter(StudyPlan.major_id == major_id, StudyPlan.is_active == True).all()
    student_courses = db.query(StudentCourse).filter(StudentCourse.student_id == current_student.id).all()
    all_courses = {c.id: c for c in db.query(Course).all()}
    major = db.query(Major).filter(Major.id == major_id).first()
    career_path = major.name if major else "Computer Science"
    
    completed_ids = {sc.course_id for sc in student_courses if sc.status == 'completed'}
    semesters = []
    current_found = False
    
    for level, sem, name in SEMESTER_ORDER:
        plan_courses = [sp for sp in study_plan if sp.recommended_level_no == level and sp.semester == sem]
        if not plan_courses:
            continue
        
        sem_data = {
            "name": name, "level": level, "semester": sem,
            "courses": [], "total_credits": 0, "completed_credits": 0, "status": "upcoming"
        }
        
        for sp in plan_courses:
            course = all_courses.get(sp.course_id)
            if not course:
                continue
            is_completed = sp.course_id in completed_ids
            sem_data["total_credits"] += course.credits
            if is_completed:
                sem_data["completed_credits"] += course.credits
            grade = next((sc.grade for sc in student_courses if sc.course_id == sp.course_id and sc.grade), None)
            sem_data["courses"].append({
                "code": course.code, "name": course.name, "credits": course.credits,
                "completed": is_completed, "grade": grade
            })
        
        if sem_data["total_credits"] > 0 and sem_data["completed_credits"] >= sem_data["total_credits"]:
            sem_data["status"] = "completed"
        elif sem_data["completed_credits"] > 0 and not current_found:
            sem_data["status"] = "current"
            current_found = True
        elif sem == "Summer":
            sem_data["status"] += " summer"
        
        semesters.append(sem_data)
    
    total_credits = sum(s["total_credits"] for s in semesters)
    completed_credits = sum(s["completed_credits"] for s in semesters)
    progress = round((completed_credits / total_credits * 100), 1) if total_credits > 0 else 0
    
    return CareerPathTimeline(
        career_path=career_path, semesters=semesters,
        total_progress=progress, estimated_graduation=str(current_student.graduation_year or "N/A")
    )


@router.get('/summer-courses/me')
def get_summer_courses(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Recommended summer courses"""
    major_id = current_student.major_id or 1
    study_plan = db.query(StudyPlan).filter(
        StudyPlan.major_id == major_id, StudyPlan.is_active == True, StudyPlan.semester == 'Summer'
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


@router.post('/summer-courses/request')
def submit_summer_request(payload: SummerCourseRequest, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Submit summer course request - saves to requests table"""
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    
    req = Request(
        student=current_student.student_code or str(current_student.id),
        course=payload.course_name or course.name,
        reason=payload.course_name # Reusing course_name for now or adding reason to payload
    )
    db.add(req)
    db.commit()
    return {"success": True, "message": f"Summer course request for '{course.name}' submitted"}


@router.get('/requests/me', response_model=List[SummerRequestRead])
def get_my_requests(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Get my summer course requests"""
    student_code = current_student.student_code or str(current_student.id)
    return db.query(Request).filter(Request.student == student_code).all()
@router.delete('/requests/{request_id}')
def cancel_request(request_id: int, db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Cancel a pending summer course request"""
    student_code = current_student.student_code or str(current_student.id)
    req = db.query(Request).filter(Request.id == request_id, Request.student == student_code).first()
    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    if req.status != 'Pending':
        raise HTTPException(status_code=400, detail='Only pending requests can be cancelled')
    
    db.delete(req)
    db.commit()
    return {"message": "Request cancelled successfully"}


@router.get('/advisor-messages', response_model=List[AdvisorMessageRead])
def get_advisor_messages(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    """Get messages between student and advisor (admin)"""
    return db.query(AdvisorMessage).filter(AdvisorMessage.student_id == current_student.id).order_by(AdvisorMessage.created_at.asc()).all()


@router.post('/advisor-messages', response_model=AdvisorMessageRead)
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
    return msg


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