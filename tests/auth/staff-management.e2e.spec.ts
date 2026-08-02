import { faker } from '@faker-js/faker';
import { expect, test } from 'src/fixtures/data.fixture';
import {
  FIELD_AREA,
  getRandomAnimalType,
  newAmount,
  STAFF_AGE,
} from 'src/helpers/testDataHelpers';

test.describe('Staff & Fields Management', () => {
  test(
    'should create a new field in Staff & Fields view',
    { tag: ['@crud', '@farm', '@resources', '@happy-path'] },
    async ({ managementPage }) => {
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
    async ({ managementPage }) => {
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
    async ({ managementPage }) => {
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
  test(
    'should edit a field name',
    { tag: ['@crud', '@farm', '@resources', '@edit'] },
    async ({ managementPage, createdField }) => {
      const { name: fieldName } = createdField;
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
    async ({ managementPage, createdField }) => {
      const { name: fieldName } = createdField;

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
  test(
    'should update a staff',
    {
      tag: ['@crud', '@farm', '@resources', '@edit'],
    },
    async ({ managementPage, createdStaff }) => {
      const { name: staffName } = createdStaff;
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
    async ({ managementPage, createdStaff }) => {
      const { name: staffName, surname: staffSurname } = createdStaff;
      await managementPage.goto();
      await managementPage.searchStaff(staffName);
      await managementPage
        .getCardActionButton(staffName, managementPage.editButtons.deleteStaff)
        .click();
      await managementPage.confirmDeleteLocator.click();
      await managementPage.searchStaff(`${staffName} ${staffSurname}`);

      await expect(
        managementPage.getFieldByName(`${staffName} ${staffSurname}`),
      ).toBeHidden();
    },
  );
});

test.describe('Staff & Fields Management - Delete Animal', () => {
  test(
    'should edit a animal',
    {
      tag: ['@crud', '@farm', '@resources', '@edit'],
    },
    async ({ managementPage, createdAnimal }) => {
      const { type: animalType, amount: animalAmount } = createdAnimal;
      const newType = getRandomAnimalType();

      await managementPage.goto();
      await managementPage.searchAnimals(animalType);
      const card = managementPage.getAnimalCardByAmount(animalAmount);
      const newAnimalAmount = newAmount();
      await expect(card).toBeVisible();

      await card.locator(managementPage.editButtons.editAnimal).click();
      await managementPage.editAnimalTypeModal.selectOption(newType);
      await managementPage.editAnimalAmountModal.clear();
      await managementPage.editAnimalAmountModal.fill(String(newAnimalAmount));
      await managementPage.editAnimalSaveButton.click();

      await managementPage.searchAnimals(newType);

      await expect(
        managementPage.getAnimalCardByAmount(newAnimalAmount),
      ).toBeVisible();
    },
  );

  test(
    'should delete a animal',
    { tag: ['@crud', '@farm', '@resources', '@delete'] },
    async ({ managementPage, createdAnimal }) => {
      const { type: animalType, amount: animalAmount } = createdAnimal;
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
