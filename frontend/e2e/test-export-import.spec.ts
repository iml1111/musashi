import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test('Export should not contain duplicate system_prompt field', async ({ page }) => {
  // Login
  await page.goto('http://localhost/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '1234')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  
  // Create new workflow
  await page.click('text=New Workflow')
  await page.waitForURL('**/workflow/new')
  
  // Add an Agent node
  await page.click('button:has-text("Agent")')
  await page.waitForTimeout(500)
  
  // Click on the agent node to open sidebar
  const agentNode = page.locator('[data-nodetype="agent"]').first()
  await agentNode.click()
  await page.waitForTimeout(500)
  
  // Set developer message
  const developerMessageInput = page.locator('textarea[placeholder*="developer message"], textarea[placeholder*="system message"]').first()
  await developerMessageInput.fill('Test developer message for export')
  
  // Wait for auto-save or trigger save
  await page.waitForTimeout(2000)
  
  // Export workflow
  const downloadPromise = page.waitForEvent('download')
  await page.click('button:has-text("Export")')
  const download = await downloadPromise
  
  // Save the downloaded file
  const downloadPath = await download.path()
  const exportedContent = fs.readFileSync(downloadPath, 'utf-8')
  const exportedData = JSON.parse(exportedContent)
  
  console.log('Exported workflow:', JSON.stringify(exportedData, null, 2))
  
  // Check that nodes don't have system_prompt field
  let hasSystemPrompt = false
  let hasDeveloperMessage = false
  
  exportedData.nodes.forEach((node: any) => {
    if (node.properties?.parameters?.system_prompt !== undefined) {
      hasSystemPrompt = true
      console.log('Found system_prompt in node:', node.id)
    }
    if (node.properties?.parameters?.developer_message !== undefined) {
      hasDeveloperMessage = true
      console.log('Found developer_message in node:', node.id)
    }
  })
  
  expect(hasSystemPrompt).toBe(false)
  expect(hasDeveloperMessage).toBe(true)
  
  console.log('✅ Export test passed: No system_prompt field found, developer_message exists')
})

test('Import should migrate system_prompt to developer_message', async ({ page }) => {
  // Create a test file with system_prompt
  const testWorkflow = {
    name: 'Test Import Workflow',
    description: 'Testing migration',
    nodes: [{
      id: 'agent-1',
      type: 'agent',
      label: 'Test Agent',
      properties: {
        parameters: {
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1.0,
          system_prompt: 'This is a legacy system prompt'
        }
      }
    }],
    edges: []
  }
  
  const testFilePath = path.join(__dirname, 'test-import.json')
  fs.writeFileSync(testFilePath, JSON.stringify(testWorkflow, null, 2))
  
  // Login
  await page.goto('http://localhost/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '1234')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  
  // Create new workflow
  await page.click('text=New Workflow')
  await page.waitForURL('**/workflow/new')
  
  // Import the test file
  const fileInput = page.locator('input[type="file"][accept=".json"]')
  await fileInput.setInputFiles(testFilePath)
  
  await page.waitForTimeout(2000)
  
  // Click on the imported agent node
  const agentNode = page.locator('[data-nodetype="agent"]').first()
  await agentNode.click()
  await page.waitForTimeout(500)
  
  // Check that developer message contains the migrated value
  const developerMessageInput = page.locator('textarea[placeholder*="developer message"], textarea[placeholder*="system message"]').first()
  const value = await developerMessageInput.inputValue()
  
  expect(value).toBe('This is a legacy system prompt')
  console.log('✅ Import test passed: system_prompt successfully migrated to developer_message')
  
  // Clean up
  fs.unlinkSync(testFilePath)
})