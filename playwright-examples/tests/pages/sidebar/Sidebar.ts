import { expect, type Locator, type Page } from '@playwright/test';
import { SELECTORS } from '@/tests/constants/selectors';
import { TEXTS } from '@/tests/constants/texts';

export class Sidebar {
  private readonly page: Page;
  readonly menuButton: Locator;
  readonly closeButton: Locator;
  readonly sidebarMenu: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.OPEN_MENU });
    this.closeButton = this.page.getByRole('button', { name: TEXTS.BUTTONS.CLOSE_MENU });
    this.sidebarMenu = this.page.locator(SELECTORS.SIDEBAR_MENU);
    this.allItemsLink = this.page.getByRole('link', { name: TEXTS.LINKS.ALL_ITEMS });
    this.aboutLink = this.page.getByRole('link', { name: TEXTS.LINKS.ABOUT });
    this.logoutLink = this.page.getByRole('link', { name: TEXTS.LINKS.LOGOUT });
    this.resetAppStateLink = this.page.getByRole('link', { name: TEXTS.LINKS.RESET_APP_STATE });
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.sidebarMenu).toBeVisible();
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

  async clickByName(name: string): Promise<void> {
    const link = this.page.getByRole('link', { name, exact: true });
    await link.click();
  }
}
