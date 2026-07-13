import { Locator, Page } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class ManagementPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.MANAGEMENT;
  readonly header: Locator;
  readonly totalFields: Locator;
  readonly totalStaff: Locator;
  readonly totalAnimals: Locator;
  readonly totalArea: Locator;

  readonly addFieldModal: Locator;
  readonly fieldHeading: Locator;
  readonly fieldNameModal: Locator;
  readonly fieldDistrictModal: Locator;
  readonly fieldAreaModal: Locator;
  readonly addFieldModalButton: Locator;
  readonly fieldNameModalError: Locator;
  readonly fieldAreaModalError: Locator;
  readonly fieldAddedMessage: Locator;
  readonly searchFieldInput: Locator;

  readonly addStaffModal: Locator;
  readonly staffHeading: Locator;
  readonly staffNameModal: Locator;
  readonly staffSurnameModal: Locator;
  readonly staffAgeModal: Locator;
  readonly staffModalButton: Locator;
  readonly staffNameModalError: Locator;
  readonly staffSurnameModalError: Locator;
  readonly staffAgeModalError: Locator;
  readonly staffAddedMessage: Locator;
  readonly searchStaffInput: Locator;

  readonly addAnimal: Locator;
  readonly animalHeading;
  readonly animalTypeModal: Locator;
  readonly animalAmountModal: Locator;
  readonly animalFieldModal: Locator;
  readonly animalAddModalButton: Locator;
  readonly animalAmountModalError: Locator;

  readonly confirmDeleteLocator: Locator;

  readonly closeButtons = {
    addField: this.page.locator('#closeAddFieldModal'),
    addStaff: this.page.locator('#closeAddStaffModal'),
    addAnimal: this.page.locator('#closeAddAnimalModal'),
    editAnimal: this.page.locator('#closeEditAnimalModal'),
    confirm: this.page.locator('#closeConfirmModal'),
  };

  readonly editButtons = {
    editField: this.page.locator('button[title="Edit Field"]'),
    editStaff: this.page.locator('button[title="Edit Staff"]'),
    editAnimal: this.page.locator('button[title="Edit Animal"]'),
    deleteField: this.page.locator('button[title="Delete Field"]'),
    deleteStaff: this.page.locator('button[title="Delete Staff"]'),
    deleteAnimal: this.page.locator('button[title="Delete Animal"]'),
  };

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', {
      name: 'Staff & Fields Management',
    });
    this.totalFields = page.locator('.totalFields');
    this.totalStaff = page.locator('.totalStaff');
    this.totalAnimals = page.locator('.totalAnimals');
    this.totalArea = page.locator('.totalArea');

    this.addFieldModal = page.locator('#openAddFieldModal');
    this.fieldHeading = page.getByRole('heading', { name: ' Fields' });
    this.fieldNameModal = page.getByPlaceholder('Enter field name');
    this.fieldDistrictModal = page.locator('#fieldDistrict');
    this.fieldAreaModal = page.locator('#fieldArea');
    this.addFieldModalButton = page.locator(
      "#addFieldModal button[type='submit']",
    );
    this.fieldNameModalError = page.locator('#fieldNameError');
    this.fieldAreaModalError = page.locator('#fieldAreaError');
    this.fieldAddedMessage = page.getByText('Field added!');
    this.searchFieldInput = page.getByPlaceholder('Search fields...');

    this.addStaffModal = page.locator('#openAddStaffModal');
    this.staffHeading = page.getByRole('heading', { name: ' Staff' });
    this.staffNameModal = page.getByPlaceholder('Enter name');
    this.staffSurnameModal = page.getByPlaceholder('Enter surname');
    this.staffAgeModal = page.getByPlaceholder('e.g. 30');
    this.staffModalButton = page
      .getByRole('button', { name: ' Add Staff' })
      .last();
    this.staffNameModalError = page.locator('#staffNameError');
    this.staffSurnameModalError = page.locator('#staffSurnameError');
    this.staffAgeModalError = page.locator('#staffAgeError');
    this.staffAddedMessage = page.getByText('Staff added!');
    this.searchStaffInput = page.getByPlaceholder('Search staff...');

    this.addAnimal = page.locator('#openAddAnimalModal');
    this.animalHeading = page.getByRole('heading', {
      name: ' Animals (groups)',
    });
    this.animalTypeModal = page.locator('#animalType');
    this.animalAmountModal = page.locator('#animalAmount');
    this.animalFieldModal = page.locator('#animalField');
    this.animalAddModalButton = page
      .getByRole('button', {
        name: ' Add Animal',
      })
      .last();
    this.animalAmountModalError = page.locator('#animalAmountError');

    this.confirmDeleteLocator = page.locator('#confirmConfirmModal');
  }

  async openAddFieldModal(): Promise<void> {
    await this.addFieldModal.click();
  }

  async addField(name: string, area: number): Promise<void> {
    await this.openAddFieldModal();
    await this.fieldNameModal.fill(name);
    await this.fieldAreaModal.fill(String(area));
    await this.addFieldModalButton.click();
  }

  async searchFields(query: string): Promise<void> {
    await this.searchFieldInput.fill(query);
  }

  async openAddAnimalModal(): Promise<void> {
    await this.addAnimal.click();
  }

  async openAddStaffModal(): Promise<void> {
    await this.addStaffModal.click();
  }

  async addAnimalGroup(
    type: string,
    amount: number,
    fieldName?: string,
  ): Promise<void> {
    await this.openAddAnimalModal();
    await this.animalTypeModal.selectOption(type);
    await this.animalAmountModal.fill(String(amount));
    if (fieldName) {
      await this.animalFieldModal.selectOption({ label: fieldName });
    } else {
      await this.animalFieldModal.selectOption('');
    }
    await this.animalAddModalButton.click();
  }

  getFieldByName(name: string): Locator {
    return this.page.getByRole('strong').filter({ hasText: name });
  }

  getFieldCardByName(name: string): Locator {
    return this.page
      .locator('li', {
        has: this.page.locator('strong', { hasText: name }),
      })
      .first();
  }

  async addStaff(name: string, surname: string, age: number): Promise<void> {
    await this.openAddStaffModal();
    await this.staffNameModal.fill(name);
    await this.staffSurnameModal.fill(surname);
    await this.staffAgeModal.fill(String(age));
    await this.staffModalButton.click();
  }

  async searchStaff(query: string): Promise<void> {
    await this.searchStaffInput.fill(query);
  }

  getCardActionButton(name: string, button: Locator): Locator {
    return this.getFieldCardByName(name).locator(button);
  }
}
