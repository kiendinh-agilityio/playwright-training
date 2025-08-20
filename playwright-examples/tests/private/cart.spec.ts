import { test, expect } from '@playwright/test';
import { HomePage, CartPage } from '@/tests/pages/index';
import { TEXTS } from '@/tests/constants/texts';
import { MATCHERS, URLS } from '@/tests/constants/routes';
import { PRODUCT_DATA } from '@/tests/constants/test-data';

test.describe('Cart Functionality', () => {
  let homePage: HomePage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    await page.goto(URLS.INVENTORY);
    await homePage.waitForLoaded();
  });

  test('Verify that the user can see all the products added to the cart', async ({ page }) => {
    await test.step('Step 1: Navigate to Home page (already done in beforeEach)', async () => {
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
    });

    await test.step(`Step 2: Add "${PRODUCT_DATA.BACKPACK.NAME}" to the cart`, async () => {
      await homePage.addToCart(PRODUCT_DATA.BACKPACK.NAME);
    });

    await test.step(`Step 3: Add "${PRODUCT_DATA.BIKE_LIGHT.NAME}" to the cart`, async () => {
      await homePage.addToCart(PRODUCT_DATA.BIKE_LIGHT.NAME);
    });

    await test.step('Step 4: Click the cart icon in the right corner', async () => {
      await cartPage.clickCartIcon();
    });

    await test.step('Step 5: Verify user can see all the added products in the Cart page', async () => {
      await cartPage.verifyCurrentUrl(URLS.CART);
      await cartPage.verifyPageTitle(TEXTS.TITLES.YOUR_CART);
      await cartPage.verifyCartItemCount(2);
      await cartPage.verifyItemExists(PRODUCT_DATA.BACKPACK.NAME);
      await cartPage.verifyItemExists(PRODUCT_DATA.BIKE_LIGHT.NAME);
      await cartPage.verifyCartBadgeCount(2);
    });
  });

  test('Verify that user can remove cart item in Cart page', async ({ page }) => {
    await test.step('Step 1: Navigate to Home page (already done in beforeEach)', async () => {
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
    });

    await test.step(`Step 2: Add "${PRODUCT_DATA.BACKPACK.NAME}" to the cart`, async () => {
      await homePage.addToCart(PRODUCT_DATA.BACKPACK.NAME);
    });

    await test.step(`Step 3: Add "${PRODUCT_DATA.BIKE_LIGHT.NAME}" to the cart`, async () => {
      await homePage.addToCart(PRODUCT_DATA.BIKE_LIGHT.NAME);
    });

    await test.step('Step 4: Click the cart icon in the right corner', async () => {
      await cartPage.clickCartIcon();
    });

    await test.step(`Step 5: Remove "${PRODUCT_DATA.BACKPACK.NAME}" from the cart`, async () => {
      await cartPage.removeItem(PRODUCT_DATA.BACKPACK.NAME);
    });

    await test.step('Step 6: Verify user can remove an item from the cart on the Cart page', async () => {
      await cartPage.verifyCurrentUrl(URLS.CART);
      await cartPage.verifyPageTitle(TEXTS.TITLES.YOUR_CART);
      await cartPage.verifyCartItemCount(1);
      await cartPage.verifyItemExists(PRODUCT_DATA.BIKE_LIGHT.NAME);
      await cartPage.verifyItemDoesNotExist(PRODUCT_DATA.BACKPACK.NAME);
      await cartPage.verifyCartBadgeCount(1);
    });
  });
});
