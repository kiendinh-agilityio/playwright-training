import { test } from '@/fixtures/pageFixtures';
import { TableHelper } from '@/utils/table';
import { createRandomUserData } from '@/mocks/userMocks';

test.describe('Users delete', () => {
  async function navigateToUsers(loginPage: any, dashboardPage: any) {
    await test.step('Navigate to Users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
  }

  async function createUsers(userApi: any, count: number) {
    const created: { id: string; email: string }[] = [];
    await test.step(`Create ${count} user(s) via API for deletion`, async () => {
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
    });
    return created;
  }

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
    test(scenario.name, async ({ loginPage, dashboardPage, usersPage, userApi }) => {
      if (scenario.numUsers === 2) {
        test.setTimeout(45000);
      }

      await navigateToUsers(loginPage, dashboardPage);

      const createdUsers = await createUsers(userApi, scenario.numUsers);

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
