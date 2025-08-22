import { test as setup } from '@playwright/test';
import { LoginPage } from '@/tests/pages/login/LoginPage';
import { SELECTORS, TIMEOUTS, AUTH_PATHS, WAIT_STATES } from '@/tests/constants';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Navigate to login page
  await loginPage.goto();

  // Wait for page to load
  await page.waitForLoadState(WAIT_STATES.NETWORK_IDLE);

  // Login with credentials using LoginPage
  await loginPage.loginAsStandardUser();
  await page.waitForLoadState(WAIT_STATES.NETWORK_IDLE);
  await page.waitForSelector(SELECTORS.INVENTORY_LIST, { timeout: TIMEOUTS.SELECTOR });
  await page.waitForTimeout(TIMEOUTS.ADDITIONAL_WAIT);

  // Save authentication state for private tests
  await page.context().storageState({ path: AUTH_PATHS.USER_STORAGE });
});
