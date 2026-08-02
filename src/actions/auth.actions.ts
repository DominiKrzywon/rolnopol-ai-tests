import { Page } from '@playwright/test';
import { User } from 'src/models/User';
import { ProfilePage } from 'src/pages/ProfilePage';
import { RegisterPage } from 'src/pages/RegisterPage';

export async function registerAndLogin(
  page: Page,
  user: User,
): Promise<ProfilePage> {
  const registerPage = new RegisterPage(page);

  await registerPage.goto();

  const loginPage = await registerPage.register(user);

  return loginPage.login(user);
}
