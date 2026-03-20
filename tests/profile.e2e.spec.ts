import { expect, test } from "@playwright/test";
import { createUser } from "../src/models/User";
import { LoginPage } from "../src/pages/LoginPage";
import { ProfilePage } from "../src/pages/ProfilePage";

test.describe("Profile Page E2E", () => {
  test(
    "should display correct user information in profile sections after login",
    { tag: ["@auth", "@profile", "@happy-path"] },
    async ({ page }) => {
      const user = createUser();
      const loginPage = new LoginPage(page);
      const profilePage = new ProfilePage(page);

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect.soft(page).toHaveURL(profilePage.PAGE_URL);

      await expect
        .soft(profilePage.welcomeMessage)
        .toContainText(`Welcome, ${user.displayName}`);

      await expect
        .soft(profilePage.displayedName)
        .toHaveText(user.displayName);
      await expect.soft(profilePage.emailValue).toHaveText(user.email);
      await expect.soft(profilePage.userId).not.toBeEmpty();
      await expect.soft(profilePage.createdAt).not.toBeEmpty();
      await expect.soft(profilePage.lastLogin).not.toBeEmpty();

      await expect.soft(profilePage.displayNameInput).toBeVisible();
      await expect
        .soft(profilePage.displayNameInput)
        .toHaveValue(user.displayName);
      await expect.soft(profilePage.newPasswordInput).toBeVisible();
      await expect.soft(profilePage.confirmPasswordInput).toBeVisible();
      await expect.soft(profilePage.saveChangesBtn).toBeVisible();

      await expect.soft(profilePage.deleteAccountBtn).toBeVisible();
    },
  );
});
