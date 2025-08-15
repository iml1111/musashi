from typing import List, Optional
from bson import ObjectId
import secrets
from datetime import datetime
from fastapi import HTTPException, status
from app.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate


class WorkflowService:
    def __init__(self, db):
        self.db = db
        self.collection = db.workflows

    async def create_workflow(self, workflow: WorkflowCreate, owner_id: str, username: str = None) -> Workflow:
        workflow_data = workflow.model_dump()
        workflow_data["owner_id"] = owner_id
        workflow_data["is_public"] = False
        workflow_data["share_token"] = None
        workflow_data["version"] = 1
        workflow_data["last_modified_by"] = username if username else owner_id
        
        # Initialize update logs with creation entry
        workflow_data["update_logs"] = [{
            "username": username if username else owner_id,
            "timestamp": datetime.utcnow(),
            "version": 1
        }]
        
        result = await self.collection.insert_one(workflow_data)
        created_workflow = await self.collection.find_one({"_id": result.inserted_id})
        if created_workflow:
            created_workflow["id"] = str(created_workflow["_id"])
            created_workflow.pop("_id", None)
        return Workflow(**created_workflow)

    async def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        if not ObjectId.is_valid(workflow_id):
            return None
        workflow = await self.collection.find_one({"_id": ObjectId(workflow_id)})
        if workflow:
            workflow["id"] = str(workflow["_id"])
            workflow.pop("_id", None)
        return Workflow(**workflow) if workflow else None

    async def get_workflows(
        self, skip: int = 0, limit: int = 100, owner_id: str = None
    ) -> List[Workflow]:
        filter_query = {}
        if owner_id:
            filter_query["owner_id"] = owner_id
        cursor = self.collection.find(filter_query).skip(skip).limit(limit)
        workflows = await cursor.to_list(length=limit)
        for workflow in workflows:
            workflow["id"] = str(workflow["_id"])
            workflow.pop("_id", None)
        return [Workflow(**workflow) for workflow in workflows]

    async def update_workflow(
        self, workflow_id: str, workflow_update: WorkflowUpdate, current_user_id: str = None, current_username: str = None
    ) -> Optional[Workflow]:
        if not ObjectId.is_valid(workflow_id):
            return None

        # Get current workflow to check version
        current_workflow = await self.get_workflow(workflow_id)
        if not current_workflow:
            return None

        update_data = {k: v for k, v in workflow_update.model_dump().items() if v is not None and k != "version"}
        if not update_data:
            return current_workflow

        # Check for version conflict (optimistic locking)
        if workflow_update.version is not None:
            if current_workflow.version != workflow_update.version:
                # Version mismatch - someone else has updated the workflow
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "message": "Workflow has been modified by another user",
                        "current_version": current_workflow.version,
                        "your_version": workflow_update.version,
                        "last_modified_by": current_workflow.last_modified_by,
                        "workflow": current_workflow.model_dump()
                    }
                )

        # Update metadata
        update_data["updated_at"] = datetime.utcnow()
        if current_username:
            update_data["last_modified_by"] = current_username
        elif current_user_id:
            update_data["last_modified_by"] = current_user_id

        # Prepare new log entry
        new_log_entry = {
            "username": current_username if current_username else current_user_id,
            "timestamp": datetime.utcnow(),
            "version": current_workflow.version + 1
        }

        # Perform the update with version increment and log addition
        # Keep only the last 50 logs
        result = await self.collection.update_one(
            {"_id": ObjectId(workflow_id), "version": current_workflow.version},
            {
                "$set": update_data,
                "$inc": {"version": 1},
                "$push": {
                    "update_logs": {
                        "$each": [new_log_entry],
                        "$slice": -50  # Keep only the last 50 entries
                    }
                }
            }
        )

        # Check if update was successful
        if result.modified_count == 0:
            # Concurrent update happened between our check and update
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Workflow was modified during update. Please refresh and try again.",
                    "current_workflow": (await self.get_workflow(workflow_id)).model_dump()
                }
            )

        return await self.get_workflow(workflow_id)

    async def delete_workflow(self, workflow_id: str) -> bool:
        if not ObjectId.is_valid(workflow_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(workflow_id)})
        return result.deleted_count > 0

    async def share_workflow(self, workflow_id: str, owner_id: str) -> Optional[Workflow]:
        if not ObjectId.is_valid(workflow_id):
            return None

        # Check if workflow exists and belongs to user
        workflow = await self.get_workflow(workflow_id)
        if not workflow:
            return None

        if str(workflow.owner_id) != str(owner_id):
            return None

        # Generate share token if not exists
        if not workflow.share_token:
            share_token = secrets.token_urlsafe(16)
            await self.collection.update_one(
                {"_id": ObjectId(workflow_id)},
                {"$set": {"share_token": share_token, "is_public": True}},
            )
            workflow = await self.get_workflow(workflow_id)

        return workflow

    async def get_workflow_by_share_token(self, share_token: str) -> Optional[Workflow]:
        workflow = await self.collection.find_one({"share_token": share_token, "is_public": True})
        if workflow:
            workflow["id"] = str(workflow["_id"])
            workflow.pop("_id", None)
        return Workflow(**workflow) if workflow else None

    async def generate_share_token(self, workflow_id: str) -> Optional[str]:
        """Generate and return share token for a workflow"""
        if not ObjectId.is_valid(workflow_id):
            return None
        
        # Check if workflow exists
        workflow = await self.get_workflow(workflow_id)
        if not workflow:
            return None

        # Generate share token if not exists
        if not workflow.share_token:
            share_token = secrets.token_urlsafe(16)
            await self.collection.update_one(
                {"_id": ObjectId(workflow_id)},
                {"$set": {"share_token": share_token, "is_public": True}},
            )
            return share_token
        
        return workflow.share_token

