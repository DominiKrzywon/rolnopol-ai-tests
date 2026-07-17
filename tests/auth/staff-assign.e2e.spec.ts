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

  test.beforeEach(async ({ request }) => {
    fieldName = faker.word.noun();
    staffName = faker.person.firstName();
    const staffSurname = faker.person.lastName();

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
      const expectedMessage = 'Staff assigned successfully!';

      await assignPage.goto();
      await assignPage.assignStaffToField(fieldName, staffName);

      await expect(assignPage.notification).toHaveText(expectedMessage);
    },
  );
});
