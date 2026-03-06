from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Grade(BaseModel):
    date: datetime
    score: float
    feedback: Optional[str] = None


class CourseBase(BaseModel):
    name: str
    code: str = ""
    description: Optional[str] = None
    instructor: str
    credits: Optional[int] = None
    color: str = "#6366f1"
    schedule: str = ""
    room: str = ""
    tags: List[str] = []
    total_sessions: int = 0


class CourseCreate(CourseBase):
    pass


class Course(CourseBase):
    id: str = Field(alias="_id")
    user_id: str
    grades: List[Grade] = []
    attendance: List[datetime] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class CourseResponse(CourseBase):
    id: str = Field(alias="_id")
    grades: List[Grade] = []
    attendance: List[datetime] = []
    created_at: datetime

    class Config:
        populate_by_name = True


class GradeCreate(BaseModel):
    score: float
    feedback: Optional[str] = None
