import { expect, test } from 'src/fixtures/auth.fixture';

test.describe('Login E2E', () => {
  test(
    'should display correct user data after login',
    {
      annotation: { type: 'case-id', description: 'TC-LOGIN-001' },
      tag: ['@auth', '@login', '@session', '@happy-path'],
    },
    async ({ loginPage, profilePage, page, registeredUser }) => {
      await page.addInitScript(() => {
        const descriptor = Object.getOwnPropertyDescriptor(
          Document.prototype,
          'cookie',
        );

        if (!descriptor?.get || !descriptor.set) {
          throw new Error('Cookie instrumentation unavailable');
        }

        const originalSetter = descriptor.set;

        Object.defineProperty(document, 'cookie', {
          configurable: true,
          get: descriptor.get,
          set(value: string) {
            originalSetter.call(document, value);

            if (value.trim().startsWith('rolnopolIsLogged=')) {
              // eslint-disable-next-line no-console
              console.trace('Auth marker write:', value);
            }
          },
        });
      });

      await loginPage.goto();
      await loginPage.login(registeredUser);

      try {
        await expect(page).toHaveURL(profilePage.PAGE_URL);
      } finally {
        // eslint-disable-next-line no-console
        console.log(
          'Auth cookie state:',
          await page.evaluate(() => {
            const cookies = document.cookie
              .split(';')
              .map((cookie) => cookie.trim());

            return {
              hasToken: cookies.some((cookie) =>
                cookie.startsWith('rolnopolToken='),
              ),
              isLogged: cookies.includes('rolnopolIsLogged=true'),
            };
          }),
        );
      }

      await expect(page).toHaveURL(profilePage.PAGE_URL);
      await expect(profilePage.emailValue).toHaveText(registeredUser.email);
      await expect.soft(profilePage.profileInformationHeading).toBeVisible();
      await expect.soft(profilePage.updateProfileHeading).toBeVisible();
      await expect.soft(profilePage.dangerZoneHeading).toBeVisible();
    },
  );

  test(
    'session management should work correctly',
    {
      annotation: { type: 'case-id', description: 'TC-LOGIN-002' },
      tag: ['@auth', '@session', '@logout'],
    },
    async ({ loginPage, profilePage, page, registeredUser }) => {
      await loginPage.goto();
      await loginPage.login(registeredUser);

      await expect(profilePage.displayedName).toHaveText(
        registeredUser.displayName!,
      );

      // Verify the session survives a page reload
      await page.reload();
      await expect(profilePage.displayedName).toHaveText(
        registeredUser.displayName!,
      );

      // Log out and verify the public homepage
      await profilePage.logout();

      await expect(page).toHaveURL(loginPage.PAGE_URL);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginSubmitBtn).toBeVisible();

      // Verify the profile requires login again
      await profilePage.goto();
      await expect(page).toHaveURL(loginPage.PAGE_URL);
      await expect(loginPage.loginSubmitBtn).toBeVisible();
    },
  );
});
