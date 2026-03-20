import { Locator, Page } from "@playwright/test";
import { PAGE_URLS } from "../constants/pageUrls";
import { BasePage } from "./BasePage";

/**
 * Page Object for the user profile/dashboard page.
 * Provides locators for profile sections, user info, update form, and account actions.
 */
export class ProfilePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.PROFILE;

  readonly profileInformationHeading: Locator;
  readonly updateProfileHeading: Locator;
  readonly dangerZoneHeading: Locator;
  readonly logoutBtn: Locator;

  readonly welcomeMessage: Locator;
  readonly displayedName: Locator;
  readonly emailValue: Locator;
  readonly userId: Locator;
  readonly createdAt: Locator;
  readonly lastLogin: Locator;

  readonly displayNameInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveChangesBtn: Locator;

  readonly deleteAccountBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.profileInformationHeading = page.getByRole("heading", {
      name: "Profile Information",
    });
    this.updateProfileHeading = page.getByRole("heading", {
      name: "Update Profile",
    });
    this.dangerZoneHeading = page.getByRole("heading", {
      name: "Danger Zone",
    });
    this.logoutBtn = page
      .getByTestId("header-component")
      .getByTestId("logout-btn");

    this.welcomeMessage = page.getByTestId("nav-profile");
    this.displayedName = page.getByTestId("displayed-name");
    this.emailValue = page.getByTestId("email-value");
    this.userId = page.getByTestId("user-id");
    this.createdAt = page.getByTestId("created-at");
    this.lastLogin = page.getByTestId("last-login");

    this.displayNameInput = page.getByTestId("new-displayed-name-input");
    this.newPasswordInput = page.getByTestId("new-password-input");
    this.confirmPasswordInput = page.getByTestId("confirm-password-input");
    this.saveChangesBtn = page.getByTestId("update-profile-submit-btn");

    this.deleteAccountBtn = page.getByTestId("delete-account-btn");
  }

  async logout() {
    await this.logoutBtn.click();
  }
}
