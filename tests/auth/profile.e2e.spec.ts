import { expect, test } from 'src/fixtures/test.fixture';

import { getDemoUserData } from '../../src/models/User';

test.describe('Profile Page E2E', () => {
  test(
    'should display correct user information in profile sections',
    {
      annotation: { type: 'case-id', description: 'TC-PROFILE-001' },
      tag: ['@auth', '@profile', '@happy-path'],
    },
    async ({ profilePage, page }) => {
      const user = getDemoUserData();
      const expectedWelcomeMessage = `Welcome, ${user.displayName}`;

      await profilePage.goto();
      await expect(page).toHaveURL(profilePage.PAGE_URL);

      // Verify the displayed account information
      await expect
        .soft(profilePage.welcomeMessage)
        .toContainText(expectedWelcomeMessage);

      await expect
        .soft(profilePage.displayedName)
        .toHaveText(user.displayName!);
      await expect.soft(profilePage.emailValue).toHaveText(user.email);
      await expect.soft(profilePage.userId).not.toBeEmpty();
      await expect.soft(profilePage.createdAt).not.toBeEmpty();
      await expect.soft(profilePage.lastLogin).not.toBeEmpty();

      // Verify the profile editing controls are available
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
