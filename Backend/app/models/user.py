from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    

class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
