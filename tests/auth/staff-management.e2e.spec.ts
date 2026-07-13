import { faker } from '@faker-js/faker';
import test, { expect } from '@playwright/test';
import {
  createAnimal,
  createField,
  createStaff,
  deleteAnimal,
  deleteField,
  deleteStaff,
} from 'src/helpers/apiHelpers';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';

const FIELD_AREA = 25;
const STAFF_AGE = 30;
const ANIMAL_AMOUNT = 50;

const ANIMAL_TYPES = [
  'chicken',
  'cow',
  'pig',
  'sheep',
  'goat',
  'duck',
  'turkey',
  'rabbit',
  'fish',
  'shrimp',
  'oyster',
  'squid',
];

function getRandomAnimalType(): string {
  return faker.helpers.arrayElement(ANIMAL_TYPES);
}

test.describe('Staff & Fields Management', () => {
  test(
    'should create a new field in Staff & Fields view',
    { tag: ['@crud', '@farm', '@resources', '@happy-path'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);
      const fieldName = faker.word.noun();

      await managementPage.goto();

      await expect(managementPage.header).toBeVisible();
      await expect(managementPage.addFieldModal).toBeVisible();

      await managementPage.addFieldModal.click();
      await managementPage.addFieldModalButton.click();

      await expect(managementPage.fieldNameModalError).toBeVisible();
      await expect(managementPage.fieldAreaModalError).toBeVisible();

      await managementPage.closeButtons.addField.click();
      await managementPage.addField(fieldName, FIELD_AREA);

      await expect(managementPage.fieldAddedMessage).toBeVisible();

      await managementPage.goto();
      await managementPage.searchFields(fieldName);
      await expect(managementPage.getFieldByName(fieldName)).toBeVisible();
    },
  );

  test(
    'should create a new animal herd in Staff & Fields view',
    { tag: ['@crud', '@farm', '@resources', '@happy-path'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);
      const fieldName = faker.word.noun();
      const animalAmount = faker.number.int({ min: 1, max: 99_999 });
      const expectedErrorMessage = 'Amount is required.';

      await managementPage.goto();

      await expect(managementPage.header).toBeVisible();
      await expect(managementPage.animalHeading).toBeVisible();
      await expect(managementPage.addAnimal).toBeVisible();

      await managementPage.addAnimal.click();
      await managementPage.animalAddModalButton.click();

      await expect(managementPage.animalAmountModalError).toHaveText(
        expectedErrorMessage,
      );

      await managementPage.closeButtons.addAnimal.click();

      await managementPage.addField(fieldName, FIELD_AREA);
      await expect(managementPage.fieldAddedMessage).toBeVisible();

      await managementPage.goto();
      await managementPage.addAnimalGroup(
        getRandomAnimalType(),
        animalAmount,
        fieldName,
      );
      await managementPage.goto();
      await managementPage.searchFields(fieldName);

      const createdFieldCard = managementPage.getFieldCardByName(fieldName);

      await expect(createdFieldCard).toBeVisible();
      await expect(createdFieldCard).toContainText(String(animalAmount));
    },
  );

  test(
    'should create a new staff  in Staff & Fields view',
    { tag: ['@crud', '@farm', '@resources', '@happy-path'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);
      const uniqueName = faker.person.firstName();
      const uniqueSurname = faker.person.lastName();
      const staffAge = faker.number.int({ min: 18, max: 65 });

      await managementPage.goto();
      await managementPage.addStaffModal.click();
      await managementPage.staffModalButton.click();

      await expect(managementPage.staffNameModalError).toBeVisible();
      await expect(managementPage.staffSurnameModalError).toBeVisible();
      await expect(managementPage.staffAgeModalError).toBeVisible();

      await managementPage.closeButtons.addStaff.click();
      await managementPage.addStaff(uniqueName, uniqueSurname, staffAge);
      await expect(managementPage.staffAddedMessage).toBeVisible();

      await managementPage.goto();
      await managementPage.searchStaff(uniqueName);
      await expect(managementPage.getFieldByName(uniqueName)).toBeVisible();
    },
  );
});

test.describe('Staff & Fields Management - Delete Field', () => {
  let fieldId: number;
  let fieldName: string;

  test.beforeEach(async ({ request }) => {
    fieldName = faker.word.noun();
    fieldId = await createField(request, { name: fieldName, area: FIELD_AREA });
  });

  test.afterEach(async ({ request }) => {
    await deleteField(request, fieldId).catch(() => {});
  });

  test(
    'should delete a field',
    { tag: ['@crud', '@farm', '@resources', '@delete'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);

      await managementPage.goto();
      await managementPage.searchFields(fieldName);
      await managementPage.getFieldByName(fieldName);
      await managementPage
        .getCardActionButton(fieldName, managementPage.editButtons.deleteField)
        .click();
      await managementPage.confirmDeleteLocator.click();

      await expect(managementPage.getFieldByName(fieldName)).toBeHidden();
    },
  );
});

test.describe('Staff & Fields Management - Delete Staff', () => {
  let staffId: number;
  let staffName: string;
  let staffSurname: string;

  test.beforeEach(async ({ request }) => {
    staffName = faker.person.firstName();
    staffSurname = faker.person.lastName();
    staffId = await createStaff(request, {
      name: staffName,
      surname: staffSurname,
      age: STAFF_AGE,
    });
  });

  test.afterEach(async ({ request }) => {
    await deleteStaff(request, staffId).catch(() => {});
  });

  test(
    'should delete a staff',
    { tag: ['@crud', '@farm', '@resources', '@delete'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);

      await managementPage.goto();
      await managementPage.searchStaff(staffName);
      await managementPage
        .getCardActionButton(staffName, managementPage.editButtons.deleteStaff)
        .click();
      await managementPage.confirmDeleteLocator.click();

      await expect(managementPage.getFieldByName(staffName)).toBeHidden();
    },
  );
});

test.describe('Staff & Fields Management - Delete Animal', () => {
  let animalId: number;
  let animalType: string;

  test.beforeEach(async ({ request }) => {
    animalType = getRandomAnimalType();
    animalId = await createAnimal(request, {
      type: animalType,
      amount: ANIMAL_AMOUNT,
    });
  });

  test.afterEach(async ({ request }) => {
    await deleteAnimal(request, animalId).catch(() => {});
  });

  test(
    'should delete a animal',
    { tag: ['@crud', '@farm', '@resources', '@delete'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);

      await managementPage.goto();
      await managementPage
        .getCardActionButton(
          animalType,
          managementPage.editButtons.deleteAnimal,
        )
        .click();
      await managementPage.confirmDeleteLocator.click();

      await expect(managementPage.getFieldByName(animalType)).toBeHidden();
    },
  );
});
