import { test, expect } from '@playwright/test';

test.describe('Workflow Editor E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting localStorage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      }));
    });
  });

  test('should display components page', async ({ page }) => {
    await page.goto('http://localhost:3000/components');
    await expect(page).toHaveTitle(/Musashi/);
    await expect(page.locator('h1')).toContainText('Component Library');
  });

  test('should display dashboard when authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Clear authentication
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});