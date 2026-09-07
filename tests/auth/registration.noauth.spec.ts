import { registerUser } from 'src/api/auth.api';
import { BASE_API_URL } from 'src/config/env.config';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test } from 'src/fixtures/test.fixture';
import { generateUniqueEmail } from 'src/helpers/testDataHelpers';

test(
  'should register new user successfully',
  { tag: ['@smoke', '@auth', '@registration'] },
  async ({ page, registerPage }) => {
    const uniqueEmail = generateUniqueEmail();
    const user = {
      email: uniqueEmail,
      password: 'testpassword123',
      displayName: 'Test User',
    };
    await registerPage.goto();

    const [registrationResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url() === `${BASE_API_URL}/register` &&
          response.request().method() === 'POST',
      ),
      registerPage.register(user),
    ]);

    expect(registrationResponse.status()).toBe(201);
    await expect(registerPage.successMessage).toBeVisible();
    await expect(page).toHaveURL('/login.html');
  },
);

test.describe('Registration Negative Tests', () => {
  test(
    'should display validation errors for invalid email and short password',
    { tag: ['@auth', '@registration', '@validation', '@negative'] },
    async ({ page, registerPage }) => {
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
    async ({ page, registerPage }) => {
      await registerPage.goto();
      await registerPage.registerSubmitBtn.click();

      await expect(registerPage.successMessage).toBeHidden();
      await expect(page).toHaveURL(/register\.html$/);
    },
  );

  for (const password of ['a', 'ab']) {
    test(
      `should reject password with ${password.length} characters`,
      { tag: ['@auth', '@registration', '@validation', '@negative'] },
      async ({ page, registerPage }) => {
        await registerPage.goto();
        await registerPage.emailInput.fill('valid@example.com');
        await registerPage.passwordInput.fill(password);
        await registerPage.registerSubmitBtn.click();

        await expect.soft(registerPage.passwordValidationError).toBeVisible();
        await expect.soft(page).toHaveURL('/register.html');
      },
    );
  }

  test(
    'should reject registration for empty password',
    {
      tag: ['@auth', '@registration', '@validation', '@negative'],
    },
    async ({ page, registerPage }) => {
      await registerPage.goto();
      await registerPage.emailInput.fill('valid@example.com');
      await registerPage.registerSubmitBtn.click();

      const isPasswordMissing = await registerPage.passwordInput.evaluate(
        (input: HTMLInputElement) => input.validity.valueMissing,
      );

      expect(isPasswordMissing).toBe(true);
      await expect(registerPage.passwordInput).toBeFocused();
      await expect(page).toHaveURL('/register.html');
    },
  );

  test(
    'should reject registration with duplicate email',
    { tag: ['@auth', '@registration', '@validation', '@negative'] },
    async ({ page, request, registerPage }) => {
      const user = prepareRandomUser();
      const expectedErrorMessage = 'User with this email already exists';

      const setupResponse = await registerUser(request, user);
      expect(setupResponse.status()).toBe(201);

      await registerPage.goto();

      const [duplicateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === `${BASE_API_URL}/register` &&
            response.request().method() === 'POST',
        ),

        registerPage.register({
          ...user,
          password: 'DifferentPassword123',
        }),
      ]);

      expect(duplicateResponse.status()).toBe(409);
      await expect(registerPage.notificationMessage).toHaveText(
        expectedErrorMessage,
      );
      await expect(page).toHaveURL(/register\.html$/);
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
      async ({ page, registerPage }) => {
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
