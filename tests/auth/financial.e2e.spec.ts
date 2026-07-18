import test, { expect } from '@playwright/test';
import { addTransaction } from 'src/helpers/apiHelpers';
import { FinancialPage } from 'src/pages/FinancialPage';

test.describe('Financial functionality tests', () => {
  let financialPage: FinancialPage;

  test.beforeEach(async ({ request, page }) => {
    const seed = await addTransaction(request, {
      type: 'income',
      amount: 1000,
      description: 'Test setup funds',
      category: 'general',
    });
    expect(seed.success, seed.error).toBe(true);
    financialPage = new FinancialPage(page);
  });

  test(
    'verify account balance and transaction history',
    {
      tag: ['@financial', '@balance', '@history'],
    },
    async () => {
      const randomDescription = `Crops expense ${Date.now()}`;
      const expectedSuccessMessage = 'Transaction added successfully';

      await financialPage.goto();

      await financialPage.addTransaction({
        type: 'expense',
        amount: 25.5,
        category: 'crops',
        description: randomDescription,
      });

      await expect(financialPage.notificationMessage).toHaveText(
        expectedSuccessMessage,
      );

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
    },
  );
});
