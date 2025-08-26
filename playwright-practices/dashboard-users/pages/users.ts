import { FrameLocator, Locator, Page, expect } from '@playwright/test';
import { IFRAME_SELECTORS } from '@/constants';

export class UsersPage {
  readonly frame: FrameLocator;
  readonly newRecordButton: Locator;
  readonly modalTitle: Locator;
  readonly recordDialog: Locator;
  readonly createButton: Locator;
  readonly saveChangesButton: Locator;

  constructor(page: Page) {
    this.frame = page.frameLocator(IFRAME_SELECTORS.DASHBOARD);
    this.newRecordButton = this.frame.getByRole('button', {
      name: /\+?\s*New\s*record/i,
    });
    this.modalTitle = this.frame.getByRole('heading', {
      name: /users record/i,
    });
    this.recordDialog = this.frame
      .getByRole('heading', { name: /users record/i })
      .locator('xpath=ancestor::div[contains(@class, "modal")]');
    this.createButton = this.frame.getByRole('button', { name: 'Create' });
    this.saveChangesButton = this.frame.getByRole('button', {
      name: 'Save changes',
    });
  }

  async gotoCollection() {
    await expect(this.frame.getByRole('table')).toBeVisible();
  }

  async openCreateModal() {
    await this.newRecordButton.click();
    await expect(this.frame.getByRole('heading', { name: /new users record/i })).toBeVisible({
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
    const email = this.recordDialog.getByLabel(/email\s*\*/i, { exact: false });
    const password = this.recordDialog.getByLabel(/password\s*\*/i, { exact: false }).first();
    const passwordConfirm = this.recordDialog.getByLabel(/password\s*confirm\s*\*/i, {
      exact: false,
    });
    const username = this.recordDialog.getByLabel(/username/i, { exact: false });
    const name = this.recordDialog.getByLabel(/^name$/i, { exact: false });

    if (data.email !== undefined) await email.fill(data.email);
    if (data.username !== undefined) await username.fill(data.username);
    if (data.name !== undefined) await name.fill(data.name);
    if (data.password !== undefined) await password.fill(data.password);
    if (data.passwordConfirm !== undefined) await passwordConfirm.fill(data.passwordConfirm);
  }

  async submitCreate() {
    await this.createButton.click();
  }

  async openRecordForEditByEmail(email: string) {
    const row = this.frame.getByRole('table').getByRole('row').filter({ hasText: email }).first();
    const actionCell = row.locator('td').last();
    await actionCell.getByRole('button').click();
    await expect(this.frame.getByRole('heading', { name: /edit users record/i })).toBeVisible({
      timeout: 15000,
    });
  }

  async updateUserFields(data: { name?: string }) {
    if (data.name !== undefined) {
      const name = this.frame.getByRole('textbox', { name: 'Name' });
      await name.fill(data.name);
    }
  }

  async saveChanges() {
    await this.saveChangesButton.click();
  }
}
