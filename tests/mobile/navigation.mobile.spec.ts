import { expect, test } from 'src/fixtures/test.fixture';

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

    await homePage.loginLink.click();
    await expect(page).toHaveURL(loginPage.PAGE_URL);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginSubmitBtn).toBeVisible();
  },
);
