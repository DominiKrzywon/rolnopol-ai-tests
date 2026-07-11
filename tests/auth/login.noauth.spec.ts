import { expect, test } from '@playwright/test';
import { HomePage } from 'src/pages/HomePage';

import { getEmptyUserData } from '../../src/models/User';
import { LoginPage } from '../../src/pages/LoginPage';
import { ProfilePage } from '../../src/pages/ProfilePage';

test.describe('Login E2E', () => {
  test(
    'should display correct user data after login',
    { tag: ['@auth', '@login', '@session', '@happy-path'] },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      const profilePage = new ProfilePage(page);
      const user = getEmptyUserData();

      await loginPage.goto();
      await loginPage.login(user.email, user.password);

      await expect.soft(page).toHaveURL(profilePage.PAGE_URL);
      await expect(profilePage.emailValue).toHaveText(user.email);
    },
  );

  test(
    'session management should work correctly',
    { tag: ['@auth', '@session', '@logout'] },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const profilePage = new ProfilePage(page);
      const user = getEmptyUserData();
      const expectedLoginHeaderText = 'Rolnopol';

      await loginPage.goto();
      await loginPage.login(user.email, user.password);

      await expect(profilePage.displayedName).toHaveText(user.displayName);

      await page.reload();
      await expect(profilePage.displayedName).toHaveText(user.displayName);

      await profilePage.logout();

      await expect(homePage.header).toHaveText(expectedLoginHeaderText);
    },
  );
});
