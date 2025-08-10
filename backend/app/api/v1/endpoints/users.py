from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserCreate, UserUpdate, AdminUserUpdate
from app.services.user import UserService
from app.services.auth import get_current_active_user_dependency, get_current_admin_user_dependency
from app.core.database import get_database

router = APIRouter()

@router.post("/", response_model=User)
async def create_user_by_admin(
    user: UserCreate,
    current_user: User = Depends(get_current_admin_user_dependency)
):
    """Create new user (Admin only)"""
    db = get_database()
    service = UserService(db)
    return await service.create_user(user, created_by_admin=True)

@router.get("/", response_model=List[User])
async def get_all_users(
    current_user: User = Depends(get_current_admin_user_dependency)
):
    """Get all users (Admin only)"""
    db = get_database()
    service = UserService(db)
    return await service.get_all_users()

@router.get("/me", response_model=User)
async def get_current_user(
    current_user: User = Depends(get_current_active_user_dependency)
):
    """Get current user info"""
    return current_user

@router.get("/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_admin_user_dependency)
):
    """Get user by ID (Admin only)"""
    db = get_database()
    service = UserService(db)
    user = await service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user_dependency)
):
    """Update current user (self)"""
    db = get_database()
    service = UserService(db)
    return await service.update_user(str(current_user.id), user_update)

@router.put("/{user_id}", response_model=User)
async def admin_update_user(
    user_id: str,
    user_update: AdminUserUpdate,
    current_user: User = Depends(get_current_admin_user_dependency)
):
    """Update user by ID (Admin only)"""
    db = get_database()
    service = UserService(db)
    return await service.admin_update_user(user_id, user_update)

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user_dependency)
):
    """Delete user (Admin only)"""
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    db = get_database()
    service = UserService(db)
    success = await service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}