import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can log in successfully', async ({ page }) => {
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL(/.*\/inventory\.html$/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('user fails to log in with wrong username', async ({ page }) => {
    await page.getByTestId('username').fill('standard_user1236812631263');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();

    const error = page.getByTestId('error');
    await expect(error).toBeVisible();
    await expect(error).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );

    await expect(page.locator('.error_icon')).toHaveCount(2);
  });

  test('user fails to log in with empty inputs', async ({ page }) => {
    await page.getByTestId('login-button').click();

    const error = page.getByTestId('error');
    await expect(error).toBeVisible();
    await expect(error).toHaveText('Epic sadface: Username is required');

    await expect(page.locator('.error_icon')).toHaveCount(2);
  });
});
