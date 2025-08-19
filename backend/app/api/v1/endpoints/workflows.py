from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from app.models.user import User
from app.services.workflow import WorkflowService
from app.services.auth import get_current_active_user_dependency
from app.core.database import get_database

router = APIRouter()


@router.get("/", response_model=List[Workflow])
async def get_workflows(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user_dependency),
    db=Depends(get_database),
):
    """Get all workflows (team collaboration mode)"""
    service = WorkflowService(db)
    # Team mode: All authenticated users can see all workflows
    return await service.get_workflows(skip=skip, limit=limit)


@router.post("/", response_model=Workflow)
async def create_workflow(
    workflow: WorkflowCreate,
    current_user: User = Depends(get_current_active_user_dependency),
    db=Depends(get_database),
):
    """Create a new workflow"""
    service = WorkflowService(db)
    return await service.create_workflow(workflow, str(current_user.id), current_user.username)


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_active_user_dependency),
    db=Depends(get_database),
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
    current_user: User = Depends(get_current_active_user_dependency),
    db=Depends(get_database),
):
    """Update a workflow with optimistic locking"""
    service = WorkflowService(db)
    try:
        workflow = await service.update_workflow(
            workflow_id, 
            workflow_update, 
            current_user_id=str(current_user.id),
            current_username=current_user.username
        )
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow
    except HTTPException as e:
        # Re-raise the 409 Conflict exception from service
        raise e


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_active_user_dependency),
    db=Depends(get_database),
):
    """Delete a workflow"""
    service = WorkflowService(db)
    deleted = await service.delete_workflow(workflow_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}


@router.post("/{workflow_id}/share")
async def share_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_active_user_dependency),
    db=Depends(get_database),
):
    """Generate share token for workflow (any team member can share)"""
    service = WorkflowService(db)
    # Team mode: Any authenticated user can share any workflow
    workflow = await service.share_workflow_team_mode(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"share_token": workflow.share_token, "is_public": workflow.is_public}


@router.get("/shared/{share_token}")
async def get_shared_workflow(share_token: str, db=Depends(get_database)):
    """Get workflow by share token (no auth required)"""
    service = WorkflowService(db)
    workflow = await service.get_workflow_by_share_token(share_token)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.get("/{workflow_id}/export")
async def export_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_active_user_dependency),
    db=Depends(get_database),
):
    """Export workflow as JSON"""
    service = WorkflowService(db)
    workflow = await service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow.dict(exclude={"id", "owner_id", "created_at", "updated_at"})

