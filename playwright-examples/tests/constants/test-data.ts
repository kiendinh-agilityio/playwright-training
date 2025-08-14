export const TEST_USER_DATA = {
  VALID: { firstName: 'John', lastName: 'Doe', zipCode: '5000' },
  EMPTY_FIRST_NAME: { firstName: '', lastName: 'Doe', zipCode: '5000' },
  EMPTY_LAST_NAME: { firstName: 'John', lastName: '', zipCode: '5000' },
  EMPTY_ZIP_CODE: { firstName: 'John', lastName: 'Doe', zipCode: '' },
};

export const EXPECTED_SUBTOTALS = {
  BACKPACK_AND_BIKE_LIGHT: '39.98', // 29.99 + 9.99
  THREE_ITEMS: '55.97', // 29.99 + 9.99 + 15.99
};

export const PRODUCT_DATA = {
  BACKPACK: 'Sauce Labs Backpack',
  BIKE_LIGHT: 'Sauce Labs Bike Light',
  T_SHIRT: 'Sauce Labs Bolt T-Shirt',
};
