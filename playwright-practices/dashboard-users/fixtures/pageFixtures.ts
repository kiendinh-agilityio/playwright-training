import { test as base, expect } from '@playwright/test';
import { LoginPage, DashboardPage, UsersPage } from '@/pages';
import { UserApiClient } from '@/services/services';
import { createRandomUserData } from '@/mocks/userMocks';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  usersPage: UsersPage;
  userApi: UserApiClient;
  createUsers: (count: number) => Promise<{ id: string; email: string }[]>;
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

  createUsers: async ({ userApi }, use) => {
    const generateUsers = async (count: number) => {
      const created: { id: string; email: string }[] = [];
      const timestamp = Date.now();
      for (let i = 0; i < count; i++) {
        const base =
          count === 1
            ? createRandomUserData('pb', 'pbuser-del-single')
            : createRandomUserData('pb', `pbuser-del-multi-${i + 1}-${timestamp}`);
        const payload = { ...base, passwordConfirm: base.password } as const;
        const res = await userApi.createUser(payload);
        created.push({ id: res.id, email: res.email });
      }
      return created;
    };

    await use(generateUsers);
  },
});

export { expect };
