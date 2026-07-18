import test, { expect } from '@playwright/test';
import { addTransaction } from 'src/helpers/apiHelpers';
import { FinancialPage } from 'src/pages/FinancialPage';

test.describe('Financial functionality tests', () => {
  let financialPage: FinancialPage;

  test.beforeEach(async ({ request, page }) => {
    await addTransaction(request, {
      type: 'income',
      amount: 1000,
      description: 'Test setup funds',
      category: 'general',
    });
    financialPage = new FinancialPage(page);
  });

  test(
    'verify account balance and transaction history',
    {
      tag: ['@financial', '@balance', '@history'],
    },
    async () => {
      await financialPage.goto();

      await expect(financialPage.currentBalance).toContainText('ROL');
      await expect(financialPage.totalIncome).not.toBeEmpty();
      await expect(financialPage.totalExpenses).not.toBeEmpty();
      await expect(financialPage.totalNetIncome).not.toBeEmpty();
      await expect(financialPage.transactionHistory).not.toBeEmpty();
    },
  );
});
