import { FrameLocator, Locator, Page, expect } from '@playwright/test';
import { IFRAME_SELECTORS } from '@/constants';

export class UsersPage {
  readonly frame: FrameLocator;
  readonly newRecordButton: Locator;
  readonly modalTitle: Locator;
  readonly createButton: Locator;
  readonly saveChangesButton: Locator;
  readonly emailField: Locator;
  readonly usernameField: Locator;
  readonly nameField: Locator;
  readonly passwordField: Locator;
  readonly passwordConfirmField: Locator;

  constructor(page: Page) {
    this.frame = page.frameLocator(IFRAME_SELECTORS.DASHBOARD);
    this.newRecordButton = this.frame.getByRole('button', { name: /new\s*record/i });
    this.modalTitle = this.frame.getByRole('heading', {
      name: /new\s*users\s*record|edit\s*users\s*record/i,
    });
    this.createButton = this.frame.getByRole('button', { name: 'Create' });
    this.saveChangesButton = this.frame.getByRole('button', {
      name: 'Save changes',
    });
    this.emailField = this.frame.getByRole('textbox', { name: /email\s*\*/i }).first();
    this.usernameField = this.frame.getByRole('textbox', { name: /username/i }).first();
    this.nameField = this.frame.getByRole('textbox', { name: /\bname\b/i }).first();
    this.passwordField = this.frame.getByRole('textbox', { name: /password\s*\*/i }).first();
    this.passwordConfirmField = this.frame
      .getByRole('textbox', { name: /password\s*confirm\s*\*/i })
      .first();
  }

  async openCreateModal() {
    await this.newRecordButton.click();
    await expect(this.frame.getByRole('heading', { name: /new\s*users\s*record/i })).toBeVisible({
      timeout: 15000,
    });
  }

  private async fillFormField(field: Locator, value: string | undefined) {
    if (value !== undefined) {
      await field.scrollIntoViewIfNeeded();
      await field.fill(value);
    }
  }

  async fillCreateUserForm(data: {
    email?: string;
    username?: string;
    name?: string;
    password?: string;
    passwordConfirm?: string;
  }) {
    await this.fillFormField(this.emailField, data.email);
    await this.fillFormField(this.usernameField, data.username);
    await this.fillFormField(this.nameField, data.name);
    await this.fillFormField(this.passwordField, data.password);
    await this.fillFormField(this.passwordConfirmField, data.passwordConfirm);
  }

  async submitCreate() {
    await this.createButton.click();
  }

  async openRecordForEditByEmail(email: string) {
    const row = this.frame.getByRole('table').getByRole('row').filter({ hasText: email }).first();
    await row.scrollIntoViewIfNeeded();
    await row.click();
    await expect(this.frame.getByRole('heading', { name: /edit\s*users\s*record/i })).toBeVisible({
      timeout: 30000,
    });
  }

  async updateUserFields(data: { email?: string }) {
    if (data.email !== undefined) {
      await expect(
        this.frame.getByRole('heading', { name: /edit\s*users\s*record/i }),
      ).toBeVisible();
      await this.emailField.scrollIntoViewIfNeeded();
      await this.emailField.click();
      await this.emailField.fill(data.email);
      await this.emailField.press('Tab');
      await this.frame.locator('body').waitFor({ timeout: 5000 });
    }
  }

  async waitForSaveChangesButtonEnabled(timeout: number = 30000) {
    await expect(this.saveChangesButton).toBeEnabled({ timeout });
  }

  async saveChanges() {
    await this.waitForSaveChangesButtonEnabled();
    await this.saveChangesButton.click();
  }
}
