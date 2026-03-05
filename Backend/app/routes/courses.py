from fastapi import APIRouter, Depends, HTTPException
from ..models import CourseCreate, CourseResponse, GradeCreate, UserResponse
from ..services import (
    get_current_user, create_course, get_user_courses,
    add_grade, add_attendance
)
from ..core.database import get_db

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("/", response_model=CourseResponse)
async def create_new_course(
    course: CourseCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Create new course"""
    return await create_course(current_user.id, course, db)


@router.get("/", response_model=list)
async def list_courses(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all user courses"""
    return await get_user_courses(current_user.id, db)


@router.post("/{course_id}/grade", response_model=CourseResponse)
async def add_course_grade(
    course_id: str,
    grade: GradeCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Add grade to course"""
    try:
        return await add_grade(current_user.id, course_id, grade.score, grade.feedback, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{course_id}/attendance")
async def log_attendance(
    course_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Log attendance for course"""
    try:
        return await add_attendance(current_user.id, course_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
