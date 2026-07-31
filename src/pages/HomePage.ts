import { Locator, Page } from '@playwright/test';

import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.HOME;
  readonly header: Locator;
  readonly statsSection: Locator;
  readonly modernKpiSection: Locator;
  readonly dynamicInsight: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('.main-title');
    this.statsSection = page.locator('.glass.futuristic-card');
    this.modernKpiSection = page.locator('.home-modern-grid');
    this.dynamicInsight = page.locator('main').getByText(/per farm\./);
  }
}
