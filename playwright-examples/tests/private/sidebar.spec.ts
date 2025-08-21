import { test, expect } from '@playwright/test';
import { Sidebar } from '@/tests/pages/sidebar/Sidebar';
import { TEXTS, MATCHERS, URLS } from '@/tests/constants';

test.describe('Sidebar Functionality', () => {
  let sidebar: Sidebar;

  test.beforeEach(async ({ page }) => {
    sidebar = new Sidebar(page);
    await page.goto(URLS.INVENTORY);
    await sidebar.waitForLoaded();
  });

  const sidebarActions = [
    {
      name: 'All Items',
      expectedUrl: MATCHERS.INVENTORY,
      verifyTitle: null,
    },
    {
      name: 'About',
      expectedUrl: MATCHERS.SAUCELABS,
      verifyTitle: TEXTS.MESSAGES.ABOUT_PAGE_TITLE,
    },
    {
      name: 'Logout',
      expectedUrl: MATCHERS.ROOT,
      verifyTitle: TEXTS.TITLES.APP,
    },
  ];

  for (const { name, expectedUrl, verifyTitle } of sidebarActions) {
    test(`Sidebar navigation - ${name}`, async ({ page }) => {
      await test.step('Open menu sidebar', async () => {
        await sidebar.openMenu();
        await sidebar.verifyMenuIsOpen();
      });

      await test.step(`Click "${name}"`, async () => {
        await sidebar.clickByName(name);
      });

      await test.step(`Verify navigation to expected page`, async () => {
        await expect(page).toHaveURL(expectedUrl);
        if (verifyTitle) {
          await expect(page).toHaveTitle(verifyTitle);
        }
      });

      await test.step('Close menu sidebar (if applicable)', async () => {
        if (name !== 'Logout' && name !== 'About') {
          await sidebar.closeMenu();
          await sidebar.verifyMenuIsClosed();
        }
      });
    });
  }
});
