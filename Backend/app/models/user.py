from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User roles with different permission levels"""
    STUDENT = "student"
    PROFESSOR = "professor"
    ADMIN = "admin"


class UserProfile(BaseModel):
    full_name: str
    student_id: str = ""
    major: str = ""
    photo_url: str = ""


class UserNotifications(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    grade_updates: bool = True
    assignment_reminders: bool = True


class UserAcademic(BaseModel):
    year: str = "1st Year"
    gpa_target: float = 4.0
    attendance_pct: float = 0


class UserSecurity(BaseModel):
    two_factor_enabled: bool = False
    active_sessions: list[str] = []


class UserAppSettings(BaseModel):
    dark_mode: bool = False


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    full_name: str
    student_id: str = ""
    major: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    profile: UserProfile
    notifications: UserNotifications = UserNotifications()
    academic: UserAcademic = UserAcademic()
    security: UserSecurity = UserSecurity()
    app_settings: UserAppSettings = UserAppSettings()
    created_at: datetime

    class Config:
        populate_by_name = True


class UserProfileUpdate(BaseModel):
    profile: Optional[UserProfile] = None
    notifications: Optional[UserNotifications] = None
    academic: Optional[UserAcademic] = None
    app_settings: Optional[UserAppSettings] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ==================== NOTIFICATION MODELS ====================

class NotificationBase(BaseModel):
    """Base notification model"""
    title: str
    message: str
    type: str  # "profile_change_request", "grade", "assignment", etc.
    read: bool = False
    data: Optional[dict] = None  # Additional data


class Notification(NotificationBase):
    """Notification with ID and timestamps"""
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


# ==================== PROFILE CHANGE REQUEST MODELS ====================

class ProfileChangeRequest(BaseModel):
    """Request to change user profile (professor creates for student, admin approves)"""
    id: str = Field(alias="_id")
    user_id: str  # Student whose profile will be changed
    requested_by_id: str  # Professor who requested the change
    changes: dict  # What needs to be changed (e.g., {"academic": {"year": "2nd Year"}})
    reason: str  # Why the change is requested
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by_id: Optional[str] = None
    review_comment: Optional[str] = None

    class Config:
        populate_by_name = True


class ProfileChangeRequestCreate(BaseModel):
    """Create profile change request"""
    user_id: str
    changes: dict
    reason: str


class ProfileChangeRequestResponse(BaseModel):
    """Response model for profile change request"""
    id: str = Field(alias="_id")
    user_id: str
    requested_by_id: str
    requested_by_email: str
    changes: dict
    reason: str
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    review_comment: Optional[str] = None

    class Config:
        populate_by_name = True


class ProfileChangeRequestReview(BaseModel):
    """Review/approve profile change request"""
    status: str  # "approved" or "rejected"
    comment: Optional[str] = None
