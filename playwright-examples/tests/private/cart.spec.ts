import { test, expect } from '@playwright/test';
import { HomePage, CartPage } from '@/tests/pages/index';
import { TEXTS } from '@/tests/constants/texts';
import { MATCHERS, URLS } from '@/tests/constants/routes';
import { PRODUCT_DATA } from '@/tests/constants/test-data';
import { addMultipleProducts, verifyProductsInCart } from '@/tests/utils/cartActions';

test.describe('Cart Functionality', () => {
  let homePage: HomePage;
  let cartPage: CartPage;

  const productSets = [
    [PRODUCT_DATA.BACKPACK.NAME],
    [PRODUCT_DATA.BACKPACK.NAME, PRODUCT_DATA.BIKE_LIGHT.NAME],
    [PRODUCT_DATA.BACKPACK.NAME, PRODUCT_DATA.BIKE_LIGHT.NAME, PRODUCT_DATA.T_SHIRT.NAME],
  ];

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    await page.goto(URLS.INVENTORY);
    await homePage.waitForLoaded();
  });

  for (const productsToAdd of productSets) {
    test(`Verify user can add ${productsToAdd.length} product(s) and see them in the cart`, async ({
      page,
    }) => {
      await test.step('Navigate to Home page (already done in beforeEach)', async () => {
        await expect(page).toHaveURL(MATCHERS.INVENTORY);
      });

      await test.step(`Add ${productsToAdd.length} product(s) to the cart`, async () => {
        await addMultipleProducts(homePage, productsToAdd);
      });

      await test.step('Click the cart icon in the right corner', async () => {
        await cartPage.clickCartIcon();
      });

      await test.step('Verify user can see all the added products in the Cart page', async () => {
        await cartPage.verifyCurrentUrl(URLS.CART);
        await cartPage.verifyPageTitle(TEXTS.TITLES.YOUR_CART);
        await verifyProductsInCart(cartPage, productsToAdd);
      });
    });
  }

  test('Verify that user can remove a product from the cart', async ({ page }) => {
    const productsToAdd = [PRODUCT_DATA.BACKPACK.NAME, PRODUCT_DATA.BIKE_LIGHT.NAME];

    await test.step('Navigate to Home page (already done in beforeEach)', async () => {
      await expect(page).toHaveURL(MATCHERS.INVENTORY);
    });

    await test.step(`Add ${productsToAdd.length} product(s) to the cart`, async () => {
      await addMultipleProducts(homePage, productsToAdd);
    });

    await test.step('Click the cart icon in the right corner', async () => {
      await cartPage.clickCartIcon();
    });

    await test.step(`Remove "${PRODUCT_DATA.BACKPACK.NAME}" from the cart`, async () => {
      await cartPage.removeItem(PRODUCT_DATA.BACKPACK.NAME);
    });

    await test.step('Verify user can remove an item from the cart on the Cart page', async () => {
      const expectedRemaining = productsToAdd.filter((p) => p !== PRODUCT_DATA.BACKPACK.NAME);

      await cartPage.verifyCurrentUrl(URLS.CART);
      await cartPage.verifyPageTitle(TEXTS.TITLES.YOUR_CART);
      await verifyProductsInCart(cartPage, expectedRemaining);
      await cartPage.verifyItemDoesNotExist(PRODUCT_DATA.BACKPACK.NAME);
    });
  });
});
