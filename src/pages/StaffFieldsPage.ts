import { Locator, Page } from "@playwright/test";
import { PAGE_URLS } from "../constants/pageUrls";
import { BasePage } from "./BasePage";

/**
 * Page Object for the Staff & Fields Management page.
 * Provides locators and actions for managing fields and staff resources.
 */
export class StaffFieldsPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.STAFF_FIELDS;

  readonly pageHeading: Locator;
  readonly fieldsHeading: Locator;
  readonly fieldsList: Locator;
  readonly searchFieldsInput: Locator;
  readonly addFieldBtn: Locator;
  readonly fieldAddedMessage: Locator;

  readonly addFieldModal: Locator;
  readonly fieldNameInput: Locator;
  readonly fieldAreaInput: Locator;
  readonly fieldDistrictSelect: Locator;
  readonly addFieldSubmitBtn: Locator;
  readonly closeAddFieldModalBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", {
      name: "Staff & Fields Management",
    });
    this.fieldsHeading = page.getByRole("heading", { name: "Fields" });
    this.fieldsList = page.getByRole("list").first();
    this.searchFieldsInput = page.getByPlaceholder("Search fields...");
    this.addFieldBtn = page.locator("#openAddFieldModal");
    this.fieldAddedMessage = page.getByText("Field added!");

    this.addFieldModal = page.locator("#addFieldModal");
    this.fieldNameInput = page.locator("#fieldName");
    this.fieldAreaInput = page.locator("#fieldArea");
    this.fieldDistrictSelect = page.locator("#fieldDistrict");
    this.addFieldSubmitBtn = page.locator(
      "#addFieldModal button[type='submit']",
    );
    this.closeAddFieldModalBtn = page.locator("#closeAddFieldModal");
  }

  async openAddFieldModal() {
    await this.addFieldBtn.click();
  }

  async addField(name: string, area: number) {
    await this.openAddFieldModal();
    await this.fieldNameInput.fill(name);
    await this.fieldAreaInput.fill(String(area));
    await this.addFieldSubmitBtn.click();
  }

  async searchFields(query: string) {
    await this.searchFieldsInput.click();
    await this.searchFieldsInput.pressSequentially(query);
  }

  getFieldByName(name: string): Locator {
    return this.page.getByRole("strong").filter({ hasText: name });
  }
}
