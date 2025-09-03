import { test, expect } from '@/fixtures/pageFixtures';
import { TableHelper, getExpectedSortedDesc } from '@/utils';
import { waitForSortResponse } from '@/utils/api';

type Table = {
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  username: string;
  name: string;
  avatar: string;
  website: string;
  created: string;
  updated: string;
};

const isString = (value: unknown): value is string => typeof value === 'string';
const CASES: (keyof Table)[] = ['id', 'email', 'emailVisibility', 'username', 'name', 'website'];

test.describe('Sort User Records', () => {
  test.beforeEach(async ({ loginPage, dashboardPage, usersPage }) => {
    await test.step('Navigate to Users page', async () => {
      await loginPage.goto();
      await dashboardPage.assertUsersBreadcrumbVisible();
    });

    await test.step('Wait for table to be ready', async () => {
      const usersTable = new TableHelper(usersPage.frame);
      await usersTable.waitForTableToLoad();
    });
  });

  CASES.forEach((columnName) => {
    test(`Successfully sort the ${columnName} column alphabetical order`, async ({
      page,
      usersPage,
    }) => {
      const usersTable = new TableHelper(usersPage.frame);

      await test.step(`Click on the column ${columnName} on the header`, async () => {
        const responsePromise = waitForSortResponse({ url: `sort=-${columnName}`, page });
        await usersTable.getColumn(columnName).click();

        const response = await responsePromise;
        const responseBody = await response.json();
        const apiData = responseBody.items.map((item) => item[columnName]).filter(isString);

        const expectedSorted = getExpectedSortedDesc(apiData);
        await expect(usersTable.getColumn(columnName)).toBeVisible();
        expect(apiData).toEqual(expectedSorted);
      });

      await test.step(`The ${columnName} column is sorted in alphabetical order`, async () => {
        await usersTable.waitForTableToLoad();
        const values = await usersTable.getAllValueCellByColumnName(columnName);

        const tableData = values.filter(isString);
        const expectedSorted = getExpectedSortedDesc(tableData);
        expect(tableData).toEqual(expectedSorted);
      });
    });
  });
});
