import { test, expect } from '@playwright/test'

// Sentinel value with timestamp
const SENTINEL = `SC_TEST_DESC_${new Date().toISOString().replace(/[-:.]/g, '')}`

test.describe('Workflow Description Persistence', () => {
  let workflowId: string

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost/login')
    
    // Login with test credentials
    // Note: In real scenario, would use test user credentials
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', '1234')
    await page.click('button[type="submit"]')
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard')
  })

  test('should persist workflow description after update and refresh', async ({ page }) => {
    console.log(`Testing with sentinel: ${SENTINEL}`)
    
    // Step 1: Create new workflow
    await page.click('text=New Workflow')
    await page.waitForURL('**/workflow/new')
    
    // Set workflow name
    const workflowNameInput = page.locator('input[placeholder="Workflow Name"]')
    await workflowNameInput.fill('Test Workflow for Description')
    
    // Step 2: Set description with sentinel value
    const descriptionInput = page.locator('textarea[placeholder="Add a description..."]')
    await descriptionInput.fill(SENTINEL)
    console.log(`Set description to: ${SENTINEL}`)
    
    // Step 3: Save workflow
    await page.click('button:has-text("Save")')
    
    // Wait for save to complete (look for success message or URL change)
    await page.waitForTimeout(2000) // Give time for save
    
    // Capture the workflow ID from URL
    const url = page.url()
    const match = url.match(/workflow\/([a-f0-9]{24})/)
    if (match) {
      workflowId = match[1]
      console.log(`Created workflow with ID: ${workflowId}`)
    }
    
    // Step 4: Verify description is displayed
    const descriptionElement = await page.locator(`text="${SENTINEL}"`).first()
    await expect(descriptionElement).toBeVisible()
    console.log('✓ Description visible after save')
    
    // Step 5: Reload page (browser refresh equivalent)
    await page.reload()
    console.log('Page reloaded')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Step 6: Verify description persists after reload
    const descriptionAfterReload = await page.locator(`text="${SENTINEL}"`).first()
    await expect(descriptionAfterReload).toBeVisible()
    console.log('✓ Description persists after reload')
    
    // Step 7: Navigate away and back
    await page.goto('http://localhost/dashboard')
    await page.waitForURL('**/dashboard')
    
    // Find and click on the workflow
    await page.click(`text="Test Workflow for Description"`)
    await page.waitForURL(`**/workflow/${workflowId}`)
    
    // Step 8: Final verification
    const finalDescription = await page.locator(`text="${SENTINEL}"`).first()
    await expect(finalDescription).toBeVisible()
    console.log('✓ Description persists after navigation')
    
    console.log('✅ All E2E persistence tests passed')
  })

  test('should persist description through API update', async ({ page, request }) => {
    console.log(`Testing API update with sentinel: ${SENTINEL}`)
    
    // Create workflow first via UI
    await page.click('text=New Workflow')
    await page.waitForURL('**/workflow/new')
    
    const workflowNameInput = page.locator('input[placeholder="Workflow Name"]')
    await workflowNameInput.fill('API Test Workflow')
    
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(2000)
    
    // Get workflow ID from URL
    const url = page.url()
    const match = url.match(/workflow\/([a-f0-9]{24})/)
    if (!match) {
      throw new Error('Could not extract workflow ID')
    }
    workflowId = match[1]
    
    // Get auth token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'))
    
    // Update via API
    const response = await request.put(`http://localhost:8080/api/v1/workflows/${workflowId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        description: SENTINEL
      }
    })
    
    expect(response.ok()).toBeTruthy()
    const responseData = await response.json()
    expect(responseData.description).toBe(SENTINEL)
    console.log('✓ API update successful')
    
    // Reload page and verify
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const descriptionElement = await page.locator(`text="${SENTINEL}"`).first()
    await expect(descriptionElement).toBeVisible()
    console.log('✓ Description persists after API update and reload')
    
    console.log('✅ API persistence test passed')
  })
})