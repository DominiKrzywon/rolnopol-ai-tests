import Ajv, { type JSONSchemaType } from 'ajv';
import type { TransactionHistory } from 'src/models/financial';

const transactionHistorySchema: JSONSchemaType<TransactionHistory> = {
  type: 'object',
  required: ['transactions', 'total', 'limit', 'offset', 'hasMore'],
  additionalProperties: true,
  properties: {
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'id',
          'type',
          'amount',
          'description',
          'category',
          'referenceId',
          'timestamp',
          'balanceBefore',
          'balanceAfter',
        ],
        properties: {
          id: { type: 'number' },
          type: {
            type: 'string',
            enum: ['expense', 'income'],
          },
          amount: { type: 'number' },
          description: { type: 'string' },
          category: { type: 'string' },
          referenceId: {
            anyOf: [{ type: 'string' }, { type: 'null', nullable: true }],
          },
          timestamp: { type: 'string' },
          balanceBefore: { type: 'number' },
          balanceAfter: { type: 'number' },
        },
      },
    },
    total: { type: 'number' },
    limit: { type: 'number' },
    offset: { type: 'number' },
    hasMore: { type: 'boolean' },
  },
};

const ajv = new Ajv({ allErrors: true });

export const validateTransactionHistory = ajv.compile(transactionHistorySchema);
