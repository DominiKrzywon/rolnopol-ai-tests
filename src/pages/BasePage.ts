import { Locator, Page } from '@playwright/test';

/**
 * Base class for Page Object pattern implementation.
 * Provides navigation and shared functionality; child classes define specific PAGE_URL.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly notificationMessage: Locator;
  abstract readonly PAGE_URL: string;

  constructor(page: Page) {
    this.page = page;
    this.notificationMessage = page.locator('.notification-message');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.PAGE_URL);
  }
}
