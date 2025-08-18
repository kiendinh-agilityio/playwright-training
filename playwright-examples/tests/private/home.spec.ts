import { test, expect } from '@playwright/test';
import { HomePage } from '@/tests/pages/home/HomePage';
import { TEXTS, PRODUCT_DATA, URLS } from '@/tests/constants';

test.describe('Home (Inventory) page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.INVENTORY);
    const home = new HomePage(page);
    await home.waitForLoaded();
  });

  test('user can add product to cart from the Home page', async ({ page }) => {
    const productName = PRODUCT_DATA.BACKPACK;
    const home = new HomePage(page);

    await test.step(`Add "${productName}" to the cart`, async () => {
      await home.addToCart(productName);
    });

    await test.step(`Verify "${productName}" button changes to REMOVE`, async () => {
      await expect(home.getItemActionButton(productName)).toHaveText(TEXTS.BUTTONS.REMOVE);
    });

    await test.step('Verify cart badge shows 1 item', async () => {
      await expect(home.cartBadge()).toHaveText('1');
    });
  });

  test('user can remove products from the cart from the Home page', async ({ page }) => {
    const productName = PRODUCT_DATA.BACKPACK;
    const home = new HomePage(page);

    await test.step(`Add "${productName}" to the cart`, async () => {
      await home.addToCart(productName);
    });

    await test.step('Verify cart badge shows 1 item', async () => {
      await expect(home.cartBadge()).toHaveText('1');
    });

    await test.step(`Remove "${productName}" from the cart`, async () => {
      await home.removeFromCart(productName);
    });

    await test.step('Verify cart badge is empty', async () => {
      await expect(home.cartBadge()).toHaveCount(0);
    });
  });

  test('user can sort product items by name', async ({ page }) => {
    const home = new HomePage(page);

    await test.step('Sort by Name (A to Z)', async () => {
      await home.selectSortByValue('az');
      const namesAsc = await home.getAllProductNames();
      const sortedNamesAsc = [...namesAsc].sort();
      expect(namesAsc).toEqual(sortedNamesAsc);
    });

    await test.step('Sort by Name (Z to A)', async () => {
      await home.selectSortByValue('za');
      const namesDesc = await home.getAllProductNames();
      const sortedNamesDesc = [...namesDesc].sort().reverse();
      expect(namesDesc).toEqual(sortedNamesDesc);
    });
  });

  test('user can sort product items by price', async ({ page }) => {
    const home = new HomePage(page);

    await test.step('Sort by Price (low to high)', async () => {
      await home.selectSortByValue('lohi');
      const pricesAsc = await home.getAllPrices();
      const sortedAsc = [...pricesAsc].sort((a, b) => a - b);
      expect(pricesAsc).toEqual(sortedAsc);
    });

    await test.step('Sort by Price (high to low)', async () => {
      await home.selectSortByValue('hilo');
      const pricesDesc = await home.getAllPrices();
      const sortedDesc = [...pricesDesc].sort((a, b) => b - a);
      expect(pricesDesc).toEqual(sortedDesc);
    });
  });
});
