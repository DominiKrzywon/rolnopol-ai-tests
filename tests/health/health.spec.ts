import { expect, test } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';

test(
  'api app health check',
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-007' },
    tag: ['@smoke', '@health'],
  },
  async ({ request }) => {
    const response = await request.get(`${BASE_API_URL}/healthcheck`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.success).toBeTruthy();
    expect(body.data.status).toEqual('healthy');
  },
);
