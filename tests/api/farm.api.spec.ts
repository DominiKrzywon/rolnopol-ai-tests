import { faker } from '@faker-js/faker';
import { createField, deleteField, getFields } from 'src/api/farm.api';
import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/auth.fixture';
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
});
