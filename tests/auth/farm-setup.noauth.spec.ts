import test, { expect, Page } from '@playwright/test';
import {
  assignStaff,
  createAnimalGroup,
  createField,
  createStaff,
} from 'src/actions/farm.actions';
import { createMarketplaceOffer } from 'src/actions/marketplace.actions';
import { prepareRandomUser } from 'src/factories/user.factory';
import { addTransaction, getFields } from 'src/helpers/apiHelpers';
import { User } from 'src/models/User';
import { AssignPage } from 'src/pages/managementPages/ManagementAssignPage';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';
import { MarketplacePage } from 'src/pages/MarketplacePage';
import { RegisterPage } from 'src/pages/RegisterPage';

test.use({ storageState: undefined });

async function registerAndLogin(page: Page, user: User): Promise<void> {
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  const loginPage = await registerPage.register(user);
  await loginPage.login(user);
}

test.describe('E2E user journeys', () => {
  test(
    'should create assignment for new farmer',
    {
      tag: ['@e2e', '@farm-setup', '@user-journey'],
    },
    async ({ page }) => {
      let field: { name: string; area: number };
      let staff: { name: string; surname: string; fullName: string };
      let animal: { type: string; amount: number };

      await test.step('register and login new user', async () => {
        await registerAndLogin(page, prepareRandomUser());
        await expect(page).toHaveURL(/profile.html/);
      });

      await test.step('add resources', async () => {
        //add field
        const managementPage = new ManagementPage(page);

        await managementPage.goto();
        field = await createField(page);
        await expect(managementPage.fieldAddedMessage).toBeVisible();

        await managementPage.goto();
        await expect(managementPage.getFieldByName(field.name)).toBeVisible();

        //add staff
        staff = await createStaff(page);
        await expect(managementPage.staffAddedMessage).toBeVisible();

        await managementPage.goto();
        await managementPage.searchStaff(staff.name);

        await expect(
          managementPage.getFieldCardByName(staff.name),
        ).toContainText(staff.surname);

        //add animal
        animal = await createAnimalGroup(page, { fieldName: field.name });

        await managementPage.goto();
        await managementPage.searchFields(field.name);
        await managementPage.searchAnimals(animal.type);

        await expect(
          managementPage.getAnimalCardByAmount(animal.amount),
        ).toBeVisible();
      });

      await test.step('assign staff to field', async () => {
        const assignPage = new AssignPage(page);
        const expectedSuccessMessage = 'Staff assigned successfully!';

        await assignPage.goto();
        await expect(assignPage.unassignedStaffCount).toHaveText('1');

        await assignStaff(page, field.name, staff.fullName);

        await expect(assignPage.notification).toHaveText(
          expectedSuccessMessage,
        );
        await expect(assignPage.unassignedStaffCount).toHaveText('0');
        await assignPage.assignTree.click();
        const fieldNode = assignPage.getTreeNodeByField(field.name);
        await expect(fieldNode.locator('.tree-child-name')).toHaveText(
          staff.fullName,
        );
      });
    },
  );

  test(
    'marketplace e2e test',
    { tag: [`@e2e`, `@marketplace-flow`, `@user-journey`] },
    async ({ browser }) => {
      test.setTimeout(90_000);

      const sellerContext = await browser.newContext();
      const buyerContext = await browser.newContext();
      const sellerPage = await sellerContext.newPage();
      const buyerPage = await buyerContext.newPage();

      const seller = prepareRandomUser();
      const buyer = prepareRandomUser();

      const testRunId = Date.now();
      const offerPrice = 250;
      const offerDescription = `E2E trade ${testRunId}`;
      let soldField: { name: string; area: number };

      try {
        await test.step('register and login seller & buyer in parallel', async () => {
          await Promise.all([
            registerAndLogin(sellerPage, seller),
            registerAndLogin(buyerPage, buyer),
          ]);
          await expect(sellerPage).toHaveURL(/profile.html/);
          await expect(buyerPage).toHaveURL(/profile.html/);
        });

        await test.step('seller: add resource and create offer', async () => {
          const managementPage = new ManagementPage(sellerPage);
          const marketplaceSeller = new MarketplacePage(sellerPage);
          const expectedSuccessMessage = 'Offer created successfully!';

          await managementPage.goto();

          soldField = await createField(sellerPage, {
            name: `E2E field ${testRunId}`,
          });

          await expect(managementPage.fieldAddedMessage).toBeVisible();

          await marketplaceSeller.goto();

          await createMarketplaceOffer(sellerPage, {
            itemType: 'field',
            price: offerPrice,
            description: offerDescription,
          });

          await expect(marketplaceSeller.notificationMessage).toHaveText(
            expectedSuccessMessage,
          );
        });

        await test.step('buyer: add funds and buy seller offer', async () => {
          const marketplaceBuyer = new MarketplacePage(buyerPage);
          const expectedPurchaseMessage = 'Purchase completed successfully!';

          await addTransaction(buyerPage.request, {
            type: 'income',
            amount: offerPrice * 4,
            description: 'E2E marketplace purchase funds',
            category: 'general',
          });

          await marketplaceBuyer.goto();
          await marketplaceBuyer.buyOfferByDescription(offerDescription);

          await expect(marketplaceBuyer.notificationMessage).toHaveText(
            expectedPurchaseMessage,
          );

          await test.step('verify field ownership transfer', async () => {
            const buyerFields = await getFields(buyerPage.request);

            expect(buyerFields.map((field) => field.name)).toContain(
              soldField.name,
            );

            const sellerFields = await getFields(sellerPage.request);

            expect(sellerFields.map((field) => field.name)).not.toContain(
              soldField.name,
            );
          });
        });
      } finally {
        await sellerContext.close();
        await buyerContext.close();
      }
    },
  );

  test(
    'verify blocked transaction',
    { tag: [`@e2e`, `@edge-case`, `@validation`] },
    async ({ page }) => {
      await test.step('register and login new user', async () => {
        await registerAndLogin(page, prepareRandomUser());
        await expect(page).toHaveURL(/profile.html/);
      });

      await test.step('verify zero user balance', async () => {
        const marketplacePage = new MarketplacePage(page);

        await marketplacePage.goto();
        const balance = await marketplacePage.getBalance();

        expect(balance).toEqual(0);
      });

      await test.step('verify purchase with empty balance', async () => {
        const marketplacePage = new MarketplacePage(page);

        await marketplacePage.goto();
      });
    },
  );
});
