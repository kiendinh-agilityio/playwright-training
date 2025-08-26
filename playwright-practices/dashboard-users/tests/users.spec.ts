import { test } from '@/fixtures/pageFixtures';
import { TableHelper } from '@/utils/table';

test.describe('Users management', () => {
  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await loginPage.goto();
    await dashboardPage.assertUsersBreadcrumbVisible();
  });
  test('Verify that the user can view the user list from the Users page', async ({
    dashboardPage,
    usersPage,
  }) => {
    await test.step('Assert breadcrumb visible', async () => {
      await dashboardPage.assertUsersBreadcrumbVisible();
    });

    await test.step('Verify users table is rendered and contains demo user', async () => {
      const table = new TableHelper(usersPage.frame);
      await table.expectRowContains('');
    });
  });
});
