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

type ColumnName = keyof UserRowData;
type ColumnValueType = 'text' | 'boolean' | 'datetime';

const columnConfig: Record<ColumnName, { type: ColumnValueType; emptyIfNA?: boolean }> = {
  id: { type: 'text' },
  email: { type: 'text' },
  emailVisibility: { type: 'boolean' },
  verified: { type: 'boolean' },
  username: { type: 'text' },
  name: { type: 'text', emptyIfNA: true },
  avatar: { type: 'text' }, // avatar handled specially when fetching
  website: { type: 'text', emptyIfNA: true },
  created: { type: 'datetime' },
  updated: { type: 'datetime' },
};

export class TableHelper {
  private readonly frame: FrameLocator;
  private readonly table: Locator;
  private readonly tableHeader: Locator;
  private readonly tableBodyRows: Locator;
  private readonly columnIndexCache: Map<string, number> = new Map();

  constructor(frame: FrameLocator) {
    this.frame = frame;
    this.table = this.frame.getByRole('table');
    this.tableHeader = this.table.locator('thead tr');
    this.tableBodyRows = this.table.locator('tbody tr.row-handle');
  }

  getTable(): Locator {
    return this.table;
  }

  getTableHeader(): Locator {
    return this.tableHeader;
  }

  getTableBodyRows(): Locator {
    return this.tableBodyRows;
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

  getRowByIndex(index: number): Locator {
    return this.getTableBodyRows().nth(index);
  }

  private async getCellByRowAndColumnName(rowIndex: number, columnName: string): Promise<Locator> {
    const columnIndex = await this.getColumnIndex(columnName);
    const row = this.getRowByIndex(rowIndex);
    return row.locator('td').nth(columnIndex);
  }

  private async getValueByRowAndColumnName(
    rowIndex: number,
    columnName: string,
    options: { type: 'text' | 'boolean' | 'datetime'; emptyIfNA?: boolean } = { type: 'text' },
  ): Promise<string | boolean> {
    const cell = await this.getCellByRowAndColumnName(rowIndex, columnName);

    if (options.type === 'boolean') {
      const labelText = (await cell.locator('.label').textContent()) ?? '';
      return labelText.toLowerCase() === 'true';
    }

    if (options.type === 'datetime') {
      const date = (await cell.locator('.date').textContent()) ?? '';
      const time = (await cell.locator('.time').textContent()) ?? '';
      return `${date} ${time}`.trim();
    }

    await cell.scrollIntoViewIfNeeded();
    const txtLocator = cell.locator('.txt');
    const hintLocator = cell.locator('.txt-hint');
    let value = '';
    const hasTxt = (await txtLocator.count()) > 0;
    if (hasTxt) {
      value = (await txtLocator.first().textContent()) ?? '';
    } else {
      const hasHint = (await hintLocator.count()) > 0;
      if (hasHint) {
        value = (await hintLocator.first().textContent()) ?? '';
      } else {
        value = (await cell.innerText()) ?? '';
      }
    }
    value = value.trim();
    if (options.emptyIfNA && value === 'N/A') return '';
    return value;
  }

  async getCellValueByRowIndex<T extends ColumnName>(
    rowIndex: number,
    columnName: T,
  ): Promise<UserRowData[T]> {
    if (columnName === 'avatar') {
      const cell = await this.getCellByRowAndColumnName(rowIndex, 'avatar');
      const hasImage = (await cell.locator('img').count()) > 0;
      if (hasImage) {
        const img = cell.locator('img');
        return ((await img.getAttribute('src')) ?? '') as UserRowData[T];
      }
      const text = (await cell.locator('.txt-hint').textContent()) ?? '';
      return (text === 'N/A' ? '' : text) as UserRowData[T];
    }

    const config = columnConfig[columnName];
    const value = await this.getValueByRowAndColumnName(rowIndex, columnName, {
      type: config.type,
      emptyIfNA: config.emptyIfNA,
    });
    return value as UserRowData[T];
  }

  getRowByText(text: string): Locator {
    return this.getTableBodyRows().filter({ hasText: text });
  }

  getRowById(id: string): Locator {
    return this.getTableBodyRows().filter({ hasText: id });
  }

  // Column-specific getters
  async getIdByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'id');
  }

  async getEmailByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'email');
  }

  async getEmailVisibilityByRowIndex(index: number): Promise<boolean> {
    return this.getCellValueByRowIndex(index, 'emailVisibility');
  }

  async getVerifiedByRowIndex(index: number): Promise<boolean> {
    return this.getCellValueByRowIndex(index, 'verified');
  }

  async getUsernameByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'username');
  }

  async getNameByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'name');
  }

  async getAvatarByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'avatar');
  }

  async getWebsiteByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'website');
  }

  async getCreatedByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'created');
  }

  async getUpdatedByRowIndex(index: number): Promise<string> {
    return this.getCellValueByRowIndex(index, 'updated');
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
    if (this.columnIndexCache.has(columnName)) {
      return this.columnIndexCache.get(columnName)!;
    }
    const headerCell = this.getColumn(columnName);
    await expect(headerCell).toBeVisible();
    const index = await headerCell.evaluate((el) => (el as any).cellIndex);
    this.columnIndexCache.set(columnName, index);
    return index;
  }

  // Optional: preload column indices once after the table is visible
  async preloadColumnIndices(columnNames?: string[]): Promise<void> {
    await this.waitForTableToLoad();
    if (columnNames && columnNames.length > 0) {
      for (const name of columnNames) {
        if (!this.columnIndexCache.has(name)) {
          const idx = await this.getColumnIndex(name);
          this.columnIndexCache.set(name, idx);
        }
      }
      return;
    }

    const headers = this.getTableHeader().locator('[title]');
    const count = await headers.count();
    for (let i = 0; i < count; i++) {
      const h = headers.nth(i);
      const name = await h.getAttribute('title');
      if (name && !this.columnIndexCache.has(name)) {
        const idx = await h.evaluate((el) => (el as any).cellIndex);
        this.columnIndexCache.set(name, idx);
      }
    }
  }

  async getAllValueCellByColumnName(columnName: string): Promise<string[]> {
    const count = await this.getRowCount();
    const values: string[] = [];

    for (let i = 0; i < count; i++) {
      if (columnName === 'avatar') {
        const v = await this.getAvatarByRowIndex(i);
        values.push(v);
        continue;
      }
      const conf = columnConfig[columnName as ColumnName] ?? { type: 'text' };
      const v = await this.getValueByRowAndColumnName(i, columnName, {
        type: conf.type,
        emptyIfNA: conf.emptyIfNA,
      });
      let asText = String(v ?? '');
      if (columnName === 'emailVisibility') asText = asText.toLowerCase();
      values.push(asText);
    }

    return values;
  }
}
