from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from ..models.grade import GradeCreate, GradeUpdate
from ..services.auth import get_current_user
from ..services.grade_service import get_grades, create_grade, update_grade, delete_grade
from ..models.user import UserResponse
from ..core.database import get_db

router = APIRouter(tags=["grades"])


@router.get("/grades")
async def list_grades(
    course_id: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get grade records, optionally filtered by course_id"""
    records = await get_grades(current_user.id, db, course_id)
    return records


@router.post("/grades")
async def add_grade(
    data: GradeCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Create a grade record"""
    record = await create_grade(current_user.id, data.model_dump(), db)
    return record


@router.put("/grades/{grade_id}")
async def edit_grade(
    grade_id: str,
    data: GradeUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Update a grade record"""
    try:
        record = await update_grade(
            current_user.id, grade_id, data.model_dump(exclude_none=True), db
        )
        return record
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/grades/{grade_id}")
async def remove_grade(
    grade_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Delete a grade record"""
    try:
        await delete_grade(current_user.id, grade_id, db)
        return {"message": "Grade deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
