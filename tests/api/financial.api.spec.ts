import {
  type APIRequestContext,
  request as playwrightRequest,
} from '@playwright/test';
import { topUpAmount } from 'src/actions/user.actions';
import { loginAs, registerVerifiedUser } from 'src/api/auth.api';
import {
  addTransaction,
  getAccountBalance,
  getTransactions,
} from 'src/api/financial.api';
import { BASE_API_URL } from 'src/config/env.config';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test } from 'src/fixtures/auth.fixture';

async function createLoggedInRecipient(
  recipientApi: APIRequestContext,
): Promise<number> {
  const recipient = prepareRandomUser();
  await registerVerifiedUser(recipientApi, recipient);

  const session = await loginAs(recipientApi, recipient);
  return session.id;
}

test.describe('Financial API', () => {
  test(
    'should display success status and correct account data for new user',
    {
      annotation: { type: 'case-id', description: 'TC-FIN-011' },
      tag: ['@api', '@financial', '@balance'],
    },
    async ({ freshUser, request }) => {
      const session = await loginAs(request, freshUser);
      const response = await request.get(`${BASE_API_URL}/financial/account`);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.account).toMatchObject({
        id: expect.any(Number),
        balance: 0,
        userId: session.id,
        currency: 'ROL',
      });
    },
  );

  test(
    'should update account balance after income and expense',
    {
      annotation: {
        type: 'case-id',
        description: 'TC-FIN-005',
      },
      tag: ['@api', '@financial', '@income', '@expense'],
    },
    async ({ freshUser: _, request }) => {
      const incomeAmount = 25.5;
      const expenseAmount = 10.25;

      const balanceBefore = await getAccountBalance(request);
      const incomeResponse = await request.post(
        `${BASE_API_URL}/financial/transactions`,
        {
          data: {
            type: 'income',
            amount: incomeAmount,
            description: 'Test income',
            category: 'salary',
            cardNumber: '4111111111111111',
            cvv: '123',
          },
        },
      );

      const data = await incomeResponse.json();
      expect(incomeResponse.status()).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.transaction.amount).toBe(incomeAmount);
      expect(data.data.transaction.type).toBe('income');
      expect(data.data.transaction.description).toBe('Test income');

      const balanceAfter = await getAccountBalance(request);
      expect(balanceAfter).toBe(balanceBefore + incomeAmount);

      const transactionExpense = await request.post(
        `${BASE_API_URL}/financial/transactions`,
        {
          data: {
            type: 'expense',
            amount: expenseAmount,
            description: 'Test expense',
            category: 'food',
          },
        },
      );
      expect(transactionExpense.status()).toBe(201);

      const balanceAfterExpense = await getAccountBalance(request);
      expect(balanceAfterExpense).toBe(balanceAfter - expenseAmount);
    },
  );

  test(
    'should be able to transfer min. amount 0.01',
    {
      annotation: {
        type: 'case-id',
        description: 'TC-FIN-006',
      },
      tag: ['@api', '@financial', '@transfer'],
    },
    async ({ freshUser: _, request }) => {
      const expectedTransferMessage = 'Transfer completed successfully';
      const recipientApi = await playwrightRequest.newContext();

      try {
        const recipientId = await createLoggedInRecipient(recipientApi);
        const recipientBalanceBefore = await getAccountBalance(recipientApi);
        const transferAmount = 0.01;

        await topUpAmount(request, 1);

        const balance = await getAccountBalance(request);
        const transfer = await request.post(
          `${BASE_API_URL}/financial/transfer`,
          {
            data: {
              toUserId: recipientId,
              amount: transferAmount,
              description: 'Test transfer',
            },
          },
        );
        const transferResponseBody = await transfer.json();

        expect(transferResponseBody.message).toEqual(expectedTransferMessage);
        expect(transfer.status()).toBe(200);
        expect(transferResponseBody.success).toBe(true);

        const balanceAfterTransfer = await getAccountBalance(request);
        expect(balanceAfterTransfer).toBe(balance - transferAmount);

        const recipientBalanceAfter = await getAccountBalance(recipientApi);
        expect(recipientBalanceAfter).toBe(
          recipientBalanceBefore + transferAmount,
        );
      } finally {
        await recipientApi.dispose();
      }
    },
  );

  test(
    'should be able to transfer maximum amount 999.99',
    {
      annotation: {
        type: 'case-id',
        description: 'TC-FIN-007',
      },
      tag: ['@api', '@financial', '@transfer'],
    },
    async ({ freshUser: _, request }) => {
      const recipientApi = await playwrightRequest.newContext();
      const expectedTransferMessage = 'Transfer completed successfully';
      try {
        const amount = 999.99;

        const recipientId = await createLoggedInRecipient(recipientApi);
        await topUpAmount(request, 1000);

        const senderAccountBalance = await getAccountBalance(request);
        const recipientAccountBalance = await getAccountBalance(recipientApi);

        expect(senderAccountBalance).toBeGreaterThan(amount);
        expect(recipientAccountBalance).toBe(0);

        const transfer = await request.post(
          `${BASE_API_URL}/financial/transfer`,
          {
            data: {
              toUserId: recipientId,
              amount,
              description: 'Test transfer',
            },
          },
        );

        const transferBody = await transfer.json();
        expect(transfer.status()).toBe(200);
        expect(transferBody.message).toEqual(expectedTransferMessage);
        expect(transferBody.success).toBe(true);

        const senderAccountAfter = await getAccountBalance(request);
        const recipientAccountAfter = await getAccountBalance(recipientApi);

        expect(senderAccountAfter).toBe(senderAccountBalance - amount);
        expect(recipientAccountAfter).toBe(recipientAccountBalance + amount);
      } finally {
        await recipientApi.dispose();
      }
    },
  );

  test(
    'should be able to transfer full balance',
    {
      annotation: {
        type: 'case-id',
        description: 'TC-FIN-008',
      },
      tag: ['@api', '@financial', '@transfer'],
    },
    async ({ freshUser: _, request }) => {
      const expectedTransferMessage = 'Transfer completed successfully';
      const recipientApi = await playwrightRequest.newContext();

      try {
        const amount = 666.66;
        const recipientId = await createLoggedInRecipient(recipientApi);

        await topUpAmount(request, amount);
        const senderBalance = await getAccountBalance(request);
        expect(senderBalance).toBeGreaterThan(0);
        expect(senderBalance).toBeLessThanOrEqual(999.99);

        const recipientBalanceBefore = await getAccountBalance(recipientApi);

        const response = await request.post(
          `${BASE_API_URL}/financial/transfer`,
          {
            data: {
              toUserId: recipientId,
              amount: senderBalance,
              description: 'Full balance transfer',
            },
          },
        );
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.message).toBe(expectedTransferMessage);
        expect(response.status()).toBe(200);

        const senderBalanceAfter = await getAccountBalance(request);
        const recipientBalanceAfter = await getAccountBalance(recipientApi);

        expect(senderBalanceAfter).toEqual(0);
        expect(recipientBalanceAfter).toEqual(
          recipientBalanceBefore + senderBalance,
        );
      } finally {
        await recipientApi.dispose();
      }
    },
  );

  test(
    'should not allowed to transfer more than current balance',
    {
      annotation: {
        type: 'case-id',
        description: 'TC-FIN-009',
      },
      tag: ['@api', '@financial', '@transfer', '@negative'],
    },
    async ({ freshUser: _, request }) => {
      const expectedErrorMessage = 'Insufficient funds for transfer';
      const recipientApi = await playwrightRequest.newContext();

      try {
        const amount = 50;
        const recipientId = await createLoggedInRecipient(recipientApi);

        await topUpAmount(request, amount);
        const senderBalanceBefore = await getAccountBalance(request);
        const recipientBalanceBefore = await getAccountBalance(recipientApi);

        expect(senderBalanceBefore).toEqual(amount);
        expect(recipientBalanceBefore).toEqual(0);

        const response = await request.post(
          `${BASE_API_URL}/financial/transfer`,
          {
            data: {
              toUserId: recipientId,
              amount: senderBalanceBefore + 0.01,
              description: 'Wrong balance',
            },
          },
        );
        const body = await response.json();

        expect(response.status()).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error).toBe(expectedErrorMessage);

        const senderBalanceAfter = await getAccountBalance(request);
        const recipientBalanceAfter = await getAccountBalance(recipientApi);

        expect(senderBalanceAfter).toEqual(senderBalanceBefore);
        expect(recipientBalanceAfter).toEqual(recipientBalanceBefore);
      } finally {
        await recipientApi.dispose();
      }
    },
  );

  test(
    'should not allowed to transfer to non existing ID',
    {
      annotation: {
        type: 'case-id',
        description: 'TC-FIN-010',
      },
      tag: ['@api', '@financial', '@transfer', '@negative'],
    },
    async ({ freshUser: _, request }) => {
      const expectedErrorMessage = 'Recipient user does not exist';

      await topUpAmount(request, 10);
      const senderBalanceBefore = await getAccountBalance(request);

      const response = await request.post(
        `${BASE_API_URL}/financial/transfer`,
        {
          data: {
            toUserId: Number.MAX_SAFE_INTEGER,
            amount: 1,
            description: 'Transfer to nonexistent recipient',
          },
        },
      );
      const body = await response.json();
      const senderBalanceAfter = await getAccountBalance(request);

      expect(response.status()).toBe(400);
      expect(senderBalanceBefore).toEqual(senderBalanceAfter);
      expect(body.success).toBe(false);
      expect(body.error).toBe(expectedErrorMessage);
    },
  );

  test(
    'should be able to check transaction history and pagination',
    {
      annotation: {
        type: 'case-id',
        description: 'TC-FIN-004',
      },
      tag: ['@api', '@financial', '@history'],
    },
    async ({ freshUser: _, request }) => {
      const amount1 = 50;
      const amount2 = 100;
      const amount3 = 150;

      const transaction1 = await topUpAmount(request, amount1);
      const transaction2 = await topUpAmount(request, amount2);
      const transaction3 = await topUpAmount(request, amount3);

      const firstPage = await request.get(
        `${BASE_API_URL}/financial/transactions?limit=2&offset=0`,
      );

      const bodyFirstPage = await firstPage.json();
      expect(firstPage.status()).toBe(200);
      expect(bodyFirstPage.success).toBe(true);
      expect(bodyFirstPage.data.total).toBe(3);
      expect(bodyFirstPage.data.limit).toBe(2);
      expect(bodyFirstPage.data.offset).toBe(0);
      expect(bodyFirstPage.data.hasMore).toBe(true);

      const secondPage = await request.get(
        `${BASE_API_URL}/financial/transactions?limit=2&offset=2`,
      );
      const bodySecondPage = await secondPage.json();

      expect(bodySecondPage.success).toBe(true);
      expect(secondPage.status()).toBe(200);
      expect(bodySecondPage.data.total).toBe(3);
      expect(bodySecondPage.data.limit).toBe(2);
      expect(bodySecondPage.data.offset).toBe(2);
      expect(bodySecondPage.data.hasMore).toBe(false);

      expect(bodyFirstPage.data.transactions).toHaveLength(2);
      expect(bodySecondPage.data.transactions).toHaveLength(1);

      const expectedIds = [
        transaction1.id,
        transaction2.id,
        transaction3.id,
      ].sort((a, b) => a - b);

      const actualIds = [
        ...bodyFirstPage.data.transactions,
        ...bodySecondPage.data.transactions,
      ]
        .map((transaction: { id: number }) => transaction.id)
        .sort((a, b) => a - b);

      expect(actualIds).toEqual(expectedIds);
    },
  );

  test(
    'should be able to check history filter by type',
    {
      annotation: { type: 'case-id', description: 'TC-FIN-012' },
      tag: ['@api', '@financial', '@history'],
    },
    async ({ freshUser: _, request }) => {
      const amountIncome = 100;
      const amountExpense = 50;
      const income = await topUpAmount(request, amountIncome);
      const { transaction: expense } = await addTransaction(request, {
        type: 'expense',
        amount: amountExpense,
        description: 'Test api',
        category: 'General',
      });
      const response = await request.get(
        `${BASE_API_URL}/financial/transactions?type=income`,
      );
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.total).toBe(1);
      expect(body.data.transactions).toHaveLength(1);
      expect(body.data.transactions[0]).toMatchObject({
        id: income.id,
        type: 'income',
      });
      expect(body.data.transactions[0].id).not.toBe(expense.id);
    },
  );

  test(
    'should be able to check history filter by category',
    {
      annotation: { type: 'case-id', description: 'TC-FIN-013' },
      tag: ['@api', '@financial', '@history'],
    },
    async ({ freshUser: _, request }) => {
      const incomeAmount = 50;

      await topUpAmount(request, incomeAmount);
      const { transaction: secondIncome } = await addTransaction(request, {
        type: 'income',
        amount: incomeAmount,
        description: 'Test',
        category: 'salary',
      });

      const response = await request.get(
        `${BASE_API_URL}/financial/transactions?category=salary`,
      );
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.total).toBe(1);
      expect(body.data.transactions).toHaveLength(1);
      expect(body.data.transactions[0]).toMatchObject({
        id: secondIncome.id,
        type: 'income',
        category: 'salary',
      });
    },
  );

  test(
    'should be able to check date range',
    {
      annotation: { type: 'case-id', description: 'TC-FIN-014' },
      tag: ['@api', '@financial', '@history'],
    },
    async ({ freshUser: _, request }) => {
      const transactionAmount = 100;
      const transaction = await topUpAmount(request, transactionAmount);
      const transactionTime = new Date(transaction.timestamp).getTime();
      const day = 24 * 60 * 60 * 1000;
      const date = (time: number): string =>
        new Date(time).toISOString().slice(0, 10);

      const startDate = date(transactionTime - day);
      const endDate = date(transactionTime + day);

      const matchingRange = await getTransactions(
        request,
        new URLSearchParams({ startDate, endDate }).toString(),
      );

      expect(matchingRange.total).toBe(1);
      expect(matchingRange.transactions).toHaveLength(1);
      expect(matchingRange.transactions[0].id).toBe(transaction.id);

      const beforeRange = await getTransactions(
        request,
        new URLSearchParams({
          startDate: date(transactionTime - 2 * day),
          endDate: date(transactionTime - 3 * day),
        }).toString(),
      );

      expect(beforeRange.total).toBe(0);
      expect(beforeRange.transactions).toEqual([]);

      const afterRange = await getTransactions(
        request,
        new URLSearchParams({
          startDate: date(transactionTime + 2 * day),
          endDate: date(transactionTime + 3 * day),
        }).toString(),
      );

      expect(afterRange.total).toBe(0);
      expect(afterRange.transactions).toEqual([]);
    },
  );
});
