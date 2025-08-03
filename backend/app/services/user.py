from typing import Optional
from app.models.user import User, UserCreate, UserInDB
from app.services.auth import AuthService


class UserService:
    def __init__(self, db):
        self.db = db
        self.collection = db.users
        self.auth_service = AuthService(db)

    async def create_user(self, user: UserCreate) -> User:
        hashed_password = self.auth_service.get_password_hash(user.password)
        user_data = user.dict(exclude={"password"})
        user_data["hashed_password"] = hashed_password
        
        result = await self.collection.insert_one(user_data)
        created_user = await self.collection.find_one({"_id": result.inserted_id})
        return User(**created_user)

    async def get_user_by_username(self, username: str) -> Optional[UserInDB]:
        user = await self.collection.find_one({"username": username})
        return UserInDB(**user) if user else None