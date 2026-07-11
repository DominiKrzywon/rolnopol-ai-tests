import test, { expect } from '@playwright/test';
import {
  addTransaction,
  cancelAllMyOffers,
  getAnimals,
  getFields,
} from 'src/helpers/apiHelpers';
import { MarketplacePage } from 'src/pages/MarketplacePage';

let marketPlace: MarketplacePage;

test.describe('Marketplace e2e tests', () => {
  test.beforeEach('verify marketplace', async ({ page, request }) => {
    await addTransaction(request, {
      type: 'income',
      amount: 10000,
      description: 'Test setup funds',
      category: 'general',
    });
    marketPlace = new MarketplacePage(page);
    await marketPlace.goto();
  });

  test(
    'should buy random offer and verify transaction history',
    { tag: ['@marketplace', '@purchase', '@happy-path'] },
    async ({ request }) => {
      let purchasedItemPrice: number;
      let purchasedItemName: string;
      let itemId: number;

      await test.step('should buy random offer', async () => {
        const expectedSuccessMessage = 'Purchase completed successfully!';

        ({ price: purchasedItemPrice, name: purchasedItemName } =
          await marketPlace.clickRandomBuyNow());

        itemId = parseInt(purchasedItemName.split(' #')[1]);

        await expect(marketPlace.notificationMessage).toHaveText(
          expectedSuccessMessage,
        );
      });

      await test.step('verify purchase in transaction history', async () => {
        await marketPlace.transactionHistory.click();

        await expect(marketPlace.transactionType.last()).toHaveText(
          `Purchase: ${purchasedItemName}`,
        );

        expect(await marketPlace.getLastTransactionAmount()).toEqual(
          -purchasedItemPrice,
        );
      });

      await test.step('verify ownership transfer', async () => {
        const fields = (await getFields(request)) as { id: number }[];
        const animals = (await getAnimals(request)) as { id: number }[];
        const resources = [...fields, ...animals];

        expect(Array.isArray(resources)).toBe(true);
        const owned = resources.some((r: { id: number }) => r.id === itemId);
        expect(owned).toBe(true);
      });
    },
  );

  test(
    'should return error when offer is to expensive',
    { tag: ['@marketplace', '@offers', '@crud'] },
    async ({ request }) => {
      await addTransaction(request, {
        type: 'expense',
        amount: 9000,
        description: 'Take a money',
        category: 'general',
      });
      const expectedErrorMessage =
        'Insufficient funds to complete purchase (no overdraft allowed)';

      await marketPlace.attemptToBuyMostExpensiveOffer();

      await expect(marketPlace.notificationMessage).toHaveText(
        expectedErrorMessage,
      );
    },
  );

  test(
    'create offer and verify in My Offers page',
    {
      tag: ['@marketplace', '@offers', '@crud'],
    },
    async ({ request }) => {
      let createdOffer: {
        price: number;
        description?: string;
      };

      await test.step('clear marketplace', async () => {
        await cancelAllMyOffers(request);
      });

      await test.step('create offer', async () => {
        const expectedSuccessMessage = 'Offer created successfully!';

        createdOffer = await marketPlace.createNewOffer(
          'animal',
          250,
          'Random text',
        );

        await expect(marketPlace.notificationMessage).toHaveText(
          expectedSuccessMessage,
        );
      });

      await test.step('verify offer in My Offers page', async () => {
        await marketPlace.myOffers.click();

        const firstOffer = marketPlace.myOfferCardLast;

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
