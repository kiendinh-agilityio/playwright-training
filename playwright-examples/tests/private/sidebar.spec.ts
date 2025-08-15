import { test, expect } from '@playwright/test';
import { Sidebar } from '@/tests/pages/sidebar/Sidebar';
import { loginAsStandardUser } from '@/tests/utils/auth';
import { TEXTS, MATCHERS } from '@/tests/constants';

test.describe('Sidebar Functionality', () => {
  let sidebar: Sidebar;

  test.beforeEach(async ({ page }) => {
    sidebar = new Sidebar(page);

    // Login with standard account as precondition
    await loginAsStandardUser(page);
  });

  test('Verify that the user stays on the home page when clicking "All Items" in the menu sidebar', async ({
    page,
  }) => {
    // Step 1: Navigate to Home page (already done in beforeEach)
    await expect(page).toHaveURL(MATCHERS.INVENTORY);

    // Step 2: Click the menu bar in the left corner
    await sidebar.openMenu();
    await sidebar.verifyMenuIsOpen();

    // Step 3: Click item "All Items"
    await sidebar.clickAllItems();

    // Step 4: Click X button to close
    await sidebar.closeMenu();
    await sidebar.verifyMenuIsClosed();

    // Step 5: Verify user stays on the Home page
    // Expected Outcome: Close menu sidebar and stay in URL: /inventory.html
    await sidebar.verifyCurrentUrl(MATCHERS.INVENTORY);
  });

  test('Verify that the user navigates to a new site saucelabs', async ({ page }) => {
    // Step 1: Navigate to Home page (already done in beforeEach)
    await expect(page).toHaveURL(MATCHERS.INVENTORY);

    // Step 2: Click the menu bar in the left corner
    await sidebar.openMenu();
    await sidebar.verifyMenuIsOpen();

    // Step 3: Click item "About"
    await sidebar.clickAbout();

    // Step 4: Verify user navigates to saucelabs
    // Expected Outcome: The user navigates to the saucelabs and Title: Sauce Labs: Cross Browser Testing, Selenium Testing & Mobile Testing
    await expect(page).toHaveURL(MATCHERS.SAUCELABS);
    await sidebar.verifyPageTitle(TEXTS.MESSAGES.ABOUT_PAGE_TITLE);
  });

  test('Verify that user is able to logout successfully', async ({ page }) => {
    // Step 1: Click the menu bar in the left corner
    await sidebar.openMenu();
    await sidebar.verifyMenuIsOpen();

    // Step 2: Click item "Logout"
    await sidebar.clickLogout();

    // Step 3: Verify user navigates to Login page
    // Expected Outcome: The user navigates to the Login page and Title: Swag Labs
    await expect(page).toHaveURL(MATCHERS.ROOT);
    await expect(page).toHaveTitle(TEXTS.TITLES.APP);
  });
});
