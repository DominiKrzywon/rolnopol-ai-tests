import { Locator, Page } from 'playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class ContactPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  readonly PAGE_URL = PAGE_URLS.CONTACT;
  contactHeader = this.page.getByRole('heading', { name: 'Contact Us' });
  namePlaceholder = this.page.getByPlaceholder('Jane Doe');
  emailPlaceholder = this.page.getByPlaceholder('jane@example.com');
  subjectPlaceholder = this.page.getByPlaceholder('How can we help?');
  messagePlaceholder = this.page.getByPlaceholder('Write your message here...');
  clearButton = this.page.getByRole('button', { name: 'Clear' });
  submitButton = this.page.getByRole('button', { name: 'Send Message' });

  get validationErrors(): Locator {
    return this.page.getByRole('alert');
  }
}
