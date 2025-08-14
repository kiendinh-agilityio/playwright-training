import { test, expect } from '@playwright/test';
import { HomePage } from '@/tests/pages/home/HomePage';
import { loginAsStandardUser } from '@/tests/utils/auth';
import { TEXTS, PRODUCT_DATA } from '@/tests/constants';

test.describe('Home (Inventory) page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
    const home = new HomePage(page);
    await home.waitForLoaded();
  });

  test('user can add product to cart from the Home page', async ({ page }) => {
    const productName = PRODUCT_DATA.BACKPACK;
    const home = new HomePage(page);
    await home.addToCart(productName);
    await expect(home.getItemActionButton(productName)).toHaveText(TEXTS.BUTTONS.REMOVE);
    await expect(home.cartBadge()).toHaveText('1');
  });

  test('user can remove products from the cart from the Home page', async ({ page }) => {
    const productName = PRODUCT_DATA.BACKPACK;
    const home = new HomePage(page);
    await home.addToCart(productName);
    await expect(home.cartBadge()).toHaveText('1');
    await home.removeFromCart(productName);
    await expect(home.cartBadge()).toHaveCount(0);
  });

  test('user can sort product items by price', async ({ page }) => {
    const home = new HomePage(page);

    expect(await home.getAvailableSortOptions()).toEqual([
      'Name (A to Z)',
      'Name (Z to A)',
      'Price (low to high)',
      'Price (high to low)',
    ]);

    // Test Name (A to Z) sorting
    await home.selectSortByValue('az');
    const namesAsc = await home.getAllProductNames();
    const sortedNamesAsc = [...namesAsc].sort();
    expect(namesAsc).toEqual(sortedNamesAsc);

    // Test Name (Z to A) sorting
    await home.selectSortByValue('za');
    const namesDesc = await home.getAllProductNames();
    const sortedNamesDesc = [...namesDesc].sort().reverse();
    expect(namesDesc).toEqual(sortedNamesDesc);

    // Test Price (low to high) sorting
    await home.selectSortByValue('lohi');
    const pricesAsc = await home.getAllPrices();
    const sortedAsc = [...pricesAsc].sort((a, b) => a - b);
    expect(pricesAsc).toEqual(sortedAsc);

    // Test Price (high to low) sorting
    await home.selectSortByValue('hilo');
    const pricesDesc = await home.getAllPrices();
    const sortedDesc = [...pricesDesc].sort((a, b) => b - a);
    expect(pricesDesc).toEqual(sortedDesc);
  });
});
