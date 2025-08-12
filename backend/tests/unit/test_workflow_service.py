import pytest
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from app.models.workflow import WorkflowCreate, WorkflowUpdate


class TestWorkflowService:
    """Test suite for WorkflowService."""

    @pytest.mark.asyncio
    async def test_create_workflow(self, workflow_service, mock_db):
        """Test workflow creation."""
        workflow_data = WorkflowCreate(
            name="Test Workflow",
            description="Test description",
            nodes=[],
            edges=[],
            metadata={"editor": "musashi-flow"},
        )

        inserted_id = ObjectId()
        mock_db.workflows.insert_one.return_value = MagicMock(inserted_id=inserted_id)
        mock_db.workflows.find_one.return_value = {
            "_id": inserted_id,
            "name": "Test Workflow",
            "description": "Test description",
            "owner_id": "user123",
            "nodes": [],
            "edges": [],
            "metadata": {"editor": "musashi-flow"},
            "is_public": False,
            "share_token": None,
            "version": 1,
        }

        result = await workflow_service.create_workflow(workflow_data, "user123")

        assert result is not None
        assert result.name == "Test Workflow"
        assert result.owner_id == "user123"
        assert result.version == 1
        assert result.is_public is False
        mock_db.workflows.insert_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_workflow_valid_id(self, workflow_service, mock_db, sample_workflow):
        """Test getting workflow with valid ID."""
        workflow_id = str(sample_workflow["_id"])
        mock_db.workflows.find_one.return_value = sample_workflow

        result = await workflow_service.get_workflow(workflow_id)

        assert result is not None
        assert result.name == sample_workflow["name"]
        assert str(result.id) == workflow_id
        mock_db.workflows.find_one.assert_called_once_with({"_id": ObjectId(workflow_id)})

    @pytest.mark.asyncio
    async def test_get_workflow_invalid_id(self, workflow_service, mock_db):
        """Test getting workflow with invalid ObjectId."""
        invalid_id = "invalid-id"

        result = await workflow_service.get_workflow(invalid_id)

        assert result is None
        mock_db.workflows.find_one.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_workflow_not_found(self, workflow_service, mock_db):
        """Test getting non-existent workflow."""
        workflow_id = str(ObjectId())
        mock_db.workflows.find_one.return_value = None

        result = await workflow_service.get_workflow(workflow_id)

        assert result is None
        mock_db.workflows.find_one.assert_called_once_with({"_id": ObjectId(workflow_id)})

    @pytest.mark.asyncio
    async def test_get_workflows_with_owner_filter(
        self, workflow_service, mock_db, sample_workflow
    ):
        """Test getting workflows filtered by owner."""
        mock_cursor = MagicMock()
        mock_cursor.skip.return_value = mock_cursor
        mock_cursor.limit.return_value = mock_cursor
        mock_cursor.to_list = AsyncMock(return_value=[sample_workflow])
        mock_db.workflows.find.return_value = mock_cursor

        result = await workflow_service.get_workflows(skip=0, limit=10, owner_id="user123")

        assert len(result) == 1
        assert result[0].name == sample_workflow["name"]
        mock_db.workflows.find.assert_called_once_with({"owner_id": "user123"})

    @pytest.mark.asyncio
    async def test_get_workflows_without_filter(self, workflow_service, mock_db, sample_workflow):
        """Test getting all workflows without filter."""
        mock_cursor = MagicMock()
        mock_cursor.skip.return_value = mock_cursor
        mock_cursor.limit.return_value = mock_cursor
        mock_cursor.to_list = AsyncMock(return_value=[sample_workflow, sample_workflow])
        mock_db.workflows.find.return_value = mock_cursor

        result = await workflow_service.get_workflows(skip=0, limit=100)

        assert len(result) == 2
        mock_db.workflows.find.assert_called_once_with({})

    @pytest.mark.asyncio
    async def test_update_workflow_valid(self, workflow_service, mock_db, sample_workflow):
        """Test updating workflow with valid data."""
        workflow_id = str(sample_workflow["_id"])
        update_data = WorkflowUpdate(name="Updated Workflow", description="Updated description")

        updated_workflow = sample_workflow.copy()
        updated_workflow["name"] = "Updated Workflow"
        updated_workflow["description"] = "Updated description"
        updated_workflow["version"] = 2

        mock_db.workflows.find_one.return_value = updated_workflow

        result = await workflow_service.update_workflow(workflow_id, update_data)

        assert result is not None
        assert result.name == "Updated Workflow"
        assert result.description == "Updated description"

        mock_db.workflows.update_one.assert_called_once()
        call_args = mock_db.workflows.update_one.call_args
        assert call_args[0][0] == {"_id": ObjectId(workflow_id)}
        assert "$inc" in call_args[0][1]
        assert call_args[0][1]["$inc"]["version"] == 1

    @pytest.mark.asyncio
    async def test_update_workflow_invalid_id(self, workflow_service, mock_db):
        """Test updating workflow with invalid ID."""
        invalid_id = "invalid-id"
        update_data = WorkflowUpdate(name="Updated")

        result = await workflow_service.update_workflow(invalid_id, update_data)

        assert result is None
        mock_db.workflows.update_one.assert_not_called()

    @pytest.mark.asyncio
    async def test_update_workflow_empty_update(self, workflow_service, mock_db, sample_workflow):
        """Test updating workflow with empty update data."""
        workflow_id = str(sample_workflow["_id"])
        update_data = WorkflowUpdate()  # All fields None

        mock_db.workflows.find_one.return_value = sample_workflow

        result = await workflow_service.update_workflow(workflow_id, update_data)

        assert result is not None
        assert result.name == sample_workflow["name"]
        mock_db.workflows.update_one.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_workflow_valid(self, workflow_service, mock_db):
        """Test deleting workflow with valid ID."""
        workflow_id = str(ObjectId())
        mock_db.workflows.delete_one.return_value = MagicMock(deleted_count=1)

        result = await workflow_service.delete_workflow(workflow_id)

        assert result is True
        mock_db.workflows.delete_one.assert_called_once_with({"_id": ObjectId(workflow_id)})

    @pytest.mark.asyncio
    async def test_delete_workflow_not_found(self, workflow_service, mock_db):
        """Test deleting non-existent workflow."""
        workflow_id = str(ObjectId())
        mock_db.workflows.delete_one.return_value = MagicMock(deleted_count=0)

        result = await workflow_service.delete_workflow(workflow_id)

        assert result is False
        mock_db.workflows.delete_one.assert_called_once_with({"_id": ObjectId(workflow_id)})

    @pytest.mark.asyncio
    async def test_generate_share_token(self, workflow_service, mock_db, sample_workflow):
        """Test generating share token for workflow."""
        workflow_id = str(sample_workflow["_id"])

        # First call returns workflow without token
        mock_db.workflows.find_one.side_effect = [
            sample_workflow,
            {**sample_workflow, "share_token": "generated-token", "is_public": True},
        ]

        result = await workflow_service.generate_share_token(workflow_id)

        assert result is not None
        assert result.share_token is not None
        assert result.is_public is True

        mock_db.workflows.update_one.assert_called_once()
        update_call = mock_db.workflows.update_one.call_args[0][1]["$set"]
        assert "share_token" in update_call
        assert update_call["is_public"] is True

    @pytest.mark.asyncio
    async def test_get_workflow_by_share_token(self, workflow_service, mock_db, sample_workflow):
        """Test getting workflow by share token."""
        share_token = "test-share-token"
        shared_workflow = {**sample_workflow, "share_token": share_token, "is_public": True}
        mock_db.workflows.find_one.return_value = shared_workflow

        result = await workflow_service.get_workflow_by_share_token(share_token)

        assert result is not None
        assert result.share_token == share_token
        assert result.is_public is True
        mock_db.workflows.find_one.assert_called_once_with(
            {"share_token": share_token, "is_public": True}
        )
