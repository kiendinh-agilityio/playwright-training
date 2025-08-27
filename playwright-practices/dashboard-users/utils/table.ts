import { expect, FrameLocator } from '@playwright/test';

export class TableHelper {
  private readonly frame: FrameLocator;

  constructor(frame: FrameLocator) {
    this.frame = frame;
  }

  async expectRowContains(text: string) {
    const table = this.frame.getByRole('table');
    const dataRows = table.getByRole('row').nth(1);
    await expect(dataRows).toBeVisible();
    if (text) {
      await expect(table.getByRole('row').filter({ hasText: text })).toHaveCount(1, {
        timeout: 10000,
      });
    }
  }
}
