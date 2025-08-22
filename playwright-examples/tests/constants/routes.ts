export const BASE_URL = 'https://www.saucedemo.com/';

export const PATHS = {
  ROOT: '/',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
};

export const URLS = {
  ROOT: BASE_URL,
  INVENTORY: `${BASE_URL}inventory.html`,
  CART: `${BASE_URL}cart.html`,
  CHECKOUT_STEP_ONE: `${BASE_URL}checkout-step-one.html`,
  CHECKOUT_STEP_TWO: `${BASE_URL}checkout-step-two.html`,
  CHECKOUT_COMPLETE: `${BASE_URL}checkout-complete.html`,
};

export const MATCHERS = {
  ROOT: /.*\/$/,
  INVENTORY: /.*inventory\.html$/,
  CART: /.*cart\.html$/,
  CHECKOUT_STEP_ONE: /.*checkout-step-one\.html$/,
  CHECKOUT_STEP_TWO: /.*checkout-step-two\.html$/,
  CHECKOUT_COMPLETE: /.*checkout-complete\.html$/,
  SAUCELABS: /.*saucelabs\.com.*/,
};
