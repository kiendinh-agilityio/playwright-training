import { expect, Locator } from '@playwright/test';

export class ModalActions {
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
      await expect(successText).toBeVisible({ timeout });
    }
  }
}
