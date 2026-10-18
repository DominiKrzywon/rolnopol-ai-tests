import { faker } from '@faker-js/faker';
import { BASE_API_URL } from 'src/config/env.config';
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
      const updateUserDisplayName =
        await profilePage.updateUserInfo(expectedUpdatedName);

      const [updateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === `${BASE_API_URL}/users/profile` &&
            response.request().method() === 'PUT',
        ),
        updateUserDisplayName,
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
});
