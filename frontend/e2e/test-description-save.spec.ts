import { test, expect } from '@playwright/test'

test('Test description save behavior', async ({ page }) => {
  const SENTINEL = `SC_TEST_DESC_${new Date().toISOString().replace(/[-:.]/g, '')}`
  
  // Login
  await page.goto('http://localhost/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '1234')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  
  // Create workflow
  await page.click('text=New Workflow')
  await page.waitForURL('**/workflow/new')
  
  // Set name and description
  await page.fill('input[placeholder="Workflow Name"]', 'Test Workflow')
  const descTextarea = page.locator('textarea[placeholder="Add a description..."]')
  await descTextarea.fill(SENTINEL)
  console.log(`Set description to: ${SENTINEL}`)
  
  // Verify the textarea has the value before save
  const valueBeforeSave = await descTextarea.inputValue()
  console.log('Description value BEFORE save:', valueBeforeSave)
  console.log('Description matches BEFORE save:', valueBeforeSave === SENTINEL)
  
  // Save
  await page.click('button:has-text("Save")')
  await page.waitForTimeout(3000)
  
  // Check the textarea value after save
  const valueAfterSave = await descTextarea.inputValue()
  console.log('Description value AFTER save:', valueAfterSave)
  console.log('Description matches AFTER save:', valueAfterSave === SENTINEL)
  
  // Get workflow ID from URL for API verification
  const url = page.url()
  const match = url.match(/workflow\/([a-f0-9]{24})/)
  if (match) {
    const workflowId = match[1]
    console.log('Workflow ID:', workflowId)
    
    // Check via API
    const token = await page.evaluate(() => localStorage.getItem('token'))
    const response = await page.request.get(`http://localhost:8080/api/v1/workflows/${workflowId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok()) {
      const data = await response.json()
      console.log('API response - description:', data.description)
      console.log('API description matches:', data.description === SENTINEL)
    }
  }
})