import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { BASE_URL, IFRAME_SELECTORS } from '@/constants';

export class LoginPage {
  readonly page: Page;
  readonly frame: FrameLocator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.frame = page.frameLocator(IFRAME_SELECTORS.DASHBOARD);
    this.emailInput = this.frame.getByRole('textbox', { name: 'Email *' });
    this.passwordInput = this.frame.getByRole('textbox', { name: 'Password *' });
    this.loginButton = this.frame.getByRole('button', { name: 'Login' });
    this.heading = this.frame.getByRole('heading', { name: 'Superuser login' });
  }

  async goto() {
    await this.page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await this.page
      .locator(IFRAME_SELECTORS.DASHBOARD)
      .waitFor({ state: 'visible', timeout: 20000 });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async assertInvalidCredentials() {
    await expect(this.frame.getByText('Invalid login credentials')).toBeVisible();
  }

  async assertEmptyFieldValidation() {
    const emailValidation = await this.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );

    expect(emailValidation.toLowerCase()).toMatch(/(please )?fill out this field/);
  }

  async assertHeadingVisible() {
    await expect(this.heading).toBeVisible();
  }
}
