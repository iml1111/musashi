# Workflow Description Persistence Map

Generated: 2025-01-14 16:15

## Stack Detection

### Backend
- **Framework**: Python 3.12 + FastAPI
- **Database**: MongoDB (Motor async driver)
- **Models**: Pydantic-based models
- **Test Runner**: pytest + pytest-asyncio

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: React hooks (useState)
- **Data Fetching**: React Query (workflow service)
- **UI Components**: Custom workflow editor with React Flow

### Deployment
- **Architecture**: Single container (Docker)
- **Ports**: Frontend :80, Backend API :8080
- **Build**: Dockerfile.optimized

## Workflow Entity Structure

### Backend Models (`backend/app/models/workflow.py`)

```python
WorkflowBase:
  - name: str
  - description: Optional[str] = None  # ← Target field
  - nodes: List[Node]
  - edges: List[Edge]
  - metadata: Dict[str, Any]

WorkflowUpdate:
  - name: Optional[str]
  - description: Optional[str]  # ← Update DTO includes description
  - nodes: Optional[List[Node]]
  - edges: Optional[List[Edge]]
  - metadata: Optional[Dict[str, Any]]

WorkflowInDB (extends WorkflowBase):
  - id: PyObjectId
  - owner_id: str
  - team_id: Optional[str]
  - version: int
  - created_at: datetime
  - updated_at: datetime
```

### Frontend Types (`frontend/src/types/workflow.ts`)

```typescript
interface Workflow {
  id: string
  name: string
  description?: string  // ← Optional field
  nodes: Node[]
  edges: Edge[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface WorkflowUpdate {
  name?: string
  description?: string  // ← Update interface includes description
  nodes?: Node[]
  edges?: Edge[]
}
```

## API Endpoints

### Update Workflow
- **Route**: `PUT /api/v1/workflows/{workflow_id}`
- **Handler**: `backend/app/api/v1/endpoints/workflows.py:50`
- **Service**: `backend/app/services/workflow.py:47` (`update_workflow`)
- **Database Operation**: `workflows.update_one()` with `$set` operator

## Frontend Components

### MusashiFlowEditor (`frontend/src/pages/MusashiFlowEditor.tsx`)

Key locations for description handling:

1. **State Management** (line ~100-150)
   - `const [workflowDescription, setWorkflowDescription] = useState('')`
   
2. **Save Function** (line 1277-1283)
   ```typescript
   const updatedWorkflow = await workflowService.updateWorkflow(workflow.id, {
     name: workflowName,
     description: workflowDescription,  // ← Sent in update
     nodes: workflowNodes,
     edges: workflowEdges,
   })
   ```

3. **Local Storage** (lines 469, 485)
   - Saves description to localStorage on changes
   
4. **Workflow Service** (`frontend/src/services/workflow.ts:75`)
   ```typescript
   async updateWorkflow(id: string, workflow: WorkflowUpdate): Promise<Workflow> {
     // PUT request with JSON body including description
   }
   ```

## Data Flow Diagram

```
[Frontend]                    [Backend]                [Database]
    |                            |                         |
MusashiFlowEditor               |                         |
    |                            |                         |
setWorkflowDescription()        |                         |
    |                            |                         |
handleSaveWorkflow()            |                         |
    |                            |                         |
workflowService.updateWorkflow()|                         |
    |                            |                         |
    |--PUT /workflows/{id}----->|                         |
    |  {description: "..."}     |                         |
    |                            |                         |
    |                      update_workflow()              |
    |                            |                         |
    |                            |--update_one()--------->|
    |                            |  {$set: {...}}         |
    |                            |                         |
    |                            |<--updated document-----|
    |                            |                         |
    |<--200 OK {workflow}--------|                         |
    |                            |                         |
setWorkflow(updated)            |                         |
```

## Test Files

### Backend Tests
- `backend/tests/unit/test_workflow_service.py:132` - test_update_workflow_valid
- `backend/tests/integration/test_workflow_endpoints.py:196` - test_update_workflow

### Frontend Tests  
- Currently no specific tests for description persistence found

## Potential Issue Points

1. **Backend Service** (`workflow.py:47-60`)
   - Check if `model_dump(exclude_unset=True)` properly includes description
   - Verify MongoDB update operation includes all fields

2. **Frontend State**
   - Verify description state is properly initialized from loaded workflow
   - Check if description changes trigger proper re-renders

3. **API Communication**
   - Ensure PUT request body includes description field
   - Verify response parsing preserves description

4. **Database Layer**
   - Check if MongoDB schema has description field
   - Verify update operation uses correct `$set` syntax

## Dependencies

### Backend
- fastapi>=0.104.0
- motor>=3.3.0
- pydantic>=2.5.0
- pytest>=7.4.0
- pytest-asyncio>=0.21.0

### Frontend
- react: ^18.2.0
- typescript: ^5.2.0
- react-query: ^3.39.3
- reactflow: ^11.11.4

## Execution Environment

### Docker (Single Container)
```bash
# Build
docker build -t musashi:latest -f Dockerfile.optimized .

# Run
./run-musashi.sh

# Endpoints
- Frontend: http://localhost
- API: http://localhost:8080/api/v1
```

### Local Development
```bash
# Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev  # Port 3000
```