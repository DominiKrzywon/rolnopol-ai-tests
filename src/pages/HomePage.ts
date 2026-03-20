import { Page } from "@playwright/test";
import { PAGE_URLS } from "../constants/pageUrls";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.HOME;

  constructor(page: Page) {
    super(page);
  }
}
