import { expect, FrameLocator, Locator } from '@playwright/test';

export interface UserRowData {
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  username: string;
  name: string;
  avatar: string;
  website: string;
  created: string;
  updated: string;
}

export class TableHelper {
  private readonly frame: FrameLocator;

  constructor(frame: FrameLocator) {
    this.frame = frame;
  }

  // Get table locator
  getTable(): Locator {
    return this.frame.getByRole('table');
  }

  getTableHeader(): Locator {
    return this.getTable().locator('thead tr');
  }

  // Get table body rows
  getTableBodyRows(): Locator {
    return this.getTable().locator('tbody tr.row-handle');
  }

  // Common helpers
  getHeaderCheckbox(): Locator {
    return this.getTableHeader().locator('.bulk-select-col input[type="checkbox"]');
  }

  getRowCheckbox(row: Locator): Locator {
    return row.locator('.bulk-select-col input[type="checkbox"]');
  }

  async getCellText(row: Locator, selector: string, emptyIfNA = false): Promise<string> {
    await row.scrollIntoViewIfNeeded();
    const cell = row.locator(selector).first();
    const text = await cell.textContent();
    const value = text ?? '';
    if (!emptyIfNA) return value;
    return value === 'N/A' ? '' : value;
  }

  async getLabelBoolean(row: Locator, selector: string): Promise<boolean> {
    const text = (await row.locator(selector).textContent()) ?? '';
    return text.toLowerCase() === 'true';
  }

  async getDatetime(row: Locator, selector: string): Promise<string> {
    const container = row.locator(selector);
    const date = (await container.locator('.date').textContent()) ?? '';
    const time = (await container.locator('.time').textContent()) ?? '';
    return `${date} ${time}`.trim();
  }

  async clickRowAction(row: Locator): Promise<void> {
    const actionButton = row.locator('.col-type-action i.ri-arrow-right-line');
    await actionButton.click();
  }

  async clickCopyId(row: Locator): Promise<void> {
    const copyButton = row.locator('.col-field-id .ri-file-copy-line');
    await copyButton.click();
  }

  // Get specific row by index
  getRowByIndex(index: number): Locator {
    return this.getTableBodyRows().nth(index);
  }

  // Get row by specific text content
  getRowByText(text: string): Locator {
    return this.getTableBodyRows().filter({ hasText: text });
  }

  // Get row by ID
  getRowById(id: string): Locator {
    return this.getTableBodyRows().filter({ hasText: id });
  }

  // Checkbox operations
  async selectRowByIndex(index: number): Promise<void> {
    const row = this.getRowByIndex(index);
    await this.getRowCheckbox(row).check();
  }

  async selectRowById(id: string): Promise<void> {
    const row = this.getRowById(id);
    await this.getRowCheckbox(row).check();
  }

  async selectAllRows(): Promise<void> {
    await this.getHeaderCheckbox().check();
  }

  async unselectAllRows(): Promise<void> {
    await this.getHeaderCheckbox().uncheck();
  }

