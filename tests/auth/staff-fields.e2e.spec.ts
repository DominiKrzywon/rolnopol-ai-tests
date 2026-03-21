import { expect, test } from "@playwright/test";
import { StaffFieldsPage } from "../../src/pages/StaffFieldsPage";

const FIELD_NAME_PREFIX = "AutoField";
const FIELD_AREA = 25;
const ANIMAL_TYPE = "cow";
const ANIMAL_AMOUNT = 10;

function generateUniqueFieldName(): string {
  const timestamp = Date.now();
  return `${FIELD_NAME_PREFIX}_${timestamp}`;
}

test.describe("Staff & Fields - Field Management", () => {
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
});

test.describe("Staff & Fields - Animal Management", () => {
  test(
    "should create a new animal herd in Staff & Fields view",
    { tag: ["@crud", "@farm", "@resources", "@happy-path"] },
    async ({ page }) => {
      const staffFieldsPage = new StaffFieldsPage(page);

      await staffFieldsPage.goto();

      await expect(staffFieldsPage.pageHeading).toBeVisible();
      await expect(staffFieldsPage.animalsHeading).toBeVisible();
      await expect(staffFieldsPage.addAnimalBtn).toBeVisible();

      await staffFieldsPage.addAnimal(ANIMAL_TYPE, ANIMAL_AMOUNT);

      await expect(staffFieldsPage.addAnimalModal).toBeHidden();

      await staffFieldsPage.searchAnimals(ANIMAL_TYPE);
      await expect(
        staffFieldsPage.getAnimalByType(ANIMAL_TYPE),
      ).toBeVisible();
    },
  );
});

