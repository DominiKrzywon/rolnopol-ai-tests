import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/test.fixture';
import { alertsSectionsSchema } from 'src/schemas/alerts.zod';

test(
  'returns alert sections with titled alerts and dated history groups',
  {
    annotation: { type: 'case-id', description: 'TC-PUBLIC-017' },
    tag: ['@alerts', '@schema'],
  },
  async ({ request }) => {
    const response = await request.get(`${BASE_API_URL}/alerts`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    alertsSectionsSchema.parse(body);
  },
);
