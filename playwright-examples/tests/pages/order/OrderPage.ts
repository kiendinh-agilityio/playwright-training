import { expect, type Locator, type Page } from '@playwright/test';
import { SELECTORS } from '@/tests/constants/selectors';
import { URLS } from '@/tests/constants/routes';
import { TEXTS, TEST_IDS } from '@/tests/constants';

export interface CheckoutData {
  firstName: string;
  lastName: string;
  zipCode: string;
}

export class OrderPage {
  private readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly zipCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly errorIcons: Locator;
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelOverviewButton: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly ponyExpressImage: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = this.page.getByTestId(TEST_IDS.FIRST_NAME);
    this.lastNameInput = this.page.getByTestId(TEST_IDS.LAST_NAME);
    this.zipCodeInput = this.page.getByTestId(TEST_IDS.POSTAL_CODE);
    this.continueButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.CONTINUE });
    this.cancelButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.CANCEL });
    this.errorMessage = this.page.getByTestId(TEST_IDS.ERROR);
    this.errorIcons = this.page.locator(SELECTORS.ERROR_ICON);
    this.pageTitle = this.page.locator(SELECTORS.TITLE);
    this.cartItems = this.page.locator(SELECTORS.CART_ITEM);
    this.subtotalLabel = this.page.locator(SELECTORS.SUMMARY_SUBTOTAL);
    this.taxLabel = this.page.locator(SELECTORS.SUMMARY_TAX);
    this.totalLabel = this.page.locator(SELECTORS.SUMMARY_TOTAL);
    this.finishButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.FINISH });
    this.cancelOverviewButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.CANCEL });
    this.completeHeader = this.page.locator(SELECTORS.COMPLETE_HEADER);
    this.completeText = this.page.locator(SELECTORS.COMPLETE_TEXT);
    this.backHomeButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.BACK_HOME });
    this.ponyExpressImage = this.page.locator(SELECTORS.PONY_EXPRESS);
    this.cartBadge = this.page.locator(SELECTORS.CART_BADGE);
  }

  // Navigation methods
  async navigateToCheckoutStepOne(): Promise<void> {
    await this.page.goto(URLS.CHECKOUT_STEP_ONE);
  }

  async navigateToCheckoutStepTwo(): Promise<void> {
    await this.page.goto(URLS.CHECKOUT_STEP_TWO);
  }

  async navigateToCheckoutComplete(): Promise<void> {
    await this.page.goto(URLS.CHECKOUT_COMPLETE);
  }

  // Form filling methods
  async fillCheckoutInformation(
    firstName: string,
    lastName: string,
    zipCode: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.zipCodeInput.fill(zipCode);
  }

  async fillCheckoutInformationWithData(data: CheckoutData): Promise<void> {
    await this.fillCheckoutInformation(data.firstName, data.lastName, data.zipCode);
  }

  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async backToHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  async cancelCheckout(): Promise<void> {
    await this.cancelButton.click();
  }

  async cancelOverview(): Promise<void> {
    await this.cancelOverviewButton.click();
  }

  // Complete checkout flow helper methods
  async completeCheckoutFlow(checkoutData: CheckoutData): Promise<void> {
    await this.fillCheckoutInformationWithData(checkoutData);
    await this.continueToOverview();
    await this.finishOrder();
  }

  async completeCheckoutFlowToOverview(checkoutData: CheckoutData): Promise<void> {
    await this.fillCheckoutInformationWithData(checkoutData);
    await this.continueToOverview();
  }

  // Verification methods
  async verifyCurrentUrl(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.pageTitle).toHaveText(expectedTitle);
  }

  async verifyCheckoutStepOnePage(): Promise<void> {
    await this.verifyCurrentUrl(URLS.CHECKOUT_STEP_ONE);
    await this.verifyPageTitle(TEXTS.TITLES.CHECKOUT_INFORMATION);
  }

  async verifyCheckoutStepTwoPage(): Promise<void> {
    await this.verifyCurrentUrl(URLS.CHECKOUT_STEP_TWO);
    await this.verifyPageTitle(TEXTS.TITLES.CHECKOUT_OVERVIEW);
  }

  async verifyCheckoutCompletePage(): Promise<void> {
    await this.verifyCurrentUrl(URLS.CHECKOUT_COMPLETE);
    await this.verifyPageTitle(TEXTS.TITLES.CHECKOUT_COMPLETE);
  }

  async verifyCompleteHeader(expectedText: string): Promise<void> {
    await expect(this.page.getByText(expectedText, { exact: true })).toBeVisible();
  }

  async verifyCompleteText(expectedText: string): Promise<void> {
    await expect(this.page.getByText(expectedText, { exact: true })).toBeVisible();
  }

  async verifyCartBadgeNotVisible(): Promise<void> {
    await expect(this.cartBadge).not.toBeVisible();
  }

  async verifyCartBadgeCount(expectedCount: number): Promise<void> {
    if (expectedCount === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(expectedCount.toString());
    }
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }

  async verifyErrorIconsVisible(): Promise<void> {
    await expect(this.errorIcons).toHaveCount(3);
  }

  async verifyFormFieldsEmpty(): Promise<void> {
    await expect(this.firstNameInput).toHaveValue('');
    await expect(this.lastNameInput).toHaveValue('');
    await expect(this.zipCodeInput).toHaveValue('');
  }

  async verifyFormFieldsFilled(
    firstName: string,
    lastName: string,
    zipCode: string,
  ): Promise<void> {
    await expect(this.firstNameInput).toHaveValue(firstName);
    await expect(this.lastNameInput).toHaveValue(lastName);
    await expect(this.zipCodeInput).toHaveValue(zipCode);
  }

  async verifyFormFieldsFilledWithData(data: CheckoutData): Promise<void> {
    await this.verifyFormFieldsFilled(data.firstName, data.lastName, data.zipCode);
  }

  async verifyCartItemsInOverview(expectedItems: string[]): Promise<void> {
    await expect(this.cartItems).toHaveCount(expectedItems.length);

    for (const itemName of expectedItems) {
      await expect(this.cartItems.filter({ has: this.page.getByText(itemName) })).toBeVisible();
    }
  }

  async verifySummaryInformation(): Promise<void> {
    await expect(this.page.getByText(TEXTS.SUMMARY_LABELS.ITEM_TOTAL_VISIBLE)).toBeVisible();
    await expect(this.page.getByText(TEXTS.SUMMARY_LABELS.TAX_VISIBLE)).toBeVisible();
    await expect(this.page.getByText(TEXTS.SUMMARY_LABELS.TOTAL_VISIBLE)).toBeVisible();
  }

  async verifyPonyExpressImageVisible(): Promise<void> {
    await expect(this.ponyExpressImage).toBeVisible();
  }

  // Form validation helper methods
  async verifyFormValidationError(expectedError: string): Promise<void> {
    await this.verifyErrorMessage(expectedError);
    await this.verifyErrorIconsVisible();
    await this.verifyCheckoutStepOnePage();
  }

  async verifySuccessfulCheckout(): Promise<void> {
    await this.verifyCheckoutCompletePage();
    await this.verifyCompleteHeader(TEXTS.MESSAGES.CHECKOUT_COMPLETE_HEADER);
    await this.verifyCompleteText(TEXTS.MESSAGES.CHECKOUT_COMPLETE_TEXT);
    await this.verifyPonyExpressImageVisible();
    await expect(this.backHomeButton).toBeVisible();
  }

  // Utility methods
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getCartBadgeCount(): Promise<number> {
    const badge = this.cartBadge;
    const count = await badge.count();
    if (count === 0) return 0;
    const text = await badge.textContent();
    return Number(text ?? 0);
  }

  async getAllCartItemNames(): Promise<string[]> {
    const itemNames = await this.page.locator(SELECTORS.INVENTORY_ITEM_NAME).allTextContents();
    return itemNames.map((name) => name.trim());
  }

  async getSubtotalAmount(): Promise<string> {
    const text = await this.subtotalLabel.textContent();
    return text?.replace(TEXTS.SUMMARY_LABELS.ITEM_TOTAL_PREFIX, '') || '';
  }

  async getTaxAmount(): Promise<string> {
    const text = await this.taxLabel.textContent();
    return text?.replace(TEXTS.SUMMARY_LABELS.TAX_PREFIX, '') || '';
  }

  async getTotalAmount(): Promise<string> {
    const text = await this.totalLabel.textContent();
    return text?.replace(TEXTS.SUMMARY_LABELS.TOTAL_PREFIX, '') || '';
  }

  // Price calculation helper
  async verifyExpectedSubtotal(expectedSubtotal: string): Promise<void> {
    const actualSubtotal = await this.getSubtotalAmount();
    expect(actualSubtotal).toBe(expectedSubtotal);
  }
}
