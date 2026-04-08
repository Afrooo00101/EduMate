from pydantic import BaseModel, ConfigDict, Field


class CourseBase(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    name: str = Field(min_length=2, max_length=150)
    credits: int = Field(ge=1, le=12)
    major_id: int | None = None
    description: str | None = None


class CourseCreate(CourseBase):
    pass


class CourseRead(CourseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class StudentCourseUpsert(BaseModel):
    course_id: int
    semester: str = Field(min_length=2, max_length=50)
    grade: str | None = Field(default=None, max_length=10)
    status: str = Field(default='planned', min_length=2, max_length=30)


class StudentCourseRead(BaseModel):
    id: int
    semester: str
    grade: str | None
    status: str
    course: CourseRead
    model_config = ConfigDict(from_attributes=True)


class SavedCourseCreate(BaseModel):
    external_id: str | None = None
    title: str
    provider: str | None = None
    category: str | None = None
    difficulty: str | None = None
    duration: str | None = None
    progress: int = 0
    enrolled: bool = False
    description: str | None = None
    image_url: str | None = None
    course_url: str | None = None
    source: str = 'custom'


class SavedCourseRead(SavedCourseCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
