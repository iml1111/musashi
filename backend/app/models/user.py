from typing import Optional
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from datetime import datetime
from bson import ObjectId
from app.models.workflow import PyObjectId
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class UserBase(BaseModel):
    username: str = Field(
        ..., min_length=1, max_length=50, description="Username must be 1-50 characters"
    )
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: bool = True
    role: UserRole = UserRole.USER

    @field_validator("username")
    @classmethod
    def validate_username_length(cls, v: str) -> str:
        if len(v) > 50:
            raise ValueError("Username must be 50 characters or less")
        if len(v) < 1:
            raise ValueError("Username must be at least 1 character")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, v):
        # Convert empty string to None for optional email field
        if v == "":
            return None
        return v

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_full_name(cls, v):
        # Convert empty string to None for optional full_name field
        if v == "":
            return None
        return v


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=1, max_length=50)
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

    @field_validator("username")
    @classmethod
    def validate_username_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) > 50:
                raise ValueError("Username must be 50 characters or less")
            if len(v) < 1:
                raise ValueError("Username must be at least 1 character")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, v):
        # Convert empty string to None for optional email field
        if v == "":
            return None
        return v

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_full_name(cls, v):
        # Convert empty string to None for optional full_name field
        if v == "":
            return None
        return v


class AdminUserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=50)
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

    @field_validator("username")
    @classmethod
    def validate_username_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) > 50:
                raise ValueError("Username must be 50 characters or less")
            if len(v) < 1:
                raise ValueError("Username must be at least 1 character")
        return v


class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "examples": [
                {
                    "_id": "507f1f77bcf86cd799439011",
                    "username": "testuser",
                    "email": "test@example.com",
                    "full_name": "Test User",
                    "is_active": True,
                    "role": "user",
                    "hashed_password": "hashed",
                    "created_at": "2023-01-01T00:00:00",
                    "updated_at": "2023-01-01T00:00:00",
                }
            ]
        },
    )


class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

