import path from 'path';
import { test } from '@/fixtures/pageFixtures';
import { CREDENTIALS } from '@/constants';

const STORAGE_STATE = path.join(process.cwd(), 'playwright/.auth/user.json');

test('authenticate', async ({ loginPage, dashboardPage, page }) => {
  const { username, password } = CREDENTIALS.ACCOUNT_SUCCESS;

  await loginPage.login(username, password);
  await dashboardPage.assertUsersBreadcrumbVisible();

  await page.context().storageState({ path: STORAGE_STATE });
});
