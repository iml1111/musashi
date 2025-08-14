# Workflow Description Persistence - Reproduction Plan

## Test Scenario

### Sentinel Value
- `SC_TEST_DESC_20250814_161511`

### Steps to Reproduce

1. **Create Initial Workflow**
   - POST `/api/v1/workflows`
   - Body: `{ name: "Test Workflow", description: "Initial" }`
   - Capture workflow ID from response

2. **Update Description with Sentinel**
   - PUT `/api/v1/workflows/{id}`
   - Body: `{ description: "SC_TEST_DESC_20250814_161511" }`
   - Verify response contains updated description

3. **Immediate Re-fetch**
   - GET `/api/v1/workflows/{id}`
   - Verify description === "SC_TEST_DESC_20250814_161511"

4. **Browser Refresh Equivalent**
   - For E2E: `page.reload()`
   - For Integration: New API client session
   - Re-fetch workflow and verify description persists

5. **Database Verification**
   - Direct MongoDB query: `db.workflows.findOne({_id: ObjectId(id)})`
   - Check `description` field === sentinel value

## Test Implementation Strategy

### Using Existing Test Framework (pytest)

Since the repo uses pytest with async support, we'll create:
- Integration test using FastAPI TestClient
- Direct database verification using Motor

### Test File Location
- `backend/tests/diagnostics/test_workflow_description_persist.py`

### Frontend Testing
Since the repo has Playwright configured:
- E2E test: `frontend/tests/e2e/workflow-description-persist.spec.ts`

## Logging & Tracing

### Backend Logging
```python
# Add to workflow service
import logging
logger = logging.getLogger(__name__)

# In update_workflow method
logger.info(f"Updating workflow {workflow_id} with description: {workflow_update.description}")
```

### Frontend Logging
```typescript
// Add to workflow service
console.log('[WorkflowService] Updating workflow:', { id, description: workflow.description });
```

### Database Query Logging
```python
# Enable MongoDB query logging
import motor.motor_asyncio
motor.motor_asyncio.LOGGER.setLevel(logging.DEBUG)
```

## Expected Behavior

1. **API Response**: Should return workflow with updated description
2. **Immediate GET**: Should return same description
3. **After Refresh**: Description should persist
4. **Database**: Document should have description field with sentinel value

## Failure Detection Points

1. **API Layer**: Response missing description → Backend serialization issue
2. **Re-fetch**: Description differs → Caching or state issue
3. **After Refresh**: Description lost → Frontend state management issue
4. **Database**: Field missing → Backend persistence issue

## Automated Test Execution

### Backend Test
```bash
cd backend
pytest tests/diagnostics/test_workflow_description_persist.py -v --log-cli-level=INFO
```

### Frontend E2E Test
```bash
cd frontend
npx playwright test tests/e2e/workflow-description-persist.spec.ts --headed
```

### Docker Container Test
```bash
# Build and run container
docker build -t musashi:test -f Dockerfile.optimized .
docker run -d --name musashi-test -p 80:80 -p 8080:8080 musashi:test

# Run tests against container
curl -X POST http://localhost:8080/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"SC_TEST_DESC_20250814_161511"}'
```