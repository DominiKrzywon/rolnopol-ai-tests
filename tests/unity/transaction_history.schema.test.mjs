import assert from 'node:assert/strict';
import test from 'node:test';

import { validateTransactionHistory } from '../../src/schemas/transaction_history.schema.ts';

const validTransaction = {
  id: 1,
  type: 'income',
  amount: 50,
  description: 'test',
  category: 'general',
  referenceId: null,
  timestamp: new Date().toISOString(),
  balanceBefore: 0,
  balanceAfter: 50,
};

const validHistory = {
  transactions: [{ ...validTransaction }],
  total: 1,
  limit: 2,
  offset: 0,
  hasMore: false,
};

test('accepts a valid transaction history with a null referenceId', () => {
  const isValid = validateTransactionHistory(validHistory);

  assert.equal(isValid, true);
});

test('rejects an unsupported transaction type', () => {
  const history = {
    ...validHistory,
    transactions: [{ ...validTransaction, type: 'transfer' }],
  };
  assert.equal(validateTransactionHistory(history), false);
});

test('rejects a history with an invalid second transaction', () => {
  const history = {
    ...validHistory,
    total: 2,
    transactions: [
      { ...validTransaction },
      { ...validTransaction, id: 2, amount: '50' },
    ],
  };
  assert.equal(validateTransactionHistory(history), false);
});

test('rejects a history without hasMore', () => {
  const history = { ...validHistory };
  delete history.hasMore;

  assert.equal(validateTransactionHistory(history), false);
});
