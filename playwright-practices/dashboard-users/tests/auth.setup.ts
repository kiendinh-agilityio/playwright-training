import path from 'path';
import { test } from '@/fixtures/pageFixtures';
import { CREDENTIALS } from '@/constants';

const STORAGE_STATE = path.join(__dirname, 'storageState.json');

test('authenticate', async ({ loginPage, page }) => {
  const { username, password } = CREDENTIALS.ACCOUNT_SUCCESS;

  await loginPage.login(username, password);
  await loginPage.assertLoginSuccess();

  await page.context().storageState({ path: STORAGE_STATE });
});
