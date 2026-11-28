import { topUpAmount } from 'src/actions/user.actions';
import { getTransactionsResponse } from 'src/api/financial.api';
import { expect, test } from 'src/fixtures/financial.fixture';
import { transactionHistoryPaginationSchema } from 'src/schemas/transaction-history.zod';

test.describe('financial history zod validation', () => {
  test(
    'returns a boolean hasMore in empty transaction history',
    {
      annotation: { type: 'case-id', description: 'TC-FIN-017' },
      tag: ['@financial', '@schema'],
    },
    async ({ apiSession: _, request }) => {
      const response = await getTransactionsResponse(request, 1, 0);
      expect(response.status()).toBe(200);
      const body = await response.json();

      const history = transactionHistoryPaginationSchema.parse(body);
      expect(history.data.transactions).toEqual([]);
    },
  );

  test(
    'returns a boolean hasMore in a populated transaction history',
    {
      annotation: { type: 'case-id', description: 'TC-FIN-018' },
      tag: ['@financial', '@schema'],
    },
    async ({ apiSession: _, request }) => {
      await topUpAmount(request, 100);

      const response = await getTransactionsResponse(request, 1, 0);
      expect(response.status()).toBe(200);

      const body = await response.json();
      const history = transactionHistoryPaginationSchema.parse(body);
      expect(history.data.transactions).toHaveLength(1);
    },
  );
});
