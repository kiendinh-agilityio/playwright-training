import { test, expect } from '@playwright/test';
import { LoginPage } from '@/tests/pages/login/LoginPage';
import { ERROR_MESSAGES, TEXTS, SELECTORS } from '@/tests/constants';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should show Swag Labs heading and page title', async () => {
    await loginPage.expectPageTitle();
    await loginPage.expectHeadingLogoVisible();
    await loginPage.expectHeadingLogoText();
  });

  test('user can log in successfully', async ({ page }) => {
    await loginPage.loginAsStandardUser();
    await expect(page.locator(SELECTORS.TITLE)).toHaveText(TEXTS.TITLES.PRODUCTS);
  });

  test('user fails to log in with wrong username', async () => {
    await loginPage.loginAsInvalidUser();

    await loginPage.expectErrorVisible();
    await loginPage.expectErrorText(ERROR_MESSAGES.LOGIN_MISMATCH);
    await loginPage.expectErrorIconCount(2);
  });

  test('user fails to log in with empty inputs', async () => {
    await loginPage.clickLoginWithEmptyInputs();

    await loginPage.expectErrorVisible();
    await loginPage.expectErrorText(ERROR_MESSAGES.LOGIN_USERNAME_REQUIRED);
    await loginPage.expectErrorIconCount(2);
  });
});
