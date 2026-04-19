"""Service for managing user notifications"""
from datetime import datetime
from bson.objectid import ObjectId
from ..models.user import Notification, NotificationBase


async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    db,
    data: dict = None
) -> Notification:
    """Create a new notification for a user"""
    notification_dict = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "read": False,
        "data": data or {},
        "created_at": datetime.utcnow(),
        "read_at": None,
    }
    
    result = db["notifications"].insert_one(notification_dict)
    notification_dict["_id"] = result.inserted_id
    
    return Notification(**notification_dict)


async def get_user_notifications(user_id: str, db, skip: int = 0, limit: int = 50) -> list:
    """Get all notifications for a user"""
    notifications = list(
        db["notifications"]
        .find({"user_id": user_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    return [_notification_doc_to_response(n) for n in notifications]


async def get_unread_count(user_id: str, db) -> int:
    """Get count of unread notifications"""
    return db["notifications"].count_documents({"user_id": user_id, "read": False})


async def mark_notification_as_read(notification_id: str, db) -> Notification:
    """Mark a single notification as read"""
    result = db["notifications"].find_one_and_update(
        {"_id": ObjectId(notification_id)},
        {
            "$set": {
                "read": True,
                "read_at": datetime.utcnow(),
            }
        },
        return_document=True,
    )
    
    if not result:
        raise ValueError("Notification not found")
    
    return Notification(**result)


async def mark_all_as_read(user_id: str, db) -> int:
    """Mark all notifications for a user as read"""
    result = db["notifications"].update_many(
        {"user_id": user_id, "read": False},
        {
            "$set": {
                "read": True,
                "read_at": datetime.utcnow(),
            }
        }
    )
    
    return result.modified_count


def _notification_doc_to_response(notification: dict) -> dict:
    """Convert MongoDB notification document to dict"""
    return {
        "id": str(notification["_id"]),
        "user_id": notification["user_id"],
        "title": notification["title"],
        "message": notification["message"],
        "type": notification["type"],
        "read": notification["read"],
        "data": notification.get("data", {}),
        "created_at": notification["created_at"],
        "read_at": notification.get("read_at"),
    }
