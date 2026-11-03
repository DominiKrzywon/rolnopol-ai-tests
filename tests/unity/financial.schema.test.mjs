import assert from 'node:assert/strict';
import test from 'node:test';

import { validateAccountData } from '../../src/schemas/financial.schema.ts';

const financialAccount = {
  account: {
    id: 1,
    userId: 1,
    balance: 0,
    currency: 'ROL',
  },
};

test('Should validate financial valid data', () => {
  const result = validateAccountData(financialAccount);
  assert.equal(result, true);
});

test('Should not validate financial invalid data', () => {
  const invalidData = {
    ...financialAccount,
    account: {
      ...financialAccount.account,
      balance: '0',
    },
  };

  const result = validateAccountData(invalidData);
  assert.equal(result, false);
});

test('Should not valid for data with no currency', () => {
  const invalidData = {
    ...financialAccount,
    account: { ...financialAccount.account },
  };

  delete invalidData.account.currency;

  const result = validateAccountData(invalidData);

  assert.equal(result, false);
});
