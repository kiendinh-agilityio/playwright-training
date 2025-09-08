import { test } from './pageFixtures';
import { UserApiClient } from '@/services/services';
import { createUsers, getUserDeletePromises } from '@/utils/';
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
  seededUsers: async ({ apiContext }, use) => {
    const users = await createUsers(apiContext, 3);

    await use(users);

    // Cleanup: check existence before deleting users
    const deletePromises = await getUserDeletePromises(apiContext, users);
    await Promise.allSettled(deletePromises);
  },
});
