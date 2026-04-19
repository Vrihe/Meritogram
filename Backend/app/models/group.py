"""Group models for classroom management"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AcademicYear(str, Enum):
    """Academic year options"""
    FIRST = "1st Year"
    SECOND = "2nd Year"
    THIRD = "3rd Year"
    FOURTH = "4th Year"


class GroupCreate(BaseModel):
    """Create group request"""
    name: str = Field(..., min_length=1, max_length=100)
    academic_year: str
    description: Optional[str] = None


class GroupUpdate(BaseModel):
    """Update group request"""
    name: Optional[str] = None
    academic_year: Optional[str] = None
    description: Optional[str] = None


class GroupStudentAdd(BaseModel):
    """Add student to group request"""
    student_id: str


class GroupResponse(BaseModel):
    """Group response model"""
    id: str = Field(..., alias="_id")
    name: str
    academic_year: str
    description: Optional[str] = None
    professor_id: str
    students: List[str] = []  # List of student IDs
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class GroupWithStudents(BaseModel):
    """Group with detailed student information"""
    id: str = Field(..., alias="_id")
    name: str
    academic_year: str
    description: Optional[str] = None
    professor_id: str
    students: List[dict] = []  # Detailed student objects
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
