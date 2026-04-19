"""Routes for notification management"""
from fastapi import APIRouter, Depends, HTTPException, Query
from ..services.auth import get_current_user
from ..services.notification_service import (
    get_user_notifications, mark_notification_as_read, mark_all_as_read, get_unread_count
)
from ..models.user import UserResponse
from ..core.database import get_db

router = APIRouter(tags=["notifications"])


@router.get("/notifications")
async def get_notifications(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """Get all notifications for current user"""
    notifications = await get_user_notifications(current_user.id, db, skip, limit)
    unread_count = await get_unread_count(current_user.id, db)
    
    return {
        "notifications": notifications,
        "unread_count": unread_count,
        "total": len(notifications)
    }


@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Mark all notifications as read for current user"""
    modified_count = await mark_all_as_read(current_user.id, db)
    
    return {
        "message": "All notifications marked as read",
        "modified_count": modified_count
    }


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Mark a specific notification as read"""
    try:
        notification = await mark_notification_as_read(notification_id, db)
        
        # Verify notification belongs to current user
        if notification.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        return notification
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/notifications/unread/count")
async def get_unread_notification_count(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get count of unread notifications"""
    unread_count = await get_unread_count(current_user.id, db)
    return {"unread_count": unread_count}
