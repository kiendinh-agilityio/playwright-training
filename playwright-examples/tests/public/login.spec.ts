import { test, expect } from '@playwright/test';
import { loginAsStandardUser } from '@/tests/utils/auth';
import { CREDENTIALS, ERROR_MESSAGES, TEXTS, SELECTORS, PATHS } from '@/tests/constants';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PATHS.ROOT);
  });

  test('user can log in successfully', async ({ page }) => {
    await loginAsStandardUser(page);
    await expect(page.locator(SELECTORS.TITLE)).toHaveText(TEXTS.TITLES.PRODUCTS);
  });

  test('user fails to log in with wrong username', async ({ page }) => {
    await page.locator(SELECTORS.USERNAME).fill(CREDENTIALS.INVALID_USERNAME.username);
    await page.locator(SELECTORS.PASSWORD).fill(CREDENTIALS.INVALID_USERNAME.password);
    await page.locator(SELECTORS.LOGIN_BUTTON).click();

    const error = page.locator(SELECTORS.ERROR_MESSAGE);
    await expect(error).toBeVisible();
    await expect(error).toHaveText(ERROR_MESSAGES.LOGIN_MISMATCH);

    await expect(page.locator(SELECTORS.ERROR_ICON)).toHaveCount(2);
  });

  test('user fails to log in with empty inputs', async ({ page }) => {
    await page.locator(SELECTORS.LOGIN_BUTTON).click();

    const error = page.locator(SELECTORS.ERROR_MESSAGE);
    await expect(error).toBeVisible();
    await expect(error).toHaveText(ERROR_MESSAGES.LOGIN_USERNAME_REQUIRED);

    await expect(page.locator(SELECTORS.ERROR_ICON)).toHaveCount(2);
  });
});
