import { Locator } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class ManagementPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.MANAGEMENT;
  readonly header = this.page.getByRole('heading', {
    name: 'Staff & Fields Management',
  });
  readonly totalFields = this.page.locator('.totalFields');
  readonly totalStaff = this.page.locator('.totalStaff');
  readonly totalAnimals = this.page.locator('.totalAnimals');
  readonly totalArea = this.page.locator('.totalArea');

  readonly addFieldModal = this.page.locator('#openAddFieldModal');
  readonly fieldHeading = this.page.getByRole('heading', { name: ' Fields' });
  readonly fieldNameModal = this.page.getByPlaceholder('Enter field name');
  readonly fieldDistrictModal = this.page.locator('#fieldDistrict');
  readonly fieldAreaModal = this.page.locator('#fieldArea');
  readonly addFieldModalButton = this.page.locator(
    "#addFieldModal button[type='submit']",
  );
  readonly fieldNameModalError = this.page.locator('#fieldNameError');
  readonly fieldAreaModalError = this.page.locator('#fieldAreaError');
  readonly fieldAddedMessage = this.page.getByText('Field added!');
  readonly searchFieldInput = this.page.getByPlaceholder('Search fields...');

  readonly fieldsList = this.page.locator('#fieldsList');
  readonly fieldCards = this.fieldsList.locator('li');
  readonly fieldsPagination = this.page.locator('#fieldsPagination');
  readonly fieldsPaginationInfo =
    this.fieldsPagination.locator('.pagination-info');
  readonly nextFieldsPageButton = this.fieldsPagination.locator(
    'button[data-page="next"]',
  );
  readonly previousFieldsPageButton = this.fieldsPagination.locator(
    'button[data-page="prev"]',
  );

  readonly addStaffModal = this.page.locator('#openAddStaffModal');
  readonly staffHeading = this.page.getByRole('heading', { name: ' Staff' });
  readonly staffNameModal = this.page.getByPlaceholder('Enter name');
  readonly staffSurnameModal = this.page.getByPlaceholder('Enter surname');
  readonly staffAgeModal = this.page.getByPlaceholder('e.g. 30');
  readonly staffModalButton = this.page
    .getByRole('button', { name: ' Add Staff' })
    .last();
  readonly staffNameModalError = this.page.locator('#staffNameError');
  readonly staffSurnameModalError = this.page.locator('#staffSurnameError');
  readonly staffAgeModalError = this.page.locator('#staffAgeError');
  readonly staffAddedMessage = this.page.getByText('Staff added!');
  readonly searchStaffInput = this.page.getByPlaceholder('Search staff...');

  readonly addAnimal = this.page.locator('#openAddAnimalModal');
  readonly animalHeading = this.page.getByRole('heading', {
    name: ' Animals (groups)',
  });
  readonly animalTypeModal = this.page.locator('#animalType');
  readonly animalAmountModal = this.page.locator('#animalAmount');
  readonly animalFieldModal = this.page.locator('#animalField');
  readonly animalAddModalButton = this.page
    .getByRole('button', {
      name: ' Add Animal',
    })
    .last();
  readonly animalAmountModalError = this.page.locator('#animalAmountError');
  readonly searchAnimalInput = this.page.locator('#animalsSearch');

  readonly editFieldNameModal = this.page.locator('#editFieldName');
  readonly editFieldAreaModal = this.page.locator('#editFieldArea');
  readonly editFieldSaveButton = this.page.locator(
    '#editFieldForm button[type="submit"]',
  );

  readonly editStaffNameModal = this.page.locator('#editStaffName');
  readonly editStaffSurnameModal = this.page.locator('#editStaffSurname');
  readonly editStaffAgeModal = this.page.locator('#editStaffAge');
  readonly editStaffSaveButton = this.page.locator(
    '#editStaffForm button[type="submit"]',
  );

  readonly editAnimalTypeModal = this.page.locator('#editAnimalType');
  readonly editAnimalAmountModal = this.page.locator('#editAnimalAmount');
  readonly editAnimalSaveButton = this.page.locator(
    '#editAnimalForm button[type="submit"]',
  );

  readonly confirmDeleteLocator = this.page.locator('#confirmConfirmModal');

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

  async searchAnimals(query: string): Promise<void> {
    await this.searchAnimalInput.fill(query);
  }

  getCardActionButton(name: string, button: Locator): Locator {
    return this.getFieldCardByName(name).locator(button);
  }

  getAnimalCardByAmount(amount: number): Locator {
    return this.page.locator('li', { hasText: String(amount) }).first();
  }

  async editStaff(name: string, surname: string, age: number): Promise<void> {
    await this.editButtons.editStaff.click();
    await this.editStaffNameModal.fill(name);
    await this.editStaffSurnameModal.fill(surname);
    await this.editStaffAgeModal.fill(String(age));
    await this.editStaffSaveButton.click();
  }
}
