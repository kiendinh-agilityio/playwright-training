import { FrameLocator, Locator, Page, expect } from '@playwright/test';
import { IFRAME_SELECTORS } from '@/constants';
import { TableHelper } from '@/utils/table';

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
    const row = this.frame
      .getByRole('table')
      .locator('tbody tr.row-handle')
      .filter({ hasText: email })
      .first();

    await expect(row).toBeVisible({ timeout: 30000 });
    await row.click();

    await expect(this.frame.getByRole('heading', { name: /edit\s*users\s*record/i })).toBeVisible({
      timeout: 30000,
    });
  }

  async openRecordForEditById(id: string) {
    const table = new TableHelper(this.frame);
    await table.waitForTableToLoad();

    const row = this.frame
      .getByRole('table')
      .locator('tbody tr.row-handle')
      .filter({ hasText: id })
      .first();
    await expect(row).toBeVisible({ timeout: 30000 });
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

  async saveChanges() {
    await this.saveChangesButton.click();
  }

  async selectRowsBy(users: { id: string; email: string }[], mode: 'email' | 'id') {
    const tableHelper = new TableHelper(this.frame);
    await tableHelper.selectRowsByUsers(users, mode);
  }

  async clickDeleteSelected() {
    const deleteButton = this.frame.getByRole('button', { name: 'Delete selected' });
    await expect(deleteButton).toBeVisible({ timeout: 30000 });
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();
  }

  async confirmDeletion(confirmationRegex: RegExp) {
    const dialog = this.frame.getByText(confirmationRegex);
    await expect(dialog).toBeVisible();
    const yesButton = this.frame.getByRole('button', { name: 'Yes' });
    await expect(yesButton).toBeVisible();
    await yesButton.click();
  }

  async verifyDeletionToast(toast: string | RegExp) {
    if (typeof toast === 'string') {
      await this.frame.getByText(toast).isVisible();
    } else {
      await expect(this.frame.getByText(toast)).toBeVisible({ timeout: 8000 });
    }
  }
}
