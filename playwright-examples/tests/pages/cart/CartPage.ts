import { expect, type Locator, type Page } from '@playwright/test';
import { SELECTORS } from '@/tests/constants/selectors';
import { TEXTS } from '@/tests/constants/texts';

export class CartPage {
  private readonly page: Page;
  readonly cartItems: Locator;
  readonly cartBadge: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = this.page.locator(SELECTORS.CART_ITEM);
    this.cartBadge = this.page.locator(SELECTORS.CART_BADGE);
    this.checkoutButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.CHECKOUT });
  }

  // Item-specific locators
  private itemCard(productName: string): Locator {
    return this.page.locator(SELECTORS.CART_ITEM).filter({ has: this.page.getByText(productName) });
  }

  getItemRemoveButton(productName: string): Locator {
    return this.itemCard(productName).getByRole('button', { name: TEXTS.BUTTONS.REMOVE });
  }

  // Actions
  async clickCartIcon(): Promise<void> {
    await this.page.locator(SELECTORS.CART_ICON).click();
  }

  async removeItem(productName: string): Promise<void> {
    await this.getItemRemoveButton(productName).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  // Verifications
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page.getByText(expectedTitle)).toBeVisible();
  }

  async verifyCurrentUrl(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async verifyCartItemCount(expectedCount: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(expectedCount);
  }

  async verifyCartBadgeCount(expectedCount: number): Promise<void> {
    if (expectedCount === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(expectedCount.toString());
    }
  }

  async verifyItemExists(productName: string): Promise<void> {
    await expect(this.itemCard(productName)).toBeVisible();
  }

  async verifyItemDoesNotExist(productName: string): Promise<void> {
    await expect(this.itemCard(productName)).not.toBeVisible();
  }
}
