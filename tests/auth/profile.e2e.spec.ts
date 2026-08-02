import { expect, test } from 'src/fixtures/test.fixture';

import { getDemoUserData } from '../../src/models/User';

test.describe('Profile Page E2E', () => {
  test(
    'should display correct user information in profile sections',
    { tag: ['@auth', '@profile', '@happy-path'] },
    async ({ profilePage }) => {
      const user = getDemoUserData();

      await profilePage.goto();

      await expect
        .soft(profilePage.welcomeMessage)
        .toContainText(`Welcome, ${user.displayName}`);

      await expect
        .soft(profilePage.displayedName)
        .toHaveText(user.displayName!);
      await expect.soft(profilePage.emailValue).toHaveText(user.email);
      await expect.soft(profilePage.userId).not.toBeEmpty();
      await expect.soft(profilePage.createdAt).not.toBeEmpty();
      await expect.soft(profilePage.lastLogin).not.toBeEmpty();

      await expect.soft(profilePage.displayNameInput).toBeVisible();
      await expect
        .soft(profilePage.displayNameInput)
        .toHaveValue(user.displayName!);
      await expect.soft(profilePage.newPasswordInput).toBeVisible();
      await expect.soft(profilePage.confirmPasswordInput).toBeVisible();
      await expect.soft(profilePage.saveChangesBtn).toBeVisible();

      await expect.soft(profilePage.deleteAccountBtn).toBeVisible();
    },
  );
});
