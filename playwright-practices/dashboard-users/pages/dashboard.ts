import { Page, FrameLocator, Locator, expect } from '@playwright/test';
import { BREADCRUMBS, IFRAME_SELECTORS } from '@/constants';

export class DashboardPage {
  readonly frame: FrameLocator;
  readonly breadcrumbUsers: Locator;

  constructor(page: Page) {
    this.frame = page.frameLocator(IFRAME_SELECTORS.DASHBOARD);
    this.breadcrumbUsers = this.frame.locator('main nav', { hasText: BREADCRUMBS.USERS });
  }

  async assertUsersBreadcrumbVisible() {
    await expect(this.breadcrumbUsers).toBeVisible();
    await expect(this.frame.getByRole('table')).toBeVisible();
  }
}
