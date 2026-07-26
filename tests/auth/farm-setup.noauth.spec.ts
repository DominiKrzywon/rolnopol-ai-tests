import { faker } from '@faker-js/faker';
import test, { expect } from '@playwright/test';
import {
  FIELD_AREA,
  getRandomAnimalType,
  newAmount,
} from 'src/helpers/testDataHelpers';
import { LoginPage } from 'src/pages/LoginPage';
import { AssignPage } from 'src/pages/managementPages/ManagementAssignPage';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';
import { RegisterPage } from 'src/pages/RegisterPage';

test.describe('New Farm Setup e2e', () => {
  test.use({ storageState: undefined });

  test(
    'should create assignment for new farmer',
    {
      tag: ['@e2e', '@farm-setup', '@user-journey'],
    },
    async ({ page }) => {
      const email = faker.internet.email();
      const password = faker.word.noun({ length: 9 });
      const displayName = faker.person.fullName();
      const fieldName = faker.word.noun();
      const staffName = faker.person.firstName();
      const staffSurname = faker.person.lastName();
      const fullName = `${staffName} ${staffSurname}`;
      const staffAge = faker.number.int({ min: 18, max: 65 });
      const animalType = getRandomAnimalType();
      const animalAmount = newAmount();

      await test.step('register new user', async () => {
        const registerPage = new RegisterPage(page);
        const expectedSuccessMessage = 'Registration successful!';

        await registerPage.goto();
        await registerPage.register(email, password, displayName);

        await expect(registerPage.successMessage).toBeVisible();
        await expect(registerPage.notificationMessage).toHaveText(
          expectedSuccessMessage,
        );
        await expect(page).toHaveURL(/login.html/);
      });

      await test.step('login', async () => {
        const loginPage = new LoginPage(page);

        await expect(page).toHaveURL(/login.html/);
        await loginPage.login(email, password);

        await expect(page).toHaveURL(/profile.html/);
      });

      await test.step('add resources', async () => {
        //add field
        const managementPage = new ManagementPage(page);

        await managementPage.goto();
        await managementPage.addField(fieldName, FIELD_AREA);

        await expect(managementPage.fieldAddedMessage).toBeVisible();

        await managementPage.goto();
        await expect(managementPage.getFieldByName(fieldName)).toBeVisible();

        //add staff
        await managementPage.addStaff(staffName, staffSurname, staffAge);

        await expect(managementPage.staffAddedMessage).toBeVisible();

        await managementPage.goto();
        await managementPage.searchStaff(staffName);

        await expect(
          managementPage.getFieldCardByName(staffName),
        ).toContainText(staffSurname);

        //add animal
        await managementPage.addAnimalGroup(
          animalType,
          animalAmount,
          fieldName,
        );

        await managementPage.goto();

        await managementPage.searchFields(fieldName);
        await managementPage.searchAnimals(animalType);

        await expect(
          managementPage.getAnimalCardByAmount(animalAmount),
        ).toBeVisible();
      });

      await test.step('assign staff to field', async () => {
        const assignPage = new AssignPage(page);
        const expectedSuccessMessage = 'Staff assigned successfully!';

        await assignPage.goto();
        await expect(assignPage.unassignedStaffCount).toHaveText('1');

        await assignPage.assignStaffToField(fieldName, fullName);
        await expect(assignPage.notification).toHaveText(
          expectedSuccessMessage,
        );

        await expect(assignPage.unassignedStaffCount).toHaveText('0');
        await assignPage.assignTree.click();

        const fieldNode = assignPage.getTreeNodeByField(fieldName);
        await expect(fieldNode.locator('.tree-child-name')).toHaveText(
          fullName,
        );
      });
    },
  );
});
