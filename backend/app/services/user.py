from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, status
from app.models.user import User, UserCreate, UserInDB, UserUpdate, AdminUserUpdate, UserRole
from app.services.auth import AuthService


class UserService:
    def __init__(self, db):
        self.db = db
        self.collection = db.users
        self.auth_service = AuthService(db)

    async def init_admin_user(self):
        """Create initial admin user if not exists"""
        admin_user = await self.collection.find_one({"username": "admin"})
        if not admin_user:
            admin_data = {
                "username": "admin",
                "hashed_password": self.auth_service.get_password_hash("1234"),
                "role": UserRole.ADMIN,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            await self.collection.insert_one(admin_data)
            print("Admin user created with username: admin, password: 1234")

    async def create_user(self, user: UserCreate, created_by_admin: bool = False) -> User:
        # Check if username already exists
        existing_user = await self.collection.find_one({"username": user.username})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
            )

        hashed_password = self.auth_service.get_password_hash(user.password)
        user_data = user.model_dump(exclude={"password"})
        user_data["hashed_password"] = hashed_password
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()

        result = await self.collection.insert_one(user_data)
        created_user = await self.collection.find_one({"_id": result.inserted_id})
        if created_user:
            created_user["id"] = str(created_user["_id"])
            created_user.pop("_id", None)
            created_user.pop("hashed_password", None)
            return User(**created_user)
        raise HTTPException(status_code=500, detail="Failed to create user")

    async def get_user_by_username(self, username: str) -> Optional[UserInDB]:
        user = await self.collection.find_one({"username": username})
        return UserInDB(**user) if user else None

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        from bson import ObjectId

        user = await self.collection.find_one({"_id": ObjectId(user_id)})
        return UserInDB(**user) if user else None

    async def get_all_users(self) -> List[User]:
        users = []
        cursor = self.collection.find({})
        async for user_doc in cursor:
            # Convert ObjectId to string for serialization
            user_data = dict(user_doc)
            user_data["id"] = str(user_data["_id"])
            user_data.pop("_id", None)
            user_data.pop("hashed_password", None)
            users.append(User(**user_data))
        return users

    async def update_user(self, user_id: str, user_update: UserUpdate) -> User:
        from bson import ObjectId

        update_data = {}
        for field, value in user_update.model_dump(exclude_unset=True).items():
            if field == "password" and value:
                update_data["hashed_password"] = self.auth_service.get_password_hash(value)
            elif field != "password":
                update_data[field] = value

        if update_data:
            update_data["updated_at"] = datetime.utcnow()

            # Check username uniqueness if updating username
            if "username" in update_data:
                existing_user = await self.collection.find_one(
                    {"username": update_data["username"], "_id": {"$ne": ObjectId(user_id)}}
                )
                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
                    )

            await self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

        updated_user = await self.collection.find_one({"_id": ObjectId(user_id)})
        updated_user["id"] = str(updated_user["_id"])
        updated_user.pop("_id", None)
        updated_user.pop("hashed_password", None)
        return User(**updated_user)

    async def admin_update_user(self, user_id: str, user_update: AdminUserUpdate) -> User:
        from bson import ObjectId

        update_data = {}
        for field, value in user_update.model_dump(exclude_unset=True).items():
            if field == "password" and value:
                update_data["hashed_password"] = self.auth_service.get_password_hash(value)
            elif field != "password":
                update_data[field] = value

        if update_data:
            update_data["updated_at"] = datetime.utcnow()

            # Check username uniqueness if updating username
            if "username" in update_data:
                existing_user = await self.collection.find_one(
                    {"username": update_data["username"], "_id": {"$ne": ObjectId(user_id)}}
                )
                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
                    )

            await self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

        updated_user = await self.collection.find_one({"_id": ObjectId(user_id)})
        updated_user["id"] = str(updated_user["_id"])
        updated_user.pop("_id", None)
        updated_user.pop("hashed_password", None)
        return User(**updated_user)

    async def delete_user(self, user_id: str) -> bool:
        from bson import ObjectId

        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        user = await self.collection.find_one({"email": email})
        return UserInDB(**user) if user else None

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        users = []
        cursor = self.collection.find({}).skip(skip).limit(limit)
        async for user_doc in cursor:
            user_data = dict(user_doc)
            user_data["id"] = str(user_data["_id"])
            user_data.pop("_id", None)
            user_data.pop("hashed_password", None)
            users.append(User(**user_data))
        return users
