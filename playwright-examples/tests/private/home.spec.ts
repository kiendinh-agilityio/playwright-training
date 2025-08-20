import { test, expect } from '@playwright/test';
import { HomePage } from '@/tests/pages/home/HomePage';
import { TEXTS, PRODUCT_DATA, URLS } from '@/tests/constants';

type SortValue = 'az' | 'za' | 'lohi' | 'hilo';

const products = [PRODUCT_DATA.BACKPACK.NAME, PRODUCT_DATA.BIKE_LIGHT.NAME];

test.describe('Home (Inventory) page', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.INVENTORY);
    home = new HomePage(page);
    await home.waitForLoaded();
  });

  test.afterEach(async () => {
    await home.clearCart();
  });

  for (const product of products) {
    test(`user can add "${product}" to cart from the Home page`, async () => {
      await test.step(`Add "${product}" to the cart`, async () => {
        await home.addToCart(product);
      });

      await test.step(`Verify "${product}" button changes to REMOVE`, async () => {
        await expect(home.getItemActionButton(product)).toHaveText(TEXTS.BUTTONS.REMOVE);
      });

      await test.step('Verify cart badge shows 1 item', async () => {
        await expect(home.cartBadge()).toHaveText('1');
      });
    });

    test(`user can remove "${product}" from cart on the Home page`, async () => {
      await test.step(`Add "${product}" to the cart`, async () => {
        await home.addToCart(product);
      });

      await test.step('Verify cart badge shows 1 item', async () => {
        await expect(home.cartBadge()).toHaveText('1');
      });

      await test.step(`Remove "${product}" from the cart`, async () => {
        await home.removeFromCart(product);
      });

      await test.step('Verify cart badge is empty', async () => {
        await expect(home.cartBadge()).toHaveCount(0);
      });
    });
  }

  const sortCases: {
    value: SortValue;
    desc: string;
    comparator: (a: any, b: any) => number;
  }[] = [
    {
      value: 'az',
      desc: 'Name (A to Z)',
      comparator: (a: string, b: string) => a.localeCompare(b),
    },
    {
      value: 'za',
      desc: 'Name (Z to A)',
      comparator: (a: string, b: string) => b.localeCompare(a),
    },
    {
      value: 'lohi',
      desc: 'Price (low to high)',
      comparator: (a: number, b: number) => a - b,
    },
    {
      value: 'hilo',
      desc: 'Price (high to low)',
      comparator: (a: number, b: number) => b - a,
    },
  ];

  for (const { value, desc, comparator } of sortCases) {
    test(`user can sort product items by ${desc}`, async () => {
      await test.step(`Sort by ${desc}`, async () => {
        await home.selectSortByValue(value);

        if (value === 'az' || value === 'za') {
          const names = await home.getAllProductNames();
          const sorted = [...names].sort(comparator as (a: string, b: string) => number);
          expect(names).toStrictEqual(sorted);
        } else {
          const prices = await home.getAllPrices();
          const sorted = [...prices].sort(comparator as (a: number, b: number) => number);
          expect(prices).toStrictEqual(sorted);
        }
      });
    });
  }
});
