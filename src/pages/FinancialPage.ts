import { Locator, Page } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class FinancialPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.FINANCIAL;
  readonly header: Locator;
  readonly currentBalance: Locator;
  readonly transactionHistory: Locator;

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

  readonly filterType: Locator;
  readonly filterCategory: Locator;
  readonly prevTransactionPage: Locator;
  readonly nextTransactionPage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('.main-title');
    this.currentBalance = page.locator('#current-balance');
    this.transactionHistory = page.locator('#transactions-container');

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

    this.filterType = page.locator('#filter-type');
    this.filterCategory = page.locator('#filter-category');
    this.prevTransactionPage = page.locator('#prev-page');
    this.nextTransactionPage = page.locator('#next-page');
  }
}
