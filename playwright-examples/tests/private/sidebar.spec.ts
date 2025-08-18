import { test, expect } from '@playwright/test';
import { Sidebar } from '@/tests/pages/sidebar/Sidebar';
import { TEXTS, MATCHERS, URLS } from '@/tests/constants';

test.describe('Sidebar Functionality', () => {
  let sidebar: Sidebar;

  test.beforeEach(async ({ page }) => {
    sidebar = new Sidebar(page);
    await page.goto(URLS.INVENTORY);
  });

  test('Verify that the user stays on the home page when clicking "All Items" in the menu sidebar', async ({
    page,
  }) => {
    await test.step('Step 1: Verify user is on Home page', async () => {
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
    });

    await test.step('Step 2: Open menu sidebar', async () => {
      await sidebar.openMenu();
      await sidebar.verifyMenuIsOpen();
    });

    await test.step('Step 3: Click "All Items"', async () => {
      await sidebar.clickAllItems();
    });

    await test.step('Step 4: Close menu sidebar', async () => {
      await sidebar.closeMenu();
      await sidebar.verifyMenuIsClosed();
    });

    await test.step('Step 5: Verify user stays on Home page', async () => {
      await sidebar.verifyCurrentUrl(MATCHERS.INVENTORY);
    });
  });

  test('Verify that the user navigates to a new site saucelabs', async ({ page }) => {
    await test.step('Step 1: Verify user is on Home page', async () => {
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
    });

    await test.step('Step 2: Open menu sidebar', async () => {
      await sidebar.openMenu();
      await sidebar.verifyMenuIsOpen();
    });

    await test.step('Step 3: Click "About"', async () => {
      await sidebar.clickAbout();
    });

    await test.step('Step 4: Verify user navigates to Sauce Labs site', async () => {
      await expect(page).toHaveURL(MATCHERS.SAUCELABS);
      await sidebar.verifyPageTitle(TEXTS.MESSAGES.ABOUT_PAGE_TITLE);
    });
  });

  test('Verify that user is able to logout successfully', async ({ page }) => {
    await test.step('Step 1: Open menu sidebar', async () => {
      await sidebar.openMenu();
      await sidebar.verifyMenuIsOpen();
    });

    await test.step('Step 2: Click "Logout"', async () => {
      await sidebar.clickLogout();
    });

    await test.step('Step 3: Verify user navigates to Login page', async () => {
      await expect(page).toHaveURL(MATCHERS.ROOT);
      await expect(page).toHaveTitle(TEXTS.TITLES.APP);
    });
  });
});
