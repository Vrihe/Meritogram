from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DeadlineBase(BaseModel):
    course_id: str
    task: str
    due: datetime
    urgent: bool = False
    credits: int = 0


class DeadlineCreate(DeadlineBase):
    pass


class DeadlineUpdate(BaseModel):
    task: Optional[str] = None
    due: Optional[datetime] = None
    urgent: Optional[bool] = None
    credits: Optional[int] = None


class DeadlineResponse(DeadlineBase):
    id: str = Field(alias="_id")
    user_id: str
    course_code: str = ""
    course_name: str = ""
