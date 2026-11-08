import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { createField, deleteField, getStaff } from 'src/api/farm.api';
import { expect, test } from 'src/fixtures/data.fixture';
import {
  FIELD_AREA,
  getDifferentAnimalType,
  getRandomAnimalType,
  newAmount,
} from 'src/helpers/testDataHelpers';

test.use({ storageState: undefined });

test.describe('Staff & Fields Management', () => {
  test(
    'should create a new field in Staff & Fields view',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-001' },
      tag: ['@crud', '@farm', '@resources', '@happy-path'],
    },
    async ({ freshUser: _, managementPage }) => {
      const fieldName = faker.word.noun();

      await managementPage.goto();

      await expect(managementPage.header).toBeVisible();
      await expect(managementPage.addFieldModal).toBeVisible();

      // Submit an empty form to check required fields
      await managementPage.addFieldModal.click();
      await managementPage.addFieldModalButton.click();

      await expect(managementPage.fieldNameModalError).toBeVisible();
      await expect(managementPage.fieldAreaModalError).toBeVisible();

      // Create the field with valid data
      await managementPage.closeButtons.addField.click();
      await managementPage.addField(fieldName, FIELD_AREA);

      await expect(managementPage.fieldAddedMessage).toBeVisible();

      await managementPage.goto();

      // Verify the created field persists after navigation
      await managementPage.searchFields(fieldName);
      await expect(managementPage.getFieldByName(fieldName)).toBeVisible();
    },
  );

  test(
    'should create a new animal herd in Staff & Fields view',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-002' },
      tag: ['@crud', '@farm', '@resources', '@happy-path'],
    },
    async ({ freshUser: _, managementPage }) => {
      const fieldName = faker.word.noun();
      const animalAmount = faker.number.int({ min: 1, max: 99_999 });
      const expectedErrorMessage = 'Amount is required.';
      const animalType = getRandomAnimalType();
      await managementPage.goto();

      await expect(managementPage.header).toBeVisible();
      await expect(managementPage.animalHeading).toBeVisible();
      await expect(managementPage.addAnimal).toBeVisible();

      // Submit an empty herd form to check amount validation
      await managementPage.addAnimal.click();
      await managementPage.animalAddModalButton.click();

      await expect(managementPage.animalAmountModalError).toHaveText(
        expectedErrorMessage,
      );

      await managementPage.closeButtons.addAnimal.click();

      // Prepare the field for the new herd
      await managementPage.addField(fieldName, FIELD_AREA);
      await expect(managementPage.fieldAddedMessage).toBeVisible();

      await managementPage.goto();

      // Create the herd on the prepared field
      await managementPage.addAnimalGroup(animalType, animalAmount, fieldName);
      const expectedAnimalLabel =
        animalType.charAt(0).toUpperCase() + animalType.slice(1);
      await managementPage.goto();

      // Verify the field card shows the created herd size
      await managementPage.searchFields(fieldName);

      const fieldCard = managementPage.getFieldCardByName(fieldName);
      const assignedAnimalLabel =
        managementPage.getAssignedAnimalLabel(fieldCard);

      const animalCard = managementPage.animalCards;

      await expect(animalCard).toHaveCount(1);
      await expect(animalCard).toBeVisible();
      await expect(fieldCard).toBeVisible();

      await expect(managementPage.getAnimalTypeLabel(animalCard)).toHaveText(
        animalType,
      );

      await expect(managementPage.getAnimalAmountLabel(animalCard)).toHaveText(
        String(animalAmount),
      );

      await expect(managementPage.getAssignedFieldLabel(animalCard)).toHaveText(
        `: ${fieldName}`,
      );

      await expect(assignedAnimalLabel).toHaveText(
        new RegExp(`:\\s*${animalAmount}\\s+${expectedAnimalLabel}$`),
      );
    },
  );

  test(
    'should create a new staff  in Staff & Fields view',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-003' },
      tag: ['@crud', '@farm', '@resources', '@happy-path'],
    },
    async ({ freshUser: _, managementPage }) => {
      const uniqueName = faker.person.firstName();
      const uniqueSurname = faker.person.lastName();
      const staffAge = faker.number.int({ min: 18, max: 65 });

      await managementPage.goto();

      // Submit an empty worker form to check required fields
      await managementPage.addStaffModal.click();
      await managementPage.staffModalButton.click();

      await expect(managementPage.staffNameModalError).toBeVisible();
      await expect(managementPage.staffSurnameModalError).toBeVisible();
      await expect(managementPage.staffAgeModalError).toBeVisible();

      // Create the worker with valid data
      await managementPage.closeButtons.addStaff.click();
      await managementPage.addStaff(uniqueName, uniqueSurname, staffAge);
      await expect(managementPage.staffAddedMessage).toBeVisible();

      await managementPage.goto();

      // Verify the worker persists after navigation
      await managementPage.searchStaff(uniqueName);
      await expect(managementPage.getFieldByName(uniqueName)).toBeVisible();
    },
  );
});

