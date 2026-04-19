from fastapi import APIRouter, Depends, HTTPException, status
from ..models.user import UserResponse, UserProfileUpdate, UserRole
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
    """Update user profile, notifications, academic info, or app settings
    
    Role-based restrictions:
    - STUDENT: Can only update profile, notifications, app_settings. Cannot update academic.year
    - PROFESSOR: Can update their own profile, notifications, app_settings
    - ADMIN: Can update any field
    """
    try:
        updates = data.model_dump(exclude_none=True)
        
        # Apply role-based access control
        if current_user.role == UserRole.STUDENT:
            # Students cannot update academic year
            if "academic" in updates and updates["academic"]:
                academic_updates = updates["academic"]
                # Create a copy without year
                filtered_academic = {k: v for k, v in academic_updates.items() if k != "year"}
                
                if "year" in academic_updates:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Students cannot change their academic year. Contact your professor or administrator."
                    )
                
                if filtered_academic:
                    updates["academic"] = filtered_academic
                else:
                    del updates["academic"]
        
        # Professor and Admin can update normally
        updated_user = await update_user_profile(current_user.id, updates, db)
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
