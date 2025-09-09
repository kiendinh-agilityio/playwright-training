import { userFixtures as test } from '@/fixtures/userFixtures';

test.describe('User Search Functionality', () => {
  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await test.step('Navigate to Users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
  });

  test('Verify that the user can search users with a matching email', async ({
    dashboardPage,
    seededUsers,
  }) => {
    const searchTerm = seededUsers[0].email;

    await test.step('Search users', async () => {
      await dashboardPage.searchUsers(searchTerm);
    });

    await test.step('Verify search results', async () => {
      await dashboardPage.verifySearch(searchTerm, true);
    });

    await test.step('Reset to original state', async () => {
      await dashboardPage.clearSearch();
    });
  });

  test('Verify that the user can search for users with the unmatched text', async ({
    dashboardPage,
  }) => {
    const searchTerm = 'lorem';

    await test.step('Search users', async () => {
      await dashboardPage.searchUsers(searchTerm);
    });

    await test.step('Verify search results', async () => {
      await dashboardPage.verifySearch(searchTerm, false);
    });

    await test.step('Reset to original state', async () => {
      await dashboardPage.clearFilters();
    });
  });
});
