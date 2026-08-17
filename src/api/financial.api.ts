import { APIRequestContext } from '@playwright/test';
import { getJson, postJson } from 'src/api/httpClient';
import { BASE_API_URL } from 'src/config/env.config';
import {
  TransactionHistory,
  TransactionPayload,
  TransactionResponse,
} from 'src/models/financial';

export async function addTransaction(
  request: APIRequestContext,
  payload: TransactionPayload,
): Promise<TransactionResponse> {
  let requestData: unknown = { ...payload };

  if (payload.type === 'income') {
    requestData = {
      ...payload,
      cardNumber: '4111111111111111',
      cvv: '123',
    };
  }

  return postJson(
    request,
    `${BASE_API_URL}/financial/transactions`,
    requestData,
  );
}

export async function getAccountBalance(
  request: APIRequestContext,
): Promise<number> {
  const { account } = await getJson<{ account: { balance: number } }>(
    request,
    `${BASE_API_URL}/financial/account`,
  );

  return account.balance;
}

export async function transferFunds(
  request: APIRequestContext,
  data: {
    toUserId: number;
    amount: number;
    description: string;
  },
): Promise<{
  success: boolean;
  amount: number;
}> {
  return postJson(request, `${BASE_API_URL}/financial/transfer`, data);
}

export async function getTransactions(
  request: APIRequestContext,
  params?: string,
): Promise<TransactionHistory> {
  return getJson<TransactionHistory>(
    request,
    `${BASE_API_URL}/financial/transactions${params ? '?' + params : ''}`,
  );
}
