import { APIRequestContext, expect } from '@playwright/test';
import { addTransaction } from 'src/helpers/apiHelpers';
import { Transaction } from 'src/models/Transaction';

export async function topUpAmount(
  request: APIRequestContext,
  amount: number,
): Promise<Transaction> {
  const response = await addTransaction(request, {
    type: 'income',
    amount,
    description: 'Test setup funds',
    category: 'general',
  });

  expect(
    response.success,
    response.error ?? 'Transaction creation failed',
  ).toBe(true);

  return response.data!.transaction;
}

export async function drainAccount(
  request: APIRequestContext,
  amount: number,
): Promise<Transaction> {
  const response = await addTransaction(request, {
    type: 'expense',
    amount,
    description: `Drain account ${Date.now()}`,
    category: 'general',
  });

  expect(
    response.success,
    response.error ?? 'Transaction creation failed',
  ).toBe(true);

  return response.data!.transaction;
}
