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

  const balanceError = validateAccountData.errors.find(
    (error) =>
      error.keyword === 'type' &&
      error.instancePath === '/account/balance' &&
      error.params.type === 'number',
  );

  assert.ok(balanceError, 'Expected an error for balance as a number');
});

test('Should not valid for data with no currency', () => {
  const invalidData = {
    ...financialAccount,
    account: { ...financialAccount.account },
  };

  delete invalidData.account.currency;

  const result = validateAccountData(invalidData);
  assert.equal(result, false);

  const currencyError = validateAccountData.errors.find(
    (error) =>
      error.keyword === 'required' &&
      error.instancePath === '/account' &&
      error.params.missingProperty === 'currency',
  );

  assert.ok(currencyError, 'Expected a number-type error for account.balance');
});

test('rejects data without account', () => {
  const data = { ...financialAccount };

  delete data.account;

  const result = validateAccountData(data);
  assert.equal(result, false);
});

test('accepts an account with an additional property', () => {
  const data = {
    ...financialAccount,
    account: {
      ...financialAccount.account,
      skills: ['coding', 'testing', 'acrobatics'],
    },
  };

  const result = validateAccountData(data);
  assert.equal(result, true);
});

test('accepts data with an additional root property', () => {
  const data = {
    ...financialAccount,
    extraText: 'This is allowed',
  };

  const result = validateAccountData(data);
  assert.equal(result, true);
});
