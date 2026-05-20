from pydantic import BaseModel


class RequestPageBase(BaseModel):
    student: str
    course: str


class RequestPageCreate(RequestPageBase):
    pass


class RequestPageRead(RequestPageBase):
    id: int

    class Config:
        from_attributes = True