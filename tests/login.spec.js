const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Login', () => {
  test('valid credentials open the dashboard', async ({ page }) => {
    await page.fill('#username-input', 'admin');
    await page.fill('#password-input', 'password123');
    await page.click('#login-btn');
    await expect(page.locator('#app-view')).toBeVisible();
    await expect(page.locator('#login-view')).toBeHidden();
  });

  test('empty fields show a validation message', async ({ page }) => {
    await page.click('#login-btn');
    await expect(page.locator('#login-error-message')).toHaveText('Please enter both username and password.');
  });

  test('wrong password shows an error and stays on login', async ({ page }) => {
    await page.fill('#username-input', 'admin');
    await page.fill('#password-input', 'wrongpass');
    await page.click('#login-btn');
    await expect(page.locator('#login-error-message')).toHaveText('Invalid username or password. Please try again.');
    await expect(page.locator('#app-view')).toBeHidden();
  });
});
