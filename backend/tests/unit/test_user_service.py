import pytest
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId
from datetime import datetime

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from app.models.user import UserCreate, UserUpdate


class TestUserService:
    """Test suite for UserService."""

    @pytest.mark.asyncio
    async def test_create_user(self, user_service, mock_db):
        """Test user creation."""
        user_data = UserCreate(
            username="newuser", email="new@example.com", password="StrongPassword123!"
        )

        inserted_id = ObjectId()
        mock_db.users.insert_one.return_value = MagicMock(inserted_id=inserted_id)
        mock_db.users.find_one.side_effect = [
            None,  # Check for existing username
            None,  # Check for existing email
            {  # Return created user
                "_id": inserted_id,
                "username": "newuser",
                "email": "new@example.com",
                "hashed_password": "hashed_password",
                "is_active": True,
                "roles": ["user"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        ]

        result = await user_service.create_user(user_data)

        assert result is not None
        assert result.username == "newuser"
        assert result.email == "new@example.com"
        assert result.is_active is True
        assert "user" in result.roles
        mock_db.users.insert_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_user_duplicate_username(self, user_service, mock_db):
        """Test user creation with duplicate username."""
        user_data = UserCreate(
            username="existinguser", email="new@example.com", password="Password123!"
        )

        # Username already exists
        mock_db.users.find_one.return_value = {"username": "existinguser"}

        with pytest.raises(ValueError) as exc_info:
            await user_service.create_user(user_data)

        assert "username already registered" in str(exc_info.value).lower()
        mock_db.users.insert_one.assert_not_called()

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self, user_service, mock_db):
        """Test user creation with duplicate email."""
        user_data = UserCreate(
            username="newuser", email="existing@example.com", password="Password123!"
        )

        # Email already exists
        mock_db.users.find_one.side_effect = [
            None,  # Username check
            {"email": "existing@example.com"},  # Email check
        ]

        with pytest.raises(ValueError) as exc_info:
            await user_service.create_user(user_data)

        assert "email already registered" in str(exc_info.value).lower()
        mock_db.users.insert_one.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_user_by_username(self, user_service, mock_db, sample_user):
        """Test getting user by username."""
        mock_db.users.find_one.return_value = sample_user

        result = await user_service.get_user_by_username("testuser")

        assert result is not None
        assert result.username == "testuser"
        mock_db.users.find_one.assert_called_once_with({"username": "testuser"})

    @pytest.mark.asyncio
    async def test_get_user_by_email(self, user_service, mock_db, sample_user):
        """Test getting user by email."""
        mock_db.users.find_one.return_value = sample_user

        result = await user_service.get_user_by_email("test@example.com")

        assert result is not None
        assert result.email == "test@example.com"
        mock_db.users.find_one.assert_called_once_with({"email": "test@example.com"})

    @pytest.mark.asyncio
    async def test_get_users_with_pagination(
        self, user_service, mock_db, sample_user, sample_admin_user
    ):
        """Test getting users with pagination."""
        mock_cursor = MagicMock()
        mock_cursor.skip.return_value = mock_cursor
        mock_cursor.limit.return_value = mock_cursor
        mock_cursor.to_list = AsyncMock(return_value=[sample_user, sample_admin_user])
        mock_db.users.find.return_value = mock_cursor

        result = await user_service.get_users(skip=10, limit=20)

        assert len(result) == 2
        assert result[0].username == "testuser"
        assert result[1].username == "admin"
        mock_cursor.skip.assert_called_once_with(10)
        mock_cursor.limit.assert_called_once_with(20)

    @pytest.mark.asyncio
    async def test_update_user(self, user_service, mock_db, sample_user):
        """Test updating user."""
        user_id = str(sample_user["_id"])
        update_data = UserUpdate(email="newemail@example.com", is_active=False)

        updated_user = {**sample_user, "email": "newemail@example.com", "is_active": False}
        mock_db.users.find_one.return_value = updated_user

        result = await user_service.update_user(user_id, update_data)

        assert result is not None
        assert result.email == "newemail@example.com"
        assert result.is_active is False

        mock_db.users.update_one.assert_called_once()
        update_call = mock_db.users.update_one.call_args[0]
        assert update_call[0] == {"_id": ObjectId(user_id)}
        assert "$set" in update_call[1]

    @pytest.mark.asyncio
    async def test_update_user_password(self, user_service, mock_db, sample_user):
        """Test updating user password."""
        user_id = str(sample_user["_id"])
        update_data = UserUpdate(password="NewPassword123!")

        mock_db.users.find_one.return_value = sample_user

        result = await user_service.update_user(user_id, update_data)

        assert result is not None

        # Check that password was hashed before update
        update_call = mock_db.users.update_one.call_args[0][1]["$set"]
        assert "hashed_password" in update_call
        assert update_call["hashed_password"] != "NewPassword123!"

    @pytest.mark.asyncio
    async def test_delete_user(self, user_service, mock_db):
        """Test deleting user."""
        user_id = str(ObjectId())
        mock_db.users.delete_one.return_value = MagicMock(deleted_count=1)

        result = await user_service.delete_user(user_id)

        assert result is True
        mock_db.users.delete_one.assert_called_once_with({"_id": ObjectId(user_id)})

    @pytest.mark.asyncio
    async def test_delete_user_not_found(self, user_service, mock_db):
        """Test deleting non-existent user."""
        user_id = str(ObjectId())
        mock_db.users.delete_one.return_value = MagicMock(deleted_count=0)

        result = await user_service.delete_user(user_id)

        assert result is False
        mock_db.users.delete_one.assert_called_once_with({"_id": ObjectId(user_id)})
