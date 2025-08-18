export const TEST_IDS = {
  ERROR: 'error',
  USERNAME: 'username',
  PASSWORD: 'password',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  POSTAL_CODE: 'postalCode',
  PRODUCT_SORT: 'product-sort-container',
} as const;

export type TestIdKey = keyof typeof TEST_IDS;
