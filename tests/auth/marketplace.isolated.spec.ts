import { topUpAmount } from 'src/actions/user.actions';
import {
  createAnimal,
  deleteAnimal,
  getAnimals,
  getFields,
} from 'src/api/farm.api';
import { addTransaction, getAccountBalance } from 'src/api/financial.api';
import {
  cancelAllMyOffers,
  getMarketplaceOffers,
} from 'src/api/marketplace.api';
import { expect, test } from 'src/fixtures/data.fixture';
import { PurchasedOffer } from 'src/pages/MarketplacePage';

test.describe('Marketplace e2e tests', () => {
  test.beforeEach(async ({ freshUser: _, request }) => {
    await topUpAmount(request, 10000);
  });

  test(
    'should buy random offer and verify transaction history',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-001' },
      tag: ['@marketplace', '@purchase', '@happy-path'],
    },
    async ({ request, marketplacePage }) => {
      let purchasedOffer: PurchasedOffer;
      let ownedIdsBeforePurchase: number[];

      await test.step('should buy random offer', async () => {
        const expectedSuccessMessage = 'Purchase completed successfully!';
        const fieldsBefore = await getFields(request);
        const animalsBefore = await getAnimals(request);

        await marketplacePage.goto();
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
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-002' },
      tag: ['@marketplace', '@offers', '@crud'],
    },
    async ({ request, marketplacePage }) => {
      const balance = await getAccountBalance(request);

      await marketplacePage.goto();
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
      annotation: { type: 'case-id', description: 'TC-MARKET-003' },
      tag: ['@marketplace', '@offers', '@crud'],
    },

    async ({ marketplacePage, request, freshUser: _ }) => {
      const animalData = {
        type: 'cow',
        amount: 10,
      };
      const price = 250;
      const description = `Offer for ${animalData.type}`;

      await getMarketplaceOffers(request);
      const animalId = await createAnimal(request, animalData);

      try {
        await marketplacePage.goto();

        await test.step('create offer', async () => {
          const expectedSuccessMessage = 'Offer created successfully!';

          await marketplacePage.createNewOffer(
            'animal',
            animalId,
            price,
            description,
          );

          await expect(marketplacePage.notificationMessage).toHaveText(
            expectedSuccessMessage,
          );
        });

        await test.step('verify offer in My Offers page', async () => {
          await marketplacePage.myOffers.click();

          const offerCard = marketplacePage.myOfferCardLast;

          await expect(offerCard.locator('.offer-price')).toContainText(
            String(price),
          );

          await expect(offerCard.locator('.offer-description')).toHaveText(
            description,
          );
        });
      } finally {
        try {
          await cancelAllMyOffers(request);
        } finally {
          await deleteAnimal(request, animalId);
        }
      }
    },
  );
});
