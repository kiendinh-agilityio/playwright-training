import { expect, type Locator, type Page } from '@playwright/test';
import { TEXTS, SELECTORS, TEST_IDS } from '@/tests/constants';

export class HomePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.page.locator(SELECTORS.INVENTORY_LIST)).toBeVisible();
  }

  private itemCard(productName: string): Locator {
    return this.page
      .locator(SELECTORS.INVENTORY_ITEM)
      .filter({ has: this.page.getByRole('link', { name: productName }) });
  }

  cartBadge(): Locator {
    return this.page.locator(SELECTORS.CART_BADGE);
  }

  getItemActionButton(productName: string): Locator {
    return this.itemCard(productName).getByRole('button');
  }

  async addToCart(productName: string): Promise<void> {
    await this.itemCard(productName)
      .getByRole('button', { name: TEXTS.BUTTONS.ADD_TO_CART })
      .click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.itemCard(productName).getByRole('button', { name: TEXTS.BUTTONS.REMOVE }).click();
  }

  async getCartCount(): Promise<number> {
    const badge = this.cartBadge();
    const count = await badge.count();
    if (count === 0) return 0;
    const text = await badge.textContent();
    return Number(text ?? 0);
  }

  get sortSelect(): Locator {
    return this.page.getByTestId(TEST_IDS.PRODUCT_SORT);
  }

  async getAvailableSortOptions(): Promise<string[]> {
    await expect(this.sortSelect).toBeVisible();
    const texts = await this.sortSelect.evaluate((select: HTMLSelectElement) =>
      Array.from(select.options).map((o) => (o.textContent || '').trim()),
    );
    return texts;
  }

  async selectSortByValue(value: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortSelect.selectOption(value);
  }

  async getAllPrices(): Promise<number[]> {
    const priceTexts = await this.page.locator(SELECTORS.INVENTORY_ITEM_PRICE).allTextContents();
    return priceTexts.map((t) => Number(t.replace('$', '')));
  }

  async getAllProductNames(): Promise<string[]> {
    const nameTexts = await this.page.locator(SELECTORS.INVENTORY_ITEM_NAME).allTextContents();
    return nameTexts.map((t) => t.trim());
  }

  async clearCart(): Promise<void> {
    const removeButtons = this.page.getByRole('button', { name: TEXTS.BUTTONS.REMOVE });
    const count = await removeButtons.count();

    for (let i = 0; i < count; i++) {
      await removeButtons.nth(i).click();
    }
  }
}
