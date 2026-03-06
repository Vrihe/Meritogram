from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


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


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
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
