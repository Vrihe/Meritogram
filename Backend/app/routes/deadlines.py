from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from ..models.deadline import DeadlineCreate, DeadlineUpdate
from ..services.auth import get_current_user
from ..services.deadline_service import get_deadlines, create_deadline
from ..models.user import UserResponse
from ..core.database import get_db

router = APIRouter(tags=["deadlines"])

@router.get("/deadlines")
async def list_deadlines(
    course_id: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get upcoming deadlines, optionally filtered by course_id"""
    records = await get_deadlines(current_user.id, db, course_id)
    return records

@router.post("/deadlines")
async def add_deadline(
    data: DeadlineCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Create a deadline record"""
    record = await create_deadline(current_user.id, data.model_dump(), db)
    return record
