import { test, expect } from '@playwright/test';
import { CartPage, HomePage, OrderPage } from '@/tests/pages/index';
import { createOrderTestHelpers } from '@/tests/utils/order-test-helpers';
import { useCheckoutTest } from '@/tests/utils/useCheckoutTest';
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
  let checkoutTest: ReturnType<typeof useCheckoutTest>;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    orderPage = new OrderPage(page);
    helpers = createOrderTestHelpers(homePage, cartPage, orderPage);
    checkoutTest = useCheckoutTest(helpers, orderPage, homePage, page);

    await page.goto(URLS.INVENTORY);
    await homePage.waitForLoaded();
  });

  test('Successful Checkout - user can check out successfully', async ({ page }) => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);
    await helpers.completeCheckoutProcess();
    await helpers.verifySuccessfulCheckout();

    await orderPage.backToHome();
    await expect(page).toHaveURL(MATCHERS.INVENTORY);
    await helpers.verifyCartIsEmpty();
  });

  test('Checkout with Empty Inputs - should block checkout', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);
    await orderPage.continueToOverview();

    await orderPage.verifyCurrentUrl(URLS.CHECKOUT_STEP_ONE);
    await orderPage.verifyPageTitle(TEXTS.TITLES.CHECKOUT_INFORMATION);
    await checkoutTest.verifyFormError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
  });

  test('Form validation - empty first name', async () => {
    await checkoutTest.setupAndFillForm([PRODUCT_DATA.BACKPACK], TEST_USER_DATA.EMPTY_FIRST_NAME);
    await checkoutTest.verifyFormError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
  });

  test('Form validation - empty last name', async () => {
    await checkoutTest.setupAndFillForm([PRODUCT_DATA.BACKPACK], TEST_USER_DATA.EMPTY_LAST_NAME);
    await checkoutTest.verifyFormError(ERROR_MESSAGES.LAST_NAME_REQUIRED);
  });

  test('Form validation - empty zip code', async () => {
    await checkoutTest.setupAndFillForm([PRODUCT_DATA.BACKPACK], TEST_USER_DATA.EMPTY_ZIP_CODE);
    await checkoutTest.verifyFormError(ERROR_MESSAGES.POSTAL_CODE_REQUIRED);
  });

  test('Checkout overview page displays correct information', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT, PRODUCT_DATA.T_SHIRT];

    await checkoutTest.setupAndGoToOverview(products);

    await orderPage.verifyCheckoutStepTwoPage();
    await orderPage.verifyCartItemsInOverview(products.map((p) => p.NAME));
    await orderPage.verifySummaryInformation();
    await expect(orderPage.finishButton).toBeVisible();
    await expect(orderPage.cancelOverviewButton).toBeVisible();
  });

  test('Cancel button - step one returns to cart', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    await orderPage.verifyCheckoutStepOnePage();
    await orderPage.cancelCheckout();

    await checkoutTest.verifyCancel(MATCHERS.CART, TEXTS.TITLES.YOUR_CART, '1');
  });

  test('Cancel button - overview returns to inventory', async () => {
    await checkoutTest.setupAndGoToOverview([PRODUCT_DATA.BACKPACK]);
    await orderPage.verifyCheckoutStepTwoPage();
    await orderPage.cancelOverview();

    await checkoutTest.verifyCancel(MATCHERS.INVENTORY, TEXTS.TITLES.PRODUCTS, '1');
  });

  test('Form fields - should fill and validate properly', async () => {
    await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);

    await orderPage.verifyFormFieldsEmpty();
    await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.VALID);
    await orderPage.verifyFormFieldsFilledWithData(TEST_USER_DATA.VALID);

    await orderPage.continueToOverview();
    await orderPage.verifyCheckoutStepTwoPage();
  });

  test('Multiple items checkout - correct pricing', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT, PRODUCT_DATA.T_SHIRT];

    await checkoutTest.setupAndGoToOverview(products);

    await orderPage.verifyCartItemsInOverview(products.map((p) => p.NAME));
    await orderPage.verifySummaryInformation();

    const tax = await orderPage.getTaxAmount();
    const total = await orderPage.getTotalAmount();

    await orderPage.verifyExpectedSubtotal(EXPECTED_SUBTOTALS.THREE_ITEMS);
    expect(tax).toBeTruthy();
    expect(total).toBeTruthy();

    await orderPage.finishOrder();
    await orderPage.verifyCheckoutCompletePage();
  });
});
