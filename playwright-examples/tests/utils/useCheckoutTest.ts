import { expect, type Page } from '@playwright/test';
import { PRODUCT_DATA, TEST_USER_DATA } from '@/tests/constants';
import type { HomePage, OrderPage } from '@/tests/pages/index';

export namespace CheckoutTypes {
  export type Product = (typeof PRODUCT_DATA)[keyof typeof PRODUCT_DATA];
  export type UserData = (typeof TEST_USER_DATA)[keyof typeof TEST_USER_DATA];
}

export const useCheckoutTest = (orderPage: OrderPage, homePage: HomePage, page: Page) => {
  return {
    async setupCheckoutWithProducts(products: CheckoutTypes.Product[] = [PRODUCT_DATA.BACKPACK]) {
      for (const product of products) {
        await homePage.addToCart(product.NAME);
      }
      await homePage.goToCart();
      await orderPage.navigateToCheckoutStepOne();
    },

    async completeCheckoutProcess(userData: CheckoutTypes.UserData = TEST_USER_DATA.VALID) {
      await orderPage.completeCheckoutFlow(userData);
    },

    async completeCheckoutToOverview(userData: CheckoutTypes.UserData = TEST_USER_DATA.VALID) {
      await orderPage.completeCheckoutFlowToOverview(userData);
    },

    async setupAndGoToOverview(products: CheckoutTypes.Product[] = [PRODUCT_DATA.BACKPACK]) {
      await this.setupCheckoutWithProducts(products);
      await this.completeCheckoutToOverview();
    },

    async setupAndFillForm(products: CheckoutTypes.Product[], userData: CheckoutTypes.UserData) {
      await this.setupCheckoutWithProducts(products);
      await orderPage.fillCheckoutInformationWithData(userData);
      await orderPage.continueToOverview();
    },

    async verifyFormError(errorMessage: string) {
      await orderPage.verifyFormValidationError(errorMessage);
    },

    async verifyCancel(expectedUrl: string | RegExp, expectedTitle: string, expectedBadge: string) {
      await expect(page).toHaveURL(expectedUrl);
      await expect(page.locator('.title')).toHaveText(expectedTitle);
      await expect(homePage.cartBadge()).toHaveText(expectedBadge);
    },

    async verifySuccessfulCheckout() {
      await orderPage.verifySuccessfulCheckout();
    },

    async verifyCartBadgeCount(count: number) {
      await orderPage.verifyCartBadgeCount(count);
    },

    async verifyCartIsEmpty() {
      await orderPage.verifyCartBadgeNotVisible();
    },
  };
};
