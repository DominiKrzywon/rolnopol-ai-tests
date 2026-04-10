import { expect, test } from '@playwright/test';

import { getEmptyUserData } from '../../src/models/User';
import { HomePage } from '../../src/pages/HomePage';
import { LoginPage } from '../../src/pages/LoginPage';
import { ProfilePage } from '../../src/pages/ProfilePage';

test.describe('Login E2E', () => {
  test.use({ storageState: undefined });

  test(
    'should login, verify profile sections, and logout successfully',
    { tag: ['@auth', '@login', '@session', '@logout', '@happy-path'] },
    async ({ page }) => {
      const user = getEmptyUserData();
      const loginPage = new LoginPage(page);
      const profilePage = new ProfilePage(page);
      const homePage = new HomePage(page);

      await loginPage.goto();

      // If DEMO_USER storage state is active, login page redirects to profile.
      // Ensure we are on login page by logging out first if needed.
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (
        page.url().endsWith('/profile.html') ||
        page.url().endsWith('/profile')
      ) {
        await profilePage.logout();
        await loginPage.goto();
      }

      await loginPage.login(user.email, user.password);

      await expect.soft(page).toHaveURL(profilePage.PAGE_URL);
      await expect.soft(profilePage.profileInformationHeading).toBeVisible();
      await expect.soft(profilePage.updateProfileHeading).toBeVisible();
      await expect.soft(profilePage.dangerZoneHeading).toBeVisible();

      await profilePage.logout();

      await expect(page).toHaveURL(homePage.PAGE_URL);
    },
  );
});
