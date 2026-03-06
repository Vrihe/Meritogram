from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GradeBase(BaseModel):
    course_id: str
    name: str  # e.g. "Midterm Exam", "Assignment 3"
    score: float
    max_score: float = 100
    weight: float = 0  # percentage weight 0-100
    feedback: str = ""


class GradeCreate(GradeBase):
    pass


class GradeUpdate(BaseModel):
    name: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[float] = None
    weight: Optional[float] = None
    feedback: Optional[str] = None


class GradeResponse(GradeBase):
    id: str = Field(alias="_id")
    user_id: str
    course_code: str = ""
    course_name: str = ""
    date: datetime
    created_at: datetime

    class Config:
        populate_by_name = True
