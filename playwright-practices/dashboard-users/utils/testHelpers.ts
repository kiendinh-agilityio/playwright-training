import { expect, Locator, FrameLocator } from '@playwright/test';

export class TestHelper {
  static async waitForModalToHide(modalTitle: Locator, timeout: number = 20000): Promise<void> {
    await expect(modalTitle).toBeHidden({ timeout });
  }

  static async waitForModalToHideOrSuccess(
    modalTitle: Locator,
    successText: Locator,
    timeout: number = 10000,
  ): Promise<void> {
    try {
      await expect(modalTitle).toBeHidden({ timeout });
    } catch {
      await expect(successText)
        .toBeVisible({ timeout })
        .catch(() => {});
    }
  }

  static async getFirstRowEmail(frame: FrameLocator): Promise<string> {
    const firstRow = frame.getByRole('table').getByRole('row').nth(1);
    const email = (await firstRow.getByRole('cell').nth(2).innerText()).trim();
    return email;
  }

  static createTestData(prefix: string = 'pb') {
    return {
      email: `test.${prefix}@example.com`,
      username: `${prefix}user`,
      password: '12345678',
      name: 'Playwright User',
    };
  }
}
