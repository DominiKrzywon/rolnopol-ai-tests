import { faker } from '@faker-js/faker';
import type { Route } from '@playwright/test';
import { loginUser } from 'src/api/auth.api';
import { BASE_API_URL, ENV } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/auth.fixture';

test.describe('profile isolated tests', () => {
  test(
    'should be able to change display name',
    {
      annotation: { type: 'case-id', description: 'TC-PROFILE-002' },
      tag: ['@profile', '@happy-path', '@mobile'],
    },
    async ({ freshUser, profilePage, page }) => {
      const expectedSuccessMessageUI = 'Profile information updated';
      const expectedSuccessMessageAPI = 'Profile updated successfully';
      const expectedUpdatedName = faker.person.firstName();
      const userEmail = freshUser.email;

      await profilePage.goto();

      // Capture the profile update response before submitting the new name
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

      // Verify the new name persists while the account email stays unchanged
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
      // Require explicit confirmation before allowing account deletion
      await profilePage.openDeleteAccountModal();

      await expect(profilePage.deleteModalTitle).toBeVisible();
      await expect(profilePage.confirmDeleteAccountBtn).toBeDisabled();

      await profilePage.deleteConfirmationInput.fill('DELETE');

      await expect(profilePage.confirmDeleteAccountBtn).toBeEnabled();

      // Confirm deletion while capturing the matching API response
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

      // Verify the deleted account can no longer authenticate
      const attemptToLogInAfterDelete = await loginUser(request, freshUser);
      const attemptJson = await attemptToLogInAfterDelete.json();

      expect(attemptToLogInAfterDelete.status()).toBe(401);
      expect(attemptJson.error).toEqual(expectedErrorMessage);
      expect(attemptJson.success).toBe(false);
    },
  );

  test(
    'should not update name after API error',
    {
      annotation: { type: 'case-id', description: 'TC-PROFILE-004' },
      tag: ['@profile', '@negative', '@mobile'],
    },
    async ({ page, freshUser, profilePage }) => {
      const expectedErrorMessage = 'Unable to save profile';
      const updatedName = `user_${Date.now()}`;
      const profileUrl = `${BASE_API_URL}/users/profile`;

      await profilePage.goto();

      await page.route(profileUrl, async (route) => {
        if (route.request().method() !== 'PUT') {
          await route.continue();
          return;
        }

        await route.fulfill({
          status: 500,
          json: {
            success: false,
            error: expectedErrorMessage,
          },
        });
      });

      const [updateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === profileUrl &&
            response.request().method() === 'PUT',
        ),
        profilePage.updateUserInfo(updatedName),
      ]);

      expect(updateResponse.status()).toBe(500);

      await expect(profilePage.updateErrorMessage).toContainText(
        expectedErrorMessage,
      );

      await expect(profilePage.displayedName).toHaveText(
        freshUser.displayName!,
      );

      await page.reload();

      await expect(profilePage.displayedName).toHaveText(
        freshUser.displayName!,
      );
    },
  );

  test(
    'should save name when retrying after API error',
    {
      annotation: { type: 'case-id', description: 'TC-PROFILE-005' },
      tag: ['@profile', '@negative', '@mobile'],
    },
    async ({ page, freshUser, profilePage }) => {
      const expectedErrorMessage = 'Unable to save profile';
      const expectedSuccessMessage = 'Profile information updated';
      const updatedName = `user_${Date.now()}`;
      const profileUrl = `${BASE_API_URL}/users/profile`;

      await profilePage.goto();

      const failProfileSave = async (route: Route): Promise<void> => {
        // eslint-disable-next-line playwright/no-conditional-in-test -- Only mock PUT; let other profile requests reach the API.
        if (route.request().method() !== 'PUT') {
          await route.continue();
          return;
        }

        await route.fulfill({
          status: 500,
          json: {
            success: false,
            error: expectedErrorMessage,
          },
        });
      };

      await page.route(profileUrl, failProfileSave);

      await profilePage.updateUserInfo(updatedName);

      await expect(profilePage.updateErrorMessage).toContainText(
        expectedErrorMessage,
      );
      await expect(profilePage.displayedName).toHaveText(
        freshUser.displayName!,
      );
      await expect(profilePage.updateUserName).toBeVisible();
      await expect(profilePage.updateUserName).toHaveValue(updatedName);
      await expect(profilePage.saveUpdatedUserInfo).toBeEnabled();

      await page.unroute(profileUrl, failProfileSave);

      const [retryResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === profileUrl &&
            response.request().method() === 'PUT',
        ),
        profilePage.saveUpdatedUserInfo.click(),
      ]);

      expect(retryResponse.status()).toBe(200);
      await expect(profilePage.updateSuccessMessage).toHaveText(
        expectedSuccessMessage,
      );

      await page.reload();
      await expect(profilePage.displayedName).toHaveText(updatedName);
    },
  );

  test(
    'should handle error during profile save',
    {
      annotation: { type: 'case-id', description: 'TC-PROFILE-006' },
      tag: ['@profile', '@negative', '@mobile'],
    },
    async ({ page, freshUser, profilePage }) => {
      const updatedName = `user_${Date.now()}`;
      const profileUrl = `${BASE_API_URL}/users/profile`;

      await profilePage.goto();

      await page.route(profileUrl, async (route) => {
        if (route.request().method() !== 'PUT') {
          await route.continue();
          return;
        }

        await route.abort();
      });

      const [failedRequest] = await Promise.all([
        page.waitForEvent(
          'requestfailed',
          (request) =>
            request.url() === profileUrl && request.method() === 'PUT',
        ),
        profilePage.updateUserInfo(updatedName),
      ]);

      expect(failedRequest.failure()).not.toBeNull();
      await expect(profilePage.updateErrorMessage).toBeVisible();
      await expect(profilePage.updateUserName).toHaveValue(updatedName);
      await expect(profilePage.saveUpdatedUserInfo).toBeEnabled();

      await page.reload();

      await expect(profilePage.displayedName).toHaveText(
        freshUser.displayName!,
      );
    },
  );
});
