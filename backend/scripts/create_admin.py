#!/usr/bin/env python3
"""Create initial admin user"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_database
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_admin():
    """Create admin user if not exists"""
    db = get_database()

    # Check if admin exists
    existing_admin = await db.users.find_one({"username": "admin"})
    if existing_admin:
        print("Admin user already exists")
        return

    # Create admin user
    admin_user = {
        "username": "admin",
        "email": "admin@musashi.dev",
        "hashed_password": pwd_context.hash("admin123"),
        "is_active": True,
        "is_superuser": True,
        "roles": ["admin", "user"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(admin_user)
    print(f"Admin user created with ID: {result.inserted_id}")


if __name__ == "__main__":
    asyncio.run(create_admin())
