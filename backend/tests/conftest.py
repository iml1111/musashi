import pytest
import pytest_asyncio
import asyncio
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.main import app
from app.services.auth import AuthService
from app.services.workflow import WorkflowService
from app.services.user import UserService


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def mock_db():
    """Mock database for testing."""
    db = MagicMock()
    db.users = MagicMock()
    db.workflows = MagicMock()

    # Mock collection methods
    db.users.find_one = AsyncMock(return_value=None)
    db.users.insert_one = AsyncMock()
    db.users.update_one = AsyncMock()
    db.users.delete_one = AsyncMock()
    db.users.find = MagicMock()

    db.workflows.find_one = AsyncMock(return_value=None)
    db.workflows.insert_one = AsyncMock()
    db.workflows.update_one = AsyncMock()
    db.workflows.delete_one = AsyncMock()
    db.workflows.find = MagicMock()

    return db


@pytest_asyncio.fixture
async def auth_service(mock_db):
    """Create AuthService instance with mock database."""
    return AuthService(mock_db)


@pytest_asyncio.fixture
async def workflow_service(mock_db):
    """Create WorkflowService instance with mock database."""
    return WorkflowService(mock_db)


@pytest_asyncio.fixture
async def user_service(mock_db):
    """Create UserService instance with mock database."""
    return UserService(mock_db)


@pytest.fixture
def test_client():
    """Create FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def sample_user():
    """Sample user data for testing."""
    return {
        "_id": "507f1f77bcf86cd799439011",
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User",
        "hashed_password": "$2b$12$7cTCNhrqegJz/jUgOvubveFCwFE6Ig7f5f4aFXWUN7er8qSgMLI0G",  # secret123
        "is_active": True,
        "role": "user",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


@pytest.fixture
def sample_admin_user():
    """Sample admin user data for testing."""
    return {
        "_id": "507f1f77bcf86cd799439012",
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Admin User",
        "hashed_password": "$2b$12$7cTCNhrqegJz/jUgOvubveFCwFE6Ig7f5f4aFXWUN7er8qSgMLI0G",  # secret123
        "is_active": True,
        "role": "admin",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


@pytest.fixture
def sample_workflow():
    """Sample workflow data for testing."""
    return {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Test Workflow",
        "description": "A test workflow",
        "owner_id": "507f1f77bcf86cd799439011",
        "nodes": [
            {
                "id": "node1",
                "type": "agent",
                "label": "Agent Node",
                "properties": {},
                "position": {"x": 0, "y": 0},
            }
        ],
        "edges": [],
        "metadata": {"editor": "musashi-flow"},
        "is_public": False,
        "share_token": None,
        "version": 1,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


@pytest.fixture
def auth_headers(auth_service):
    """Generate auth headers with JWT token."""
    token = auth_service.create_access_token(
        data={"sub": "testuser"}, expires_delta=timedelta(minutes=30)
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(auth_service):
    """Generate admin auth headers with JWT token."""
    token = auth_service.create_access_token(
        data={"sub": "admin", "roles": ["admin"]}, expires_delta=timedelta(minutes=30)
    )
    return {"Authorization": f"Bearer {token}"}
