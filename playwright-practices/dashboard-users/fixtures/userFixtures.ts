import { test } from './pageFixtures';
import { UserApiClient } from '@/services/services';
import { createRandomUserData } from '@/utils/';

export type UserFixtures = {
  userApi: UserApiClient;
  createUsers: (count: number) => Promise<{
    users: { id: string; email: string }[];
    cleanup: () => Promise<void>;
  }>;
};

export const userFixtures = test.extend<UserFixtures>({
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

    const createUsersWithCleanup = async (count: number) => {
      const users = await generateUsers(count);

      return {
        users,
        cleanup: async () => {
          for (const user of users) {
            await userApi.deleteUser(user.id);
          }
        },
      };
    };

    await use(createUsersWithCleanup);
  },
});