test.describe('Staff & Fields Management - Delete Field', () => {
  test(
    'should edit a field name',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-004' },
      tag: ['@crud', '@farm', '@resources', '@edit'],
    },
    async ({ freshUser: _, managementPage, createdField }) => {
      const { name: fieldName } = createdField;
      const newFieldName = `field_${Date.now()}`;

      await managementPage.goto();
      await managementPage.searchFields(fieldName);
      await managementPage
        .getCardActionButton(fieldName, managementPage.editButtons.editField)
        .click();

      // Save a new name for the existing field
      await managementPage.editFieldNameModal.clear();
      await managementPage.editFieldNameModal.fill(newFieldName);
      await managementPage.editFieldSaveButton.click();

      await managementPage.goto();

      // Verify the field can be found by its new name
      await managementPage.searchFields(newFieldName);
      await expect(managementPage.getFieldByName(newFieldName)).toBeVisible();
    },
  );

  test(
    'should delete a field',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-005' },
      tag: ['@crud', '@farm', '@resources', '@delete'],
    },
    async ({ freshUser: _, managementPage, createdField }) => {
      const { name: fieldName } = createdField;

      await managementPage.goto();
      await managementPage.searchFields(fieldName);
      await managementPage.getFieldByName(fieldName);
      await managementPage
        .getCardActionButton(fieldName, managementPage.editButtons.deleteField)
        .click();

      // Confirm deletion of the selected field
      await managementPage.confirmDeleteLocator.click();

      await expect(managementPage.getFieldByName(fieldName)).toBeHidden();
    },
  );
});

