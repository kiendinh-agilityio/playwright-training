import { test as base, expect, APIRequestContext } from '@playwright/test';
import { LoginPage, DashboardPage, UsersPage } from '@/pages';
import { extractAccessToken } from '@/utils/api';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  usersPage: UsersPage;
  apiContext: APIRequestContext;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  usersPage: async ({ page }, use) => {
    const users = new UsersPage(page);
    await use(users);
  },

  apiContext: async ({ playwright }, use) => {
    const token = extractAccessToken();
    const context = await playwright.request.newContext({
      baseURL: process.env.BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    await use(context);
    await context.dispose();
  },
});

export { expect };
