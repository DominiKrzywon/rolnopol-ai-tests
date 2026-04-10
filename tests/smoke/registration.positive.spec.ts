import { expect, test } from '@playwright/test';

import { generateUniqueEmail } from '../../src/helpers/testDataHelpers';
import { RegisterPage } from '../../src/pages/RegisterPage';

test.describe('Registration Positive Tests', () => {
  test(
    'should register a new user successfully',
    { tag: ['@auth', '@registration', '@positive'] },
    async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      const uniqueEmail = generateUniqueEmail();
      await registerPage.register(uniqueEmail, 'TestPassword123', 'Test User');

      await expect(registerPage.successMessage).toBeVisible();
      await expect(page).toHaveURL(/login\.html$/);
    },
  );
});
