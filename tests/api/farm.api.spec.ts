import { faker } from '@faker-js/faker';
import {
  createAssignment,
  createField,
  createStaff,
  deleteField,
  deleteStaff,
  getAssignments,
  getFields,
} from 'src/api/farm.api';
import { BASE_API_URL } from 'src/config/env.config';
import { expect } from 'src/fixtures/auth.fixture';
import { test } from 'src/fixtures/data.fixture';
import { FIELD_AREA } from 'src/helpers/testDataHelpers';

test.describe('Farm API', () => {
  test(
    'should reject anonymous fields request without exposing field data',
    {
      annotation: { type: 'case-id', description: 'TC-AUTH-012' },
      tag: ['@api', '@auth', '@farm', '@authorization', '@negative'],
    },
    async ({ request }) => {
      const expectedError = 'Access token required';

      const response = await request.get(`${BASE_API_URL}/fields`);
      const body = await response.json();

      expect(response.status()).toBe(401);
      expect(body.success).toBe(false);
      expect(body.data).toBeUndefined();
      expect(body.error).toBe(expectedError);
    },
  );

  test(
    'should retrieve a newly created field with its name and area',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-010' },
      tag: ['@api', '@farm', '@crud', '@happy-path'],
    },
    async ({ freshUser: _, request }) => {
      const fieldData = {
        name: `api-field-${faker.string.uuid()}`,
        area: FIELD_AREA,
      };

      const fieldId = await createField(request, fieldData);

      try {
        const fields = await getFields(request);
        const retrievedField = fields.find((field) => field.id === fieldId);

        expect(retrievedField).toBeDefined();
        expect(retrievedField).toMatchObject({
          id: fieldId,
          name: fieldData.name,
          area: fieldData.area,
        });
      } finally {
        await deleteField(request, fieldId);
      }
    },
  );

  test(
    'should delete assigned field',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-012' },
      tag: ['@api', '@farm', '@crud', '@happy-path'],
    },
    async ({ freshUser: _, request }) => {
      const staffId = await createStaff(request, {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        age: Number(faker.number.int({ min: 18, max: 99 })),
      });

      const fieldData = {
        name: `api-field-${faker.string.uuid()}`,
        area: FIELD_AREA,
      };

      const fieldId = await createField(request, fieldData);

      const assignmentId = await createAssignment(request, {
        fieldId,
        staffId,
      });

      try {
        const response = await request.delete(
          `${BASE_API_URL}/fields/${fieldId}`,
        );
        const body = await response.json();

        const fieldsAfter = await getFields(request);
        const assignmentsAfter = await getAssignments(request);

        expect(response.status()).toBe(200);
        expect(body.success).toBe(true);
        expect(fieldsAfter.some((field) => field.id === fieldId)).toBe(false);
        expect(
          assignmentsAfter.some((assignment) => assignment.id === assignmentId),
        ).toBe(false);
      } finally {
        await deleteStaff(request, staffId);
      }
    },
  );
});
