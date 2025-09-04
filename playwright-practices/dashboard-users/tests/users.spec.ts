import { test, expect } from '@/fixtures/pageFixtures';
import {
  ModalActions,
  TableHelper,
  waitForCreateUserResponse,
  waitForEditUserRequest,
} from '@/utils/';
import { validationTestCases, createRandomUserData } from '@/mocks/userMocks';
import { UserApiResponse } from '@/interfaces/user';

test.describe('Users management', () => {
  let createdUserApiResponse: UserApiResponse | null = null;

  test.beforeEach(async ({ loginPage, dashboardPage, userApi }) => {
    await test.step('Login and navigate to users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });

    await test.step('Create a fresh user via API for this test', async () => {
      const base = createRandomUserData('pb', 'pbuser');
      const payload = {
        ...base,
        passwordConfirm: base.password,
      };
      createdUserApiResponse = await userApi.createUser(payload);
    });
  });

  test.afterEach(async ({ userApi }) => {
    if (createdUserApiResponse?.id) {
      await test.step('Cleanup: delete created user via API', async () => {
        await userApi.deleteUser(createdUserApiResponse.id);
        createdUserApiResponse = null;
      });
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
    const testData = createRandomUserData('pb', 'pbuser');

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
    });
  });

  test.describe('Create validations', () => {
    for (const testCase of validationTestCases) {
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
    userApi,
  }) => {
    const updatedData = createRandomUserData('pb', 'pbuser-updated');
    const newEmail = updatedData.email;
    const base = createRandomUserData('pb', 'pbuser');
    const payload = { ...base, passwordConfirm: base.password };
    const userToEdit = await userApi.createUser(payload);
    let updatedUser: UserApiResponse;

    await test.step('Open the user for editing using email', async () => {
      await usersPage.openRecordForEditByEmail(userToEdit.email);
    });

    await test.step('Update email field and save', async () => {
      await usersPage.updateUserFields({ email: newEmail });

      const responsePromise = waitForEditUserRequest(page);
      await usersPage.saveChanges();
      updatedUser = await responsePromise;

      const successText = usersPage.frame.getByText(/success|updated|saved/i);
      await ModalActions.waitForModalToHideOrSuccess(usersPage.modalTitle, successText);
    });

    await test.step('Verify that the newly edit user in table matches the API edit user response ', async () => {
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
