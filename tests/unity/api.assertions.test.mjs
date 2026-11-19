import assert from 'node:assert/strict';
import test from 'node:test';

import { expectApiSuccess } from '../../src/assertions/api.assertions.ts';

test('check parsed object for valid response', async () => {
  const body = {
    success: true,
    timestamp: '2026-11-19T12:00:00Z',
    data: { balance: 50 },
  };

  const response = {
    url: () => 'http://localhost/api/example',
    status: () => 200,
    json: async () => body,
  };

  const actual = await expectApiSuccess(response, 200);

  assert.deepEqual(actual, body);
});

test('check behavior for error while expected success', async () => {
  const body = {
    success: true,
    timestamp: '2026-11-19T12:00:00Z',
    data: { balance: 50 },
  };

  const response = {
    url: () => 'http://localhost/api/example',
    status: () => 500,
    json: async () => body,
  };

  await assert.rejects(
    () => expectApiSuccess(response, 200),
    /Unexpected status/,
  );
});

test('should get expected error for invalid JSON', async () => {
  const response = {
    url: () => 'http://localhost/api/example',
    status: () => 200,
    json: async () => {
      throw new SyntaxError('Invalid JSON');
    },
  };
  await assert.rejects(
    () => expectApiSuccess(response, 200),
    /Expected valid JSON/,
  );
});
