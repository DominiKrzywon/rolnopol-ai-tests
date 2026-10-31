import Ajv, { JSONSchemaType } from 'ajv';
import { AccountData } from 'src/types/accountData';

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