  // Column-specific getters
  async getIdByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    return this.getCellText(row, '.col-field-id .txt');
  }

  async getEmailByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    return this.getCellText(row, '.col-field-email .txt');
  }

  async getEmailVisibilityByRowIndex(index: number): Promise<boolean> {
    const row = this.getRowByIndex(index);
    return this.getLabelBoolean(row, '.col-field-emailVisibility .label');
  }

  async getVerifiedByRowIndex(index: number): Promise<boolean> {
    const row = this.getRowByIndex(index);
    return this.getLabelBoolean(row, '.col-field-verified .label');
  }

  async getUsernameByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    return this.getCellText(row, '.col-field-username .txt');
  }

  async getNameByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    // Support both normal text and hint (e.g., N/A) variants
    return this.getCellText(row, '.col-field-name .txt, .col-field-name .txt-hint', true);
  }

  async getAvatarByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    const avatarElement = row.locator('.col-field-avatar');
    const hasImage = (await avatarElement.locator('img').count()) > 0;
    if (hasImage) {
      const img = avatarElement.locator('img');
      return (await img.getAttribute('src')) ?? '';
    }
    const text = (await avatarElement.locator('.txt-hint').textContent()) ?? '';
    return text === 'N/A' ? '' : text;
  }

  async getWebsiteByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    // Support both normal text and hint (e.g., N/A) variants
    return this.getCellText(row, '.col-field-website .txt, .col-field-website .txt-hint', true);
  }

  async getCreatedByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    return this.getDatetime(row, '.col-field-created .datetime');
  }

  async getUpdatedByRowIndex(index: number): Promise<string> {
    const row = this.getRowByIndex(index);
    return this.getDatetime(row, '.col-field-updated .datetime');
  }

  // Get all data for a specific row
  async getRowDataByIndex(index: number): Promise<UserRowData> {
    return {
      id: await this.getIdByRowIndex(index),
      email: await this.getEmailByRowIndex(index),
      emailVisibility: await this.getEmailVisibilityByRowIndex(index),
      verified: await this.getVerifiedByRowIndex(index),
      username: await this.getUsernameByRowIndex(index),
      name: await this.getNameByRowIndex(index),
      avatar: await this.getAvatarByRowIndex(index),
      website: await this.getWebsiteByRowIndex(index),
      created: await this.getCreatedByRowIndex(index),
      updated: await this.getUpdatedByRowIndex(index),
    };
  }

  // Get all data for a specific row by ID
  async getRowDataById(id: string): Promise<UserRowData | null> {
    const row = this.getRowById(id);
    if ((await row.count()) === 0) {
      return null;
    }

    const rowIndex = await this.getRowIndexById(id);
    if (rowIndex === -1) {
      return null;
    }

    return this.getRowDataByIndex(rowIndex);
  }

  // Get row index by ID
  async getRowIndexById(id: string): Promise<number> {
    const rows = this.getTableBodyRows();
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const rowId = await this.getIdByRowIndex(i);
      if (rowId === id) {
        return i;
      }
    }

    return -1;
  }

  // Row count
  async getRowCount(): Promise<number> {
    return this.getTableBodyRows().count();
  }

  // Click action button (arrow) for a specific row
  async clickActionButtonByIndex(index: number): Promise<void> {
    const row = this.getRowByIndex(index);
    await this.clickRowAction(row);
  }

  async clickActionButtonById(id: string): Promise<void> {
    const row = this.getRowById(id);
    await this.clickRowAction(row);
  }

  // Copy ID to clipboard
  async copyIdToClipboardByIndex(index: number): Promise<void> {
    const row = this.getRowByIndex(index);
    await this.clickCopyId(row);
  }

  async copyIdToClipboardById(id: string): Promise<void> {
    const row = this.getRowById(id);
    await this.clickCopyId(row);
  }

  // Sorting operations
  async sortByColumn(columnName: string): Promise<void> {
    const columnHeader = this.getTableHeader().locator(`[title="${columnName}"]`);
    await columnHeader.click();
  }

  // Validation methods
  async expectRowContains(text: string): Promise<void> {
    const table = this.getTable();
    const dataRows = table.getByRole('row').nth(1);
    await expect(dataRows).toBeVisible();
    if (text) {
      await expect(table.getByRole('row').filter({ hasText: text })).toHaveCount(1, {
        timeout: 10000,
      });
    }
  }

  async expectRowCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getRowCount();
    expect(actualCount).toEqual(expectedCount);
  }

  async expectRowDataByIndex(index: number, expectedData: Partial<UserRowData>): Promise<void> {
    const actualData = await this.getRowDataByIndex(index);

    for (const key of Object.keys(expectedData) as (keyof UserRowData)[]) {
      const value = expectedData[key];
      if (value !== undefined) {
        expect(actualData[key]).toBe(value);
      }
    }
  }

  async expectRowDataById(id: string, expectedData: Partial<UserRowData>): Promise<void> {
    const actualData = await this.getRowDataById(id);
    if (!actualData) {
      throw new Error(`Row with ID ${id} not found`);
    }

    for (const key of Object.keys(expectedData) as (keyof UserRowData)[]) {
      const value = expectedData[key];
      if (value !== undefined) {
        expect(actualData[key]).toBe(value);
      }
    }
  }

  // Wait for table to load
  async waitForTableToLoad(): Promise<void> {
    await expect(this.getTable()).toBeVisible();
    await expect(this.getTableBodyRows().first()).toBeVisible({ timeout: 10000 });
  }

  // Check if table is empty
  async isEmpty(): Promise<boolean> {
    const count = await this.getRowCount();
    return count === 0;
  }

  // Get all rows data
  async getAllRowsData(): Promise<UserRowData[]> {
    const count = await this.getRowCount();
    const rowsData: UserRowData[] = [];

    for (let i = 0; i < count; i++) {
      const rowData = await this.getRowDataByIndex(i);
      rowsData.push(rowData);
    }

    return rowsData;
  }
}
