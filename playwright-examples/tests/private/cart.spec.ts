import { test, expect } from '@playwright/test';
import { HomePage } from '@/tests/pages/home/HomePage';
import { CartPage } from '@/tests/pages/cart/CartPage';
import { loginAsStandardUser } from '@/tests/utils/auth';
import { TEXTS } from '@/tests/constants/texts';
import { MATCHERS, URLS } from '@/tests/constants/routes';
import { PRODUCT_DATA } from '@/tests/constants/test-data';

test.describe('Cart Functionality', () => {
  let homePage: HomePage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);

    // Login with standard account as precondition
    await loginAsStandardUser(page);
    await homePage.waitForLoaded();
  });

  test('Verify that the user can see all the products added to the cart', async ({ page }) => {
    // Step 1: Navigate to Home page (already done in beforeEach)
    await expect(page).toHaveURL(MATCHERS.INVENTORY);

    // Step 2: Click button 'Add to cart' of the product has title 'Sauce Labs Backpack'
    await homePage.addToCart(PRODUCT_DATA.BACKPACK);

    // Step 3: Click button 'Add to cart' of the product has title 'Sauce Labs Bike Light'
    await homePage.addToCart(PRODUCT_DATA.BIKE_LIGHT);

    // Step 4: Click the cart icon in the right corner
    await cartPage.clickCartIcon();

    // Step 5: Verify user can see all the products which is added to the Cart page
    // Expected Results:
    // - Navigate to Cart page
    await cartPage.verifyCurrentUrl(URLS.CART);

    // - Title: Your Cart
    await cartPage.verifyPageTitle(TEXTS.TITLES.YOUR_CART);

    // - Show 2 items with title 'Sauce Labs Backpack' and 'Sauce Labs Bike Light'
    await cartPage.verifyCartItemCount(2);
    await cartPage.verifyItemExists(PRODUCT_DATA.BACKPACK);
    await cartPage.verifyItemExists(PRODUCT_DATA.BIKE_LIGHT);

    // - Show 2 in the cart icon in the right corner
    await cartPage.verifyCartBadgeCount(2);
  });

  test('Verify that user can remove cart item in Cart page', async ({ page }) => {
    // Step 1: Navigate to Home page (already done in beforeEach)
    await expect(page).toHaveURL(MATCHERS.INVENTORY);

    // Step 2: Click button 'Add to cart' of the product has title 'Sauce Labs Backpack'
    await homePage.addToCart(PRODUCT_DATA.BACKPACK);

    // Step 3: Click button 'Add to cart' of the product has title 'Sauce Labs Bike Light'
    await homePage.addToCart(PRODUCT_DATA.BIKE_LIGHT);

    // Step 4: Click the cart icon in the right corner
    await cartPage.clickCartIcon();

    // Step 5: Click button 'Remove' of product has title 'Sauce Labs Backpack'
    await cartPage.removeItem(PRODUCT_DATA.BACKPACK);

    // Step 6: Verify user can remove an item from the cart on the Cart page
    // Expected Results:
    // - Navigate to Cart page
    await cartPage.verifyCurrentUrl(URLS.CART);

    // - Title: Your Cart
    await cartPage.verifyPageTitle(TEXTS.TITLES.YOUR_CART);

    // - Show 1 items with title 'Sauce Labs Bike Light'
    await cartPage.verifyCartItemCount(1);
    await cartPage.verifyItemExists(PRODUCT_DATA.BIKE_LIGHT);
    await cartPage.verifyItemDoesNotExist(PRODUCT_DATA.BACKPACK);

    // - Show 1 in the cart icon in the right corner
    await cartPage.verifyCartBadgeCount(1);
  });
});
