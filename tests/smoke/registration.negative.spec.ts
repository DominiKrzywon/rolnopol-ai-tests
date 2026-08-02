import { expect, test } from '@playwright/test';
import { generateUniqueEmail } from 'src/helpers/testDataHelpers';

import { RegisterPage } from '../../src/pages/RegisterPage';

test.describe('Registration Negative Tests', () => {
  test(
    'should display validation errors for invalid email and short password',
    { tag: ['@auth', '@registration', '@validation', '@negative'] },
    async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const invalidEmail = 'not-a-valid-email';
      const shortPassword = 'ab';

      await registerPage.goto();
      await registerPage.emailInput.fill(invalidEmail);
      await registerPage.passwordInput.fill(shortPassword);
      await registerPage.registerSubmitBtn.click();

      await expect(registerPage.emailValidationError).toBeVisible();
      await expect(registerPage.passwordValidationError).toBeVisible();
      await expect(page).toHaveURL(/register\.html$/);
    },
  );

  test(
    'should prevent registration with empty required fields',
    { tag: ['@auth', '@registration', '@validation', '@negative'] },
    async ({ page }) => {
      const registerPage = new RegisterPage(page);

      await registerPage.goto();
      await registerPage.registerSubmitBtn.click();

      await expect(registerPage.successMessage).toBeHidden();
      await expect(page).toHaveURL(/register\.html$/);
    },
  );

  test(
    'should reject password with less than 3 characters',
    { tag: ['@auth', '@registration', '@validation', '@negative'] },
    async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const shortPasswords = ['', 'a', 'ab'];

      for (const shortPassword of shortPasswords) {
        await registerPage.goto();
        await registerPage.emailInput.fill('valid@example.com');
        await registerPage.passwordInput.fill(shortPassword);
        await registerPage.registerSubmitBtn.click();

        await expect.soft(registerPage.successMessage).toBeHidden();
        await expect.soft(page).toHaveURL(/register\.html$/);
      }
    },
  );

  test(
    'should return error for duplicate user',
    { tag: ['@auth', '@registration', '@validation', '@negative'] },
    async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const expectedErrorMessage = 'User with this email already exists';
      const uniqueEmail = generateUniqueEmail();
      const user = { email: uniqueEmail, password: 'Test123.' };
      await registerPage.goto();

      await registerPage.register(user);

      await registerPage.register({ ...user, password: 'Test1234.' });

      await expect(registerPage.notificationMessage).toHaveText(
        expectedErrorMessage,
      );
    },
  );

  const invalidEmails = [
    'plaintext',
    '@example.com',
    'user@',
    'user @example.com',
  ];

  for (const invalidEmail of invalidEmails) {
    test(
      `should reject invalid email: "${invalidEmail}"`,
      { tag: ['@auth', '@registration', '@validation', '@negative'] },
      async ({ page }) => {
        const registerPage = new RegisterPage(page);

        await registerPage.goto();
        await registerPage.emailInput.fill(invalidEmail);
        await registerPage.passwordInput.fill('validPassword123');
        await registerPage.registerSubmitBtn.click();

        await expect(registerPage.emailValidationError).toBeVisible();
        await expect(page).toHaveURL(/register\.html$/);
      },
    );
  }
});
