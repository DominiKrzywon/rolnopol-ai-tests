import { expect, test } from 'src/fixtures/auth.fixture';

test.describe('Login E2E', () => {
  test(
    'should display correct user data after login',
    { tag: ['@auth', '@login', '@session', '@happy-path'] },
    async ({ loginPage, profilePage, page, registeredUser }) => {
      await loginPage.goto();
      await loginPage.login(registeredUser);

      await expect(page).toHaveURL(profilePage.PAGE_URL);
      await expect(profilePage.emailValue).toHaveText(registeredUser.email);
      await expect.soft(profilePage.profileInformationHeading).toBeVisible();
      await expect.soft(profilePage.updateProfileHeading).toBeVisible();
      await expect.soft(profilePage.dangerZoneHeading).toBeVisible();
    },
  );

  test(
    'session management should work correctly',
    { tag: ['@auth', '@session', '@logout'] },
    async ({ loginPage, profilePage, page, homePage, registeredUser }) => {
      const expectedLoginHeaderText = 'Rolnopol';

      await loginPage.goto();
      await loginPage.login(registeredUser);

      await expect(profilePage.displayedName).toHaveText(
        registeredUser.displayName!,
      );

      await page.reload();
      await expect(profilePage.displayedName).toHaveText(
        registeredUser.displayName!,
      );

      await profilePage.logout();
      await expect(page).toHaveURL(homePage.PAGE_URL);
      await expect(homePage.header).toHaveText(expectedLoginHeaderText);

      await profilePage.goto();
      await expect(page).toHaveURL(loginPage.PAGE_URL);
      await expect(loginPage.loginSubmitBtn).toBeVisible();
    },
  );
});
