import { faker } from '@faker-js/faker';
import {
  createField,
  createStaff,
  deleteField,
  deleteStaff,
} from 'src/api/farm.api';
import { expect, test } from 'src/fixtures/auth.fixture';
import { FIELD_AREA, STAFF_AGE } from 'src/helpers/testDataHelpers';

test.use({ storageState: undefined });

test.describe('Staff Assignment Management', () => {
  let staffId: number;
  let fieldId: number;
  let fieldName: string;
  let staffName: string;
  let fullName: string;
  let staffSurname: string;

  const expectedMessage = 'Staff assigned successfully!';

  test.beforeEach(async ({ freshUser: _, request }) => {
    fieldName = faker.word.noun();
    staffName = faker.person.firstName();
    staffSurname = faker.person.lastName();
    fullName = `${staffName} ${staffSurname}`;

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
    async ({ assignPage }) => {
      await assignPage.goto();
      await assignPage.assignStaffToField(fieldName, fullName);

      await expect(assignPage.notification).toHaveText(expectedMessage);
    },
  );

  test(
    'should not show assigned staff in select dropdown',
    {
      tag: ['@crud', '@farm', '@assignment'],
    },
    async ({ assignPage }) => {
      await assignPage.goto();
      await assignPage.assignStaffToField(fieldName, fullName);

      await assignPage.openAssignForm(fieldName);

      await expect(assignPage.staffSelectModal).not.toContainText(fullName);
    },
  );

  test(
    'should unassigned works correctly',
    { tag: ['@crud', '@farm', '@assignment'] },
    async ({ assignPage, page }) => {
      const expectedSuccessMessage = 'Staff unassigned successfully!';

      await assignPage.goto();
      await assignPage.assignStaffToField(fieldName, fullName);

      await expect(assignPage.unassignedStaffCount).toHaveText('0');

      const assignmentGrid = assignPage.getAssignmentGridByField(fieldName);
      await assignmentGrid.getByTitle('Unassign').click();

      await expect(page.getByText(expectedSuccessMessage)).toBeVisible();
      await expect(assignPage.unassignedStaffCount).toHaveText('1');
    },
  );

  test.describe('Tree view with 2 farmer', () => {
    let staffId2: number;
    let staffName2: string;
    let staffSurname2: string;

    test.beforeEach(async ({ request }) => {
      staffName2 = faker.person.firstName();
      staffSurname2 = faker.person.lastName();
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
      async ({ assignPage }) => {
        await assignPage.goto();
        await assignPage.assignStaffToField(fieldName, `${fullName}`);

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
          `${fullName}`,
        );
        await expect(fieldNode.locator('.tree-child-name').nth(1)).toHaveText(
          `${staffName2} ${staffSurname2}`,
        );
      },
    );
  });
});
