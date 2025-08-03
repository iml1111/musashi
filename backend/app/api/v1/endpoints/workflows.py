from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from app.services.workflow import WorkflowService
from app.core.database import get_database

router = APIRouter()

@router.get("/", response_model=List[Workflow])
async def get_workflows(
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_database)
):
    """Get all workflows"""
    service = WorkflowService(db)
    return await service.get_workflows(skip=skip, limit=limit)

@router.post("/", response_model=Workflow)
async def create_workflow(
    workflow: WorkflowCreate,
    db=Depends(get_database)
):
    """Create a new workflow"""
    service = WorkflowService(db)
    return await service.create_workflow(workflow)

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    db=Depends(get_database)
):
    """Get a workflow by ID"""
    service = WorkflowService(db)
    workflow = await service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow_update: WorkflowUpdate,
    db=Depends(get_database)
):
    """Update a workflow"""
    service = WorkflowService(db)
    workflow = await service.update_workflow(workflow_id, workflow_update)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    db=Depends(get_database)
):
    """Delete a workflow"""
    service = WorkflowService(db)
    deleted = await service.delete_workflow(workflow_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

@router.get("/{workflow_id}/export")
async def export_workflow(
    workflow_id: str,
    db=Depends(get_database)
):
    """Export workflow as JSON"""
    service = WorkflowService(db)
    workflow = await service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow.dict(exclude={"id", "owner_id", "created_at", "updated_at"})