import { expect, type Locator, type Page } from '@playwright/test';
import { SELECTORS } from '@/tests/constants/selectors';
import { URLS } from '@/tests/constants/routes';
import { TEXTS } from '@/tests/constants/texts';

export interface CheckoutData {
  firstName: string;
  lastName: string;
  zipCode: string;
}

export class OrderPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Checkout Step One - Your Information Page
  get firstNameInput(): Locator {
    return this.page.locator(SELECTORS.FIRST_NAME);
  }

  get lastNameInput(): Locator {
    return this.page.locator(SELECTORS.LAST_NAME);
  }

  get zipCodeInput(): Locator {
    return this.page.locator(SELECTORS.POSTAL_CODE);
  }

  get continueButton(): Locator {
    return this.page.getByRole('button', { name: TEXTS.BUTTONS.CONTINUE });
  }

  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: TEXTS.BUTTONS.CANCEL });
  }

  get errorMessage(): Locator {
    return this.page.locator(SELECTORS.ERROR_MESSAGE);
  }

  get errorIcons(): Locator {
    return this.page.locator(SELECTORS.ERROR_ICON);
  }

  // Checkout Step Two - Overview Page
  get pageTitle(): Locator {
    return this.page.locator(SELECTORS.TITLE);
  }

  get cartItems(): Locator {
    return this.page.locator(SELECTORS.CART_ITEM);
  }

  get subtotalLabel(): Locator {
    return this.page.locator(SELECTORS.SUMMARY_SUBTOTAL);
  }

  get taxLabel(): Locator {
    return this.page.locator(SELECTORS.SUMMARY_TAX);
  }

  get totalLabel(): Locator {
    return this.page.locator(SELECTORS.SUMMARY_TOTAL);
  }

  get finishButton(): Locator {
    return this.page.getByRole('button', { name: TEXTS.BUTTONS.FINISH });
  }

  get cancelOverviewButton(): Locator {
    return this.page.getByRole('button', { name: TEXTS.BUTTONS.CANCEL });
  }

  // Checkout Complete Page
  get completeHeader(): Locator {
    return this.page.locator(SELECTORS.COMPLETE_HEADER);
  }

  get completeText(): Locator {
    return this.page.locator(SELECTORS.COMPLETE_TEXT);
  }

  get backHomeButton(): Locator {
    return this.page.getByRole('button', { name: TEXTS.BUTTONS.BACK_HOME });
  }

  get ponyExpressImage(): Locator {
    return this.page.locator(SELECTORS.PONY_EXPRESS);
  }

  // Cart badge (for verification after checkout)
  get cartBadge(): Locator {
    return this.page.locator(SELECTORS.CART_BADGE);
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
    await expect(this.completeHeader).toHaveText(expectedText);
  }

  async verifyCompleteText(expectedText: string): Promise<void> {
    await expect(this.completeText).toHaveText(expectedText);
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
      await expect(
        this.page.locator('.cart_item').filter({ has: this.page.getByText(itemName) }),
      ).toBeVisible();
    }
  }

  async verifySummaryInformation(): Promise<void> {
    await expect(this.subtotalLabel).toBeVisible();
    await expect(this.taxLabel).toBeVisible();
    await expect(this.totalLabel).toBeVisible();
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
    const itemNames = await this.page.locator('.inventory_item_name').allTextContents();
    return itemNames.map((name) => name.trim());
  }

  async getSubtotalAmount(): Promise<string> {
    const text = await this.subtotalLabel.textContent();
    return text?.replace('Item total: $', '') || '';
  }

  async getTaxAmount(): Promise<string> {
    const text = await this.taxLabel.textContent();
    return text?.replace('Tax: $', '') || '';
  }

  async getTotalAmount(): Promise<string> {
    const text = await this.totalLabel.textContent();
    return text?.replace('Total: $', '') || '';
  }

  // Price calculation helper
  async verifyExpectedSubtotal(expectedSubtotal: string): Promise<void> {
    const actualSubtotal = await this.getSubtotalAmount();
    expect(actualSubtotal).toBe(expectedSubtotal);
  }
}
