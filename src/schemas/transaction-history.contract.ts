import assert from 'node:assert/strict';

import type { APIRequestContext } from '@playwright/test';
import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { ENV } from 'src/config/env.config';

export async function loadTransactionHistoryValidator(
  request: APIRequestContext,
): Promise<ValidateFunction> {
  const url = `${ENV.BASE_URL}/schema/openapi.v1.json`;
  const response = await request.get(url);
  assert.equal(response.status(), 200, `Expected HTTP 200 from ${url}`);

  const openApi = await response.json();
  const schema =
    openApi.paths?.['/financial/transactions']?.get?.responses?.['200']
      ?.content?.['application/json']?.schema;
  assert.ok(schema, 'Expected the GET /financial/transactions HTTP 200 schema');

  const transactionRef = '#/components/schemas/Transaction';
  const transactions = schema.properties?.data?.properties?.transactions;
  assert.equal(
    transactions?.items?.$ref,
    transactionRef,
    'Unexpected schema reference for transaction items',
  );

  const transactionSchema = openApi.components?.schemas?.Transaction;
  assert.ok(transactionSchema, 'Expected the Transaction schema in OpenAPI');

  const responseSchema = structuredClone(schema);
  responseSchema.properties.data.properties.transactions.items =
    transactionSchema;

  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  ajv.addKeyword({ keyword: 'example', valid: true });

  return ajv.compile(responseSchema);
}
