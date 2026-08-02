import { expect, test } from 'src/fixtures/test.fixture';

import { getEmptyUserData } from '../../src/models/User';

test.describe('Login E2E', () => {
  test(
    'should display correct user data after login',
    { tag: ['@auth', '@login', '@session', '@happy-path'] },
    async ({ loginPage, profilePage, page }) => {
      const user = getEmptyUserData();

      await loginPage.goto();
      await loginPage.login(user);

      await expect.soft(page).toHaveURL(profilePage.PAGE_URL);
      await expect(profilePage.emailValue).toHaveText(user.email);
    },
  );

  test(
    'session management should work correctly',
    { tag: ['@auth', '@session', '@logout'] },
    async ({ loginPage, profilePage, page, homePage }) => {
      const user = getEmptyUserData();
      const expectedLoginHeaderText = 'Rolnopol';

      await loginPage.goto();
      await loginPage.login(user);

      await expect(profilePage.displayedName).toHaveText(user.displayName!);

      await page.reload();
      await expect(profilePage.displayedName).toHaveText(user.displayName!);

      await profilePage.logout();

      await expect(homePage.header).toHaveText(expectedLoginHeaderText);
    },
  );
});
