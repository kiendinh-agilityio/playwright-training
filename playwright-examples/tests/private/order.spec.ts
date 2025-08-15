import { test, expect } from '@playwright/test';
import { HomePage } from '@/tests/pages/home/HomePage';
import { CartPage } from '@/tests/pages/cart/CartPage';
import { OrderPage } from '@/tests/pages/order/OrderPage';
import { loginAsStandardUser } from '@/tests/utils/auth';
import { createOrderTestHelpers } from '@/tests/utils/order-test-helpers';
import {
  ERROR_MESSAGES,
  TEXTS,
  MATCHERS,
  URLS,
  TEST_USER_DATA,
  EXPECTED_SUBTOTALS,
  PRODUCT_DATA,
} from '@/tests/constants';

test.describe('Order Functionality', () => {
  let homePage: HomePage;
  let cartPage: CartPage;
  let orderPage: OrderPage;
  let helpers: ReturnType<typeof createOrderTestHelpers>;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    orderPage = new OrderPage(page);
    helpers = createOrderTestHelpers(homePage, cartPage, orderPage);

    // Login with standard account as precondition
    await loginAsStandardUser(page);
    await homePage.waitForLoaded();
  });

  test('Successful Checkout - Verify that the user can check out successfully with products added to the cart', async ({
    page,
  }) => {
    // Setup: Add products and navigate to checkout
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);

    // Complete checkout process
    await helpers.completeCheckoutProcess();
    await helpers.verifySuccessfulCheckout();

    // Go back to home and verify cart is empty
    await orderPage.backToHome();
    await expect(page).toHaveURL(MATCHERS.INVENTORY);
    await helpers.verifyCartIsEmpty();
  });

  test('Checkout with Empty Inputs - Verify that the user cannot check out with empty inputs', async () => {
    // Setup: Add products and navigate to checkout
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);

    // Try to continue without filling form
    await orderPage.continueToOverview();

    // Verify error state
    await orderPage.verifyCurrentUrl(URLS.CHECKOUT_STEP_ONE);
    await orderPage.verifyPageTitle(TEXTS.TITLES.CHECKOUT_INFORMATION);
    await helpers.verifyFormValidationError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
  });

  test('should verify checkout information form validation - empty first name', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.EMPTY_FIRST_NAME);
    await orderPage.continueToOverview();
    await helpers.verifyFormValidationError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
  });

  test('should verify checkout information form validation - empty last name', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.EMPTY_LAST_NAME);
    await orderPage.continueToOverview();
    await helpers.verifyFormValidationError(ERROR_MESSAGES.LAST_NAME_REQUIRED);
  });

  test('should verify checkout information form validation - empty zip code', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.EMPTY_ZIP_CODE);
    await orderPage.continueToOverview();
    await helpers.verifyFormValidationError(ERROR_MESSAGES.POSTAL_CODE_REQUIRED);
  });

  test('should verify checkout overview page displays correct information', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT];
    await helpers.setupCheckoutWithProducts(products);
    await helpers.completeCheckoutToOverview();

    // Verify overview page
    await orderPage.verifyCheckoutStepTwoPage();
    await orderPage.verifyCartItemsInOverview(products);
    await orderPage.verifySummaryInformation();

    // Verify buttons are present
    await expect(orderPage.finishButton).toBeVisible();
    await expect(orderPage.cancelOverviewButton).toBeVisible();
  });

  test('should verify checkout complete page displays success message', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    await helpers.completeCheckoutProcess();
    await helpers.verifySuccessfulCheckout();
  });

  test('should verify cart is cleared after successful checkout', async ({ page }) => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT];
    await helpers.addProductsToCart(products);
    await expect(homePage.cartBadge()).toHaveText('2');

    await helpers.navigateToCheckout();
    await helpers.completeCheckoutProcess();
    await orderPage.backToHome();

    // Verify cart is empty
    await expect(page).toHaveURL(MATCHERS.INVENTORY);
    await helpers.verifyCartIsEmpty();
  });

  test('should verify cancel button functionality in checkout step one', async ({ page }) => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    await orderPage.verifyCheckoutStepOnePage();
    await orderPage.cancelCheckout();

    // Verify we're back to cart page
    await expect(page).toHaveURL(MATCHERS.CART);
    await expect(page.locator('.title')).toHaveText(TEXTS.TITLES.YOUR_CART);
    await expect(homePage.cartBadge()).toHaveText('1');
  });

  test('should verify cancel button functionality in checkout overview', async ({ page }) => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    await helpers.completeCheckoutToOverview();
    await orderPage.verifyCheckoutStepTwoPage();
    await orderPage.cancelOverview();

    // Verify we're back to inventory page
    await expect(page).toHaveURL(MATCHERS.INVENTORY);
    await expect(page.locator('.title')).toHaveText(TEXTS.TITLES.PRODUCTS);
    await expect(homePage.cartBadge()).toHaveText('1');
  });

  test('should verify form fields are properly filled and validated', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);

    // Verify form fields are initially empty
    await orderPage.verifyFormFieldsEmpty();

    // Fill and verify form
    await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.VALID);
    await orderPage.verifyFormFieldsFilledWithData(TEST_USER_DATA.VALID);

    await orderPage.continueToOverview();
    await orderPage.verifyCheckoutStepTwoPage();
  });

  test('should verify multiple items checkout with correct pricing', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT, PRODUCT_DATA.T_SHIRT];
    await helpers.setupCheckoutWithProducts(products);
    await helpers.completeCheckoutToOverview();

    // Verify items and pricing
    await orderPage.verifyCartItemsInOverview(products);
    await orderPage.verifySummaryInformation();

    const tax = await orderPage.getTaxAmount();
    const total = await orderPage.getTotalAmount();

    // Verify pricing
    await orderPage.verifyExpectedSubtotal(EXPECTED_SUBTOTALS.THREE_ITEMS);
    expect(tax).toBeTruthy();
    expect(total).toBeTruthy();

    await orderPage.finishOrder();
    await orderPage.verifyCheckoutCompletePage();
  });
});
