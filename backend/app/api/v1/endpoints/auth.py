from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import Token, LoginRequest, User, UserCreate
from app.services.auth import AuthService, get_current_active_user_dependency
from app.services.user import UserService
from app.core.database import get_database

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db=Depends(get_database)):
    """Login and get access token"""
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
async def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_database)):
    """Login with form data (OAuth2 compatible)"""
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


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db=Depends(get_database)):
    """Register a new user"""
    user_service = UserService(db)
    auth_service = AuthService(db)
    
    # Create the user
    try:
        await user_service.create_user(user_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Authenticate the newly created user
    token = await auth_service.authenticate_user(user_data.username, user_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate after registration"
        )
    
    return token


@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_active_user_dependency), db=Depends(get_database)):
    """Refresh access token"""
    auth_service = AuthService(db)
    # Generate new token for the current user
    token_data = {
        "access_token": auth_service.create_access_token(
            data={"sub": current_user.username}
        ),
        "token_type": "bearer"
    }
    return Token(**token_data)


@router.post("/logout")
async def logout():
    """Logout (client should remove token)"""
    return {"message": "Successfully logged out"}
