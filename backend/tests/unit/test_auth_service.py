import pytest
from datetime import datetime, timedelta
from jose import jwt

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from app.core.config import settings


class TestAuthService:
    """Test suite for AuthService."""

    @pytest.mark.asyncio
    async def test_password_hashing(self, auth_service):
        """Test password hashing and verification."""
        password = "TestPassword123!"
        hashed = auth_service.get_password_hash(password)

        # Verify hash is different from original
        assert hashed != password

        # Verify password matches hash
        assert auth_service.verify_password(password, hashed) is True

        # Verify wrong password doesn't match
        assert auth_service.verify_password("WrongPassword", hashed) is False

    @pytest.mark.asyncio
    async def test_password_hash_uniqueness(self, auth_service):
        """Test that same password generates different hashes."""
        password = "TestPassword123!"
        hash1 = auth_service.get_password_hash(password)
        hash2 = auth_service.get_password_hash(password)

        # Hashes should be different due to salt
        assert hash1 != hash2

        # But both should verify correctly
        assert auth_service.verify_password(password, hash1) is True
        assert auth_service.verify_password(password, hash2) is True

    @pytest.mark.asyncio
    async def test_jwt_token_generation(self, auth_service):
        """Test JWT token generation."""
        data = {"sub": "testuser", "roles": ["user"]}
        token = auth_service.create_access_token(data)

        assert token is not None
        assert isinstance(token, str)

        # Decode and verify token
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert decoded["sub"] == "testuser"
        assert decoded["roles"] == ["user"]
        assert "exp" in decoded

    @pytest.mark.asyncio
    async def test_jwt_token_expiration(self, auth_service):
        """Test JWT token with custom expiration."""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=15)
        token = auth_service.create_access_token(data, expires_delta)

        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        exp_time = datetime.utcfromtimestamp(decoded["exp"])
        now = datetime.utcnow()

        # Check expiration is approximately 15 minutes from now
        time_diff = (exp_time - now).total_seconds()
        assert 890 < time_diff < 910  # Allow small variance

    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, auth_service, mock_db, sample_user):
        """Test successful user authentication."""
        from unittest.mock import AsyncMock

        mock_db.users.find_one = AsyncMock(return_value=sample_user)

        result = await auth_service.authenticate_user("testuser", "secret123")

        assert result is not None
        assert result.access_token is not None
        assert result.token_type == "bearer"
        mock_db.users.find_one.assert_called_once_with({"username": "testuser"})

    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self, auth_service, mock_db, sample_user):
        """Test authentication with wrong password."""
        from unittest.mock import AsyncMock

        mock_db.users.find_one = AsyncMock(return_value=sample_user)

        result = await auth_service.authenticate_user("testuser", "wrongpassword")

        assert result is None
        mock_db.users.find_one.assert_called_once_with({"username": "testuser"})

    @pytest.mark.asyncio
    async def test_authenticate_user_not_found(self, auth_service, mock_db):
        """Test authentication with non-existent user."""
        from unittest.mock import AsyncMock

        mock_db.users.find_one = AsyncMock(return_value=None)

        result = await auth_service.authenticate_user("nonexistent", "password")

        assert result is None
        mock_db.users.find_one.assert_called_once_with({"username": "nonexistent"})

    @pytest.mark.asyncio
    async def test_authenticate_inactive_user(self, auth_service, mock_db, sample_user):
        """Test authentication with inactive user."""
        from unittest.mock import AsyncMock

        sample_user["is_active"] = False
        mock_db.users.find_one = AsyncMock(return_value=sample_user)

        result = await auth_service.authenticate_user("testuser", "secret123")

        # Should authenticate but token should indicate inactive status
        assert result is not None
        decoded = jwt.decode(
            result.access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        assert decoded["sub"] == "testuser"

    @pytest.mark.asyncio
    async def test_get_current_user_valid_token(self, auth_service, mock_db, sample_user):
        """Test getting current user with valid token."""
        from unittest.mock import AsyncMock

        mock_db.users.find_one = AsyncMock(return_value=sample_user)

        # Create valid token
        token = auth_service.create_access_token({"sub": "testuser"})

        # Mock the credentials
        from fastapi.security import HTTPAuthorizationCredentials

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        user = await auth_service.get_current_user(credentials)

        assert user is not None
        assert user.username == "testuser"
        mock_db.users.find_one.assert_called_with({"username": "testuser"})

    @pytest.mark.asyncio
    async def test_get_current_user_expired_token(self, auth_service, mock_db):
        """Test getting current user with expired token."""
        # Create expired token
        data = {"sub": "testuser"}
        expired_token = auth_service.create_access_token(
            data, expires_delta=timedelta(minutes=-1)  # Already expired
        )

        from fastapi.security import HTTPAuthorizationCredentials
        from fastapi import HTTPException

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=expired_token)

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user(credentials)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, auth_service, mock_db):
        """Test getting current user with invalid token."""
        from fastapi.security import HTTPAuthorizationCredentials
        from fastapi import HTTPException

        invalid_token = "invalid.token.here"
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=invalid_token)

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user(credentials)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_no_username_in_token(self, auth_service, mock_db):
        """Test token without username claim."""
        from fastapi.security import HTTPAuthorizationCredentials
        from fastapi import HTTPException

        # Create token without 'sub' claim
        token = auth_service.create_access_token({"role": "user"})
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user(credentials)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_admin_user_success(self, auth_service, mock_db, sample_admin_user):
        """Test getting current admin user."""
        from unittest.mock import AsyncMock
        from app.models.user import User

        mock_db.users.find_one = AsyncMock(return_value=sample_admin_user)
        
        # Create admin token
        token = auth_service.create_access_token({"sub": "admin", "role": "admin"})
        
        from fastapi.security import HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        user = await auth_service.get_current_user(credentials)
        
        assert user is not None
        assert user.role == "admin"

    @pytest.mark.asyncio
    async def test_get_current_admin_user_failure(self, auth_service, mock_db, sample_user):
        """Test admin access with regular user."""
        from unittest.mock import AsyncMock
        from fastapi import HTTPException
        
        mock_db.users.find_one = AsyncMock(return_value=sample_user)
        
        # Create regular user token
        token = auth_service.create_access_token({"sub": "testuser", "role": "user"})
        
        from fastapi.security import HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        user = await auth_service.get_current_user(credentials)
        
        # Verify user is not admin
        assert user.role == "user"

    @pytest.mark.asyncio
    async def test_token_with_special_characters_in_username(self, auth_service):
        """Test JWT token with special characters in username."""
        special_username = "user@example.com"
        data = {"sub": special_username}
        token = auth_service.create_access_token(data)

        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert decoded["sub"] == special_username
