#!/usr/bin/env python3
"""
Initialize admin user in MongoDB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import os

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_admin():
    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "musashi")
    
    print(f"Connecting to: {mongodb_url}/{database_name}")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    users_collection = db.users
    
    # Check if admin exists
    admin_user = await users_collection.find_one({"username": "admin"})
    
    if admin_user:
        print("Admin user already exists")
        # Update password to ensure it's correct
        hashed_password = pwd_context.hash("1234")
        await users_collection.update_one(
            {"username": "admin"},
            {"$set": {
                "hashed_password": hashed_password,
                "updated_at": datetime.utcnow()
            }}
        )
        print("Admin password updated to: 1234")
    else:
        # Create admin user
        admin_data = {
            "username": "admin",
            "hashed_password": pwd_context.hash("1234"),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await users_collection.insert_one(admin_data)
        print("✅ Admin user created with username: admin, password: 1234")
    
    # Verify user exists
    user = await users_collection.find_one({"username": "admin"})
    if user:
        print(f"Admin user verified: {user['username']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_admin())