import { APIRequestContext, APIResponse } from '@playwright/test';
import { getJson, postJson, readResponseData } from 'src/api/httpClient';
import { BASE_API_URL } from 'src/config/env.config';
import {
  CreateTransactionPayload,
  TransactionHistory,
  TransactionPayload,
  TransactionResponse,
} from 'src/models/financial';
import { AccountData } from 'src/types/accountData';

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
  const response = await getAccountResponse(request);

  const { account } = await readResponseData<AccountData>(
    response,
    'GET',
    response.url(),
  );

  return account.balance;
}

export async function getAccountResponse(
  request: APIRequestContext,
): Promise<APIResponse> {
  return request.get(`${BASE_API_URL}/financial/account`);
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

export async function createTransactionResponse(
  request: APIRequestContext,
  payload: CreateTransactionPayload,
): Promise<APIResponse> {
  return request.post(`${BASE_API_URL}/financial/transactions`, {
    data: payload,
  });
}
