import { Locator, Page } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class ManagementPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.MANAGEMENT;
  readonly header: Locator;
  readonly totalFields: Locator;
  readonly totalStaff: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', {
      name: 'Staff & Fields Management',
    });
    this.totalFields = page.locator('.totalFields');
    this.totalStaff = page.locator('.totalStaff');
  }
}
