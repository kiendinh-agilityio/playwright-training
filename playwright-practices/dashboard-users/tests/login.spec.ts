import { test } from '@/fixtures/pageFixtures';
import { CREDENTIALS } from '@/constants';
import { runLoginFlow } from '@/utils/login';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Functionality', () => {
  test('Displays "Superuser login" heading on load', async ({ loginPage }) => {
    await test.step('Navigate to login page and verify heading', async () => {
      await loginPage.goto();
      await loginPage.assertHeadingVisible();
    });
  });

  test('Login successfully with valid credentials', async ({ loginPage, dashboardPage }) => {
    await runLoginFlow(
      loginPage,
      dashboardPage,
      CREDENTIALS.ACCOUNT_SUCCESS.username,
      CREDENTIALS.ACCOUNT_SUCCESS.password,
      'success',
    );
  });

  test('Login failed with wrong email or password', async ({ loginPage, dashboardPage }) => {
    await runLoginFlow(
      loginPage,
      dashboardPage,
      CREDENTIALS.ACCOUNT_INVALID.username,
      CREDENTIALS.ACCOUNT_INVALID.password,
      'invalidCredentials',
    );
  });

  test('Login failed with empty inputs', async ({ loginPage, dashboardPage }) => {
    await runLoginFlow(loginPage, dashboardPage, '', '', 'emptyValidation');
  });
});
