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
    await test.step('Setup checkout with products', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);
    });

    await test.step('Complete checkout process', async () => {
      await helpers.completeCheckoutProcess();
    });

    await test.step('Verify successful checkout', async () => {
      await helpers.verifySuccessfulCheckout();
    });

    await test.step('Back to home and verify cart empty', async () => {
      await orderPage.backToHome();
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
      await helpers.verifyCartIsEmpty();
    });
  });

  test('Checkout with Empty Inputs - should block checkout', async () => {
    await test.step('Setup checkout with products', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT]);
    });

    await test.step('Try to continue without filling info', async () => {
      await orderPage.continueToOverview();
    });

    await test.step('Verify error message appears', async () => {
      await orderPage.verifyCurrentUrl(URLS.CHECKOUT_STEP_ONE);
      await orderPage.verifyPageTitle(TEXTS.TITLES.CHECKOUT_INFORMATION);
      await checkoutTest.verifyFormError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
    });
  });

  // ✅ Refactor: Parameterized tests cho form validation
  const requiredFields = [
    {
      name: 'first name',
      userData: TEST_USER_DATA.EMPTY_FIRST_NAME,
      error: ERROR_MESSAGES.FIRST_NAME_REQUIRED,
    },
    {
      name: 'last name',
      userData: TEST_USER_DATA.EMPTY_LAST_NAME,
      error: ERROR_MESSAGES.LAST_NAME_REQUIRED,
    },
    {
      name: 'zip code',
      userData: TEST_USER_DATA.EMPTY_ZIP_CODE,
      error: ERROR_MESSAGES.POSTAL_CODE_REQUIRED,
    },
  ];

  requiredFields.forEach(({ name, userData, error }) => {
    test(`Form validation - empty ${name}`, async () => {
      await test.step(`Setup and fill form with empty ${name}`, async () => {
        await checkoutTest.setupAndFillForm([PRODUCT_DATA.BACKPACK], userData);
      });

      await test.step(`Verify ${name} required error`, async () => {
        await checkoutTest.verifyFormError(error);
      });
    });
  });

  test('Checkout overview page displays correct information', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT, PRODUCT_DATA.T_SHIRT];

    await test.step('Setup and go to checkout overview', async () => {
      await checkoutTest.setupAndGoToOverview(products);
    });

    await test.step('Verify overview page and items', async () => {
      await orderPage.verifyCheckoutStepTwoPage();
      await orderPage.verifyCartItemsInOverview(products.map((p) => p.NAME));
      await orderPage.verifySummaryInformation();
    });

    await test.step('Verify overview buttons visible', async () => {
      await expect(orderPage.finishButton).toBeVisible();
      await expect(orderPage.cancelOverviewButton).toBeVisible();
    });
  });

  // ✅ Refactor: Parameterized tests cho Cancel button
  const cancelCases = [
    {
      name: 'step one returns to cart',
      setup: async () => {
        await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
        await orderPage.verifyCheckoutStepOnePage();
        await orderPage.cancelCheckout();
      },
      verify: async () => {
        await checkoutTest.verifyCancel(MATCHERS.CART, TEXTS.TITLES.YOUR_CART, '1');
      },
    },
    {
      name: 'overview returns to inventory',
      setup: async () => {
        await checkoutTest.setupAndGoToOverview([PRODUCT_DATA.BACKPACK]);
        await orderPage.verifyCheckoutStepTwoPage();
        await orderPage.cancelOverview();
      },
      verify: async () => {
        await checkoutTest.verifyCancel(MATCHERS.INVENTORY, TEXTS.TITLES.PRODUCTS, '1');
      },
    },
  ];

  cancelCases.forEach(({ name, setup, verify }) => {
    test(`Cancel button - ${name}`, async () => {
      await test.step(`Setup checkout and cancel at ${name}`, async () => {
        await setup();
      });

      await test.step('Verify cancel action result', async () => {
        await verify();
      });
    });
  });

  test('Form fields - should fill and validate properly', async () => {
    await test.step('Setup checkout with product', async () => {
      await helpers.setupCheckoutWithProducts([PRODUCT_DATA.BACKPACK]);
    });

    await test.step('Verify form empty and fill with valid data', async () => {
      await orderPage.verifyFormFieldsEmpty();
      await orderPage.fillCheckoutInformationWithData(TEST_USER_DATA.VALID);
      await orderPage.verifyFormFieldsFilledWithData(TEST_USER_DATA.VALID);
    });

    await test.step('Continue and verify step two page', async () => {
      await orderPage.continueToOverview();
      await orderPage.verifyCheckoutStepTwoPage();
    });
  });

  test('Multiple items checkout - correct pricing', async () => {
    const products = [PRODUCT_DATA.BACKPACK, PRODUCT_DATA.BIKE_LIGHT, PRODUCT_DATA.T_SHIRT];

    await test.step('Setup and go to overview with multiple products', async () => {
      await checkoutTest.setupAndGoToOverview(products);
    });

    await test.step('Verify items and summary info', async () => {
      await orderPage.verifyCartItemsInOverview(products.map((p) => p.NAME));
      await orderPage.verifySummaryInformation();
    });

    await test.step('Verify tax and total calculation', async () => {
      const tax = await orderPage.getTaxAmount();
      const total = await orderPage.getTotalAmount();

      await orderPage.verifyExpectedSubtotal(EXPECTED_SUBTOTALS.THREE_ITEMS);
      expect(tax).toBeTruthy();
      expect(total).toBeTruthy();
    });

    await test.step('Finish order and verify complete page', async () => {
      await orderPage.finishOrder();
      await orderPage.verifyCheckoutCompletePage();
    });
  });
});
