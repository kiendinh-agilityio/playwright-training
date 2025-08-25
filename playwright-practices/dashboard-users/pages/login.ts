import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { BASE_URL, BREADCRUMBS, IFRAME_SELECTORS } from '@/constants';

export class LoginPage {
  readonly page: Page;
  readonly frame: FrameLocator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly breadcrumbUsers: Locator;

  constructor(page: Page) {
    this.page = page;
    this.frame = page.frameLocator(IFRAME_SELECTORS.DASHBOARD);
    this.emailInput = this.frame.getByRole('textbox', { name: 'Email *' });
    this.passwordInput = this.frame.getByRole('textbox', { name: 'Password *' });
    this.loginButton = this.frame.getByRole('button', { name: 'Login' });
    this.breadcrumbUsers = this.frame.getByRole('main').getByText(BREADCRUMBS.USERS);
  }

  async goto() {
    await this.page.goto(BASE_URL);
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async assertLoginSuccess() {
    await expect(this.breadcrumbUsers).toBeVisible();
  }

  async assertInvalidCredentials() {
    await expect(this.frame.getByText('Invalid login credentials')).toBeVisible();
  }

  async assertEmptyFieldValidation() {
    const emailValidation = await this.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );

    expect(emailValidation.toLowerCase()).toContain('fill out');
  }
}
