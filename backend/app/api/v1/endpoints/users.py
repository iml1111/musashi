from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User, UserCreate
from app.services.user import UserService
from app.core.database import get_database

router = APIRouter()

@router.post("/", response_model=User)
async def create_user(
    user: UserCreate,
    db=Depends(get_database)
):
    """Create a new user"""
    service = UserService(db)
    return await service.create_user(user)

@router.get("/me", response_model=User)
async def get_current_user(
    db=Depends(get_database)
):
    """Get current user info"""
    # TODO: Implement current user dependency
    pass