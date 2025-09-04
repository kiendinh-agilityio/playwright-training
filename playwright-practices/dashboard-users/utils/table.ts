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

  // Generic: get row by column value
  async getRowByValue(params: {
    columnName: string;
    value: string;
    requireVisible?: boolean;
  }): Promise<Locator> {
    const { columnName, value, requireVisible } = params;

    // Map columnName to column selector
    const columnToSelector: Record<string, string> = {
      id: '.col-field-id .txt',
      email: '.col-field-email .txt',
      emailVisibility: '.col-field-emailVisibility .label',
      verified: '.col-field-verified .label',
      username: '.col-field-username .txt',
      name: '.col-field-name .txt, .col-field-name .txt-hint',
      avatar: '.col-field-avatar',
      website: '.col-field-website .txt, .col-field-website .txt-hint',
      created: '.col-field-created .datetime',
      updated: '.col-field-updated .datetime',
    };

    const selector = columnToSelector[columnName] ?? `.col-field-${columnName} .txt`;

    // Build inner locator from the table to ensure correct scoping and types
    const inner = this.getTable().locator(selector).filter({ hasText: value });

    const row = this.getTableBodyRows().filter({ has: inner }).first();

    if (requireVisible) {
      await expect(row).toBeVisible();
    }

    return row;
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
  async sortByColumn(columnName: string, direction: 'asc' | 'desc' = 'asc'): Promise<void> {
    const columnHeader = this.getTableHeader().locator(`[title="${columnName}"]`);
    await columnHeader.click();

    if (direction === 'desc') {
      await columnHeader.click();
    }
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

  // Bulk select rows by users and mode
  async selectRowsByUsers(
    users: { id: string; email: string }[],
    mode: 'email' | 'id',
  ): Promise<void> {
    for (const user of users) {
      await this.waitForTableToLoad();
      const locatorFilter = mode === 'email' ? user.email : user.id;
      const row = this.getTable()
        .locator('tbody tr.row-handle')
        .filter({ hasText: locatorFilter })
        .first();
      await expect(row).toBeVisible({ timeout: mode === 'email' ? 30000 : 15000 });
      await row.scrollIntoViewIfNeeded();
      const checkboxInput = row.locator('.bulk-select-col input[type="checkbox"]');
      const label = row.locator('.bulk-select-col label');
      if (mode === 'email') {
        await label.click();
        await this.getTable().locator('tbody').waitFor({ timeout: 2000 });
      } else {
        if (!(await checkboxInput.isChecked())) {
          await label.click();
        }
        await expect(checkboxInput).toBeChecked();
      }
    }
    const checked = this.getTable().locator('.bulk-select-col input[type="checkbox"]:checked');
    await expect(checked).toHaveCount(users.length);
  }

  // Wait for table to load
  async waitForTableToLoad(): Promise<void> {
    await expect(this.getTable()).toBeVisible();

    // Wait for table to be ready, but don't require rows to exist
    // Table might be empty initially
    await this.getTable().waitFor({ timeout: 10000 });

    // Check if table has any rows, but don't fail if it's empty
    const rowCount = await this.getRowCount();
    if (rowCount > 0) {
      await expect(this.getTableBodyRows().first()).toBeVisible({ timeout: 5000 });
    }
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

  // Get column header locator
  getColumn(columnName: string): Locator {
    return this.getTableHeader().locator(`[title="${columnName}"]`);
  }

  async getColumnIndex(columnName: string): Promise<number> {
    const headerCell = this.getColumn(columnName);
    await expect(headerCell).toBeVisible();
    const index = await headerCell.evaluate((el) => (el as HTMLTableCellElement).cellIndex);
    return index;
  }

  async getAllValueCellByColumnName(columnName: string): Promise<string[]> {
    const count = await this.getRowCount();
    const values: string[] = [];
    const columnIndex = await this.getColumnIndex(columnName);

    for (let i = 0; i < count; i++) {
      const row = this.getRowByIndex(i);
      const cell = row.locator('td').nth(columnIndex);
      let value = (await cell.innerText()).trim() ?? '';

      if (columnName === 'emailVisibility') {
        value = value.toLowerCase();
      } else if (columnName === 'name' || columnName === 'website') {
        value = value === 'N/A' ? '' : value;
      }

      values.push(value);
    }

    return values;
  }
}
