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
  readonly animalsHeading: Locator;
  readonly fieldsList: Locator;
  readonly animalsList: Locator;
  readonly searchFieldsInput: Locator;
  readonly searchAnimalsInput: Locator;
  readonly addFieldBtn: Locator;
  readonly addAnimalBtn: Locator;
  readonly fieldAddedMessage: Locator;

  readonly addFieldModal: Locator;
  readonly fieldNameInput: Locator;
  readonly fieldAreaInput: Locator;
  readonly fieldDistrictSelect: Locator;
  readonly addFieldSubmitBtn: Locator;
  readonly closeAddFieldModalBtn: Locator;

  readonly addAnimalModal: Locator;
  readonly animalTypeSelect: Locator;
  readonly animalAmountInput: Locator;
  readonly animalFieldSelect: Locator;
  readonly addAnimalSubmitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", {
      name: "Staff & Fields Management",
    });
    this.fieldsHeading = page.getByRole("heading", { name: "Fields" });
    this.animalsHeading = page.getByRole("heading", {
      name: "Animals (groups)",
    });
    this.fieldsList = page.getByRole("list").first();
    this.animalsList = page.locator("#animalsList");
    this.searchFieldsInput = page.getByPlaceholder("Search fields...");
    this.searchAnimalsInput = page.getByPlaceholder("Search animals...");
    this.addFieldBtn = page.locator("#openAddFieldModal");
    this.addAnimalBtn = page.locator("#openAddAnimalModal");
    this.fieldAddedMessage = page.getByText("Field added!");

    this.addFieldModal = page.locator("#addFieldModal");
    this.fieldNameInput = page.locator("#fieldName");
    this.fieldAreaInput = page.locator("#fieldArea");
    this.fieldDistrictSelect = page.locator("#fieldDistrict");
    this.addFieldSubmitBtn = page.locator(
      "#addFieldModal button[type='submit']",
    );
    this.closeAddFieldModalBtn = page.locator("#closeAddFieldModal");

    this.addAnimalModal = page.locator("#addAnimalModal");
    this.animalTypeSelect = page.locator("#animalType");
    this.animalAmountInput = page.locator("#animalAmount");
    this.animalFieldSelect = page.locator("#animalField");
    this.addAnimalSubmitBtn = page.locator(
      "#addAnimalForm button[type='submit']",
    );
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

  async openAddAnimalModal() {
    await this.addAnimalBtn.click();
  }

  async addAnimalGroup(type: string, amount: number, fieldId: string = "") {
    await this.openAddAnimalModal();
    await this.animalTypeSelect.selectOption(type);
    await this.animalAmountInput.fill(String(amount));
    await this.animalFieldSelect.selectOption(fieldId);
    await this.addAnimalSubmitBtn.click();
  }

  async searchAnimals(query: string) {
    await this.searchAnimalsInput.fill(query);
  }

  getFieldByName(name: string): Locator {
    return this.page.getByRole("strong").filter({ hasText: name });
  }

  getAnimalGroupByTypeAndAmount(type: string, amount: number): Locator {
    return this.animalsList
      .locator("li")
      .filter({ hasText: new RegExp(`${type}\\s+${amount}\\b`, "i") })
      .first();
  }
}
