from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from ..models import UserCreate, UserLogin, Token, UserResponse
from ..services import (
    create_user, authenticate_user, create_access_token, get_current_user
)
from ..core.config import get_settings
from ..core.database import get_db

router = APIRouter(tags=["auth"])
settings = get_settings()


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db=Depends(get_db)):
    """Register new user"""
    try:
        new_user = await create_user(user, db)
        return UserResponse(
            id=str(new_user.id),
            email=new_user.email,
            full_name=new_user.full_name,
            created_at=new_user.created_at
        )
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


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Get current user"""
    return current_user
