import { Locator, Page } from "@playwright/test";
import { PAGE_URLS } from "../constants/pageUrls";
import { BasePage } from "./BasePage";

export class RegisterPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.REGISTER;
  readonly emailInput: Locator;
  readonly displayNameInput: Locator;
  readonly passwordInput: Locator;
  readonly registerSubmitBtn: Locator;
  readonly registerSubtitle: Locator;
  readonly successMessage: Locator;
  readonly emailValidationError: Locator;
  readonly passwordValidationError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId("email-input");
    this.displayNameInput = page.getByTestId("display-name-input");
    this.passwordInput = page.getByTestId("password-input");
    this.registerSubmitBtn = page.getByTestId("register-submit-btn");
    this.registerSubtitle = page.getByTestId("register-subtitle");
    this.successMessage = page.getByText("Registration successful!");
    this.emailValidationError = page
      .getByTestId("register-form")
      .getByText("Please enter a valid email address");
    this.passwordValidationError = page
      .getByTestId("register-form")
      .getByText("Must be at least 3 characters");
  }

  async register(email: string, password: string, displayName?: string) {
    await this.emailInput.fill(email);
    if (displayName) {
      await this.displayNameInput.fill(displayName);
    }
    await this.passwordInput.fill(password);
    await this.registerSubmitBtn.click();
  }
}
