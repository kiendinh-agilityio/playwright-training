import { Page, FrameLocator, Locator, expect } from '@playwright/test';
import { BREADCRUMBS, IFRAME_SELECTORS } from '@/constants';

export class DashboardPage {
  readonly frame: FrameLocator;
  readonly breadcrumbUsers: Locator;

  constructor(page: Page) {
    this.frame = page.frameLocator(IFRAME_SELECTORS.DASHBOARD);
    this.breadcrumbUsers = this.frame
      .getByRole('main')
      .getByText(BREADCRUMBS.USERS, { exact: true });
  }

  async assertUsersBreadcrumbVisible() {
    await expect(this.breadcrumbUsers).toBeVisible();
  }
}
