import { Locator, Page } from "@playwright/test";
import { PAGE_URLS } from "../constants/pageUrls";
import { BasePage } from "./BasePage";

export class DocsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.DOCS;
  readonly docsHeaderSubtitle: Locator;

  constructor(page: Page) {
    super(page);
    this.docsHeaderSubtitle = page.locator(".docs-header-subtitle");
  }
}
