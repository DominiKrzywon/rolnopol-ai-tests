import { Locator, Page } from '@playwright/test';
import { LoginPage } from 'src/pages/LoginPage';

import { PAGE_URLS } from '../constants/pageUrls';
import { User } from '../models/User';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.REGISTER;
  readonly emailInput: Locator;
  readonly displayNameInput: Locator;
  readonly passwordInput: Locator;
  readonly registerSubmitBtn: Locator;
  readonly registerSubtitle: Locator;
  readonly successMessage: Locator;
  readonly emailValidationError: Locator;
  readonly passwordValidationError: Locator;
  readonly notificationMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email-input');
    this.displayNameInput = page.getByTestId('display-name-input');
    this.passwordInput = page.getByTestId('password-input');
    this.registerSubmitBtn = page.getByTestId('register-submit-btn');
    this.registerSubtitle = page.getByTestId('register-subtitle');
    this.successMessage = page.getByText('Registration successful!');
    this.emailValidationError = page
      .getByTestId('register-form')
      .getByText('Please enter a valid email address');
    this.passwordValidationError = page
      .getByTestId('register-form')
      .getByText('Must be at least 3 characters');
    this.notificationMessage = page.locator('.notification-message');
  }

  async register(user: User): Promise<LoginPage> {
    await this.emailInput.fill(user.email);
    if (user.displayName) {
      await this.displayNameInput.fill(user.displayName);
    }
    await this.passwordInput.fill(user.password);
    await this.registerSubmitBtn.click();

    await this.page.waitForURL(/login.html/);
    return new LoginPage(this.page);
  }
}
