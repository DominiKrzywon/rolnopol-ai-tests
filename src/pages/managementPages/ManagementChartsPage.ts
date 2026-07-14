import { Locator, Page } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class ChartsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.CHARTS;
  readonly header: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', {
      name: 'Analytics & Insights',
    });
  }
}
