import pytest
from datetime import datetime
from pydantic import ValidationError

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from app.models.user import UserCreate, UserUpdate, User, TokenPayload
from app.models.workflow import Node, Edge, WorkflowCreate, WorkflowUpdate, Workflow


class TestUserModels:
    """Test suite for User models."""

    def test_user_create_valid(self):
        """Test creating valid UserCreate model."""
        user = UserCreate(username="testuser", email="test@example.com", password="Password123!")

        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.password == "Password123!"

    def test_user_create_invalid_email(self):
        """Test UserCreate with invalid email."""
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(username="testuser", email="invalid-email", password="Password123!")

        errors = exc_info.value.errors()
        assert any(error["type"] == "value_error" for error in errors)

    def test_user_create_short_username(self):
        """Test UserCreate with short username."""
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="ab", email="test@example.com", password="Password123!"  # Too short
            )

        errors = exc_info.value.errors()
        assert any("at least 3 characters" in str(error) for error in errors)

    def test_user_update_partial(self):
        """Test UserUpdate with partial data."""
        update = UserUpdate(email="new@example.com")

        assert update.email == "new@example.com"
        assert update.password is None
        assert update.is_active is None
        assert update.username is None

    def test_user_model_complete(self):
        """Test complete User model."""
        user = User(
            id="507f1f77bcf86cd799439011",
            username="testuser",
            email="test@example.com",
            is_active=True,
            role="admin",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        assert str(user.id) == "507f1f77bcf86cd799439011"
        assert user.username == "testuser"
        assert user.role == "admin"

    def test_token_payload(self):
        """Test TokenPayload model."""
        payload = TokenPayload(sub="testuser", role="admin")

        assert payload.sub == "testuser"
        assert payload.role == "admin"


class TestWorkflowModels:
    """Test suite for Workflow models."""

    def test_node_model(self):
        """Test Node model."""
        node = Node(
            id="node1",
            type="agent",
            label="Test Agent",
            properties={"model": "gpt-4"},
            position_x=100,
            position_y=200,
        )

        assert node.id == "node1"
        assert node.type == "agent"
        assert node.properties["model"] == "gpt-4"
        assert node.position_x == 100
        assert node.position_y == 200

    def test_edge_model(self):
        """Test Edge model."""
        edge = Edge(
            id="edge1",
            source="node1",
            target="node2",
            label="Connection",
            sourceHandle="output",
            targetHandle="input",
            data={"weight": 1.0},
        )

        assert edge.source == "node1"
        assert edge.target == "node2"
        assert edge.sourceHandle == "output"
        assert edge.data["weight"] == 1.0

    def test_workflow_create(self):
        """Test WorkflowCreate model."""
        workflow = WorkflowCreate(
            name="Test Workflow",
            description="A test workflow",
            nodes=[
                {
                    "id": "node1",
                    "type": "agent",
                    "label": "Agent",
                    "properties": {},
                    "position": {"x": 0, "y": 0},
                }
            ],
            edges=[],
            metadata={"editor": "musashi"},
        )

        assert workflow.name == "Test Workflow"
        assert len(workflow.nodes) == 1
        assert workflow.nodes[0].type == "agent"

    def test_workflow_create_empty_name(self):
        """Test WorkflowCreate with empty name - empty strings are currently allowed."""
        # Note: Empty names are currently allowed by the model
        workflow = WorkflowCreate(name="", nodes=[], edges=[])
        assert workflow.name == ""

    def test_workflow_update_partial(self):
        """Test WorkflowUpdate with partial data."""
        update = WorkflowUpdate(name="Updated Name", description=None, nodes=None)

        assert update.name == "Updated Name"
        assert update.description is None
        assert update.nodes is None

    def test_workflow_model_complete(self):
        """Test complete Workflow model."""
        workflow = Workflow(
            id="507f1f77bcf86cd799439011",
            name="Test Workflow",
            description="Description",
            owner_id="user123",
            nodes=[],
            edges=[],
            metadata={},
            is_public=False,
            share_token=None,
            version=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        assert str(workflow.id) == "507f1f77bcf86cd799439011"
        assert workflow.owner_id == "user123"
        assert workflow.version == 1
        assert workflow.is_public is False

    def test_workflow_with_complex_nodes(self):
        """Test Workflow with complex node structures."""
        workflow = WorkflowCreate(
            name="Complex Workflow",
            nodes=[
                {
                    "id": "agent1",
                    "type": "agent",
                    "label": "Main Agent",
                    "properties": {"model": "gpt-4", "temperature": 0.7, "connected_inputs": []},
                    "position": {"x": 0, "y": 0},
                },
                {
                    "id": "func1",
                    "type": "function",
                    "label": "Process Function",
                    "properties": {"code": "return input * 2"},
                    "position": {"x": 200, "y": 0},
                },
            ],
            edges=[
                {
                    "id": "edge1",
                    "source": "agent1",
                    "target": "func1",
                    "sourceHandle": "output",
                    "targetHandle": "input",
                }
            ],
        )

        assert len(workflow.nodes) == 2
        assert len(workflow.edges) == 1
        assert workflow.nodes[0].properties["model"] == "gpt-4"
        assert workflow.edges[0].source == "agent1"
