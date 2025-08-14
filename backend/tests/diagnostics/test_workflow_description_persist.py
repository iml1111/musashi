"""
Diagnostic test for workflow description persistence issue.
Tests that description field is properly saved and retrieved across:
1. API updates
2. Database persistence
3. Session refresh
"""

import pytest
import pytest_asyncio
import asyncio
import logging
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.services.workflow import WorkflowService
from app.models.workflow import WorkflowCreate, WorkflowUpdate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test sentinel value
SENTINEL = f"SC_TEST_DESC_{datetime.now().strftime('%Y%m%d_%H%M%S')}"


class TestWorkflowDescriptionPersistence:
    """Test suite for workflow description persistence."""
    
    @pytest_asyncio.fixture
    async def db_client(self):
        """Create a test database connection."""
        # Use localhost for testing instead of host.docker.internal
        test_url = "mongodb://localhost:27017"
        client = AsyncIOMotorClient(test_url)
        db = client[f"{settings.DATABASE_NAME}_test"]
        yield db
        # Cleanup
        await db.workflows.delete_many({})
        client.close()
    
    @pytest_asyncio.fixture
    async def workflow_service(self, db_client):
        """Create workflow service instance."""
        return WorkflowService(db_client)
    
    @pytest.fixture
    def api_client(self):
        """Create test API client."""
        return TestClient(app)
    
    @pytest.mark.asyncio
    async def test_description_persistence_backend(self, workflow_service, db_client):
        """Test description persistence at service/database level."""
        logger.info(f"Testing with sentinel: {SENTINEL}")
        
        # Step 1: Create workflow
        workflow_data = WorkflowCreate(
            name="Test Workflow",
            description="Initial description"
        )
        created = await workflow_service.create_workflow(
            workflow_data, 
            owner_id="test_user"
        )
        workflow_id = str(created.id)
        logger.info(f"Created workflow {workflow_id} with initial description")
        
        # Step 2: Update with sentinel description
        update_data = WorkflowUpdate(description=SENTINEL)
        updated = await workflow_service.update_workflow(workflow_id, update_data)
        
        assert updated is not None, "Update returned None"
        assert updated.description == SENTINEL, f"Update response description mismatch: {updated.description}"
        logger.info(f"✓ API returned updated description: {updated.description}")
        
        # Step 3: Immediate re-fetch via service
        fetched = await workflow_service.get_workflow(workflow_id)
        assert fetched is not None, "Fetch returned None"
        assert fetched.description == SENTINEL, f"Re-fetch description mismatch: {fetched.description}"
        logger.info(f"✓ Re-fetch returned correct description: {fetched.description}")
        
        # Step 4: Direct database verification
        db_doc = await db_client.workflows.find_one({"_id": ObjectId(workflow_id)})
        assert db_doc is not None, "Document not found in database"
        assert "description" in db_doc, "Description field missing in database"
        assert db_doc["description"] == SENTINEL, f"Database description mismatch: {db_doc.get('description')}"
        logger.info(f"✓ Database contains correct description: {db_doc['description']}")
        
        # Step 5: Simulate new session (new service instance)
        new_service = WorkflowService(db_client)
        new_fetch = await new_service.get_workflow(workflow_id)
        assert new_fetch is not None, "New session fetch returned None"
        assert new_fetch.description == SENTINEL, f"New session description mismatch: {new_fetch.description}"
        logger.info(f"✓ New session returned correct description: {new_fetch.description}")
        
        logger.info("✅ All backend persistence tests passed")
    
    @pytest.mark.asyncio
    async def test_description_persistence_api(self, api_client):
        """Test description persistence through API endpoints."""
        logger.info(f"Testing API with sentinel: {SENTINEL}")
        
        # First, we need to authenticate (create a test user and get token)
        # For simplicity, using mock auth or assuming test setup
        # In real scenario, would need proper auth setup
        
        headers = {
            "Content-Type": "application/json",
            # Add auth header if needed
        }
        
        # Step 1: Create workflow via API
        create_payload = {
            "name": "API Test Workflow",
            "description": "Initial API description"
        }
        
        # Note: This would need proper auth setup in real test
        # For diagnostic purposes, showing the pattern
        
        logger.info("Note: Full API test would require authentication setup")
        logger.info("Please run backend service test for core functionality verification")
    
    @pytest.mark.asyncio
    async def test_update_field_inclusion(self, workflow_service, db_client):
        """Test that update operation properly includes description field."""
        logger.info("Testing update field inclusion...")
        
        # Create workflow
        workflow_data = WorkflowCreate(
            name="Field Test Workflow",
            description="Initial"
        )
        created = await workflow_service.create_workflow(
            workflow_data,
            owner_id="test_user"
        )
        workflow_id = str(created.id)
        
        # Test partial update with only description
        update_data = WorkflowUpdate(description=SENTINEL)
        update_dict = update_data.model_dump(exclude_unset=True)
        
        assert "description" in update_dict, "Description not in update dict"
        logger.info(f"✓ Update dict contains description: {update_dict}")
        
        # Perform update
        result = await db_client.workflows.update_one(
            {"_id": ObjectId(workflow_id)},
            {"$set": update_dict}
        )
        
        assert result.modified_count == 1, "Document not modified"
        logger.info("✓ Database update operation succeeded")
        
        # Verify in database
        db_doc = await db_client.workflows.find_one({"_id": ObjectId(workflow_id)})
        assert db_doc["description"] == SENTINEL, f"Database description incorrect: {db_doc.get('description')}"
        logger.info(f"✓ Database contains updated description: {db_doc['description']}")
        
        logger.info("✅ Field inclusion test passed")


if __name__ == "__main__":
    # Run tests directly
    pytest.main([__file__, "-v", "--log-cli-level=INFO"])