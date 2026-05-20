import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.models.planning import PlannerState
from app.models.user import Student, User
from app.schemas.requests_page import RequestPageCreate
from app.services.planning_service import PlanningService

router = APIRouter(
    prefix="/requests",
    tags=["Requests Page"],
)

SUMMER_REQUESTS_JSON_KEY = "summer_requests"


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


def _request_rows(db: Session) -> list[dict]:
    states = db.query(PlannerState).all()
    course_ids: set[int] = set()
    student_ids: set[int] = set()
    raw_rows: list[tuple[int, dict]] = []

    for state in states:
        requests = _state_payload(state).get(SUMMER_REQUESTS_JSON_KEY, [])
        if not isinstance(requests, list):
            continue
        for item in requests:
            raw_rows.append((state.student_id, item))
            student_ids.add(state.student_id)
            if item.get("course_id"):
                course_ids.add(int(item["course_id"]))

    students = {
        student.id: student
        for student in db.query(Student).filter(Student.id.in_(student_ids)).all()
    } if student_ids else {}
    courses = {
        course.id: course
        for course in db.query(Course).filter(Course.id.in_(course_ids)).all()
    } if course_ids else {}

    rows = []
    for student_id, item in raw_rows:
        student = students.get(student_id)
        course = courses.get(int(item.get("course_id", 0)))
        rows.append({
            "id": int(item.get("id", 0)),
            "student_id": student_id,
            "student": student.full_name if student else f"Student #{student_id}",
            "student_code": student.student_code if student else None,
            "course_id": int(item.get("course_id", 0)),
            "course": f"{course.code} - {course.name}" if course else "Unknown course",
            "course_code": course.code if course else None,
            "course_name": course.name if course else None,
            "semester": item.get("semester") or "Summer",
            "reason": item.get("reason"),
            "status": item.get("status") or "pending",
            "admin_notes": item.get("admin_notes"),
            "requested_at": item.get("requested_at"),
        })
    return sorted(rows, key=lambda row: row.get("requested_at") or "", reverse=True)


def _find_student(db: Session, value: str) -> Student | None:
    token = value.strip()
    if not token:
        return None
    return (
        db.query(Student)
        .join(User)
        .filter(or_(Student.student_code == token, User.email == token, User.name.ilike(f"%{token}%")))
        .first()
    )


def _find_course(db: Session, value: str) -> Course | None:
    token = value.strip()
    if not token:
        return None
    return db.query(Course).filter(or_(Course.code == token, Course.name.ilike(f"%{token}%"))).first()

# ======================
# GET ALL REQUESTS
# ======================
@router.get("")
def get_requests(db: Session = Depends(get_db)):
    return _request_rows(db)


# ======================
# ADD REQUEST
# ======================
@router.post("")
def add_request(payload: RequestPageCreate, db: Session = Depends(get_db)):
    student = _find_student(db, payload.student)
    course = _find_course(db, payload.course)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    state = PlanningService(db).get_or_create_state(student.id)
    data = _state_payload(state)
    requests = data.get(SUMMER_REQUESTS_JSON_KEY, [])
    if not isinstance(requests, list):
        requests = []

    next_id = max([int(item.get("id", 0)) for item in requests] + [0]) + 1
    requests.append({
        "id": next_id,
        "student_id": student.id,
        "course_id": course.id,
        "semester": "Summer",
        "reason": None,
        "status": "pending",
        "admin_notes": None,
        "requested_at": datetime.now().isoformat(timespec="seconds"),
    })
    data[SUMMER_REQUESTS_JSON_KEY] = requests
    _save_state_payload(db, state, data)

    return next(row for row in _request_rows(db) if row["student_id"] == student.id and row["id"] == next_id)


# ======================
# DELETE REQUEST
# ======================
@router.delete("/{request_id}")
def delete_request(request_id: int, db: Session = Depends(get_db)):
    states = db.query(PlannerState).all()
    for state in states:
        data = _state_payload(state)
        requests = data.get(SUMMER_REQUESTS_JSON_KEY, [])
        if not isinstance(requests, list):
            continue
        kept = [item for item in requests if int(item.get("id", 0)) != request_id]
        if len(kept) != len(requests):
            data[SUMMER_REQUESTS_JSON_KEY] = kept
            _save_state_payload(db, state, data)
            return {"message": "deleted"}

    return {"message": "not found"}
