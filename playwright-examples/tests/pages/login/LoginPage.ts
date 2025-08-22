import { expect, type Locator, type Page } from '@playwright/test';
import { SELECTORS, PATHS, MATCHERS, CREDENTIALS, TEXTS, TEST_IDS } from '@/tests/constants';

export class LoginPage {
  private readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly headingLogo: Locator;
  readonly errorMessage: Locator;
  readonly errorIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = this.page.getByPlaceholder(TEXTS.PLACEHOLDERS.USERNAME);
    this.passwordInput = this.page.getByPlaceholder(TEXTS.PLACEHOLDERS.PASSWORD);
    this.loginButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.LOGIN });
    this.headingLogo = this.page.getByText(TEXTS.TITLES.APP);
    this.errorMessage = this.page.getByTestId(TEST_IDS.ERROR);
    this.errorIcon = this.page.locator(SELECTORS.ERROR_ICON);
  }

  // Actions
  async goto(): Promise<void> {
    await this.page.goto(PATHS.ROOT);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAsStandardUser(): Promise<void> {
    const authConfig = CREDENTIALS.STANDARD_USER;
    await this.login(authConfig.username, authConfig.password);
    await expect(this.page).toHaveURL(MATCHERS.INVENTORY);
  }

  async loginAsInvalidUser(): Promise<void> {
    const authConfig = CREDENTIALS.INVALID_USERNAME;
    await this.login(authConfig.username, authConfig.password);
  }

  async clickLoginWithEmptyInputs(): Promise<void> {
    await this.loginButton.click();
  }

  // Verifications
  async expectPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(TEXTS.TITLES.APP);
  }

  async expectHeadingLogoVisible(): Promise<void> {
    await expect(this.headingLogo).toBeVisible();
  }

  async expectHeadingLogoText(): Promise<void> {
    await expect(this.headingLogo).toHaveText(TEXTS.TITLES.APP);
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectErrorText(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(expectedText);
  }

  async expectErrorIconCount(count: number): Promise<void> {
    await expect(this.errorIcon).toHaveCount(count);
  }
}
