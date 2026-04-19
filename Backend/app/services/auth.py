from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson.objectid import ObjectId
from ..core.config import get_settings
from ..core.database import get_db
from ..models import UserResponse
from ..models.user import UserProfile, UserNotifications, UserAcademic, UserSecurity, UserAppSettings, UserRole

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
MAX_BCRYPT_PASSWORD_BYTES = 72


def _normalize_password_for_bcrypt(password: str) -> str:
    """Trim password to bcrypt byte limit using a safe UTF-8 boundary."""
    encoded = password.encode("utf-8")
    if len(encoded) <= MAX_BCRYPT_PASSWORD_BYTES:
        return password

    truncated = encoded[:MAX_BCRYPT_PASSWORD_BYTES]
    return truncated.decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    """Hash password"""
    normalized_password = _normalize_password_for_bcrypt(password)
    return pwd_context.hash(normalized_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    normalized_password = _normalize_password_for_bcrypt(plain_password)
    return pwd_context.verify(normalized_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt


def _user_doc_to_response(user: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse."""
    profile = user.get("profile", {})
    if not profile:
        profile = {
            "full_name": user.get("full_name", ""),
            "student_id": user.get("student_id", ""),
            "major": user.get("major", ""),
            "photo_url": user.get("photo_url", ""),
        }

    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        role=UserRole(user.get("role", "student")),
        profile=UserProfile(**profile),
        notifications=UserNotifications(**user.get("notifications", {})),
        academic=UserAcademic(**user.get("academic", {})),
        security=UserSecurity(**user.get("security", {})),
        app_settings=UserAppSettings(**user.get("app_settings", {})),
        created_at=user["created_at"],
    )


async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> UserResponse:
    """Get current authenticated user from token"""
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credential_exception
    except JWTError:
        raise credential_exception

    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None

    if user is None:
        raise credential_exception

    return _user_doc_to_response(user)
