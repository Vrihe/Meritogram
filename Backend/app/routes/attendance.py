from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from ..models.attendance import AttendanceCreate, AttendanceUpdate
from ..services.auth import get_current_user
from ..services.attendance_service import get_attendance, create_attendance, update_attendance
from ..models.user import UserResponse
from ..core.database import get_db

router = APIRouter(tags=["attendance"])


@router.get("/attendance")
async def list_attendance(
    course_id: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get attendance records, optionally filtered by course_id"""
    records = await get_attendance(current_user.id, db, course_id)
    return records


@router.post("/attendance")
async def add_attendance(
    data: AttendanceCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Create an attendance record"""
    record = await create_attendance(current_user.id, data.model_dump(), db)
    return record


@router.put("/attendance/{record_id}")
async def edit_attendance(
    record_id: str,
    data: AttendanceUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Update an attendance record"""
    try:
        record = await update_attendance(
            current_user.id, record_id, data.model_dump(exclude_none=True), db
        )
        return record
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
