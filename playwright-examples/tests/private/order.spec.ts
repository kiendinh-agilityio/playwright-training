import { test, expect } from '@playwright/test';
import { CartPage, HomePage, OrderPage } from '@/tests/pages/index';
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
    await page.goto(URLS.INVENTORY);
    await homePage.waitForLoaded();
  });

  test('Successful Checkout - Verify that the user can check out successfully with products added to the cart', async ({
    page,
  }) => {
    await test.step('Setup: Add products and navigate to checkout', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);
    });

    await test.step('Complete checkout process', async () => {
      await helpers.completeCheckoutProcess();
      await helpers.verifySuccessfulCheckout();
    });

    await test.step('Go back to home and verify cart is empty', async () => {
      await orderPage.backToHome();
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
      await helpers.verifyCartIsEmpty();
    });
  });

  test('Checkout with Empty Inputs - Verify that the user cannot check out with empty inputs', async () => {
    await test.step('Setup: Add products and navigate to checkout', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);
    });

    await test.step('Try to continue without filling form', async () => {
      await orderPage.continueToOverview();
    });

    await test.step('Verify error state', async () => {
      await orderPage.verifyCurrentUrl(URLS.CHECKOUT_STEP_ONE);
      await orderPage.verifyPageTitle(TEXTS.TITLES.CHECKOUT_INFORMATION);
      await helpers.verifyFormValidationError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
    });
  });

  test('should verify checkout information form validation - empty first name', async () => {
    await test.step('Fill with empty first name and try to continue', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
      await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.EMPTY_FIRST_NAME);
      await orderPage.continueToOverview();
    });

    await test.step('Verify first name required error', async () => {
      await helpers.verifyFormValidationError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
    });
  });

  test('should verify checkout information form validation - empty last name', async () => {
    await test.step('Fill with empty last name and try to continue', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
      await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.EMPTY_LAST_NAME);
      await orderPage.continueToOverview();
    });

    await test.step('Verify last name required error', async () => {
      await helpers.verifyFormValidationError(ERROR_MESSAGES.LAST_NAME_REQUIRED);
    });
  });

  test('should verify checkout information form validation - empty zip code', async () => {
    await test.step('Fill with empty zip code and try to continue', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
      await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.EMPTY_ZIP_CODE);
      await orderPage.continueToOverview();
    });

    await test.step('Verify postal code required error', async () => {
      await helpers.verifyFormValidationError(ERROR_MESSAGES.POSTAL_CODE_REQUIRED);
    });
  });

  test('should verify checkout overview page displays correct information', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT];

    await test.step('Setup and complete checkout to overview', async () => {
      await helpers.setupCheckoutWithProducts(products);
      await helpers.completeCheckoutToOverview();
    });

    await test.step('Verify overview page', async () => {
      await orderPage.verifyCheckoutStepTwoPage();
      await orderPage.verifyCartItemsInOverview(products);
      await orderPage.verifySummaryInformation();
      await expect(orderPage.finishButton).toBeVisible();
      await expect(orderPage.cancelOverviewButton).toBeVisible();
    });
  });

  test('should verify cancel button functionality in checkout step one', async ({ page }) => {
    await test.step('Setup checkout and cancel at step one', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
      await orderPage.verifyCheckoutStepOnePage();
      await orderPage.cancelCheckout();
    });

    await test.step('Verify we are back to cart page', async () => {
      await expect(page).toHaveURL(MATCHERS.CART);
      await expect(page.locator('.title')).toHaveText(TEXTS.TITLES.YOUR_CART);
      await expect(homePage.cartBadge()).toHaveText('1');
    });
  });

  test('should verify cancel button functionality in checkout overview', async ({ page }) => {
    await test.step('Setup checkout and cancel at overview', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
      await helpers.completeCheckoutToOverview();
      await orderPage.verifyCheckoutStepTwoPage();
      await orderPage.cancelOverview();
    });

    await test.step('Verify we are back to inventory page', async () => {
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
      await expect(page.locator('.title')).toHaveText(TEXTS.TITLES.PRODUCTS);
      await expect(homePage.cartBadge()).toHaveText('1');
    });
  });

  test('should verify form fields are properly filled and validated', async () => {
    await test.step('Verify form is initially empty', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
      await orderPage.verifyFormFieldsEmpty();
    });

    await test.step('Fill with valid data and verify', async () => {
      await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.VALID);
      await orderPage.verifyFormFieldsFilledWithData(TEST_USER_DATA.VALID);
    });

    await test.step('Continue to overview and verify step two page', async () => {
      await orderPage.continueToOverview();
      await orderPage.verifyCheckoutStepTwoPage();
    });
  });

  test('should verify multiple items checkout with correct pricing', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT, PRODUCT_DATA.T_SHIRT];

    await test.step('Setup and complete checkout to overview', async () => {
      await helpers.setupCheckoutWithProducts(products);
      await helpers.completeCheckoutToOverview();
    });

    await test.step('Verify items and pricing', async () => {
      await orderPage.verifyCartItemsInOverview(products);
      await orderPage.verifySummaryInformation();

      const tax = await orderPage.getTaxAmount();
      const total = await orderPage.getTotalAmount();

      await orderPage.verifyExpectedSubtotal(EXPECTED_SUBTOTALS.THREE_ITEMS);
      expect(tax).toBeTruthy();
      expect(total).toBeTruthy();
    });

    await test.step('Finish order and verify checkout complete', async () => {
      await orderPage.finishOrder();
      await orderPage.verifyCheckoutCompletePage();
    });
  });
});
