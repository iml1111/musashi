import { test, expect } from '@playwright/test'

test('Test description persistence after fix', async ({ page }) => {
  const SENTINEL = `SC_TEST_DESC_${new Date().toISOString().replace(/[-:.]/g, '')}`
  
  // Login
  await page.goto('http://localhost/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '1234')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  
  // Navigate to existing workflow instead of creating new
  // First, create via API to ensure clean state
  const token = await page.evaluate(() => localStorage.getItem('token'))
  
  // Create workflow via API
  const createResponse = await page.request.post('http://localhost:8080/api/v1/workflows', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      name: 'API Created Workflow',
      description: 'Initial description',
      nodes: [],
      edges: []
    }
  })
  
  const workflow = await createResponse.json()
  const workflowId = workflow.id || workflow._id
  console.log('Created workflow ID:', workflowId)
  console.log('Initial description:', workflow.description)
  
  // Navigate to the workflow editor
  await page.goto(`http://localhost/workflow/${workflowId}`)
  await page.waitForLoadState('networkidle')
  
  // Check if description is loaded
  const descTextarea = page.locator('textarea[placeholder="Add a description..."]')
  const initialValue = await descTextarea.inputValue()
  console.log('Description loaded in UI:', initialValue)
  
  // Update description
  await descTextarea.fill(SENTINEL)
  console.log('Set description to:', SENTINEL)
  
  // Save
  await page.click('button:has-text("Save")')
  await page.waitForTimeout(2000)
  
  // Check value after save
  const valueAfterSave = await descTextarea.inputValue()
  console.log('Description after save:', valueAfterSave)
  console.log('✅ Description persists after save:', valueAfterSave === SENTINEL)
  
  // Reload page
  await page.reload()
  await page.waitForLoadState('networkidle')
  
  // Check after reload
  const valueAfterReload = await descTextarea.inputValue()
  console.log('Description after reload:', valueAfterReload)
  console.log('✅ Description persists after reload:', valueAfterReload === SENTINEL)
  
  // Verify via API
  const getResponse = await page.request.get(`http://localhost:8080/api/v1/workflows/${workflowId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const updatedWorkflow = await getResponse.json()
  console.log('API description:', updatedWorkflow.description)
  console.log('✅ API confirms description:', updatedWorkflow.description === SENTINEL)
  
  // Final assertion
  expect(valueAfterReload).toBe(SENTINEL)
})