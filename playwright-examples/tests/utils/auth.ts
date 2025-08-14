import { expect, type Page } from '@playwright/test';
import { CREDENTIALS } from '@/tests/constants/credentials';
import { MATCHERS, PATHS } from '@/tests/constants/routes';
import { SELECTORS } from '@/tests/constants/selectors';

export async function loginAsStandardUser(page: Page): Promise<void> {
  await page.goto(PATHS.ROOT);
  await page.locator(SELECTORS.USERNAME).fill(CREDENTIALS.STANDARD_USER.username);
  await page.locator(SELECTORS.PASSWORD).fill(CREDENTIALS.STANDARD_USER.password);
  await page.locator(SELECTORS.LOGIN_BUTTON).click();
  await expect(page).toHaveURL(MATCHERS.INVENTORY);
}
