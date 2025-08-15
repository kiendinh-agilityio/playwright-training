import { expect, type Locator, type Page } from '@playwright/test';
import { SELECTORS } from '@/tests/constants/selectors';

export class Sidebar {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get menuButton(): Locator {
    return this.page.locator(SELECTORS.MENU_BUTTON);
  }

  get closeButton(): Locator {
    return this.page.locator(SELECTORS.CLOSE_BUTTON);
  }

  get sidebarMenu(): Locator {
    return this.page.locator(SELECTORS.SIDEBAR_MENU);
  }

  get allItemsLink(): Locator {
    return this.page.locator(SELECTORS.ALL_ITEMS_LINK);
  }

  get aboutLink(): Locator {
    return this.page.locator(SELECTORS.ABOUT_LINK);
  }

  get logoutLink(): Locator {
    return this.page.locator(SELECTORS.LOGOUT_LINK);
  }

  get resetAppStateLink(): Locator {
    return this.page.locator(SELECTORS.RESET_APP_STATE_LINK);
  }

  // Actions
  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await expect(this.sidebarMenu).toBeVisible();
  }

  async closeMenu(): Promise<void> {
    await this.closeButton.click();
    await expect(this.sidebarMenu).not.toBeVisible();
  }

  async clickAllItems(): Promise<void> {
    await this.allItemsLink.click();
  }

  async clickAbout(): Promise<void> {
    await this.aboutLink.click();
  }

  async clickLogout(): Promise<void> {
    await this.logoutLink.click();
  }

  async clickResetAppState(): Promise<void> {
    await this.resetAppStateLink.click();
  }

  // Verifications
  async verifyMenuIsOpen(): Promise<void> {
    await expect(this.sidebarMenu).toBeVisible();
  }

  async verifyMenuIsClosed(): Promise<void> {
    await expect(this.sidebarMenu).not.toBeVisible();
  }

  async verifyCurrentUrl(url: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  async verifyPageTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }
}
