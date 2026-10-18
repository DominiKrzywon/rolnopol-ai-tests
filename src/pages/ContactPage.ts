import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class ContactPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.CONTACT;

  readonly contactHeader = this.page.getByRole('heading', {
    name: 'Contact Us',
  });
  readonly nameInput = this.page.getByPlaceholder('Jane Doe');
  readonly emailInput = this.page.getByPlaceholder('jane@example.com');
  readonly submitButton = this.page.getByRole('button', {
    name: 'Send Message',
  });
  readonly validationErrors = this.page.getByRole('alert');
}
