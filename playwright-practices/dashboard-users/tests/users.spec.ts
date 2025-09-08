import { userFixtures as test } from '@/fixtures/userFixtures';
import { expect } from '@/fixtures/pageFixtures';
import {
  ModalActions,
  TableHelper,
  waitForCreateUserResponse,
  waitForEditUserRequest,
  createUniqueUserData,
} from '@/utils/';
import { VALIDATION_TEST_CASES } from '@/mocks/users';
import { UserApiResponse } from '@/interfaces/user';
import { UserApiClient } from '@/services/user';

test.describe('Users management', () => {
  let userId: string | undefined;

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await test.step('Login and navigate to users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
  });

  test.afterEach(async ({ apiContext, dashboardPage, usersPage }) => {
    if (userId) {
      const userApi = new UserApiClient(apiContext);
      await userApi.deleteUser(userId);
      await dashboardPage.refreshUsersTable();

      const table = new TableHelper(usersPage.frame);
      await table.waitForTableToLoad();

      userId = undefined;
    }
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

  test('Verify that a user can add a new user to the table successfully', async ({
    page,
    usersPage,
  }) => {
    const testData = createUniqueUserData('pb', 'pbuser');

    await test.step('Open New record modal', async () => {
      await usersPage.openCreateModal();
    });

    await test.step('Fill form with valid data', async () => {
      await usersPage.fillCreateUserForm({
        email: testData.email,
        username: testData.username,
        name: testData.name,
        password: testData.password,
        passwordConfirm: testData.password,
      });
    });

    await test.step('Click Create and capture API response', async () => {
      const responsePromise = waitForCreateUserResponse(page);
      await usersPage.submitCreate();
      const apiUser = await responsePromise;

      await ModalActions.waitForModalToHide(usersPage.modalTitle);

      const table = new TableHelper(usersPage.frame);
      await table.expectRowContains(apiUser.email);

      await test.step('Verify that the newly created user in table matches the API create user response', async () => {
        await table.expectRowDataById(apiUser.id, {
          email: apiUser.email,
          username: apiUser.username,
          name: apiUser.name,
        });
      });

      userId = apiUser.id;
    });
  });

  test.describe('Create validations', () => {
    for (const testCase of VALIDATION_TEST_CASES) {
      test(testCase.name, async ({ usersPage }) => {
        await test.step('Open create modal', async () => {
          await usersPage.openCreateModal();
        });

        await test.step('Fill form with invalid data', async () => {
          await usersPage.fillCreateUserForm(testCase.data);
        });

        await test.step('Submit form and verify validation', async () => {
          await usersPage.submitCreate();
          await expect(usersPage.modalTitle).toBeVisible();
        });
      });
    }
  });

  test('Verify that a user can edit user in the table successfully', async ({
    page,
    usersPage,
    dashboardPage,
    seededUsers,
  }) => {
    const updatedData = createUniqueUserData('pb', 'pbuser-updated');
    const newEmail = updatedData.email;
    const newName = updatedData.name;
    const newUsername = updatedData.username;
    let updatedUser: UserApiResponse;

    await test.step('Refresh table to fetch newly created record', async () => {
      await dashboardPage.refreshUsersTable();
    });

    const userToEdit = seededUsers[0];

    await test.step('Open the user for editing using email', async () => {
      await usersPage.openRecordForEditByEmail(userToEdit.email);
    });

    await test.step('Update fields (email, name, username) and save', async () => {
      await usersPage.updateUserFields({
        email: newEmail,
        name: newName,
        username: newUsername,
      });

      const responsePromise = waitForEditUserRequest(page);
      await usersPage.saveChanges();
      updatedUser = await responsePromise;

      const successText = usersPage.frame.getByText(/success|updated|saved/i);
      await ModalActions.waitForModalToHideOrSuccess(usersPage.modalTitle, successText);
    });

    await test.step('Verify that UI matches API response after edit', async () => {
      const table = new TableHelper(usersPage.frame);
      await table.expectRowContains(newEmail);
      const rows = await table.getAllRowsData();
      const uiRow = rows.find((r) => r.email === newEmail);

      expect(uiRow).toBeTruthy();
      expect(uiRow.username).toBe(updatedUser.username);
      expect(uiRow.name).toBe(updatedUser.name);
    });
  });
});
