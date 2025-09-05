import { test } from '@/fixtures/pageFixtures';

export const verifyMap = {
  success: async (_loginPage, dashboardPage) =>
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

export type ExpectationKey = keyof typeof verifyMap;

export async function runLoginFlow(
  loginPage,
  dashboardPage,
  username: string,
  password: string,
  expectation: ExpectationKey,
) {
  await test.step('Fill email & password and click Login', async () => {
    await loginPage.login(username, password);
  });

  await verifyMap[expectation](loginPage, dashboardPage);
}
