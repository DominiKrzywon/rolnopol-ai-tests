import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export type TransactionType = '' | 'income' | 'expense' | 'transfer';
export type TransactionCategory =
  | ''
  | 'general'
  | 'crops'
  | 'equipment'
  | 'livestock'
  | 'maintenance'
  | 'transfer'
  | 'system';
export type FilterOptions = {
  type?: TransactionType;
  category?: TransactionCategory;
};

export type TransferFundsOptions = {
  toUserId: number;
  amount: number;
  description: string;
};

export class FinancialPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.FINANCIAL;
  readonly header = this.page.locator('.main-title');
  readonly currentBalance = this.page.locator('#current-balance');
  readonly transactionHistory = this.page.locator('#transactions-container');

  readonly totalIncome = this.page.locator('#total-income');
  readonly totalExpenses = this.page.locator('#total-expenses');
  readonly totalTransaction = this.page.locator('#transaction-count');
  readonly totalNetIncome = this.page.locator('#net-income');

  readonly transferFundsHeader = this.page.locator('#transfer-form-header');
  readonly transferFormContent = this.page.locator('#transfer-form-content');
  readonly transferToUserId = this.page.locator('#transfer-toUserId');
  readonly transferAmount = this.page.locator('#transfer-amount');
  readonly transferDescription = this.page.locator('#transfer-description');
  readonly transferSubmit = this.page.locator('#submit-transfer');
  readonly transferSuccess = this.page.locator('#transfer-form-success');
  readonly transferAmountError = this.page.locator('#transfer-amount-error');
  readonly transferFormError = this.page.locator('#transfer-form-errors');
  readonly startDateInput = this.page.getByLabel('Start Date');
  readonly endDateInput = this.page.getByLabel('End Date');

  readonly transactionFormHeader = this.page.locator(
    '#transaction-form-header',
  );
  readonly transactionContent = this.page.locator('#transaction-form-content');
  readonly transactionTypeIncome = this.page.locator('[data-type="income"]');
  readonly transactionTypeExpense = this.page.locator('[data-type="expense"]');
  readonly transactionAmount = this.page.locator('#transaction-amount');
  readonly transactionCategory = this.page.locator('#transaction-category');
  readonly transactionIncomeCardNumber = this.page.locator(
    '#transaction-card-number',
  );
  readonly transactionCvv = this.page.locator('#transaction-cvv');
  readonly transactionDescription = this.page.locator(
    '#transaction-description',
  );
  readonly transactionSubmit = this.page.locator('#submit-transaction');
  readonly transactionRows = this.page.locator(
    '#transactions-container tbody tr',
  );

  readonly transactionTable = this.page.locator('.transactions-table');
  readonly filterType = this.page.locator('#filter-type');
  readonly filterCategory = this.page.locator('#filter-category');
  readonly prevTransactionPage = this.page.locator('#prev-page');
  readonly nextTransactionPage = this.page.locator('#next-page');

  async expandTransferForm(): Promise<void> {
    const isCollapsed = await this.transferFormContent.evaluate((element) =>
      element.classList.contains('collapsed'),
    );
    if (isCollapsed) {
      await this.transferFundsHeader.click();
    }
  }

  async transferFunds({
    toUserId,
    amount,
    description,
  }: TransferFundsOptions): Promise<void> {
    await this.expandTransferForm();
    await this.transferToUserId.fill(String(toUserId));
    await this.transferAmount.fill(String(amount));
    await this.transferDescription.fill(description);
    await this.transferSubmit.click();
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

  async getBalance(): Promise<number> {
    const balance = await this.currentBalance.innerText();

    return Number(
      balance
        .replace(',', '.')
        .replace(/\s/g, '')
        .replace(/[^\d.]/g, ''),
    );
  }

  async filterBy({ type, category }: FilterOptions): Promise<void> {
    await this.filterType.selectOption(type ?? '');
    await this.filterCategory.selectOption(category ?? '');
  }

  async setDateRange(startDate: string, endDate: string): Promise<void> {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
  }
}
