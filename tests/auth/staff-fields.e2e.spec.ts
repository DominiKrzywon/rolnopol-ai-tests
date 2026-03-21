import { expect, test } from "@playwright/test";
import { StaffFieldsPage } from "../../src/pages/StaffFieldsPage";

const FIELD_NAME_PREFIX = "AutoField";
const FIELD_AREA = 25;
const ANIMAL_TYPE = "goat";

function generateUniqueFieldName(): string {
  const timestamp = Date.now();
  return `${FIELD_NAME_PREFIX}_${timestamp}`;
}

function generateUniqueAnimalAmount(): number {
  return 1_000_000 + (Date.now() % 9_000_000);
}

test.describe("Staff & Fields Management", () => {
  test(
    "should create a new field in Staff & Fields view",
    { tag: ["@crud", "@farm", "@resources", "@happy-path"] },
    async ({ page }) => {
      const staffFieldsPage = new StaffFieldsPage(page);
      const fieldName = generateUniqueFieldName();

      await staffFieldsPage.goto();

      await expect(staffFieldsPage.pageHeading).toBeVisible();
      await expect(staffFieldsPage.addFieldBtn).toBeVisible();

      await staffFieldsPage.addField(fieldName, FIELD_AREA);

      await expect(staffFieldsPage.fieldAddedMessage).toBeVisible();

      await staffFieldsPage.goto();
      await staffFieldsPage.searchFields(fieldName);
      await expect(staffFieldsPage.getFieldByName(fieldName)).toBeVisible();
    },
  );

  test(
    "should create a new animal herd in Staff & Fields view",
    { tag: ["@crud", "@farm", "@resources", "@happy-path"] },
    async ({ page }) => {
      const staffFieldsPage = new StaffFieldsPage(page);
      const animalAmount = generateUniqueAnimalAmount();

      await staffFieldsPage.goto();

      await expect(staffFieldsPage.pageHeading).toBeVisible();
      await expect(staffFieldsPage.animalsHeading).toBeVisible();
      await expect(staffFieldsPage.addAnimalBtn).toBeVisible();

      await staffFieldsPage.addAnimalGroup(ANIMAL_TYPE, animalAmount);

      await staffFieldsPage.goto();
      await staffFieldsPage.searchAnimals(ANIMAL_TYPE);
      await expect(
        staffFieldsPage.getAnimalGroupByTypeAndAmount(
          ANIMAL_TYPE,
          animalAmount,
        ),
      ).toBeVisible();
    },
  );
});
