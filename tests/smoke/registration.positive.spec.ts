import { expect, test } from '@playwright/test';

import { generateUniqueEmail } from '../../src/helpers/testDataHelpers';
import { RegisterPage } from '../../src/pages/RegisterPage';

test.describe('Registration Positive Tests', () => {
  test(
    'should register a new user successfully',
    { tag: ['@auth', '@registration', '@positive'] },
    async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const uniqueEmail = generateUniqueEmail();
      const user = {
        email: uniqueEmail,
        password: 'TestPassword123',
        displayName: 'Test User',
      };
      await registerPage.goto();

      await registerPage.register(user);

      await expect(registerPage.successMessage).toBeVisible();
      await expect(page).toHaveURL('/login.html');
    },
  );
});
