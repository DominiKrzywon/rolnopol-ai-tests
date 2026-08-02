import { request as playwrightRequest } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/test.fixture';
import { addTransaction } from 'src/helpers/apiHelpers';
import { getEmptyUserData } from 'src/models/User';

test.describe('Financial functionality tests', () => {
  async function getEmptyUserId(): Promise<number> {
    const api = await playwrightRequest.newContext({ baseURL: BASE_API_URL });
    const user = getEmptyUserData();
    try {
      const response = await api.post(`${BASE_API_URL}/login`, {
        data: { email: user.email, password: user.password },
      });
      const body = await response.json();
      const userId = body.data?.id;

      if (typeof userId !== 'number') {
        throw new Error(
          `Failed to get USER id: ${body.error ?? JSON.stringify(body)}`,
        );
      }
      return userId;
    } finally {
      await api.dispose();
    }
  }

  test.beforeEach(async ({ request }) => {
    const seed = await addTransaction(request, {
      type: 'income',
      amount: 9500,
      description: 'Test setup funds',
      category: 'general',
    });
    expect(seed.success, seed.error).toBe(true);
  });

  test(
    'verify account balance and transaction history',
    {
      tag: ['@financial', '@balance', '@history'],
    },
    async ({ financialPage }) => {
      const randomDescription = `Crops expense ${Date.now()}`;
      const expectedSuccessMessage = 'Transaction added successfully';
      const amount = 25.5;

      await financialPage.goto();

      const balanceBefore = await financialPage.getBalance();
      expect(balanceBefore).toBeGreaterThanOrEqual(0);

      await financialPage.addTransaction({
        type: 'expense',
        amount: amount,
        category: 'crops',
        description: randomDescription,
      });

      await expect(financialPage.notificationMessage).toHaveText(
        expectedSuccessMessage,
      );

      const balanceAfter = await financialPage.getBalance();
      expect(balanceAfter).toBeCloseTo(balanceBefore - amount, 1);

      await expect(financialPage.currentBalance).toContainText('ROL');
      await expect(financialPage.totalIncome).not.toBeEmpty();
      await expect(financialPage.totalExpenses).not.toBeEmpty();
      await expect(financialPage.totalNetIncome).not.toBeEmpty();
      await expect(financialPage.transactionHistory).not.toBeEmpty();

      const row = financialPage.transactionRows.filter({
        hasText: randomDescription,
      });
      await expect(row).toBeVisible();
      await expect(row).toContainText('expense');
      await expect(row).toContainText('crops');

      await financialPage.filterBy({
        category: 'crops',
      });

      await expect(row).toBeVisible();

      await financialPage.filterBy({
        type: 'income',
        category: '',
      });
      await expect(row).toHaveCount(0);

      await financialPage.filterBy({
        type: '',
        category: '',
      });

      await expect(row).toBeVisible();
    },
  );

  test(
    'verify funds transfer between users',
    {
      tag: ['@financial', '@transfer', '@business-logic'],
    },
    async ({ financialPage, page }) => {
      const toUserId = await getEmptyUserId();
      const amount = 10;
      const description = `E2E transfer ${Date.now()}`;
      const expectedSuccessMessage = 'Transfer completed successfully!';

      await financialPage.goto();
      const balanceBefore = await financialPage.getBalance();
      await financialPage.transferFunds({ toUserId, amount, description });
      await expect(financialPage.transferSuccess).toHaveText(
        expectedSuccessMessage,
      );

      await page.reload();

      const balanceAfter = await financialPage.getBalance();

      expect(balanceAfter).toBeCloseTo(balanceBefore - amount);

      const row = financialPage.transactionRows.filter({
        hasText: description,
      });

      await expect(row).toContainText('transfer');
    },
  );

  test(
    'verify prevent overdraft',
    {
      tag: [`@financial`, `@validation`, `@edge-case`],
    },
    async ({ request, financialPage, page }) => {
      await addTransaction(request, {
        type: 'expense',
        amount: 9000,
        description: 'Take a money',
        category: 'general',
      });

      const expectedErrorMessage = 'Insufficient funds for transfer';
      const toUserId = await getEmptyUserId();
      const leave = 50;
      const maxTransfer = 999.99;

      await financialPage.goto();
      let balanceBefore = await financialPage.getBalance();

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (balanceBefore >= maxTransfer) {
        const drain = await addTransaction(request, {
          type: 'expense',
          amount: balanceBefore - leave,
          description: `Drain ${Date.now()}`,
          category: 'general',
        });
        // eslint-disable-next-line playwright/no-conditional-expect
        expect(drain.success, drain.error).toBe(true);
        await page.reload();
        balanceBefore = await financialPage.getBalance();
      }

      const amount = balanceBefore + 1;
      const description = `Negative ${Date.now()}`;

      await financialPage.transferFunds({ toUserId, amount, description });
      await expect(financialPage.notificationMessage).toHaveText(
        expectedErrorMessage,
      );
    },
  );
});
