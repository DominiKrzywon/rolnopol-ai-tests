import { FrameLocator, Page } from "@playwright/test";
import { PAGE_URLS } from "../constants/pageUrls";
import { BasePage } from "./BasePage";

export class ApiDocsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.API_DOCS;
  readonly iframe: FrameLocator;

  constructor(page: Page) {
    super(page);
    this.iframe = page.frameLocator("iframe");
  }
}
