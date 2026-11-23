import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/auth.fixture';
import { validateStaffList } from 'src/schemas/farm.schema';

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
    const validBody = validateStaffList(body.data);
    expect(validBody).toBe(true);
    expect(body.data).toHaveLength(0);
  },
);
