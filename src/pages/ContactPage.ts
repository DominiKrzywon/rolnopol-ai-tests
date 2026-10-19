import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class ContactPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.CONTACT;

  readonly contactHeader = this.page.getByRole('heading', {
    name: 'Contact Us',
  });
  readonly notificationMessage = this.page.locator('.notification-message');

  readonly nameInput = this.page.getByPlaceholder('Jane Doe');
  readonly emailInput = this.page.getByPlaceholder('jane@example.com');
  readonly subjectInput = this.page.getByPlaceholder('How can we help?');
  readonly messageInput = this.page.getByPlaceholder(
    'Write your message here...',
  );
  readonly submitButton = this.page.getByRole('button', {
    name: 'Send Message',
  });
  readonly validationErrors = this.page.getByRole('alert');

  async sendTheMessage(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.subjectInput.fill(subject);
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }
}
