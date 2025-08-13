import { test, expect } from '@playwright/test';

test.describe('Heading', () => {
  test('should show Swag Labs heading and page title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Swag Labs');

    const heading = page.locator('.login_logo');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Swag Labs');
  });
});
