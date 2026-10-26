import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class AlertsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.ALERTS;
  readonly alertsHeader = this.page.getByRole('heading', {
    name: 'Alerts',
    exact: true,
  });
  readonly searchInput = this.page.getByRole('searchbox', {
    name: 'Search alerts',
  });
  readonly severityFilter = this.page.getByRole('combobox', {
    name: 'Filter severity',
  });
  readonly regionSelect = this.page.getByRole('combobox', {
    name: 'Select region',
  });
  readonly refreshButton = this.page.getByTitle('Refresh alerts', {
    exact: true,
  });

  readonly upcomingList = this.page.locator('#upcomingList');
  readonly todayList = this.page.locator('#todayList');
  readonly historyList = this.page.locator('#historyList');
  readonly upcomingCount = this.page.locator('#upcomingCount');
  readonly todayCount = this.page.locator('#todayCount');
  readonly historyCount = this.page.locator('#historyCount');
  readonly upcomingAlerts = this.upcomingList.locator('.alert-card');
  readonly todayAlerts = this.todayList.locator('.alert-card');
  readonly historyAlerts = this.historyList.locator('.alert-card');

  async searchAlerts(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async selectRegion(regionCode: string): Promise<void> {
    await this.regionSelect.selectOption(regionCode);
  }

  async filterBySeverity(
    severity: '' | 'low' | 'medium' | 'high' | 'critical',
  ): Promise<void> {
    await this.severityFilter.selectOption(severity);
  }

  async refreshAlerts(): Promise<void> {
    await this.refreshButton.click();
  }
}
