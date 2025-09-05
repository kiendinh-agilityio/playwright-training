import { userFixtures as test } from '@/fixtures/userFixtures';
import { DATA_USERS } from '@/mocks';

test.describe('User Search Functionality', () => {
  let testUsers: { id: string; email: string }[];

  test.beforeEach(async ({ loginPage, dashboardPage, userApi }) => {
    await test.step('Navigate to Users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });

    await test.step('Create test users with specific emails', async () => {
      const [firstTestUser, secondTestUser] = await Promise.all([
        userApi.createUser(DATA_USERS[0]),
        userApi.createUser(DATA_USERS[1]),
      ]);

      testUsers = [
        { id: firstTestUser.id, email: firstTestUser.email },
        { id: secondTestUser.id, email: secondTestUser.email },
      ];
    });
  });

  test.afterEach(async ({ userApi }) => {
    await Promise.allSettled(testUsers.map((u) => userApi.deleteUser(u.id)));
  });

  for (const { name, term, expectMatch, clearAction } of [
    {
      name: 'Verify that the user can search users with a matching email',
      term: DATA_USERS[1].email,
      expectMatch: true,
      clearAction: 'clearSearch' as const,
    },
    {
      name: 'Verify that the user can search for users with the unmatched text',
      term: 'lorem',
      expectMatch: false,
      clearAction: 'clearFilters' as const,
    },
  ]) {
    test(name, async ({ dashboardPage }) => {
      await test.step('Search users', async () => {
        await dashboardPage.searchUsers(term);
      });

      await test.step('Verify search results', async () => {
        await dashboardPage.verifySearch(term, expectMatch);
      });

      await test.step('Reset to original state', async () => {
        await dashboardPage[clearAction]();
      });
    });
  }
});
