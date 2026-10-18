import { faker } from '@faker-js/faker';
import { loginUser } from 'src/api/auth.api';
import { BASE_API_URL, ENV } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/auth.fixture';

test.describe('profile isolated tests', () => {
  test(
    'should be able to change display name',
    {
      annotation: { type: 'case-id', description: 'TC-PROFILE-002' },
      tag: ['@profile', '@happy-path'],
    },
    async ({ freshUser, profilePage, page }) => {
      const expectedSuccessMessageUI = 'Profile information updated';
      const expectedSuccessMessageAPI = 'Profile updated successfully';
      const expectedUpdatedName = faker.person.firstName();
      const userEmail = freshUser.email;

      await profilePage.goto();

      const [updateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === `${BASE_API_URL}/users/profile` &&
            response.request().method() === 'PUT',
        ),
        profilePage.updateUserInfo(expectedUpdatedName),
      ]);

      const body = await updateResponse.json();

      expect(updateResponse.status()).toBe(200);
      expect(body.message).toEqual(expectedSuccessMessageAPI);
      await expect(profilePage.notificationMessage).toHaveText(
        expectedSuccessMessageUI,
      );
      expect(body.success).toBe(true);
      expect(body.data.displayedName).toBe(expectedUpdatedName);
      await expect(profilePage.displayedName).toHaveText(expectedUpdatedName);

      await page.reload();
      await expect(profilePage.displayedName).toHaveText(expectedUpdatedName);
      await expect(profilePage.emailValue).toHaveText(userEmail);
    },
  );

  test(
    'should be able to delete own account',
    {
      annotation: { type: 'case-id', description: 'TC-PROFILE-003' },
      tag: ['@profile', '@happy-path', '@deletion'],
    },
    async ({ freshUser, request, profilePage, page, homePage }) => {
      const expectedSuccessMessage = 'Account deleted successfully';
      const expectedErrorMessage = 'Invalid credentials';

      await profilePage.goto();
      await profilePage.openDeleteAccountModal();

      await expect(profilePage.deleteModalTitle).toBeVisible();
      await expect(profilePage.confirmDeleteAccountBtn).toBeDisabled();

      await profilePage.deleteConfirmationInput.fill('DELETE');

      await expect(profilePage.confirmDeleteAccountBtn).toBeEnabled();

      const [deleteResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === `${BASE_API_URL}/users/profile` &&
            response.request().method() === 'DELETE',
        ),
        profilePage.confirmDeleteAccountBtn.click(),
      ]);

      const body = await deleteResponse.json();

      expect(deleteResponse.status()).toBe(200);
      await expect(profilePage.notificationMessage).toHaveText(
        expectedSuccessMessage,
      );
      expect(body.success).toBe(true);
      expect(body.message).toEqual(expectedSuccessMessage);
      await expect(homePage.statsSection).toBeVisible();
      await expect(page).toHaveURL(ENV.BASE_URL);

      const attemptToLogInAfterDelete = await loginUser(request, freshUser);
      const attemptJson = await attemptToLogInAfterDelete.json();

      expect(attemptToLogInAfterDelete.status()).toBe(401);
      expect(attemptJson.error).toEqual(expectedErrorMessage);
      expect(attemptJson.success).toBe(false);
    },
  );
});
