import { HomePage } from '@/tests/pages/home/HomePage';
import { CartPage } from '@/tests/pages/cart/CartPage';
import { OrderPage } from '@/tests/pages/order/OrderPage';
import type { CheckoutData } from '@/tests/pages/order/OrderPage';
import { TEST_USER_DATA } from '@/tests/constants/test-data';

// Helper class for order test operations
export class OrderTestHelpers {
  constructor(
    private homePage: HomePage,
    private cartPage: CartPage,
    private orderPage: OrderPage,
  ) {}

  async addProductsToCart(products: string[]): Promise<void> {
    for (const product of products) {
      await this.homePage.addToCart(product);
    }
  }

  async navigateToCheckout(): Promise<void> {
    await this.cartPage.clickCartIcon();
    await this.cartPage.checkout();
  }

  async setupCheckoutWithProducts(products: string[]): Promise<void> {
    await this.addProductsToCart(products);
    await this.navigateToCheckout();
  }

  async completeCheckoutProcess(userData: CheckoutData = TEST_USER_DATA.VALID): Promise<void> {
    await this.orderPage.completeCheckoutFlow(userData);
  }

  async completeCheckoutToOverview(userData: CheckoutData = TEST_USER_DATA.VALID): Promise<void> {
    await this.orderPage.completeCheckoutFlowToOverview(userData);
  }

  async verifyFormValidationError(expectedError: string): Promise<void> {
    await this.orderPage.verifyFormValidationError(expectedError);
  }

  async verifySuccessfulCheckout(): Promise<void> {
    await this.orderPage.verifySuccessfulCheckout();
  }

  async verifyCartBadgeCount(expectedCount: number): Promise<void> {
    await this.orderPage.verifyCartBadgeCount(expectedCount);
  }

  async verifyCartIsEmpty(): Promise<void> {
    await this.orderPage.verifyCartBadgeNotVisible();
  }
}

// Factory function to create test helpers
export function createOrderTestHelpers(
  homePage: HomePage,
  cartPage: CartPage,
  orderPage: OrderPage,
): OrderTestHelpers {
  return new OrderTestHelpers(homePage, cartPage, orderPage);
}
