import { userFixtures as test } from '@/fixtures/userFixtures';
import { TableHelper } from '@/utils/table';

test.describe('Users delete', () => {
  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await test.step('Navigate to Users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
  });

  test('Verify that user can remove user table successfully', async ({
    usersPage,
    seededUsers,
  }) => {
    const createdUsers = [seededUsers[0]];

    const table = new TableHelper(usersPage.frame);
    await test.step('Wait for table to load and sort if needed', async () => {
      await table.waitForTableToLoad();
      await table.sortByColumn('created', 'desc');
    });

    await test.step(`Select ${createdUsers.length} user(s) for deletion`, async () => {
      await usersPage.selectRowsBy(createdUsers, 'email');
    });

    await test.step('Click Delete selected', async () => {
      await usersPage.clickDeleteSelected();
    });

    await test.step('Confirm deletion', async () => {
      await usersPage.confirmDeletion(/do you really want to delete the selected record/i);
    });

    await test.step('Verify deletion result', async () => {
      await usersPage.verifyDeletionToast('Successfully deleted the selected record.');
    });
  });

  test('Verify that user can remove multiple users to the table successfully', async ({
    usersPage,
    seededUsers,
  }) => {
    test.setTimeout(45000);

    const createdUsers = [seededUsers[0], seededUsers[1]];

    const table = new TableHelper(usersPage.frame);
    await test.step('Wait for table to load and sort if needed', async () => {
      await table.waitForTableToLoad();
      await table.sortByColumn('created', 'desc');
    });

    await test.step(`Select ${createdUsers.length} user(s) for deletion`, async () => {
      await usersPage.selectRowsBy(createdUsers, 'id');
    });

    await test.step('Click Delete selected', async () => {
      await usersPage.clickDeleteSelected();
    });

    await test.step('Confirm deletion', async () => {
      await usersPage.confirmDeletion(/do you really want to delete the selected records\?/i);
    });

    await test.step('Verify deletion result', async () => {
      await usersPage.verifyDeletionToast(/Successfully deleted the selected records/i);
    });
  });
});
