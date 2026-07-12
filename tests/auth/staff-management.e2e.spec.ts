import { faker } from '@faker-js/faker';
import test, { expect } from '@playwright/test';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';

const FIELD_NAME_PREFIX = 'AutoField';
const FIELD_AREA = 25;
const ANIMAL_TYPE = 'goat';

function generateUniqueFieldName(): string {
  const timestamp = Date.now();
  return `${FIELD_NAME_PREFIX}_${timestamp}`;
}

function generateUniqueAnimalAmount(): number {
  return 20_000 + (Date.now() % 50_000);
}

function generateRandomNumber(min: number = 1, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

test.describe('Staff & Fields Management', () => {
  test(
    'should create a new field in Staff & Fields view',
    { tag: ['@crud', '@farm', '@resources', '@happy-path'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);
      const fieldName = generateUniqueFieldName();

      await managementPage.goto();

      await expect(managementPage.fieldHeading).toBeVisible();
      await expect(managementPage.header).toBeVisible();
      await expect(managementPage.addFieldModal).toBeVisible();

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
      const fieldName = generateUniqueFieldName();
      const animalAmount = generateUniqueAnimalAmount();

      await managementPage.goto();

      await expect(managementPage.header).toBeVisible();
      await expect(managementPage.animalHeading).toBeVisible();
      await expect(managementPage.addAnimal).toBeVisible();

      await managementPage.addField(fieldName, FIELD_AREA);
      await expect(managementPage.fieldAddedMessage).toBeVisible();

      await managementPage.goto();

      await managementPage.addAnimalGroup(ANIMAL_TYPE, animalAmount, fieldName);

      await managementPage.goto();
      await managementPage.searchFields(fieldName);

      const createdFieldCard = managementPage.getFieldCardByName(fieldName);

      await expect(createdFieldCard).toBeVisible();
      await expect(createdFieldCard).toContainText(String(animalAmount));
      await expect(createdFieldCard).toContainText(/goat/i);
    },
  );

  test(
    'should create a new staff  in Staff & Fields view',
    { tag: ['@crud', '@farm', '@resources', '@happy-path'] },
    async ({ page }) => {
      const managementPage = new ManagementPage(page);
      const uniqueName = faker.internet.username();
      const uniqueSurname = faker.internet.username();
      const STAFF_AGE = generateRandomNumber(1, 100);

      await managementPage.goto();
      await managementPage.addStaff(uniqueName, uniqueSurname, STAFF_AGE);

      await expect(managementPage.staffAddedMessage).toBeVisible();

      await managementPage.goto();
      await managementPage.searchStaff(uniqueName);
      await expect(managementPage.getFieldByName(uniqueName)).toBeVisible();
    },
  );
});
