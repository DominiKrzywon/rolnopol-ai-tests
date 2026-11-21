import { topUpAmount } from 'src/actions/user.actions';
import { getTransactionsResponse } from 'src/api/financial.api';
import { expect, test } from 'src/fixtures/financial.fixture';
import { loadTransactionHistoryValidator } from 'src/schemas/transaction-history.contract';

test('should valid contract for valid data', async ({
  apiSession: _,
  request,
}) => {
  const amount = 100;

  await topUpAmount(request, amount);
  const response = await getTransactionsResponse(request, 1, 0);
  expect(response.status()).toBe(200);

  const body = await response.json();
  const validate = await loadTransactionHistoryValidator(request);
  expect(validate(body), JSON.stringify(validate.errors)).toBe(true);
});
