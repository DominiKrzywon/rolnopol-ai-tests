import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class AlertsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.ALERTS;

  readonly regionSelect = this.page.getByRole('combobox', {
    name: 'Select region',
  });
}
