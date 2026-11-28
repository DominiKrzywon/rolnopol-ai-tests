import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/data.fixture';
import { validateStaffResponse } from 'src/schemas/farm.schema';
import { CreatedStaff } from 'src/types/testData';

test.describe('Staff list response contract', () => {
  test(
    'returns an empty staff list for a newly registered user',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-023' },
      tag: ['@farm', '@schema'],
    },
    async ({ request, apiSession: _ }) => {
      const response = await request.get(`${BASE_API_URL}/staff`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      const validBody = validateStaffResponse(body);
      expect(
        validBody,
        `Staff list does not match the schema: ${JSON.stringify(validateStaffResponse.errors)}`,
      ).toBe(true);
      expect(body.data).toHaveLength(0);
    },
  );

  test(
    'creating and reading new worker via API',
    {
      annotation: { type: 'case-id', description: 'TC-FARM-015' },
      tag: ['@api', '@farm', '@assignment', '@happy-path'],
    },
    async ({ request, createdStaff }) => {
      const response = await request.get(`${BASE_API_URL}/staff`);
      expect(response.status()).toBe(200);

      const body = (await response.json()) as { data: CreatedStaff[] };
      const isValidStaffList = validateStaffResponse(body);

      expect(
        isValidStaffList,
        `Staff list does not match the schema: ${JSON.stringify(validateStaffResponse.errors)}`,
      ).toBe(true);

      const worker = body.data.find((item) => item.id === createdStaff.id);
      expect(worker).toMatchObject({
        id: createdStaff.id,
        name: createdStaff.name,
        surname: createdStaff.surname,
        age: createdStaff.age,
      });
    },
  );
});
