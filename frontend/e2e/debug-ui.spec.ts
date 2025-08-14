import { test, expect } from '@playwright/test'

test('Debug UI and take screenshots', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost/login')
  await page.screenshot({ path: 'login-page.png' })
  
  // Try login
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '1234')
  await page.screenshot({ path: 'login-filled.png' })
  
  await page.click('button[type="submit"]')
  
  // Wait a bit and see where we are
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'after-login.png' })
  console.log('Current URL:', page.url())
  
  // Try to click New Workflow button
  try {
    await page.click('text=New Workflow', { timeout: 5000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'new-workflow-page.png' })
    console.log('New workflow URL:', page.url())
    
    // Debug: List all input fields
    const inputs = await page.locator('input').all()
    console.log(`Found ${inputs.length} input fields`)
    
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder')
      const name = await inputs[i].getAttribute('name')
      const id = await inputs[i].getAttribute('id')
      console.log(`Input ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`)
    }
    
    // Debug: List all textareas
    const textareas = await page.locator('textarea').all()
    console.log(`Found ${textareas.length} textarea fields`)
    
    for (let i = 0; i < textareas.length; i++) {
      const placeholder = await textareas[i].getAttribute('placeholder')
      const name = await textareas[i].getAttribute('name')
      const id = await textareas[i].getAttribute('id')
      console.log(`Textarea ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`)
    }
    
  } catch (e) {
    console.log('Could not find New Workflow button:', e.message)
    
    // List all visible text on the page
    const visibleText = await page.locator('body').innerText()
    console.log('Page content:', visibleText.substring(0, 500))
  }
})