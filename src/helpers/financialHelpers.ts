import { type APIRequestContext } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';

type Transaction = {
  id: number;
  timestamp: string;
};

type TransactionData = {
  transactions: Transaction[];
  total: number;
};

export const getTransactionsByDateRange = async (
  request: APIRequestContext,
  startDate: string,
  endDate: string,
): Promise<TransactionData> => {
  const response = await request.get(
    `${BASE_API_URL}/financial/transactions?startDate=${startDate}&endDate=${endDate}`,
  );

  const body = await response.json();

  return body.data;
};
