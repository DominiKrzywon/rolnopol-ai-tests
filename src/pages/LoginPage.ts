import { Locator, Page } from '@playwright/test';

import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.LOGIN;
  readonly loginSubtitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginSubmitBtn: Locator;
  readonly notificationMessage: Locator;
  readonly header: Locator;

  constructor(page: Page) {
    super(page);
    this.loginSubtitle = page.getByTestId('login-subtitle');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginSubmitBtn = page.getByTestId('login-submit-btn');
    this.notificationMessage = page.locator('.notification-message');
    this.header = page.getByRole('heading', {
      name: 'Login to Your User Account',
    });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginSubmitBtn.click();
  }
}
