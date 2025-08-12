import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from bson import ObjectId

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from app.main import app
from app.core.database import get_database


class TestAuthEndpoints:
    """Integration tests for authentication endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Create mock database."""
        db = MagicMock()
        db.users = MagicMock()
        return db

    @pytest.fixture(autouse=True)
    def override_db(self, mock_db):
        """Override database dependency."""
        app.dependency_overrides[get_database] = lambda: mock_db
        yield
        app.dependency_overrides.clear()

    def test_login_success(self, client, mock_db):
        """Test successful login."""
        # Setup mock
        mock_db.users.find_one = AsyncMock(
            return_value={
                "_id": ObjectId("507f1f77bcf86cd799439011"),
                "username": "testuser",
                "email": "test@example.com",
                "hashed_password": "$2b$12$7cTCNhrqegJz/jUgOvubveFCwFE6Ig7f5f4aFXWUN7er8qSgMLI0G",  # secret123
                "is_active": True,
                "role": "user",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        )

        # Make request
        response = client.post(
            "/api/v1/auth/login", data={"username": "testuser", "password": "secret123"}
        )

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "testuser"

    def test_login_invalid_credentials(self, client, mock_db):
        """Test login with invalid credentials."""
        mock_db.users.find_one = AsyncMock(return_value=None)

        response = client.post(
            "/api/v1/auth/login", data={"username": "testuser", "password": "wrongpassword"}
        )

        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

    def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        response = client.post("/api/v1/auth/login", data={"username": "testuser"})

        assert response.status_code == 422

    def test_register_success(self, client, mock_db):
        """Test successful user registration."""
        # Setup mocks
        mock_db.users.find_one = AsyncMock(return_value=None)
        mock_db.users.insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId("507f1f77bcf86cd799439011"))
        )

        # Make request
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "password123",
                "full_name": "New User",
            },
        )

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "new@example.com"

    def test_register_duplicate_username(self, client, mock_db):
        """Test registration with existing username."""
        mock_db.users.find_one = AsyncMock(
            return_value={"_id": ObjectId("507f1f77bcf86cd799439011"), "username": "existing"}
        )

        response = client.post(
            "/api/v1/auth/register",
            json={"username": "existing", "email": "new@example.com", "password": "password123"},
        )

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_get_current_user(self, client, mock_db):
        """Test getting current user info."""
        # Create valid token
        from app.services.auth import AuthService

        auth_service = AuthService(mock_db)
        token = auth_service.create_access_token({"sub": "testuser", "role": "user"})

        # Setup mock
        mock_db.users.find_one = AsyncMock(
            return_value={
                "_id": ObjectId("507f1f77bcf86cd799439011"),
                "username": "testuser",
                "email": "test@example.com",
                "is_active": True,
                "role": "user",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        )

        # Make request
        response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_get_current_user_no_token(self, client):
        """Test getting current user without token."""
        response = client.get("/api/v1/auth/me")

        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid-token"})

        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]

    def test_refresh_token(self, client, mock_db):
        """Test token refresh."""
        # Create valid token
        from app.services.auth import AuthService

        auth_service = AuthService(mock_db)
        token = auth_service.create_access_token({"sub": "testuser", "role": "user"})

        # Setup mock
        mock_db.users.find_one = AsyncMock(
            return_value={
                "_id": ObjectId("507f1f77bcf86cd799439011"),
                "username": "testuser",
                "role": "user",
                "is_active": True,
            }
        )

        # Make request
        response = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {token}"})

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
