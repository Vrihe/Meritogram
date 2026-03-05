from bson.objectid import ObjectId
from datetime import datetime
from ..models import User, UserCreate, UserResponse
from .auth import hash_password, verify_password
from ..core.database import get_db


async def create_user(user: UserCreate, db) -> User:
    """Create new user"""
    existing_user = db["users"].find_one({"email": user.email})
    if existing_user:
        raise ValueError("User with this email already exists")
    
    user_dict = {
        "email": user.email,
        "full_name": user.full_name,
        "password_hash": hash_password(user.password),
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = db["users"].insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    return User(**user_dict)


async def get_user_by_email(email: str, db) -> UserResponse:
    """Get user by email"""
    user = db["users"].find_one({"email": email})
    if not user:
        raise ValueError("User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        created_at=user["created_at"]
    )


async def authenticate_user(email: str, password: str, db):
    """Authenticate user by email and password"""
    user = db["users"].find_one({"email": email})
    if not user:
        return None
    
    if not verify_password(password, user.get("password_hash", "")):
        return None
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        created_at=user["created_at"]
    )
