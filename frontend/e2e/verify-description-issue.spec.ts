import { test, expect } from '@playwright/test'

test('Verify description issue', async ({ page }) => {
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
  await page.fill('textarea[placeholder="Add a description..."]', SENTINEL)
  console.log(`Set description to: ${SENTINEL}`)
  
  // Save
  await page.click('button:has-text("Save")')
  await page.waitForTimeout(2000)
  
  // Check what's on the page
  const url = page.url()
  console.log('Current URL:', url)
  
  // Try to find description in different ways
  const bodyText = await page.locator('body').innerText()
  console.log('Description in page text:', bodyText.includes(SENTINEL))
  
  // Check textarea value
  const descTextarea = page.locator('textarea[placeholder="Add a description..."]')
  const textareaExists = await descTextarea.count() > 0
  if (textareaExists) {
    const textareaValue = await descTextarea.inputValue()
    console.log('Textarea value:', textareaValue)
    console.log('Textarea contains sentinel:', textareaValue === SENTINEL)
  } else {
    console.log('Description textarea not found')
  }
  
  // Check any element with description text
  const descElements = page.locator(`text="${SENTINEL}"`)
  const descCount = await descElements.count()
  console.log(`Found ${descCount} elements with description text`)
  
  // Check partial match
  const partialMatch = page.locator(`text=${SENTINEL.substring(0, 10)}`)
  const partialCount = await partialMatch.count()
  console.log(`Found ${partialCount} elements with partial description match`)
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'after-save.png', fullPage: true })
  
  // Reload and check again
  await page.reload()
  await page.waitForLoadState('networkidle')
  
  const bodyTextAfterReload = await page.locator('body').innerText()
  console.log('After reload - Description in page text:', bodyTextAfterReload.includes(SENTINEL))
  
  const descTextareaAfterReload = page.locator('textarea[placeholder="Add a description..."]')
  const textareaExistsAfterReload = await descTextareaAfterReload.count() > 0
  if (textareaExistsAfterReload) {
    const textareaValueAfterReload = await descTextareaAfterReload.inputValue()
    console.log('After reload - Textarea value:', textareaValueAfterReload)
    console.log('After reload - Textarea contains sentinel:', textareaValueAfterReload === SENTINEL)
  } else {
    console.log('After reload - Description textarea not found')
  }
  
  await page.screenshot({ path: 'after-reload.png', fullPage: true })
})