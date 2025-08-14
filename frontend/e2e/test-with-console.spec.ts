import { test, expect } from '@playwright/test'

test('Test with browser console logging', async ({ page }) => {
  const SENTINEL = `SC_TEST_DESC_${new Date().toISOString().replace(/[-:.]/g, '')}`
  
  // Listen to console messages
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`Browser ${msg.type()}: ${msg.text()}`)
    }
  })
  
  // Login
  await page.goto('http://localhost/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '1234')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  
  // Create workflow
  await page.click('text=New Workflow')
  await page.waitForURL('**/workflow/new')
  
  // Add console log to check what happens
  await page.evaluate(() => {
    const originalSetState = window.React?.useState || (() => {});
    console.log('React available:', !!window.React);
  })
  
  // Set name and description
  await page.fill('input[placeholder="Workflow Name"]', 'Test Workflow')
  const descTextarea = page.locator('textarea[placeholder="Add a description..."]')
  await descTextarea.fill(SENTINEL)
  
  // Check network request
  const savePromise = page.waitForResponse(resp => 
    resp.url().includes('/workflows') && resp.request().method() === 'POST'
  )
  
  // Save
  await page.click('button:has-text("Save")')
  
  // Wait for the save response
  const response = await savePromise
  const responseData = await response.json()
  console.log('Save response:', JSON.stringify(responseData, null, 2))
  
  await page.waitForTimeout(1000)
  
  // Check the textarea value after save
  const valueAfterSave = await descTextarea.inputValue()
  console.log('Textarea value after save:', valueAfterSave)
})