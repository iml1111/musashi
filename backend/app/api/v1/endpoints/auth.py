from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import Token, LoginRequest, User
from app.services.auth import AuthService, get_current_active_user_dependency
from app.core.database import get_database

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest
):
    """Login and get access token"""
    db = get_database()
    service = AuthService(db)
    token = await service.authenticate_user(login_data.username, login_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

@router.post("/login/form", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Login with form data (OAuth2 compatible)"""
    db = get_database()
    service = AuthService(db)
    token = await service.authenticate_user(form_data.username, form_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user_dependency)):
    """Get current user info"""
    return current_user

@router.post("/logout")
async def logout():
    """Logout (client should remove token)"""
    return {"message": "Successfully logged out"}