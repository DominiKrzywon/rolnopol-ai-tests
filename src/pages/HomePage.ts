import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.HOME;
  readonly header = this.page.locator('.main-title');
  readonly statsSection = this.page.locator('.glass.futuristic-card');
  readonly modernKpiSection = this.page.locator('.home-modern-grid');
  readonly dynamicInsight = this.page.locator('main').getByText(/per farm\./);
}
