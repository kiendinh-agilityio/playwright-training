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
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly searchForm: Locator;

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

    // Simplified search locators based on new requirements
    this.searchForm = this.frame.locator('form.searchbar');
    // Use a more reliable selector that finds the search input within the search form
    this.searchInput = this.frame.locator('form.searchbar').getByRole('textbox').first();
    this.searchButton = this.frame.getByRole('button', { name: 'Search' });
    this.clearButton = this.frame.getByRole('button', { name: 'Clear', exact: true });
    this.clearFiltersButton = this.frame.getByRole('button', { name: 'Clear filters' });
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

  async searchUsers(searchTerm: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    const searchInputDiv = this.searchInput.locator('div');
    await searchInputDiv.click();
    await searchInputDiv.clear();
    await searchInputDiv.fill(searchTerm);
    await this.searchButton.click();
  }

  async clearSearch() {
    await expect(this.clearButton).toBeVisible({ timeout: 10000 });
    await this.clearButton.click();
  }

  async clearFilters() {
    await expect(this.clearFiltersButton).toBeVisible({ timeout: 10000 });
    await this.clearFiltersButton.click();
  }

  async verifySearch(searchTerm: string, expectResults: boolean = true) {
    await expect(this.searchInput.locator('div')).toContainText(searchTerm, { timeout: 10000 });

    if (expectResults) {
      const table = this.frame.getByRole('table');
      await expect(table).toBeVisible({ timeout: 10000 });
      const tableRows = table.locator('tbody tr.row-handle');
      await expect(tableRows.filter({ hasText: searchTerm })).toBeVisible({ timeout: 10000 });
    } else {
      const noRecordsMessage = this.frame.getByRole('heading', { name: 'No records found.' });
      await expect(noRecordsMessage).toBeVisible({ timeout: 10000 });
    }
  }
}
