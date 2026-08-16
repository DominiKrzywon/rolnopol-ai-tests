import { APIRequestContext } from '@playwright/test';
import { addTransaction } from 'src/helpers/apiHelpers';
import { Transaction } from 'src/models/finanrrrcial.ts/Transaction';

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

  return response.transaction;
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

  return response.transaction;
}
