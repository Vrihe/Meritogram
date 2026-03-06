from bson.objectid import ObjectId
from datetime import datetime
from ..models.user import (
    UserCreate, UserResponse,
    UserNotifications, UserAcademic, UserSecurity, UserAppSettings,
)
from .auth import hash_password, verify_password, _user_doc_to_response


async def create_user(user: UserCreate, db) -> UserResponse:
    """Create new user"""
    existing_user = db["users"].find_one({"email": user.email})
    if existing_user:
        raise ValueError("User with this email already exists")

    user_dict = {
        "email": user.email,
        "password_hash": hash_password(user.password),
        "profile": {
            "full_name": user.full_name,
            "student_id": user.student_id,
            "major": user.major,
            "photo_url": "",
        },
        "notifications": UserNotifications().model_dump(),
        "academic": UserAcademic().model_dump(),
        "security": UserSecurity().model_dump(),
        "app_settings": UserAppSettings().model_dump(),
        "created_at": datetime.utcnow(),
        "updated_at": None,
    }

    result = db["users"].insert_one(user_dict)
    user_dict["_id"] = result.inserted_id

    return _user_doc_to_response(user_dict)


async def get_user_by_email(email: str, db) -> UserResponse:
    """Get user by email"""
    user = db["users"].find_one({"email": email})
    if not user:
        raise ValueError("User not found")
    return _user_doc_to_response(user)


async def authenticate_user(email: str, password: str, db) -> UserResponse | None:
    """Authenticate user by email and password"""
    user = db["users"].find_one({"email": email})
    if not user:
        return None

    if not verify_password(password, user.get("password_hash", "")):
        return None

    return _user_doc_to_response(user)


async def update_user_profile(user_id: str, updates: dict, db) -> UserResponse:
    """Update user profile/settings fields"""
    set_fields = {}
    for section_key, section_data in updates.items():
        if section_data is not None and section_key in ("profile", "notifications", "academic", "app_settings"):
            data = section_data if isinstance(section_data, dict) else section_data.model_dump()
            for field_key, value in data.items():
                set_fields[f"{section_key}.{field_key}"] = value

    if not set_fields:
        raise ValueError("No valid fields to update")

    set_fields["updated_at"] = datetime.utcnow()

    db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": set_fields},
    )

    user = db["users"].find_one({"_id": ObjectId(user_id)})
    return _user_doc_to_response(user)
