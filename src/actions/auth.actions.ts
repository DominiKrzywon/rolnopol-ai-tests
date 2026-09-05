import { Page } from '@playwright/test';
import { User } from 'src/models/User';
import { LoginPage } from 'src/pages/LoginPage';
import { ProfilePage } from 'src/pages/ProfilePage';
import { RegisterPage } from 'src/pages/RegisterPage';

export async function registerAndLogin(
  page: Page,
  user: User,
): Promise<ProfilePage> {
  const registerPage = new RegisterPage(page);
  const loginPage = new LoginPage(page);

  await registerPage.goto();

  await Promise.all([
    page.waitForURL(/login\.html$/),
    registerPage.register(user),
  ]);

  return loginPage.login(user);
}
