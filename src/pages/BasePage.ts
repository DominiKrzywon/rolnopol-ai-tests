import { Page } from "@playwright/test";

/**
 * Base class for Page Object pattern implementation.
 * Provides navigation and shared functionality; child classes define specific PAGE_URL.
 */
export abstract class BasePage {
  readonly page: Page;
  abstract readonly PAGE_URL: string;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.PAGE_URL);
  }
}
