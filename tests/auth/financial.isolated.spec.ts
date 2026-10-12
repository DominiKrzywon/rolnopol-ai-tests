import { request as playwrightRequest } from '@playwright/test';
import { drainAccount, topUpAmount } from 'src/actions/user.actions';
import { registerUser } from 'src/api/auth.api';
import { getAccountBalance } from 'src/api/financial.api';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test } from 'src/fixtures/auth.fixture';

test.describe('Financial functionality tests', () => {
  async function createRecipientId(): Promise<number> {
    const api = await playwrightRequest.newContext();
    const user = prepareRandomUser();

    try {
      const response = await registerUser(api, user);

      expect(response.status()).toBe(201);

      const body = await response.json();
      return body.data.user.id;
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
      annotation: { type: 'case-id', description: 'TC-FIN-001' },
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

      // Record an expense and verify its balance impact
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

      // Find the new expense in transaction history
      const row = financialPage.transactionRows.filter({
        hasText: randomDescription,
      });
      await expect(row).toBeVisible();
      await expect(row).toContainText('expense');
      await expect(row).toContainText('crops');

      // Verify the expense matches its category filter
      await financialPage.filterBy({
        category: 'crops',
      });

      await expect(row).toBeVisible();

      // Verify the income filter excludes the expense
      await financialPage.filterBy({
        type: 'income',
        category: '',
      });
      await expect(row).toHaveCount(0);

      // Clear filters and verify the expense reappears
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
      annotation: { type: 'case-id', description: 'TC-FIN-002' },
      tag: ['@financial', '@transfer', '@business-logic'],
    },
    async ({ financialPage, page }) => {
      const expectedSuccessMessage = 'Transfer completed successfully!';
      const toUserId = await createRecipientId();
      const amount = 10;
      const description = `E2E transfer ${Date.now()}`;

      await financialPage.goto();
      const balanceBefore = await financialPage.getBalance();

      // Transfer funds to the prepared recipient
      await financialPage.transferFunds({ toUserId, amount, description });
      await expect(financialPage.transferSuccess).toHaveText(
        expectedSuccessMessage,
        { timeout: 15_000 },
      );

      // Verify the debit and history entry after reloading
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
      annotation: { type: 'case-id', description: 'TC-FIN-003' },
      tag: [`@financial`, `@validation`, `@edge-case`],
    },
    async ({ request, financialPage }) => {
      const leave = 50;
      const expectedErrorMessage = 'Insufficient funds for transfer';
      const toUserId = await createRecipientId();

      const balanceBeforeDrain = await getAccountBalance(request);

      // Leave a small balance for the overdraft attempt
      await drainAccount(request, balanceBeforeDrain - leave);

      const balanceBeforeTransfer = await getAccountBalance(request);
      expect(balanceBeforeTransfer).toBe(leave);

      const amount = balanceBeforeTransfer + 1;
      const description = `Negative ${Date.now()}`;

      await financialPage.goto();

      // Attempt to transfer more than the remaining balance
      await financialPage.transferFunds({ toUserId, amount, description });
      await expect(financialPage.notificationMessage).toHaveText(
        expectedErrorMessage,
      );

      // Verify the rejected transfer leaves the balance unchanged
      const balanceAfterTransfer = await getAccountBalance(request);
      expect(balanceAfterTransfer).toBe(balanceBeforeTransfer);
    },
  );
});
