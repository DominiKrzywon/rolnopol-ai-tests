import { expect, test as base } from '@playwright/test';
import { FinancialPage } from 'src/pages/FinancialPage';
import { HomePage } from 'src/pages/HomePage';
import { LoginPage } from 'src/pages/LoginPage';
import { AssignPage } from 'src/pages/managementPages/ManagementAssignPage';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';
import { MarketplacePage } from 'src/pages/MarketplacePage';
import { ProfilePage } from 'src/pages/ProfilePage';
import { RegisterPage } from 'src/pages/RegisterPage';

type PageFixtures = {
  managementPage: ManagementPage;
  assignPage: AssignPage;
  marketplacePage: MarketplacePage;
  financialPage: FinancialPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  profilePage: ProfilePage;
  homePage: HomePage;
};

export const test = base.extend<PageFixtures>({
  managementPage: async ({ page }, use) => {
    await use(new ManagementPage(page));
  },

  assignPage: async ({ page }, use) => {
    await use(new AssignPage(page));
  },

  marketplacePage: async ({ page }, use) => {
    await use(new MarketplacePage(page));
  },

  financialPage: async ({ page }, use) => {
    await use(new FinancialPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect };
