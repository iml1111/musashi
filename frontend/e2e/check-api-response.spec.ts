import { test, expect } from '@playwright/test'

test('Check API response for workflow creation', async ({ page, request }) => {
  // Login first
  await page.goto('http://localhost/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '1234')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  
  // Get token
  const token = await page.evaluate(() => localStorage.getItem('access_token'))
  
  // Create workflow via API
  const createResponse = await request.post('http://localhost:8080/api/v1/workflows', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      name: 'API Test Workflow',
      description: 'Test Description from API',
      nodes: [],
      edges: []
    }
  })
  
  const created = await createResponse.json()
  console.log('Created workflow:', JSON.stringify(created, null, 2))
  
  // Get the workflow back
  const workflowId = created.id || created._id
  const getResponse = await request.get(`http://localhost:8080/api/v1/workflows/${workflowId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const fetched = await getResponse.json()
  console.log('Fetched workflow:', JSON.stringify(fetched, null, 2))
  
  // Update the workflow
  const updateResponse = await request.put(`http://localhost:8080/api/v1/workflows/${workflowId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      description: 'Updated Description'
    }
  })
  
  const updated = await updateResponse.json()
  console.log('Updated workflow:', JSON.stringify(updated, null, 2))
  
  // Get again
  const getResponse2 = await request.get(`http://localhost:8080/api/v1/workflows/${workflowId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const fetched2 = await getResponse2.json()
  console.log('Fetched after update:', JSON.stringify(fetched2, null, 2))
})