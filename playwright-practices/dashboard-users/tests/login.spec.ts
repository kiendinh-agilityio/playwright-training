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

  const casesLogin = [
    {
      name: 'Login successfully with valid credentials',
      ...CREDENTIALS.ACCOUNT_SUCCESS,
      expectation: 'success',
    },
    {
      name: 'Login failed with wrong email or password',
      ...CREDENTIALS.ACCOUNT_INVALID,
      expectation: 'invalidCredentials',
    },
    {
      name: 'Login failed with empty inputs',
      username: '',
      password: '',
      expectation: 'emptyValidation',
    },
  ] as const;

  const verifyMap = {
    success: async (loginPage, dashboardPage) =>
      await test.step('Verify user navigates to Users page', async () => {
        await dashboardPage.assertUsersBreadcrumbVisible();
      }),
    invalidCredentials: async (loginPage) =>
      await test.step('Verify error toast is shown', async () => {
        await loginPage.assertInvalidCredentials();
      }),
    emptyValidation: async (loginPage) =>
      await test.step('Verify validation message is displayed', async () => {
        await loginPage.assertEmptyFieldValidation();
      }),
  };

  for (const { name, username, password, expectation } of casesLogin) {
    test(name, async ({ loginPage, dashboardPage }) => {
      await test.step('Fill email & password and click Login', async () => {
        await loginPage.login(username, password);
      });

      await verifyMap[expectation](loginPage, dashboardPage);
    });
  }
});
