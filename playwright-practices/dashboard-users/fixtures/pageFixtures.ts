import { test as base, expect } from '@playwright/test';
import { LoginPage, DashboardPage, UsersPage } from '@/pages';
import { UserApiClient } from '@/services/UserApiClient';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  usersPage: UsersPage;
  userApi: UserApiClient;
};

export const test = base.extend<Fixtures>({
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
  userApi: async ({ request }, use) => {
    const client = new UserApiClient(request);
    await use(client);
  },
});

export { expect };
