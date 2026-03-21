import { expect, test as setup } from "@playwright/test";
import { DEMO_USER_AUTH_FILE } from "../../playwright.config";
import { getDemoUserData } from "../../src/models/User";
import { LoginPage } from "../../src/pages/LoginPage";
import { ProfilePage } from "../../src/pages/ProfilePage";

setup("authenticate as DEMO_USER", async ({ page }) => {
  const user = getDemoUserData();
  const loginPage = new LoginPage(page);
  const profilePage = new ProfilePage(page);

  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  await expect(page).toHaveURL(profilePage.PAGE_URL);

  await page.context().storageState({ path: DEMO_USER_AUTH_FILE });
});
