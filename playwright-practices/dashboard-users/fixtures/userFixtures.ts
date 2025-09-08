import { test } from './pageFixtures';
import { UserApiClient } from '@/services/services';
import { createMultipleUsers } from '@/utils/';
import { UserApiResponse } from '@/interfaces/user';

export type UserFixtures = {
  userApi: UserApiClient;
  seededUsers: UserApiResponse[];
};

export const userFixtures = test.extend<UserFixtures>({
  userApi: async ({ apiContext }, use) => {
    const client = new UserApiClient(apiContext);
    await use(client);
  },

  /**
   * Seeds the dashboard with three users, and automatically deletes them after use.
   * @param {Object} context - The test context.
   * @param {APIRequestContext} context.apiContext - The API request context.
   * @param {DashboardPage} context.dashboardPage - The dashboard page.
   * @param {Function} use - A callback function to use the seeded users.
   */
  seededUsers: async ({ apiContext, dashboardPage }, use) => {
    const users = await createMultipleUsers(apiContext, 3, 'del-multi');

    await use(users);

    // Cleanup: delete users
    const userApi = new UserApiClient(apiContext);
    const deletePromises = users
      .filter((user) => user && user.id)
      .map((user) => userApi.deleteUser(user.id));

    const results = await Promise.allSettled(deletePromises);

    for (const result of results) {
      if (result.status === 'rejected' && !result.reason.message.includes('404')) {
        throw result.reason;
      }
    }

    await dashboardPage.refreshUsersTable();
  },
});
