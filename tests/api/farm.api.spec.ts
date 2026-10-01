import { faker } from '@faker-js/faker';
import {
  createAssignment,
  createField,
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
    async ({ freshUser: _, request, createdField }) => {
      const fieldId = createdField.id;
      const fields = await getFields(request);
      const retrievedField = fields.find((field) => field.id === fieldId);

      expect(retrievedField).toBeDefined();
      expect(retrievedField).toMatchObject({
        id: fieldId,
        name: createdField.name,
        area: FIELD_AREA,
      });
    },
  );

  test(
    'should delete assigned field',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-012' },
      tag: ['@api', '@farm', '@crud', '@happy-path'],
    },
    async ({ freshUser: _, request, createdStaff }) => {
      const staffId = createdStaff.id;

      const fieldData = {
        name: `api-field-${faker.string.uuid()}`,
        area: FIELD_AREA,
      };

      const fieldId = await createField(request, fieldData);

      const assignmentId = await createAssignment(request, {
        fieldId,
        staffId,
      });

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
    },
  );

  test(
    'should be able to update field',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-014' },
      tag: ['@api', '@farm', '@crud', '@happy-path'],
    },
    async ({ freshUser: _, request, createdField }) => {
      const expectedMessage = 'Updated successfully';
      const updatedFieldName = `api-field-updated-${faker.string.uuid()}`;
      const fieldId = createdField.id;

      const response = await request.put(`${BASE_API_URL}/fields/${fieldId}`, {
        data: {
          name: updatedFieldName,
          area: FIELD_AREA + 100,
        },
      });
      const body = await response.json();

      const fields = await getFields(request);

      expect(response.status()).toBe(200);
      expect(body.message).toBe(expectedMessage);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: fieldId,
        name: updatedFieldName,
        area: FIELD_AREA + 100,
      });
      expect(fields.find((field) => field.id === fieldId)?.name).toBe(
        updatedFieldName,
      );
      expect(fields.find((field) => field.id === fieldId)?.area).toBe(
        FIELD_AREA + 100,
      );
    },
  );

  test(
    'should assign staff to a field through API',
    {
      annotation: { type: 'case-id', description: 'TC-ASSIGN-005' },
      tag: ['@api', '@farm', '@assignment', '@happy-path'],
    },
    async ({ freshUser: _, request, createdStaff, createdField }) => {
      const staffId = createdStaff.id;
      const fieldId = createdField.id;

      const response = await request.post(`${BASE_API_URL}/fields/assign`, {
        data: {
          fieldId,
          staffId,
        },
      });

      const body = await response.json();
      expect(response.status()).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: expect.any(Number),
        fieldId,
        staffId,
      });

      const assignmentId = body.data.id;

      const assignments = await getAssignments(request);

      const createdAssignment = assignments.find(
        (assignment) =>
          assignment.fieldId === fieldId &&
          assignment.staffId === staffId &&
          assignment.id === assignmentId,
      );

      expect(createdAssignment).toBeDefined();
    },
  );
});
