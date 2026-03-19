from bson.objectid import ObjectId
from datetime import datetime
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from ..models.user import (
    UserCreate, UserResponse,
    UserNotifications, UserAcademic, UserSecurity, UserAppSettings,
)
from .auth import hash_password, verify_password, _user_doc_to_response
from ..core.config import get_settings

settings = get_settings()


async def create_user(user: UserCreate, db) -> UserResponse:
    """Create new user"""
    existing_user = db["users"].find_one({"email": user.email})
    if existing_user:
        raise ValueError("User with this email already exists")

    user_dict = {
        "email": user.email,
        "password_hash": hash_password(user.password),
        "auth_provider": "local",
        "google_sub": None,
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

    password_hash = user.get("password_hash")
    if not password_hash:
        return None

    if not verify_password(password, password_hash):
        return None

    return _user_doc_to_response(user)


async def authenticate_google_user(id_token: str, db) -> UserResponse:
    """Authenticate user by Google ID token and create user on first login."""
    if not settings.GOOGLE_CLIENT_ID:
        raise ValueError("Google auth is not configured")

    try:
        token_info = google_id_token.verify_oauth2_token(
            id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        raise ValueError("Invalid Google token") from exc

    if token_info.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise ValueError("Invalid Google token issuer")

    email = token_info.get("email")
    if not email:
        raise ValueError("Google account did not provide email")

    if not token_info.get("email_verified", False):
        raise ValueError("Google account email is not verified")

    google_sub = token_info.get("sub")
    full_name = token_info.get("name") or email.split("@")[0]
    picture = token_info.get("picture", "")

    user = db["users"].find_one({"email": email})
    if user:
        update_fields = {}
        if google_sub and user.get("google_sub") != google_sub:
            update_fields["google_sub"] = google_sub
        if user.get("auth_provider") != "google":
            update_fields["auth_provider"] = "google"
        if full_name and not user.get("profile", {}).get("full_name"):
            update_fields["profile.full_name"] = full_name
        if picture and not user.get("profile", {}).get("photo_url"):
            update_fields["profile.photo_url"] = picture

        if update_fields:
            update_fields["updated_at"] = datetime.utcnow()
            db["users"].update_one(
                {"_id": user["_id"]},
                {"$set": update_fields},
            )
            user = db["users"].find_one({"_id": user["_id"]})

        return _user_doc_to_response(user)

    user_dict = {
        "email": email,
        "password_hash": None,
        "auth_provider": "google",
        "google_sub": google_sub,
        "profile": {
            "full_name": full_name,
            "student_id": "",
            "major": "",
            "photo_url": picture,
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
