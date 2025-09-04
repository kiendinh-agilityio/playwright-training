import { test } from '@/fixtures/pageFixtures';
import { TableHelper } from '@/utils/table';

test.describe('Users delete', () => {
  let createdUsersForCleanup: { id: string; email: string }[] = [];

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await test.step('Navigate to Users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
  });

  test.afterEach(async ({ userApi }) => {
    if (!createdUsersForCleanup.length) return;

    await test.step('Cleanup created users from database', async () => {
      for (const u of createdUsersForCleanup) {
        await userApi.deleteUser(u.id);
      }

      createdUsersForCleanup = [];
    });
  });

  const scenarios = [
    {
      name: 'Verify that user can remove user table successfully',
      numUsers: 1,
      selectMode: 'email' as const,
      confirm: /do you really want to delete the selected record/i,
      toast: 'Successfully deleted the selected record.' as const,
      sortBeforeSelect: false,
      verifyAbsenceAndApi: true,
    },
    {
      name: 'Verify that user can remove multiple users to the table successfully',
      numUsers: 2,
      selectMode: 'id' as const,
      confirm: /do you really want to delete the selected records\?/i,
      toast: /Successfully deleted the selected records/i,
      sortBeforeSelect: true,
      verifyAbsenceAndApi: false,
    },
  ];

  for (const scenario of scenarios) {
    test(scenario.name, async ({ usersPage, createUsers }) => {
      if (scenario.numUsers === 2) {
        test.setTimeout(45000);
      }

      const createdUsers =
        await test.step(`Create ${scenario.numUsers} user(s) via API for deletion`, async () =>
          await createUsers(scenario.numUsers));

      createdUsersForCleanup = createdUsers;

      const table = new TableHelper(usersPage.frame);
      await test.step('Wait for table to load and sort if needed', async () => {
        await table.waitForTableToLoad();
        if (scenario.sortBeforeSelect) {
          await table.sortByColumn('created', 'desc');
        }
      });

      await test.step(`Select ${createdUsers.length} user(s) for deletion`, async () => {
        await usersPage.selectRowsBy(createdUsers, scenario.selectMode);
      });

      await test.step('Click Delete selected', async () => {
        await usersPage.clickDeleteSelected();
      });

      await test.step('Confirm deletion', async () => {
        await usersPage.confirmDeletion(scenario.confirm);
      });

      await test.step('Verify deletion result', async () => {
        await usersPage.verifyDeletionToast(scenario.toast);
      });
    });
  }
});
