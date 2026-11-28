import { _ } from 'ajv';
import { topUpAmount } from 'src/actions/user.actions';
import { getTransactionsResponse } from 'src/api/financial.api';
import { expect, test } from 'src/fixtures/financial.fixture';
import { loadTransactionHistoryValidator } from 'src/schemas/transaction-history.contract';

test.describe('Published transaction history contract', () => {
  test(
    'matches the published contract for a populated transaction history',
    {
      annotation: { type: 'case-id', description: 'TC-FIN-016' },
      tag: ['@financial', '@schema'],
    },
    async ({ apiSession: _, request }) => {
      const amount1 = 100;
      const amount2 = 200;

      await topUpAmount(request, amount1);
      await topUpAmount(request, amount2);

      const response = await getTransactionsResponse(request, 2, 0);
      expect(response.status()).toBe(200);

      const body = await response.json();
      const validate = await loadTransactionHistoryValidator(request);
      const matchesContract = validate(body);

      expect(matchesContract, JSON.stringify(validate.errors)).toBe(true);
      expect(body.data.transactions).toHaveLength(2);
    },
  );
});
