#!/usr/bin/env python3
"""Create initial admin user"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    """Create admin user if not exists"""
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["musashi"]
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": "admin@musashi.com"})
    if existing_admin:
        print("Admin user already exists")
        return
    
    # Create admin user
    admin_user = {
        "username": "admin",
        "email": "admin@musashi.com",
        "hashed_password": pwd_context.hash("admin123"),
        "is_active": True,
        "is_superuser": True,
        "roles": ["admin", "user"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(admin_user)
    print(f"Admin user created with ID: {result.inserted_id}")
    print("Email: admin@musashi.com")
    print("Password: admin123")

if __name__ == "__main__":
    asyncio.run(create_admin())