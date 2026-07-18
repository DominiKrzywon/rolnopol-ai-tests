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
import { FIELD_AREA, STAFF_AGE } from 'src/helpers/testDataHelpers';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';

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
  let managementPage: ManagementPage;

  test.beforeEach('verify management page', async ({ page }) => {
    managementPage = new ManagementPage(page);
  });

  test(
    'should create a new field in Staff & Fields view',
    { tag: ['@crud', '@farm', '@resources', '@happy-path'] },
    async () => {
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
    async () => {
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
    async () => {
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
  let managementPage: ManagementPage;

  test.beforeEach(async ({ request, page }) => {
    fieldName = faker.word.noun();
    fieldId = await createField(request, { name: fieldName, area: FIELD_AREA });

    managementPage = new ManagementPage(page);
  });

  test.afterEach(async ({ request }) => {
    await deleteField(request, fieldId).catch(() => {});
  });

  test(
    'should edit a field name',
    { tag: ['@crud', '@farm', '@resources', '@edit'] },
    async () => {
      const newFieldName = faker.word.noun();

      await managementPage.goto();
      await managementPage.searchFields(fieldName);
      await managementPage
        .getCardActionButton(fieldName, managementPage.editButtons.editField)
        .click();

      await managementPage.editFieldNameModal.clear();
      await managementPage.editFieldNameModal.fill(newFieldName);
      await managementPage.editFieldSaveButton.click();

      await managementPage.searchFields(newFieldName);
      await expect(managementPage.getFieldByName(newFieldName)).toBeVisible();
    },
  );

  test(
    'should delete a field',
    { tag: ['@crud', '@farm', '@resources', '@delete'] },
    async () => {
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
  let managementPage: ManagementPage;

  test.beforeEach(async ({ request, page }) => {
    staffName = faker.person.firstName();
    staffSurname = faker.person.lastName();
    staffId = await createStaff(request, {
      name: staffName,
      surname: staffSurname,
      age: STAFF_AGE,
    });
    managementPage = new ManagementPage(page);
  });

  test.afterEach(async ({ request }) => {
    await deleteStaff(request, staffId).catch(() => {});
  });

  test(
    'should update a staff',
    {
      tag: ['@crud', '@farm', '@resources', '@edit'],
    },
    async () => {
      const newName = faker.internet.username();
      const newSurname = faker.internet.username();
      const card = managementPage.getFieldCardByName(newName);

      await managementPage.goto();
      await managementPage.searchStaff(staffName);
      await managementPage.editStaff(newName, newSurname, STAFF_AGE);

      await managementPage.searchStaff(newName);
      await expect(managementPage.getFieldByName(newName)).toBeVisible();
      await expect(managementPage.getFieldByName(newSurname)).toBeVisible();

      await expect(card).toContainText(`age: ${STAFF_AGE}`);
    },
  );

  test(
    'should delete a staff',
    { tag: ['@crud', '@farm', '@resources', '@delete'] },
    async () => {
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
  let animalAmount: number;
  let animalType: string;
  let managementPage: ManagementPage;

  test.beforeEach(async ({ request, page }) => {
    animalType = getRandomAnimalType();

    animalAmount = faker.number.int({ min: 10_000, max: 99_999 });
    animalId = await createAnimal(request, {
      type: animalType,
      amount: animalAmount,
    });
    managementPage = new ManagementPage(page);
  });

  test.afterEach(async ({ request }) => {
    await deleteAnimal(request, animalId).catch(() => {});
  });

  test(
    'should edit a animal',
    {
      tag: ['@crud', '@farm', '@resources', '@edit'],
    },
    async () => {
      const newType = getRandomAnimalType();
      const newAmount = faker.number.int({ min: 10_000, max: 99_999 });

      await managementPage.goto();
      await managementPage.searchAnimals(animalType);
      const card = managementPage.getAnimalCardByAmount(animalAmount);
      await expect(card).toBeVisible();

      await card.locator(managementPage.editButtons.editAnimal).click();
      await managementPage.editAnimalTypeModal.selectOption(newType);
      await managementPage.editAnimalAmountModal.clear();
      await managementPage.editAnimalAmountModal.fill(String(newAmount));
      await managementPage.editAnimalSaveButton.click();

      await managementPage.searchAnimals(newType);

      await expect(
        managementPage.getAnimalCardByAmount(newAmount),
      ).toBeVisible();
    },
  );

  test(
    'should delete a animal',
    { tag: ['@crud', '@farm', '@resources', '@delete'] },
    async () => {
      await managementPage.goto();
      await managementPage
        .getCardActionButton(
          animalType,
          managementPage.editButtons.deleteAnimal,
        )
        .click();
      await managementPage.confirmDeleteLocator.click();

      await expect(
        managementPage.getAnimalCardByAmount(animalAmount),
      ).toBeHidden();
    },
  );
});
