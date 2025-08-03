from typing import List, Optional
from bson import ObjectId
from app.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate, WorkflowInDB


class WorkflowService:
    def __init__(self, db):
        self.db = db
        self.collection = db.workflows

    async def create_workflow(self, workflow: WorkflowCreate, owner_id: str = "temp") -> Workflow:
        workflow_data = workflow.dict()
        workflow_data["owner_id"] = owner_id
        result = await self.collection.insert_one(workflow_data)
        created_workflow = await self.collection.find_one({"_id": result.inserted_id})
        return Workflow(**created_workflow)

    async def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        if not ObjectId.is_valid(workflow_id):
            return None
        workflow = await self.collection.find_one({"_id": ObjectId(workflow_id)})
        return Workflow(**workflow) if workflow else None

    async def get_workflows(self, skip: int = 0, limit: int = 100) -> List[Workflow]:
        cursor = self.collection.find().skip(skip).limit(limit)
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