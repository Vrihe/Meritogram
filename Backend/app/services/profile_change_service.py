"""Service for managing profile change requests"""
from datetime import datetime
from bson.objectid import ObjectId
from ..models.user import ProfileChangeRequestCreate, ProfileChangeRequest, UserRole
from .notification_service import create_notification


async def create_profile_change_request(
    user_id: str,
    requested_by_id: str,
    changes: dict,
    reason: str,
    db
) -> dict:
    """Create a profile change request (only professor can create)"""
    # Verify requested_by user is professor
    requester = db["users"].find_one({"_id": ObjectId(requested_by_id)})
    if not requester or requester.get("role") != UserRole.PROFESSOR.value:
        raise ValueError("Only professors can create profile change requests")
    
    # Verify user exists
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise ValueError("User not found")
    
    request_dict = {
        "user_id": user_id,
        "requested_by_id": requested_by_id,
        "changes": changes,
        "reason": reason,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "reviewed_at": None,
        "reviewed_by_id": None,
        "review_comment": None,
    }
    
    result = db["profile_change_requests"].insert_one(request_dict)
    request_dict["_id"] = result.inserted_id
    
    # Create notification for admins
    admin_users = db["users"].find({"role": UserRole.ADMIN.value})
    for admin in admin_users:
        await create_notification(
            user_id=str(admin["_id"]),
            title="Profile Change Request",
            message=f"{requester.get('email', 'A professor')} requested to change profile for {user.get('email', 'a student')}",
            notification_type="profile_change_request",
            db=db,
            data={
                "request_id": str(result.inserted_id),
                "student_id": user_id,
                "professor_id": requested_by_id,
            }
        )
    
    return _profile_change_request_doc_to_response(request_dict, requester, user)


async def get_pending_requests(db, skip: int = 0, limit: int = 50) -> list:
    """Get all pending profile change requests for admin"""
    requests = list(
        db["profile_change_requests"]
        .find({"status": "pending"})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for req in requests:
        requester = db["users"].find_one({"_id": ObjectId(req["requested_by_id"])})
        student = db["users"].find_one({"_id": ObjectId(req["user_id"])})
        result.append(_profile_change_request_doc_to_response(req, requester, student))
    
    return result


async def get_request_by_id(request_id: str, db) -> dict:
    """Get a specific profile change request"""
    req = db["profile_change_requests"].find_one({"_id": ObjectId(request_id)})
    
    if not req:
        raise ValueError("Request not found")
    
    requester = db["users"].find_one({"_id": ObjectId(req["requested_by_id"])})
    student = db["users"].find_one({"_id": ObjectId(req["user_id"])})
    
    return _profile_change_request_doc_to_response(req, requester, student)


async def approve_profile_change(
    request_id: str,
    admin_id: str,
    comment: str,
    db
) -> dict:
    """Approve profile change request and apply changes to user"""
    req = db["profile_change_requests"].find_one({"_id": ObjectId(request_id)})
    if not req:
        raise ValueError("Request not found")
    
    if req["status"] != "pending":
        raise ValueError(f"Request is already {req['status']}")
    
    # Apply changes to user profile
    update_fields = {}
    for key, value in req["changes"].items():
        if isinstance(value, dict):
            # Nested update (e.g., academic.year)
            for nested_key, nested_value in value.items():
                update_fields[f"{key}.{nested_key}"] = nested_value
        else:
            update_fields[key] = value
    
    db["users"].update_one(
        {"_id": ObjectId(req["user_id"])},
        {"$set": update_fields}
    )
    
    # Update request status
    updated_req = db["profile_change_requests"].find_one_and_update(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.utcnow(),
                "reviewed_by_id": admin_id,
                "review_comment": comment,
            }
        },
        return_document=True,
    )
    
    # Create notification for professor
    requester = db["users"].find_one({"_id": ObjectId(updated_req["requested_by_id"])})
    await create_notification(
        user_id=updated_req["requested_by_id"],
        title="Profile Change Approved",
        message=f"Your profile change request has been approved.",
        notification_type="profile_change_approved",
        db=db,
        data={"request_id": request_id}
    )
    
    # Create notification for student
    student = db["users"].find_one({"_id": ObjectId(updated_req["user_id"])})
    await create_notification(
        user_id=updated_req["user_id"],
        title="Profile Updated",
        message=f"Your profile has been updated by admin.",
        notification_type="profile_updated",
        db=db,
        data={"request_id": request_id}
    )
    
    return _profile_change_request_doc_to_response(updated_req, requester, student)


async def reject_profile_change(
    request_id: str,
    admin_id: str,
    comment: str,
    db
) -> dict:
    """Reject profile change request"""
    req = db["profile_change_requests"].find_one({"_id": ObjectId(request_id)})
    if not req:
        raise ValueError("Request not found")
    
    if req["status"] != "pending":
        raise ValueError(f"Request is already {req['status']}")
    
    # Update request status
    updated_req = db["profile_change_requests"].find_one_and_update(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.utcnow(),
                "reviewed_by_id": admin_id,
                "review_comment": comment,
            }
        },
        return_document=True,
    )
    
    # Create notification for professor
    requester = db["users"].find_one({"_id": ObjectId(updated_req["requested_by_id"])})
    await create_notification(
        user_id=updated_req["requested_by_id"],
        title="Profile Change Rejected",
        message=f"Your profile change request has been rejected. Reason: {comment}",
        notification_type="profile_change_rejected",
        db=db,
        data={"request_id": request_id}
    )
    
    student = db["users"].find_one({"_id": ObjectId(updated_req["user_id"])})
    return _profile_change_request_doc_to_response(updated_req, requester, student)


def _profile_change_request_doc_to_response(request_dict: dict, requester: dict, student: dict) -> dict:
    """Convert profile change request document to response"""
    return {
        "id": str(request_dict["_id"]),
        "user_id": request_dict["user_id"],
        "requested_by_id": request_dict["requested_by_id"],
        "requested_by_email": requester.get("email", "unknown") if requester else "unknown",
        "requested_by_name": requester.get("profile", {}).get("full_name", "Unknown") if requester else "Unknown",
        "student_email": student.get("email", "unknown") if student else "unknown",
        "student_name": student.get("profile", {}).get("full_name", "Unknown") if student else "Unknown",
        "changes": request_dict["changes"],
        "reason": request_dict["reason"],
        "status": request_dict["status"],
        "created_at": request_dict["created_at"],
        "reviewed_at": request_dict.get("reviewed_at"),
        "review_comment": request_dict.get("review_comment"),
    }
