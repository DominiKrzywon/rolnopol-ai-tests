import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

export class ApiDocsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.API_DOCS;
  readonly iframe = this.page.frameLocator('iframe');
}
