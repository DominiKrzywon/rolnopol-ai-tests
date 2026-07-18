import { Locator, Page } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class FinancialPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.FINANCIAL;
  readonly header: Locator;
  readonly currentBalance: Locator;
  readonly transactionHistory: Locator;
  readonly notificationMessage: Locator;

  readonly totalIncome: Locator;
  readonly totalExpenses: Locator;
  readonly totalTransaction: Locator;
  readonly totalNetIncome: Locator;

  readonly transferFundsHeader: Locator;
  readonly transferToUserId: Locator;
  readonly transferAmount: Locator;
  readonly transferDescription: Locator;
  readonly transferSubmit: Locator;
  readonly transferSuccess: Locator;
  readonly transferAmountError: Locator;
  readonly transferFormError: Locator;

  readonly transactionFormHeader: Locator;
  readonly transactionContent: Locator;
  readonly transactionTypeIncome: Locator;
  readonly transactionTypeExpense: Locator;
  readonly transactionAmount: Locator;
  readonly transactionCategory: Locator;
  readonly transactionIncomeCardNumber: Locator;
  readonly transactionCvv: Locator;
  readonly transactionDescription: Locator;
  readonly transactionSubmit: Locator;
  readonly transactionRows: Locator;

  readonly transactionTable: Locator;
  readonly filterType: Locator;
  readonly filterCategory: Locator;
  readonly prevTransactionPage: Locator;
  readonly nextTransactionPage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('.main-title');
    this.currentBalance = page.locator('#current-balance');
    this.transactionHistory = page.locator('#transactions-container');
    this.notificationMessage = page.locator('.notification-message');

    this.totalIncome = page.locator('#total-income');
    this.totalExpenses = page.locator('#total-expenses');
    this.totalTransaction = page.locator('#transaction-count');
    this.totalNetIncome = page.locator('#net-income');

    this.transferFundsHeader = page.locator('#transfer-form-header');
    this.transferToUserId = page.locator('#transfer-toUserId');
    this.transferAmount = page.locator('#transfer-amount');
    this.transferDescription = page.locator('#transfer-description');
    this.transferSubmit = page.locator('#submit-transfer');
    this.transferSuccess = page.locator('#transfer-form-success');
    this.transferAmountError = page.locator('#transfer-amount-error');
    this.transferFormError = page.locator('#transfer-form-errors');

    this.transactionFormHeader = page.locator('#transaction-form-header');
    this.transactionContent = page.locator('#transaction-form-content');
    this.transactionTypeIncome = page.locator('[data-type="income"]');
    this.transactionTypeExpense = page.locator('[data-type="expense"]');
    this.transactionAmount = page.locator('#transaction-amount');
    this.transactionCategory = page.locator('#transaction-category');
    this.transactionIncomeCardNumber = page.locator('#transaction-card-number');
    this.transactionCvv = page.locator('#transaction-cvv');
    this.transactionDescription = page.locator('#transaction-description');
    this.transactionSubmit = page.locator('#submit-transaction');
    this.transactionRows = page.locator('#transactions-container tbody tr');

    this.transactionTable = page.locator('.transactions-table');
    this.filterType = page.locator('#filter-type');
    this.filterCategory = page.locator('#filter-category');
    this.prevTransactionPage = page.locator('#prev-page');
    this.nextTransactionPage = page.locator('#next-page');
  }

  async expandTransactionForm(): Promise<void> {
    const isCollapsed = await this.transactionContent.evaluate((element) =>
      element.classList.contains('collapsed'),
    );
    if (isCollapsed) {
      await this.transactionFormHeader.click();
    }
  }

  async addTransaction(data: {
    type: 'expense';
    amount: number;
    category: string;
    description: string;
  }): Promise<void> {
    await this.expandTransactionForm();
    await this.transactionTypeExpense.click();
    await this.transactionAmount.fill(String(data.amount));
    await this.transactionAmount.blur();
    await this.transactionCategory.selectOption(data.category);
    await this.transactionDescription.fill(data.description);
    await this.transactionSubmit.click();
  }
}
