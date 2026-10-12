import { APIResponse, expect } from '@playwright/test';
import { ApiEnvelope } from 'src/models/ApiResponse';

export async function expectApiSuccess<T = unknown>(
  response: APIResponse,
  expectedStatus: number,
): Promise<ApiEnvelope<T>> {
  const context = `${response.url()} (HTTP ${response.status()})`;
  expect(response.status(), `Unexpected status for ${context}`).toBe(
    expectedStatus,
  );

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Expected valid JSON from ${context}`);
  }

  expect(
    typeof body === 'object' && body !== null && !Array.isArray(body),
    `Expected a JSON envelope object from ${context}`,
  ).toBe(true);
  expect(
    (body as Record<string, unknown>).success,
    `Expected success === true from ${context}`,
  ).toBe(true);

  return body as ApiEnvelope<T>;
}
