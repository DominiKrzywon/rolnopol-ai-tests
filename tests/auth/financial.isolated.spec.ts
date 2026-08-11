import { request as playwrightRequest } from '@playwright/test';
import { drainAccount, topUpAmount } from 'src/actions/user.actions';
import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/auth.fixture';
import { getAccountBalance } from 'src/helpers/apiHelpers';
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
      const userId = body.data?.user?.id;

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

  test.beforeEach(async ({ freshUser: _, request }) => {
    await topUpAmount(request, 9500);
  });

  test(
    'verify account balance and transaction history',
    {
      tag: ['@financial', '@balance', '@history'],
    },
    async ({ financialPage }) => {
      const randomDescription = `Crops expense ${Date.now()}`;
      const expectedSuccessMessage = 'Transaction added successfully';
      const amountAtStart = 9500;
      const amount = 25.5;

      await financialPage.goto();

      const balanceBefore = await financialPage.getBalance();
      expect(balanceBefore).toEqual(amountAtStart);

      await financialPage.addTransaction({
        type: 'expense',
        amount,
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
        { timeout: 15_000 },
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
      const leave = 50;
      const extraMoney = 9000;
      const amountBeforeDrain = 18450;
      await topUpAmount(request, extraMoney);

      const expectedErrorMessage = 'Insufficient funds for transfer';
      const toUserId = await getEmptyUserId();

      await financialPage.goto();

      await drainAccount(request, amountBeforeDrain);

      await page.reload();
      expect(await financialPage.getBalance()).toEqual(leave);

      const currentBalance = await getAccountBalance(request);

      const amount = leave + 1;
      const description = `Negative ${Date.now()}`;

      await financialPage.transferFunds({ toUserId, amount, description });
      await expect(financialPage.notificationMessage).toHaveText(
        expectedErrorMessage,
      );
      expect(currentBalance).toEqual(leave);
    },
  );
});
