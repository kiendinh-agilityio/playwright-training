# Playwright Training Example

## Overview

This is a sample project for Playwright training, demonstrating how to use Playwright for end-to-end testing of the [pocketbase](https://pocketbase.io/demo/) web application.

## Features scope

- Verify that the user is able to log in successfully
- Verify that the user failed to log in with the wrong email or password
- Verify that the user failed to log in with the empty inputs
- Verify that the user can view the user list from the User page
- Verify that a user can add a new user to the table successfully
- Verify that user can't add new users with empty inputs
- Verify that a user can edit user to the table successfully
- Verify that user can remove user table successfully
- Verify that user can remove multiple users to the table successfully
- Verify that user can search user items
- Verify that user can sort user items by column
- Verify that user is able to logout successfully

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
