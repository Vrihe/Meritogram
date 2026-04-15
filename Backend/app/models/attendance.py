from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AttendanceBase(BaseModel):
    course_id: str
    date: datetime
    status: str  # "present", "absent", "late"
    notes: str = ""


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: str = Field(alias="_id")
    user_id: str
    course_code: str = ""
    course_name: str = ""
    created_at: datetime

    class Config:
        populate_by_name = True
