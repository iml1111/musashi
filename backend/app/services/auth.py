from typing import Optional
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.models.user import Token, User, TokenPayload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


class AuthService:
    def __init__(self, db):
        self.db = db
        self.users_collection = db.users

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    async def authenticate_user(self, username: str, password: str) -> Optional[Token]:
        user = await self.users_collection.find_one({"username": username})
        if not user or not self.verify_password(password, user["hashed_password"]):
            return None
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self.create_access_token(
            data={"sub": user["username"], "role": user["role"]}, 
            expires_delta=access_token_expires
        )
        # Convert ObjectId to string for serialization
        user_data = dict(user)
        user_data['id'] = str(user_data['_id'])
        user_data.pop('_id', None)
        user_data.pop('hashed_password', None)
        
        return Token(
            access_token=access_token, 
            token_type="bearer",
            user=User(**user_data)
        )

    def decode_token(self, token: str) -> Optional[TokenPayload]:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            role: str = payload.get("role")
            if username is None:
                return None
            token_data = TokenPayload(sub=username, role=role)
            return token_data
        except JWTError:
            return None

    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        token_data = self.decode_token(credentials.credentials)
        if token_data is None:
            raise credentials_exception
            
        user = await self.users_collection.find_one({"username": token_data.sub})
        if user is None:
            raise credentials_exception
        
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("hashed_password", None)
        return User(**user)

    async def get_current_active_user(self, current_user: User = Depends(get_current_user)) -> User:
        if not current_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return current_user

    async def get_current_admin_user(self, current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user


# Dependency functions
async def get_current_user_dependency(credentials: HTTPAuthorizationCredentials = Depends(security)):
    from app.core.database import get_database
    db = get_database()
    auth_service = AuthService(db)
    return await auth_service.get_current_user(credentials)

async def get_current_active_user_dependency(current_user: User = Depends(get_current_user_dependency)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user_dependency(current_user: User = Depends(get_current_active_user_dependency)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user