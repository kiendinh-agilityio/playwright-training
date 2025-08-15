import { test as setup, expect } from '@playwright/test';
import { SELECTORS, PATHS, MATCHERS, CREDENTIALS } from '@/tests/constants';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto(PATHS.ROOT);

  // Use credentials directly
  const authConfig = CREDENTIALS.STANDARD_USER;

  // Login with credentials
  await page.locator(SELECTORS.USERNAME).fill(authConfig.username);
  await page.locator(SELECTORS.PASSWORD).fill(authConfig.password);
  await page.locator(SELECTORS.LOGIN_BUTTON).click();

  // Wait for successful login and verify we're on the inventory page
  await expect(page).toHaveURL(MATCHERS.INVENTORY);

  // Save authentication state for private tests
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
