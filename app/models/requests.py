from sqlalchemy import Column, Integer, String
from app.database import Base


class CourseRequest(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    student = Column(String(150))
    course = Column(String(150))
    