import { Locator, Page } from "@playwright/test";
import { PAGE_URLS } from "../constants/pageUrls";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.LOGIN;
  readonly loginSubtitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginSubmitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.loginSubtitle = page.getByTestId("login-subtitle");
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.loginSubmitBtn = page.getByTestId("login-submit-btn");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginSubmitBtn.click();
  }
}
