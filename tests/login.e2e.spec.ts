import { expect, test } from "@playwright/test";
import { createUser } from "../src/models/User";
import { HomePage } from "../src/pages/HomePage";
import { LoginPage } from "../src/pages/LoginPage";
import { ProfilePage } from "../src/pages/ProfilePage";

test.describe("Login E2E", () => {
  test(
    "should login, verify profile sections, and logout successfully",
    { tag: ["@auth", "@login", "@session", "@logout", "@happy-path"] },
    async ({ page }) => {
      const user = createUser();
      const loginPage = new LoginPage(page);
      const profilePage = new ProfilePage(page);
      const homePage = new HomePage(page);

      await loginPage.goto();
      await loginPage.login(user.email, user.password);

      await expect.soft(page).toHaveURL(profilePage.PAGE_URL);
      await expect.soft(profilePage.profileInformationHeading).toBeVisible();
      await expect.soft(profilePage.updateProfileHeading).toBeVisible();
      await expect.soft(profilePage.dangerZoneHeading).toBeVisible();

      await profilePage.logout();

      await expect(page).toHaveURL(homePage.PAGE_URL);
    },
  );
});
