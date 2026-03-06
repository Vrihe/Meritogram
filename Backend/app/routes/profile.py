from fastapi import APIRouter, Depends, HTTPException
from ..models.user import UserResponse, UserProfileUpdate
from ..services.auth import get_current_user
from ..services.user_service import update_user_profile
from ..core.database import get_db

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get current user's full profile"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UserProfileUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Update user profile, notifications, academic info, or app settings"""
    try:
        updates = data.model_dump(exclude_none=True)
        updated_user = await update_user_profile(current_user.id, updates, db)
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
