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
  BACKPACK: {
    NAME: 'Sauce Labs Backpack',
    PRICE: '29.99',
    DESCRIPTION:
      'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.',
  },
  BIKE_LIGHT: {
    NAME: 'Sauce Labs Bike Light',
    PRICE: '9.99',
    DESCRIPTION:
      "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
  },
  T_SHIRT: {
    NAME: 'Sauce Labs Bolt T-Shirt',
    PRICE: '15.99',
    DESCRIPTION:
      'Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.',
  },
};

export const TIMEOUTS = {
  SELECTOR: 10000,
  ADDITIONAL_WAIT: 2000,
};

export const AUTH_PATHS = {
  USER_STORAGE: 'playwright/.auth/user.json',
};

export const WAIT_STATES = {
  NETWORK_IDLE: 'networkidle',
} as const;
