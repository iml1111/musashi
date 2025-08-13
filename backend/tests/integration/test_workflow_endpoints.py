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
from app.services.auth import AuthService


class TestWorkflowEndpoints:
    """Integration tests for workflow endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Create mock database."""
        db = MagicMock()
        db.users = MagicMock()
        db.workflows = MagicMock()
        return db

    @pytest.fixture
    def auth_token(self, mock_db):
        """Create authentication token."""
        auth_service = AuthService(mock_db)
        return auth_service.create_access_token({"sub": "testuser", "role": "user"})

    @pytest.fixture(autouse=True)
    def override_db(self, mock_db):
        """Override database dependency."""
        from app.services.auth import get_current_active_user_dependency
        from app.models.user import User

        app.dependency_overrides[get_database] = lambda: mock_db

        # Create a mock current user for all workflow tests
        mock_current_user = User(
            id="507f1f77bcf86cd799439011",
            username="testuser",
            email="test@example.com",
            is_active=True,
            role="user",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Override the auth dependency
        app.dependency_overrides[get_current_active_user_dependency] = lambda: mock_current_user

        yield
        app.dependency_overrides.clear()

    def test_get_workflows(self, client, mock_db, auth_token):
        """Test getting user workflows."""
        # Setup mock
        mock_workflows = [
            {
                "_id": ObjectId("507f1f77bcf86cd799439012"),
                "name": "Workflow 1",
                "owner_id": "507f1f77bcf86cd799439011",
                "created_at": datetime.utcnow(),
            },
            {
                "_id": ObjectId("507f1f77bcf86cd799439013"),
                "name": "Workflow 2",
                "owner_id": "507f1f77bcf86cd799439011",
                "created_at": datetime.utcnow(),
            },
        ]

        mock_cursor = MagicMock()
        mock_cursor.skip.return_value = mock_cursor
        mock_cursor.limit.return_value = mock_cursor
        mock_cursor.to_list = AsyncMock(return_value=mock_workflows)
        mock_db.workflows.find.return_value = mock_cursor

        # Make request
        response = client.get(
            "/api/v1/workflows", headers={"Authorization": f"Bearer {auth_token}"}
        )

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Workflow 1"

    def test_get_workflows_unauthorized(self, client):
        """Test getting workflows without authentication."""
        from app.services.auth import get_current_active_user_dependency
        
        # Temporarily remove auth override to test unauthorized access
        if get_current_active_user_dependency in app.dependency_overrides:
            del app.dependency_overrides[get_current_active_user_dependency]
        
        try:
            response = client.get("/api/v1/workflows")
            assert response.status_code == 403
        finally:
            # Restore auth override for other tests
            from app.models.user import User
            mock_current_user = User(
                id="507f1f77bcf86cd799439011",
                username="testuser",
                email="test@example.com",
                is_active=True,
                role="user",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            app.dependency_overrides[get_current_active_user_dependency] = lambda: mock_current_user

    def test_create_workflow(self, client, mock_db, auth_token):
        """Test creating a new workflow."""
        # Setup mock
        inserted_id = ObjectId("507f1f77bcf86cd799439014")
        mock_db.workflows.insert_one = AsyncMock(return_value=MagicMock(inserted_id=inserted_id))
        mock_db.workflows.find_one = AsyncMock(
            return_value={
                "_id": inserted_id,
                "name": "New Workflow",
                "description": "Test workflow",
                "owner_id": "507f1f77bcf86cd799439011",
                "nodes": [],
                "edges": [],
                "created_at": datetime.utcnow(),
            }
        )

        # Make request
        response = client.post(
            "/api/v1/workflows",
            json={
                "name": "New Workflow",
                "description": "Test workflow",
                "nodes": [],
                "edges": [],
                "metadata": {},
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Workflow"
        assert data["owner_id"] == "507f1f77bcf86cd799439011"

    def test_get_workflow_by_id(self, client, mock_db, auth_token):
        """Test getting a specific workflow."""
        # Setup mock
        workflow_id = "507f1f77bcf86cd799439014"
        mock_db.workflows.find_one = AsyncMock(
            return_value={
                "_id": ObjectId(workflow_id),
                "name": "Test Workflow",
                "owner_id": "507f1f77bcf86cd799439011",
                "nodes": [],
                "edges": [],
                "created_at": datetime.utcnow(),
            }
        )

        # Make request
        response = client.get(
            f"/api/v1/workflows/{workflow_id}", headers={"Authorization": f"Bearer {auth_token}"}
        )

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Workflow"

    def test_get_workflow_not_found(self, client, mock_db, auth_token):
        """Test getting non-existent workflow."""
        mock_db.workflows.find_one = AsyncMock(return_value=None)

        response = client.get(
            "/api/v1/workflows/507f1f77bcf86cd799439099",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 404

    def test_update_workflow(self, client, mock_db, auth_token):
        """Test updating a workflow."""
        # Setup mock
        workflow_id = "507f1f77bcf86cd799439014"
        mock_db.workflows.find_one = AsyncMock(
            return_value={
                "_id": ObjectId(workflow_id),
                "name": "Old Name",
                "owner_id": "507f1f77bcf86cd799439011",
                "created_at": datetime.utcnow(),
            }
        )
        mock_db.workflows.update_one = AsyncMock()

        # Make request
        response = client.put(
            f"/api/v1/workflows/{workflow_id}",
            json={"name": "Updated Name"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        # Assertions
        assert response.status_code == 200
        mock_db.workflows.update_one.assert_called_once()

    def test_delete_workflow(self, client, mock_db, auth_token):
        """Test deleting a workflow."""
        # Setup mock
        workflow_id = "507f1f77bcf86cd799439014"
        mock_db.workflows.find_one = AsyncMock(
            return_value={"_id": ObjectId(workflow_id), "owner_id": "507f1f77bcf86cd799439011"}
        )
        mock_db.workflows.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))

        # Make request
        response = client.delete(
            f"/api/v1/workflows/{workflow_id}", headers={"Authorization": f"Bearer {auth_token}"}
        )

        # Assertions
        assert response.status_code == 200
        assert response.json()["message"] == "Workflow deleted successfully"

    def test_share_workflow(self, client, mock_db, auth_token):
        """Test generating share token for workflow."""
        # Setup mock
        workflow_id = "507f1f77bcf86cd799439014"
        mock_db.workflows.find_one = AsyncMock(side_effect=[
            # First call to get_workflow in share_workflow
            {
                "_id": ObjectId(workflow_id),
                "name": "Test Workflow",
                "owner_id": "507f1f77bcf86cd799439011",
                "is_public": False,
                "nodes": [],
                "edges": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            # Second call after update
            {
                "_id": ObjectId(workflow_id),
                "name": "Test Workflow",
                "owner_id": "507f1f77bcf86cd799439011",
                "is_public": True,
                "share_token": "generated_token",
                "nodes": [],
                "edges": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        ])
        mock_db.workflows.update_one = AsyncMock()

        # Make request
        response = client.post(
            f"/api/v1/workflows/{workflow_id}/share",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "share_token" in data
        assert len(data["share_token"]) > 0

    def test_get_shared_workflow(self, client, mock_db):
        """Test getting workflow by share token."""
        # Setup mock
        share_token = "test-share-token"
        mock_db.workflows.find_one = AsyncMock(
            return_value={
                "_id": ObjectId("507f1f77bcf86cd799439014"),
                "name": "Shared Workflow",
                "owner_id": "507f1f77bcf86cd799439011",
                "is_public": True,
                "share_token": share_token,
                "nodes": [],
                "edges": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        )

        # Make request (no auth required)
        response = client.get(f"/api/v1/workflows/shared/{share_token}")

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Shared Workflow"
