import { expect, type Page } from '@playwright/test';
import { PRODUCT_DATA, TEST_USER_DATA } from '@/tests/constants';
import type { OrderPage, HomePage } from '@/tests/pages/index';
import { createOrderTestHelpers } from '@/tests/utils/order-test-helpers';

type Helpers = ReturnType<typeof createOrderTestHelpers>;

export namespace CheckoutTypes {
  export type Product = (typeof PRODUCT_DATA)[keyof typeof PRODUCT_DATA];
  export type UserData = (typeof TEST_USER_DATA)[keyof typeof TEST_USER_DATA];
}

export const useCheckoutTest = (
  helpers: Helpers,
  orderPage: OrderPage,
  homePage: HomePage,
  page: Page,
) => {
  return {
    async setupAndGoToOverview(products: CheckoutTypes.Product[] = [PRODUCT_DATA.BACKPACK]) {
      await helpers.setupCheckoutWithProducts(products);
      await helpers.completeCheckoutToOverview();
    },

    async setupAndFillForm(products: CheckoutTypes.Product[], userData: CheckoutTypes.UserData) {
      await helpers.setupCheckoutWithProducts(products);
      await orderPage.fillCheckoutInformationWithData(userData);
      await orderPage.continueToOverview();
    },

    async verifyFormError(errorMessage: string) {
      await helpers.verifyFormValidationError(errorMessage);
    },

    async verifyCancel(expectedUrl: string | RegExp, expectedTitle: string, expectedBadge: string) {
      await expect(page).toHaveURL(expectedUrl);
      await expect(page.locator('.title')).toHaveText(expectedTitle);
      await expect(homePage.cartBadge()).toHaveText(expectedBadge);
    },
  };
};
