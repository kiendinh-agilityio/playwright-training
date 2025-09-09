import { Page, FrameLocator, Locator, expect } from '@playwright/test';
import { BREADCRUMBS, IFRAME_SELECTORS } from '@/constants';

export class DashboardPage {
  readonly frame: FrameLocator;
  readonly breadcrumbUsers: Locator;
  readonly searchForm: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly refreshButton: Locator;

  constructor(page: Page) {
    this.frame = page.frameLocator(IFRAME_SELECTORS.DASHBOARD);
    this.breadcrumbUsers = this.frame.locator('main nav', { hasText: BREADCRUMBS.USERS });

    this.searchForm = this.frame.locator('form.searchbar');
    this.searchInput = this.frame.locator('form.searchbar').getByRole('textbox').first();
    this.searchButton = this.frame.getByRole('button', { name: 'Search' });
    this.clearButton = this.frame.getByRole('button', { name: 'Clear', exact: true });
    this.clearFiltersButton = this.frame.getByRole('button', { name: 'Clear filters' });
    this.refreshButton = this.frame.getByRole('button', { name: 'Refresh' });
  }

  async assertUsersBreadcrumbVisible() {
    await expect(this.breadcrumbUsers).toBeVisible();
    await expect(this.frame.getByRole('table')).toBeVisible();
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

  async refreshUsersTable() {
    await expect(this.refreshButton).toBeVisible({ timeout: 10000 });
    await this.refreshButton.click();
    await expect(this.frame.getByRole('table')).toBeVisible({ timeout: 10000 });
  }

  async verifySearch(searchTerm: string, hasResults: boolean = true) {
    await expect(this.searchInput.locator('div')).toContainText(searchTerm, { timeout: 30000 });

    if (hasResults) {
      const table = this.frame.getByRole('table');
      await expect(table).toBeVisible({ timeout: 30000 });
      const tableRows = table.locator('tbody tr.row-handle');
      await expect(tableRows.filter({ hasText: searchTerm })).toBeVisible({ timeout: 30000 });
    } else {
      const noRecordsMessage = this.frame.getByRole('heading', { name: 'No records found.' });
      await expect(noRecordsMessage).toBeVisible({ timeout: 30000 });
    }
  }
}
