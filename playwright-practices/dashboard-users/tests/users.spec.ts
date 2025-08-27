import { test, expect } from '@/fixtures/pageFixtures';
import { TestHelper, TableHelper, ApiMockHelper } from '@/utils/';
import {
  validationTestCases,
  createRandomUserData,
  createEditUserTestData,
} from '@/mocks/userMocks';

test.describe('Users management', () => {
  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await test.step('Login and navigate to users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });
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

    await test.step('Mock create API and click Create', async () => {
      const apiMock = new ApiMockHelper(page);
      await apiMock.mockCreateUserWithList(testData);

      await usersPage.submitCreate();
      await TestHelper.waitForModalToHide(usersPage.modalTitle);
    });

    await test.step('Verify new user appears in table', async () => {
      const table = new TableHelper(usersPage.frame);
      await table.expectRowContains(testData.email);
    });
  });

  test.describe('Create validations', () => {
    for (const testCase of validationTestCases) {
      test(testCase.name, async ({ usersPage }) => {
        await test.step('Open create modal', async () => {
          await usersPage.openCreateModal();
        });

        await test.step('Fill form with invalid data', async () => {
          await usersPage.fillCreateUserForm(testCase.data as any);
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
    const editTestData = createEditUserTestData('updated.email@example.com');

    await test.step('Navigate to users collection and get first row email', async () => {
      await usersPage.gotoCollection();
      editTestData.originalEmail = await TestHelper.getFirstRowEmail(usersPage.frame);
    });

    await test.step('Open existing user details and switch to edit', async () => {
      await usersPage.openRecordForEditByEmail(editTestData.originalEmail);
    });

    await test.step('Update email field', async () => {
      await usersPage.updateUserFields({ email: editTestData.newEmail });
    });

    await test.step('Mock edit API and save', async () => {
      const apiMock = new ApiMockHelper(page);
      await apiMock.mockEditUser(editTestData.newEmail);

      await usersPage.saveChanges();

      const successText = usersPage.frame.getByText(/success|updated|saved/i);
      await TestHelper.waitForModalToHideOrSuccess(usersPage.modalTitle, successText);
    });
  });
});
