import { Locator, Page } from '@playwright/test';

import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.HOME;
  readonly header: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('.main-title');
  }
}
