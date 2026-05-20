from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.coursesdetails import CourseDetails
from app.schemas.coursesdetails import (
    CourseDetailsCreate,
    CourseDetailsRead
)

router = APIRouter(
    prefix="/coursesdetails",
    tags=["Courses Details Page"]
)


# =====================
# GET ALL
# =====================
@router.get("/", response_model=list[CourseDetailsRead])
def get_courses_details(db: Session = Depends(get_db)):
    return db.query(CourseDetails).all()


# =====================
# ADD
# =====================
@router.post("/", response_model=CourseDetailsRead)
def add_course_details(
    data: CourseDetailsCreate,
    db: Session = Depends(get_db)
):

    course = CourseDetails(**data.model_dump())

    db.add(course)
    db.commit()
    db.refresh(course)

    return course


# =====================
# DELETE
# =====================
@router.delete("/{course_id}")
def delete_course_details(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = db.query(CourseDetails).get(course_id)

    if not course:
        return {"message": "not found"}

    db.delete(course)
    db.commit()

    return {"message": "deleted"}