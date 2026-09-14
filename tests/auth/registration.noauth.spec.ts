import { registerUser } from 'src/api/auth.api';
import { BASE_API_URL } from 'src/config/env.config';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test } from 'src/fixtures/test.fixture';
import { generateUniqueEmail } from 'src/helpers/testDataHelpers';

test(
  'should register new user successfully',
  {
    annotation: { type: 'case-id', description: 'TC-REG-001' },
    tag: ['@smoke', '@auth', '@registration'],
  },
  async ({ page, registerPage, loginPage }) => {
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
    await expect(loginPage.header).toBeVisible();
    await expect(page).toHaveURL('/login.html');
  },
);

test.describe('Registration Negative Tests', () => {
  test(
    'should display validation errors for invalid email and short password',
    {
      annotation: { type: 'case-id', description: 'TC-REG-002' },
      tag: ['@auth', '@registration', '@validation', '@negative'],
    },
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
    {
      annotation: { type: 'case-id', description: 'TC-REG-003' },
      tag: ['@auth', '@registration', '@validation', '@negative'],
    },
    async ({ page, registerPage }) => {
      await registerPage.goto();
      await registerPage.registerSubmitBtn.click();

      await expect(registerPage.successMessage).toBeHidden();
      await expect(page).toHaveURL(/register\.html$/);
    },
  );

  for (const { password, caseId } of [
    { password: 'a', caseId: 'TC-REG-004' },
    { password: 'ab', caseId: 'TC-REG-005' },
  ]) {
    test(
      `should reject password with ${password.length} characters`,
      {
        annotation: { type: 'case-id', description: caseId },
        tag: ['@auth', '@registration', '@validation', '@negative'],
      },
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
      annotation: { type: 'case-id', description: 'TC-REG-006' },
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
    {
      annotation: { type: 'case-id', description: 'TC-REG-007' },
      tag: ['@auth', '@registration', '@validation', '@negative'],
    },
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
    { invalidEmail: 'plaintext', caseId: 'TC-REG-008' },
    { invalidEmail: '@example.com', caseId: 'TC-REG-009' },
    { invalidEmail: 'user@', caseId: 'TC-REG-010' },
    { invalidEmail: 'user @example.com', caseId: 'TC-REG-011' },
  ];

  for (const { invalidEmail, caseId } of invalidEmails) {
    test(
      `should reject invalid email: "${invalidEmail}"`,
      {
        annotation: { type: 'case-id', description: caseId },
        tag: ['@auth', '@registration', '@validation', '@negative'],
      },
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
