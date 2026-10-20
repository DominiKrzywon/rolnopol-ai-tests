import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

export class DocsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.DOCS;
  readonly docsHeaderSubtitle = this.page.locator('.docs-header-subtitle');
}
