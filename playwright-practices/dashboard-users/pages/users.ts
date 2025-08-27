import { FrameLocator, Locator, Page, expect } from '@playwright/test';
import { IFRAME_SELECTORS } from '@/constants';

export class UsersPage {
  readonly frame: FrameLocator;
  readonly newRecordButton: Locator;
  readonly modalTitle: Locator;
  readonly createButton: Locator;
  readonly saveChangesButton: Locator;
  readonly editRecordButton: Locator;
  readonly recordPanel: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly passwordConfirmField: Locator;
  readonly usernameField: Locator;
  readonly nameField: Locator;

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
    this.editRecordButton = this.frame.getByRole('button', { name: /edit\s*record/i });
    this.recordPanel = this.frame
      .locator('.overlay-panel.record-panel')
      .filter({ has: this.frame.getByRole('heading', { name: /users\s*record/i }) })
      .first();
    this.emailField = this.recordPanel.getByRole('textbox', { name: /email\s*\*/i });
    this.passwordField = this.recordPanel.getByRole('textbox', { name: /password\s*\*/i }).first();
    this.passwordConfirmField = this.recordPanel.getByRole('textbox', {
      name: /password\s*confirm\s*\*/i,
    });
    this.usernameField = this.recordPanel.getByRole('textbox', { name: /username/i });
    this.nameField = this.recordPanel.getByRole('textbox', { name: /\bname\b/i }).first();
  }

  async gotoCollection() {
    await expect(this.frame.getByRole('table')).toBeVisible();
  }

  async openCreateModal() {
    await this.newRecordButton.click();
    await expect(this.frame.getByRole('heading', { name: /new\s*users\s*record/i })).toBeVisible({
      timeout: 15000,
    });
  }

  async fillCreateUserForm(data: {
    email?: string;
    username?: string;
    name?: string;
    password?: string;
    passwordConfirm?: string;
  }) {
    if (data.email !== undefined) {
      await this.emailField.scrollIntoViewIfNeeded();
      await this.emailField.fill(data.email);
    }
    if (data.username !== undefined) {
      await this.usernameField.scrollIntoViewIfNeeded();
      await this.usernameField.fill(data.username);
    }
    if (data.name !== undefined) {
      await this.nameField.scrollIntoViewIfNeeded();
      await this.nameField.fill(data.name);
    }
    if (data.password !== undefined) {
      await this.passwordField.scrollIntoViewIfNeeded();
      await this.passwordField.fill(data.password);
    }
    if (data.passwordConfirm !== undefined) {
      await this.passwordConfirmField.scrollIntoViewIfNeeded();
      await this.passwordConfirmField.fill(data.passwordConfirm);
    }
  }

  async submitCreate() {
    await this.createButton.click();
  }

  async openRecordForEditByEmail(email: string) {
    const row = this.frame.getByRole('table').getByRole('row').filter({ hasText: email }).first();
    await row.scrollIntoViewIfNeeded();
    const emailCell = row
      .getByRole('cell', { name: new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
      .first();
    await emailCell.click({ trial: true }).catch(() => {});
    await emailCell.click().catch(() => {});

    const editHeading = this.frame.getByRole('heading', { name: /edit\s*users\s*record/i });
    const viewHeading = this.frame.getByRole('heading', { name: /users\s*record/i });

    if (
      !(await editHeading.isVisible().catch(() => false)) &&
      !(await viewHeading.isVisible().catch(() => false))
    ) {
      await row.evaluate((el) => (el as HTMLElement).click());
    }

    await viewHeading.waitFor({ timeout: 15000 }).catch(() => {});
    if (!(await editHeading.isVisible().catch(() => false))) {
      await this.editRecordButton.waitFor({ state: 'visible' });
      await this.editRecordButton.click();
    }
    await expect(this.frame.getByRole('heading', { name: /edit\s*users\s*record/i })).toBeVisible({
      timeout: 15000,
    });
  }

  async updateUserFields(data: { email?: string }) {
    if (data.email !== undefined) {
      const activePanel = this.frame
        .locator('.overlay-panel.record-panel')
        .filter({
          has: this.frame.getByRole('heading', { name: /edit\s*users\s*record/i }),
        })
        .first();

      await activePanel.waitFor({ state: 'visible', timeout: 10000 });

      const email = activePanel.getByRole('textbox', { name: /email\s*\*/i }).first();
      await email.scrollIntoViewIfNeeded();
      await email.click();
      await email.clear();
      await email.fill(data.email);
      await email.press('Tab');

      await this.frame.locator('body').waitFor({ timeout: 20000 });

      const isButtonEnabled = await this.saveChangesButton.isEnabled();
      if (!isButtonEnabled) {
        await this.enableSaveChangesButton();
      }
    }
  }

  async waitForSaveChangesButtonEnabled(timeout: number = 30000) {
    await expect(this.saveChangesButton).toBeEnabled({ timeout });
  }

  async enableSaveChangesButton() {
    const activePanel = this.frame
      .locator('.overlay-panel.record-panel')
      .filter({
        has: this.frame.getByRole('heading', { name: /edit\s*users\s*record/i }),
      })
      .first();

    await activePanel.waitFor({ state: 'visible', timeout: 10000 });

    const emailField = activePanel.getByRole('textbox', { name: /email\s*\*/i }).first();
    await emailField.scrollIntoViewIfNeeded();

    const currentEmail = await emailField.inputValue();
    let modifiedEmail = currentEmail;

    if (currentEmail && currentEmail.length > 0) {
      modifiedEmail = currentEmail + 'x';
    } else {
      modifiedEmail = 'test@example.com';
    }

    await emailField.click();
    await emailField.clear();
    await emailField.fill(modifiedEmail);
    await emailField.press('Tab');

    await this.frame.locator('body').waitFor({ timeout: 5000 });
    await expect(this.saveChangesButton).toBeEnabled({ timeout: 10000 });
  }

  async saveChanges() {
    let isDisabled = await this.saveChangesButton.isDisabled();

    if (isDisabled) {
      await this.enableSaveChangesButton();
      isDisabled = await this.saveChangesButton.isDisabled();

      if (isDisabled) {
        await this.enableSaveChangesButton();
      }
    }

    await this.waitForSaveChangesButtonEnabled();
    await this.saveChangesButton.click();
  }
}
