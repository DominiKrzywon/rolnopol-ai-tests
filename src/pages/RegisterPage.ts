import { PAGE_URLS } from '../constants/pageUrls';
import { User } from '../models/User';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.REGISTER;
  readonly emailInput = this.page.getByTestId('email-input');
  readonly displayNameInput = this.page.getByTestId('display-name-input');
  readonly passwordInput = this.page.getByTestId('password-input');
  readonly registerSubmitBtn = this.page.getByTestId('register-submit-btn');
  readonly registerSubtitle = this.page.getByTestId('register-subtitle');
  readonly successMessage = this.page.getByText('Registration successful!');
  readonly emailValidationError = this.page
    .getByTestId('register-form')
    .getByText('Please enter a valid email address');
  readonly passwordValidationError = this.page
    .getByTestId('register-form')
    .getByText('Must be at least 3 characters');

  async register(user: User): Promise<void> {
    await this.emailInput.fill(user.email);
    if (user.displayName) {
      await this.displayNameInput.fill(user.displayName);
    }
    await this.passwordInput.fill(user.password);
    await this.registerSubmitBtn.click();
  }
}
