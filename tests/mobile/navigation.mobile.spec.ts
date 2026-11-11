import { expect, test } from 'src/fixtures/test.fixture';

test.describe('mobile tests', () => {
  test(
    'Should open login page through mobile navigation',
    {
      annotation: { type: 'case-id', description: 'TC-MOBILE-001' },
      tag: ['@auth', '@profile', '@happy-path', '@mobile'],
    },
    async ({ homePage, loginPage, page }) => {
      await homePage.goto();
      await homePage.mobileMenuToggle.click();
      await expect(homePage.mobileMenuToggle).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      await expect(homePage.loginLink).toBeVisible();
      await expect(homePage.loginLink).toBeEnabled();

      await homePage.mobileMenuToggle.click();

      await expect(homePage.mobileMenuToggle).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      await expect.soft(homePage.mobileMenu).toHaveCSS('opacity', '0');
      await expect.soft(homePage.mobileMenu).toHaveCSS('max-height', '0px');
      await expect.soft(homePage.mobileMenu).toHaveCSS('overflow', 'hidden');

      await homePage.mobileMenuToggle.click();
      await homePage.loginLink.click();

      await expect(page).toHaveURL(loginPage.PAGE_URL);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginSubmitBtn).toBeVisible();
    },
  );

  test(
    'Should open register page through mobile navigation',
    {
      annotation: { type: 'case-id', description: 'TC-MOBILE-002' },
      tag: ['@auth', '@register', '@happy-path', '@mobile'],
    },
    async ({ homePage, registerPage, page }) => {
      await homePage.goto();
      await homePage.mobileMenuToggle.click();
      await homePage.mobileRegisterLink.click();

      await expect(page).toHaveURL(registerPage.PAGE_URL);
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.emailInput).toBeEnabled();
      await expect(registerPage.displayNameInput).toBeVisible();
      await expect(registerPage.displayNameInput).toBeEnabled();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeEnabled();
      await expect(registerPage.registerSubmitBtn).toBeVisible();
      await expect(registerPage.registerSubmitBtn).toBeEnabled();
    },
  );

  test(
    'Should keep login controls usable without horizontal scrolling on mobile',
    {
      annotation: { type: 'case-id', description: 'TC-MOBILE-003' },
      tag: ['@auth', '@login', '@happy-path', '@mobile'],
    },
    async ({ page, loginPage }) => {
      const exampleEmail = 'test@test.com';
      const examplePassword = 'Test123.';

      await loginPage.goto();
      await loginPage.emailInput.fill(exampleEmail);
      await loginPage.passwordInput.fill(examplePassword);
      await loginPage.loginSubmitBtn.scrollIntoViewIfNeeded();

      await expect(loginPage.loginSubmitBtn).toBeVisible();
      await expect(loginPage.emailInput).toHaveValue(exampleEmail);
      await expect(loginPage.passwordInput).toHaveValue(examplePassword);

      const dimensions = await page.evaluate(() => ({
        contentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }));

      expect(dimensions.contentWidth).toBeLessThanOrEqual(
        dimensions.viewportWidth + 1,
      );

      const controls = [
        ['email', loginPage.emailInput],
        ['password', loginPage.passwordInput],
        ['submit', loginPage.loginSubmitBtn],
      ] as const;

      for (const [name, control] of controls) {
        const bounds = await control.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            width: document.documentElement.clientWidth,
          };
        });

        expect(bounds.left, `${name}: left edge`).toBeGreaterThanOrEqual(-1);
        expect(bounds.right, `${name}: right edge`).toBeLessThanOrEqual(
          bounds.width + 1,
        );
      }
    },
  );
});
