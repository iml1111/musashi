from typing import List, Optional
from bson import ObjectId
import secrets
from app.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate, WorkflowInDB


class WorkflowService:
    def __init__(self, db):
        self.db = db
        self.collection = db.workflows

    async def create_workflow(self, workflow: WorkflowCreate, owner_id: str) -> Workflow:
        workflow_data = workflow.dict()
        workflow_data["owner_id"] = owner_id
        workflow_data["is_public"] = False
        workflow_data["share_token"] = None
        workflow_data["version"] = 1
        print(f"Creating workflow with owner_id: {owner_id}")
        result = await self.collection.insert_one(workflow_data)
        created_workflow = await self.collection.find_one({"_id": result.inserted_id})
        print(f"Created workflow: {created_workflow.get('_id')} with owner_id: {created_workflow.get('owner_id')}")
        return Workflow(**created_workflow)

    async def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        if not ObjectId.is_valid(workflow_id):
            return None
        workflow = await self.collection.find_one({"_id": ObjectId(workflow_id)})
        return Workflow(**workflow) if workflow else None

    async def get_workflows(self, skip: int = 0, limit: int = 100, owner_id: str = None) -> List[Workflow]:
        filter_query = {}
        if owner_id:
            filter_query["owner_id"] = owner_id
        cursor = self.collection.find(filter_query).skip(skip).limit(limit)
        workflows = await cursor.to_list(length=limit)
        return [Workflow(**workflow) for workflow in workflows]

    async def update_workflow(self, workflow_id: str, workflow_update: WorkflowUpdate) -> Optional[Workflow]:
        if not ObjectId.is_valid(workflow_id):
            return None
        
        update_data = {k: v for k, v in workflow_update.dict().items() if v is not None}
        if not update_data:
            return await self.get_workflow(workflow_id)
        
        await self.collection.update_one(
            {"_id": ObjectId(workflow_id)},
            {"$set": update_data, "$inc": {"version": 1}}
        )
        return await self.get_workflow(workflow_id)

    async def delete_workflow(self, workflow_id: str) -> bool:
        if not ObjectId.is_valid(workflow_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(workflow_id)})
        return result.deleted_count > 0
    
    async def share_workflow(self, workflow_id: str, owner_id: str) -> Optional[Workflow]:
        if not ObjectId.is_valid(workflow_id):
            print(f"Invalid workflow_id: {workflow_id}")
            return None
        
        # Check if workflow exists and belongs to user
        workflow = await self.get_workflow(workflow_id)
        if not workflow:
            print(f"Workflow not found: {workflow_id}")
            return None
            
        # Debug logging
        print(f"Workflow owner_id: {workflow.owner_id} (type: {type(workflow.owner_id)})")
        print(f"Current owner_id: {owner_id} (type: {type(owner_id)})")
        
        if str(workflow.owner_id) != str(owner_id):
            print(f"Owner mismatch: workflow owner {workflow.owner_id} != current user {owner_id}")
            return None
        
        # Generate share token if not exists
        if not workflow.share_token:
            share_token = secrets.token_urlsafe(16)
            await self.collection.update_one(
                {"_id": ObjectId(workflow_id)},
                {"$set": {"share_token": share_token, "is_public": True}}
            )
            workflow = await self.get_workflow(workflow_id)
        
        return workflow
    
    async def get_workflow_by_share_token(self, share_token: str) -> Optional[Workflow]:
        workflow = await self.collection.find_one({"share_token": share_token, "is_public": True})
        return Workflow(**workflow) if workflow else None