from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from pydantic import BaseModel
from ..models import UserCreate, UserLogin, GoogleAuthRequest, Token, UserResponse
from ..services import (
    create_user, authenticate_user, authenticate_google_user, create_access_token, get_current_user
)
from ..services.auth import verify_password, hash_password
from ..core.config import get_settings
from ..core.database import get_db

router = APIRouter(tags=["auth"])
settings = get_settings()


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


@router.post("/register", response_model=Token)
async def register(user: UserCreate, db=Depends(get_db)):
    """Register new user and return token"""
    try:
        new_user = await create_user(user, db)

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.id},
            expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer", user=new_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db=Depends(get_db)):
    """Login user"""
    user = await authenticate_user(credentials.email, credentials.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer", user=user)


@router.post("/google", response_model=Token)
async def google_login(payload: GoogleAuthRequest, db=Depends(get_db)):
    """Authenticate or register user using Google ID token."""
    try:
        user = await authenticate_google_user(payload.id_token, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer", user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Get current user"""
    return current_user


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db),
):
    """Change user password"""
    try:
        from ..models.user import User
        
        user = await db.get(User, current_user.id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify current password
        if not verify_password(request.currentPassword, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Update password
        user.hashed_password = hash_password(request.newPassword)
        await db.commit()
        
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
