from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class CourseDetails(Base):
    __tablename__ = "courses_details"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    instructor = Column(String(150))
    description = Column(Text)
    duration = Column(String(100))
    level = Column(String(50))