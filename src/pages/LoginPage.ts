import { User } from 'src/models/User';
import { ProfilePage } from 'src/pages/ProfilePage';

import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.LOGIN;
  readonly loginSubtitle = this.page.getByTestId('login-subtitle');
  readonly emailInput = this.page.getByTestId('email-input');
  readonly passwordInput = this.page.getByTestId('password-input');
  readonly loginSubmitBtn = this.page.getByTestId('login-submit-btn');
  readonly header = this.page.getByRole('heading', {
    name: 'Login to Your User Account',
  });

  async login(user: User): Promise<ProfilePage> {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.loginSubmitBtn.click();
    return new ProfilePage(this.page);
  }
}
