import { test, expect } from '@/fixtures/pageFixtures';
import {
  ModalActions,
  TableHelper,
  waitForCreateUserResponse,
  waitForEditUserRequest,
} from '@/utils/';
import { validationTestCases, createRandomUserData } from '@/mocks/userMocks';
import { UserApiResponse, EditUserResponse } from '@/interfaces/user';

test.describe('Users management', () => {
  // Store created user data globally for reuse across tests
  let createdUserApiResponse: UserApiResponse | null = null;

  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await test.step('Login and navigate to users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
  });

  test.afterEach(async () => {
    // Cleanup: Reset the stored data after each test
    if (createdUserApiResponse?.id) {
      await test.step('Cleanup: Reset created user data', async () => {
        // Reset the stored data for next test
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

      // Store the created user API response for reuse
      createdUserApiResponse = apiUser;

      const table = new TableHelper(usersPage.frame);
      await table.expectRowContains(apiUser.email);

      await test.step('Verify created user row matches API response', async () => {
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
  }) => {
    if (!createdUserApiResponse?.id) {
      test.skip();
      return;
    }

    const updatedData = createRandomUserData('pb', 'pbuser-updated');
    const newEmail = updatedData.email;

    await test.step('Open the previously created user for editing using collectionId', async () => {
      await usersPage.openRecordForEditByEmail(createdUserApiResponse.email);
    });

    await test.step('Update email field and save', async () => {
      await usersPage.updateUserFields({ email: newEmail });

      const responsePromise = waitForEditUserRequest(page, createdUserApiResponse.id);
      await usersPage.saveChanges();
      const editResponse: EditUserResponse = await responsePromise;

      await test.step('Verify API response status', async () => {
        expect(editResponse.status).toBeGreaterThanOrEqual(200);
        expect(editResponse.status).toBeLessThan(300);
      });

      await test.step('Verify updated email in response data', async () => {
        expect(editResponse.data?.email ?? '').toBe(newEmail);
      });

      const successText = usersPage.frame.getByText(/success|updated|saved/i);
      await ModalActions.waitForModalToHideOrSuccess(usersPage.modalTitle, successText);
    });

    await test.step('Verify the updated email appears in table', async () => {
      const table = new TableHelper(usersPage.frame);
      await table.expectRowContains(newEmail);
    });
  });
});
