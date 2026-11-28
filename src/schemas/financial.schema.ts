import Ajv, { type JSONSchemaType } from 'ajv';
import type { AccountData } from 'src/types/accountData';

const accountDataSchema: JSONSchemaType<AccountData> = {
  type: 'object',
  required: ['account'],
  additionalProperties: true,
  properties: {
    account: {
      type: 'object',
      required: ['id', 'userId', 'balance', 'currency'],
      additionalProperties: true,
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        balance: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  },
};

const ajv = new Ajv({ allErrors: true });

export const validateAccountData = ajv.compile(accountDataSchema);

export const validateAccountResponse = ajv.compile({
  properties: {
    success: { type: 'boolean', const: true },
    timestamp: { type: 'string' },
    data: accountDataSchema,
  },
  type: 'object',
  required: ['success', 'timestamp', 'data'],
});
