import { test } from '@/fixtures/pageFixtures';
import { CREDENTIALS } from '@/constants';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Functionality', () => {
  test('Displays "Superuser login" heading on load', async ({ loginPage }) => {
    await test.step('Navigate to login page and verify heading', async () => {
      await loginPage.goto();
      await loginPage.assertHeadingVisible();
    });
  });

  test('Login successfully with valid credentials', async ({ loginPage, dashboardPage }) => {
    await test.step('Fill email & password and click Login', async () => {
      await loginPage.login(
        CREDENTIALS.ACCOUNT_SUCCESS.username,
        CREDENTIALS.ACCOUNT_SUCCESS.password,
      );
    });

    await test.step('Verify user navigates to Users page', async () => {
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
  });

  test('Login failed with wrong email or password', async ({ loginPage }) => {
    await test.step('Fill email & password and click Login', async () => {
      await loginPage.login(
        CREDENTIALS.ACCOUNT_INVALID.username,
        CREDENTIALS.ACCOUNT_INVALID.password,
      );
    });

    await test.step('Verify error toast is shown', async () => {
      await loginPage.assertInvalidCredentials();
    });
  });

  test('Login failed with empty inputs', async ({ loginPage }) => {
    await test.step('Fill email & password and click Login', async () => {
      await loginPage.login('', '');
    });

    await test.step('Verify validation message is displayed', async () => {
      await loginPage.assertEmptyFieldValidation();
    });
  });
});