test.describe('Staff & Fields Management - Delete Staff', () => {
  test(
    'should update a staff',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-006' },
      tag: ['@crud', '@farm', '@resources', '@edit'],
    },
    async ({ freshUser: _, managementPage, createdStaff, request }) => {
      const { name: staffName } = createdStaff;
      const newName = faker.internet.username();
      const newSurname = faker.internet.username();
      const newAge = faker.number.int({ min: 31, max: 65 });
      const card = managementPage.getFieldCardByName(newName);

      await managementPage.goto();
      await managementPage.searchStaff(staffName);

      // Update the existing worker details
      await managementPage.editStaff(newName, newSurname, newAge);

      await managementPage.goto();

      // Verify the saved name, surname, and age
      await managementPage.searchStaff(newName);
      await expect(managementPage.getFieldByName(newName)).toBeVisible();
      await expect(managementPage.getFieldByName(newSurname)).toBeVisible();

      const staffMembers = await getStaff(request);
      const staff = staffMembers.find(
        (member) => member.id === createdStaff.id,
      );
      expect(staff).toMatchObject({
        name: newName,
        surname: newSurname,
        age: newAge,
      });

      await expect(card).toContainText(`age: ${newAge}`);
    },
  );

  test(
    'should delete a staff',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-007' },
      tag: ['@crud', '@farm', '@resources', '@delete'],
    },
    async ({ freshUser: _, managementPage, createdStaff }) => {
      const { name: staffName, surname: staffSurname } = createdStaff;
      await managementPage.goto();
      await managementPage.searchStaff(staffName);
      await managementPage
        .getCardActionButton(staffName, managementPage.editButtons.deleteStaff)
        .click();

      // Confirm deletion and verify the worker is absent
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
      annotation: { type: 'case-id', description: 'TC-FARM-008' },
      tag: ['@crud', '@farm', '@resources', '@edit'],
    },
    async ({ freshUser: _, managementPage, createdAnimal }) => {
      const { type: animalType, amount: animalAmount } = createdAnimal;
      const newType = getDifferentAnimalType(animalType);

      await managementPage.goto();
      await managementPage.searchAnimals(animalType);
      const card = managementPage.getAnimalCardByAmount(animalAmount);
      const newAnimalAmount = newAmount();
      await expect(card).toBeVisible();

      // Save the new herd type and size
      await card.locator(managementPage.editButtons.editAnimal).click();
      await managementPage.editAnimalTypeModal.selectOption(newType);
      await managementPage.editAnimalAmountModal.clear();
      await managementPage.editAnimalAmountModal.fill(String(newAnimalAmount));
      await managementPage.editAnimalSaveButton.click();

      await managementPage.goto();

      // Verify the updated herd can be found
      await managementPage.searchAnimals(newType);

      const animalCard = managementPage.animalCards;

      await expect(managementPage.getAnimalTypeLabel(animalCard)).toHaveText(
        newType,
      );

      await expect(managementPage.getAnimalAmountLabel(animalCard)).toHaveText(
        String(newAnimalAmount),
      );
    },
  );

  test(
    'should delete a animal',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-009' },
      tag: ['@crud', '@farm', '@resources', '@delete'],
    },
    async ({ freshUser: _, managementPage, createdAnimal }) => {
      const { type: animalType, amount: animalAmount } = createdAnimal;
      await managementPage.goto();
      await managementPage
        .getCardActionButton(
          animalType,
          managementPage.editButtons.deleteAnimal,
        )
        .click();

      // Confirm deletion and verify the herd is absent
      await managementPage.confirmDeleteLocator.click();

      await expect(
        managementPage.getAnimalCardByAmount(animalAmount),
      ).toBeHidden();
    },
  );

  test(
    'should paginate fields after search',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-013' },
      tag: ['@ui', '@farm', '@crud', '@happy-path'],
    },
    async ({ freshUser: _, request, managementPage }) => {
      const uniqueId = randomUUID().slice(0, 8);
      const prefix = `pagination-field-${uniqueId}`;
      const fieldNameLabels = managementPage.fieldCards.locator('strong');

      const fieldNames: string[] = Array.from(
        { length: 6 },
        (_, index) => `${prefix}-${index + 1}`,
      );
      const fieldIds: number[] = [];

      // Create enough matching fields to span two pages
      for (const name of fieldNames) {
        const fieldId = await createField(request, {
          name,
          area: FIELD_AREA,
        });

        fieldIds.push(fieldId);
      }

      try {
        await managementPage.goto();

        // Verify the first page of filtered results
        await managementPage.searchFields(prefix);

        await expect(managementPage.fieldCards).toHaveCount(5);
        const cards = await managementPage.fieldCards.all();
        for (const card of cards) {
          await expect(card).toBeVisible();
        }
        await expect(managementPage.fieldsList).toBeVisible();
        await expect(managementPage.fieldsPagination).toContainText('1/2');
        await expect(managementPage.nextFieldsPageButton).toBeEnabled();
        await expect(managementPage.previousFieldsPageButton).toBeDisabled();
        await expect(fieldNameLabels).toHaveText(fieldNames.slice(0, 5));

        // Move to the second page of filtered results
        await managementPage.nextFieldsPageButton.click();
        await expect(managementPage.fieldsPagination).toContainText('2/2');
        await expect(managementPage.previousFieldsPageButton).toBeEnabled();
        await expect(managementPage.fieldCards).toHaveCount(1);
        await expect(managementPage.nextFieldsPageButton).toBeDisabled();
        await expect(fieldNameLabels).toHaveText(fieldNames.slice(5));

        await managementPage.previousFieldsPageButton.click();

        await expect(managementPage.fieldsPagination).toContainText('1/2');
        await expect(managementPage.fieldCards).toHaveCount(5);
        await expect(fieldNameLabels).toHaveText(fieldNames.slice(0, 5));
      } finally {
        await Promise.all(fieldIds.map((id) => deleteField(request, id)));
      }
    },
  );
});
