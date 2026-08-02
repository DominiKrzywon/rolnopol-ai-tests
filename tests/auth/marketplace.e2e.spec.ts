import { topUpAmount } from 'src/actions/user.actions';
import { expect, test } from 'src/fixtures/test.fixture';
import {
  addTransaction,
  cancelAllMyOffers,
  getAccountBalance,
  getAnimals,
  getFields,
} from 'src/helpers/apiHelpers';
import { PurchasedOffer } from 'src/pages/MarketplacePage';

test.describe('Marketplace e2e tests', () => {
  test.beforeEach(async ({ request, marketplacePage }) => {
    await topUpAmount(request, 10000);
    await marketplacePage.goto();
  });

  test(
    'should buy random offer and verify transaction history',
    { tag: ['@marketplace', '@purchase', '@happy-path'] },
    async ({ request, marketplacePage }) => {
      let purchasedOffer: PurchasedOffer;
      let ownedIdsBeforePurchase: number[];

      await test.step('should buy random offer', async () => {
        const expectedSuccessMessage = 'Purchase completed successfully!';
        const fieldsBefore = await getFields(request);
        const animalsBefore = await getAnimals(request);

        purchasedOffer = await marketplacePage.clickRandomBuyNow();

        ownedIdsBeforePurchase =
          // eslint-disable-next-line playwright/no-conditional-in-test
          purchasedOffer.itemType === 'field'
            ? fieldsBefore.map((f) => f.id)
            : animalsBefore.map((a) => a.id);
        await expect(marketplacePage.notificationMessage).toHaveText(
          expectedSuccessMessage,
        );
      });

      await test.step('verify purchase in transaction history', async () => {
        await marketplacePage.transactionHistory.click();
        await expect(marketplacePage.transactionType.last()).toHaveText(
          `Purchase: ${purchasedOffer.name}`,
        );
        expect(await marketplacePage.getLastTransactionAmount()).toEqual(
          -purchasedOffer.price,
        );
      });

      await test.step('verify ownership transfer', async () => {
        const ownedAfterPurchase =
          // eslint-disable-next-line playwright/no-conditional-in-test
          purchasedOffer.itemType === 'field'
            ? await getFields(request)
            : await getAnimals(request);
        const newlyOwnedIds = ownedAfterPurchase
          .map((resource) => resource.id)
          .filter((id) => !ownedIdsBeforePurchase.includes(id));
        expect(
          newlyOwnedIds,
          `buyer should own exactly one new ${purchasedOffer.itemType} after buying "${purchasedOffer.name}"`,
        ).toHaveLength(1);
      });
    },
  );

  test(
    'should return error when offer is to expensive',
    { tag: ['@marketplace', '@offers', '@crud'] },
    async ({ request, marketplacePage }) => {
      const balance = await getAccountBalance(request);

      await addTransaction(request, {
        type: 'expense',
        amount: balance,
        description: 'Drain balance to test overdraft protection',
        category: 'general',
      });
      expect(await getAccountBalance(request), 'balance must be 0').toBe(0);
      const expectedErrorMessage =
        'Insufficient funds to complete purchase (no overdraft allowed)';

      await marketplacePage.attemptToBuyMostExpensiveOffer();

      await expect(marketplacePage.notificationMessage).toHaveText(
        expectedErrorMessage,
      );
    },
  );

  test(
    'create offer and verify in My Offers page',
    {
      tag: ['@marketplace', '@offers', '@crud'],
    },
    async ({ request, marketplacePage }) => {
      let createdOffer: {
        price: number;
        description?: string;
      };

      await test.step('clear marketplace', async () => {
        await cancelAllMyOffers(request);
      });

      await test.step('create offer', async () => {
        const expectedSuccessMessage = 'Offer created successfully!';

        createdOffer = await marketplacePage.createNewOffer(
          'animal',
          250,
          'Random text',
        );

        await expect(marketplacePage.notificationMessage).toHaveText(
          expectedSuccessMessage,
        );
      });

      await test.step('verify offer in My Offers page', async () => {
        await marketplacePage.myOffers.click();

        const firstOffer = marketplacePage.myOfferCardLast;

        await expect(firstOffer.locator('.offer-price')).toContainText(
          String(createdOffer.price),
        );

        await expect(firstOffer.locator('.offer-description')).toHaveText(
          createdOffer.description!,
        );
      });
    },
  );
});
