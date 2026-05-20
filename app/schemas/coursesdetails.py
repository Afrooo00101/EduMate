from pydantic import BaseModel


class CourseDetailsBase(BaseModel):
    title: str
    instructor: str
    description: str
    duration: str
    level: str


class CourseDetailsCreate(CourseDetailsBase):
    pass


class CourseDetailsRead(CourseDetailsBase):
    id: int

    class Config:
        from_attributes = True