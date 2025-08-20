# Playwright Training Example

## Overview

This is a sample project for Playwright training, demonstrating how to use Playwright for end-to-end testing of the [saucedemo](https://www.saucedemo.com/) web application.

## Features scope

- Verify that the user is able to log in successfully
- Verify that the user failed to log in with the wrong username
- Verify that the user failed to log in with the empty inputs
- Verify that user can add product to cart from the Home page
- Verify that user can remove products to the cart from the Home page
- Verify that user can sort product items by price
- Verify that the user stays on the home page when clicking "All Items" in the menu sidebar
- Verify that the user navigates to a new site [saucelabs](https://saucelabs.com/)
- Verify that user is able to logout successfully
- Verify that the user can see all the products added to the cart
- Verify that user can remove cart item in Cart page
- Verify that the user can check out successfully which products added to the cart
- Verify that user can't checkout with empty inputs

## Setup environment

1. Make sure you install packages with correct version below:

- node v20.18.0
- npm 10.8.2

2. Redirect to folder

```
cd playwright-examples
```

3. Install Dependencies

```
pnpm install
```

## Ways to use

1. Run all Tests

```
npx playwright test
```

2. Run Tests by file

```
npx playwright test cart.spec.ts
```

3. Run Tests with UI mode

```
npx playwright test --ui
```

4. Debug Tests

```
npx playwright test --debug
```

5. View HTML Report

```
npx playwright show-report
```
