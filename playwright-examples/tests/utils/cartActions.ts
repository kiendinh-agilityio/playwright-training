import { HomePage, CartPage } from '@/tests/pages/index';

export async function addMultipleProducts(homePage: HomePage, products: string[]) {
  for (const product of products) {
    await homePage.addToCart(product);
  }
}

export async function verifyProductsInCart(cartPage: CartPage, products: string[]) {
  await cartPage.verifyCartItemCount(products.length);

  for (const product of products) {
    await cartPage.verifyItemExists(product);
  }

  await cartPage.verifyCartBadgeCount(products.length);
}
