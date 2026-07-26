import { faker } from '@faker-js/faker';
import test, { expect } from '@playwright/test';
import {
  assignStaff,
  createAnimalGroup,
  createField,
  createStaff,
} from 'src/actions/farm.actions';
import { prepareRandomUser } from 'src/factories/user.factory';
import { AssignPage } from 'src/pages/managementPages/ManagementAssignPage';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';
import { RegisterPage } from 'src/pages/RegisterPage';

test.use({ storageState: undefined });

test.describe('E2E user journeys', () => {
  test(
    'should create assignment for new farmer',
    {
      tag: ['@e2e', '@farm-setup', '@user-journey'],
    },
    async ({ page }) => {
      let field: { name: string; area: number };
      let staff: { name: string; surname: string; fullName: string };
      let animal: { type: string; amount: number };
      const fieldName = faker.word.noun();

      await test.step('register and login new user', async () => {
        const registerPage = new RegisterPage(page);
        const user = prepareRandomUser();

        await registerPage.goto();
        const loginPage = await registerPage.register(user);
        await loginPage.login(user);

        await expect(page).toHaveURL(/profile.html/);
      });

      await test.step('add resources', async () => {
        //add field
        const managementPage = new ManagementPage(page);

        await managementPage.goto();
        field = await createField(page);
        await expect(managementPage.fieldAddedMessage).toBeVisible();

        await managementPage.goto();
        await expect(managementPage.getFieldByName(fieldName)).toBeVisible();

        //add staff
        staff = await createStaff(page);
        await expect(managementPage.staffAddedMessage).toBeVisible();

        await managementPage.goto();
        await managementPage.searchStaff(staff.name);

        await expect(
          managementPage.getFieldCardByName(staff.name),
        ).toContainText(staff.surname);

        //add animal
        animal = await createAnimalGroup(page, { fieldName: field.name });

        await managementPage.goto();
        await managementPage.searchFields(field.name);
        await managementPage.searchAnimals(animal.type);

        await expect(
          managementPage.getAnimalCardByAmount(animal.amount),
        ).toBeVisible();
      });

      await test.step('assign staff to field', async () => {
        const assignPage = new AssignPage(page);
        const expectedSuccessMessage = 'Staff assigned successfully!';

        await assignPage.goto();
        await expect(assignPage.unassignedStaffCount).toHaveText('1');

        await assignStaff(page, field.name, staff.fullName);

        await expect(assignPage.notification).toHaveText(
          expectedSuccessMessage,
        );
        await expect(assignPage.unassignedStaffCount).toHaveText('0');
        await assignPage.assignTree.click();
        const fieldNode = assignPage.getTreeNodeByField(fieldName);
        await expect(fieldNode.locator('.tree-child-name')).toHaveText(
          staff.fullName,
        );
      });
    },
  );
});
