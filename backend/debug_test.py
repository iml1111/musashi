import asyncio
from unittest.mock import AsyncMock, MagicMock
from app.services.auth import AuthService
from datetime import datetime

async def test():
    # Create mock db
    mock_db = MagicMock()
    mock_db.users = MagicMock()
    
    sample_user = {
        "_id": "507f1f77bcf86cd799439011",
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # secret123
        "is_active": True,
        "role": "user",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    mock_db.users.find_one = AsyncMock(return_value=sample_user)
    
    # Create auth service
    auth_service = AuthService(mock_db)
    
    # Test authenticate
    result = await auth_service.authenticate_user("testuser", "secret123")
    print(f"Result: {result}")
    
    # Test password verification
    is_valid = auth_service.verify_password("secret123", sample_user["hashed_password"])
    print(f"Password valid: {is_valid}")
    
    # Test with wrong password
    is_invalid = auth_service.verify_password("wrongpassword", sample_user["hashed_password"])
    print(f"Wrong password valid: {is_invalid}")

asyncio.run(test())
