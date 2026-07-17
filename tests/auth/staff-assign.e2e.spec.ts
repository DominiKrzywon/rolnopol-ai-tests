import { faker } from '@faker-js/faker';
import test, { expect } from '@playwright/test';
import {
  createField,
  createStaff,
  deleteField,
  deleteStaff,
} from 'src/helpers/apiHelpers';
import { FIELD_AREA, STAFF_AGE } from 'src/helpers/testDataHelpers';
import { AssignPage } from 'src/pages/managementPages/ManagementAssignPage';

test.describe('Staff Assignment Management', () => {
  let staffId: number;
  let fieldId: number;
  let fieldName: string;
  let staffName: string;
  let staffSurname: string;

  const expectedMessage = 'Staff assigned successfully!';

  test.beforeEach(async ({ request }) => {
    fieldName = faker.word.noun();
    staffName = faker.person.firstName();
    staffSurname = faker.person.lastName();

    staffId = await createStaff(request, {
      name: staffName,
      surname: staffSurname,
      age: STAFF_AGE,
    });

    fieldId = await createField(request, {
      name: fieldName,
      area: FIELD_AREA,
    });
  });

  test.afterEach(async ({ request }) => {
    await deleteStaff(request, staffId).catch(() => {});
    await deleteField(request, fieldId).catch(() => {});
  });

  test(
    'should assignment for new staff and field',
    {
      tag: ['@crud', '@farm', '@assignment'],
    },
    async ({ page }) => {
      const assignPage = new AssignPage(page);

      await assignPage.goto();
      await assignPage.assignStaffToField(fieldName, staffName);

      await expect(assignPage.notification).toHaveText(expectedMessage);
    },
  );

  test.describe('Tree view with 2 farmer', () => {
    let staffId2: number;
    const staffName2: string = '';
    const staffSurname2: string = '';

    test.beforeEach(async ({ request }) => {
      staffId2 = await createStaff(request, {
        name: staffName2,
        surname: staffSurname2,
        age: STAFF_AGE,
      });
    });

    test.afterEach(async ({ request }) => {
      await deleteStaff(request, staffId2).catch(() => {});
    });

    test(
      'should show 2 staff assigned to field in tree view',
      {
        tag: ['@crud', '@farm', '@assignment'],
      },
      async ({ page }) => {
        const assignPage = new AssignPage(page);

        await assignPage.goto();
        await assignPage.assignStaffToField(
          fieldName,
          `${staffName} ${staffSurname}`,
        );

        await assignPage.assignStaffToField(
          fieldName,
          `${staffName2} ${staffSurname2}`,
        );

        await assignPage.assignTree.click();
        await assignPage.assignmentsNodeTree.waitFor({ state: 'visible' });

        const fieldNode = assignPage.getTreeNodeByField(fieldName);

        await expect(fieldNode.locator('.tree-node-title')).toHaveText(
          fieldName,
        );
        await expect(fieldNode.locator('.tree-node-staff-count')).toContainText(
          '2',
        );
        await expect(fieldNode.locator('.tree-child-name').nth(0)).toHaveText(
          `${staffName} ${staffSurname}`,
        );
        await expect(fieldNode.locator('.tree-child-name').nth(1)).toHaveText(
          `${staffName2} ${staffSurname2}`,
        );
      },
    );
  });
});
