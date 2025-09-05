import { test as base, expect } from '@playwright/test';
import { LoginPage, DashboardPage, UsersPage } from '@/pages';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  usersPage: UsersPage;
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
});

export { expect };
