import { topUpAmount } from 'src/actions/user.actions';
import { createAnimal, deleteAnimal, getFields } from 'src/api/farm.api';
import { addTransaction, getAccountBalance } from 'src/api/financial.api';
import {
  cancelAllMyOffers,
  getMarketplaceOffers,
  getMyOffers,
} from 'src/api/marketplace.api';
import { expect, test } from 'src/fixtures/marketplace.fixture';

test.describe('Marketplace e2e tests', () => {
  test.beforeEach(async ({ freshUser: _, request }) => {
    await topUpAmount(request, 10000);
  });

  test(
    'should buy an owned test field offer and verify transaction history',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-001' },
      tag: ['@marketplace', '@purchase', '@happy-path'],
    },
    async ({ request, marketplacePage, fieldOfferForPurchase }) => {
      const expectedSuccessMessage = 'Purchase completed successfully!';
      const { fieldId, fieldName, offerId, price, description, sellerApi } =
        fieldOfferForPurchase;

      await test.step('verify prepared offer and buy it', async () => {
        const offers = await getMyOffers(sellerApi);
        const offer = offers.find((item) => item.id === offerId);

        expect(offer, `Expected seller offer with ID ${offerId}`).toBeDefined();
        expect(offer).toMatchObject({
          id: offerId,
          itemType: 'field',
          itemId: fieldId,
          price,
          description,
          status: 'active',
          details: {
            name: fieldName,
          },
        });

        const sellerFields = await getFields(sellerApi);
        expect(sellerFields).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: fieldId, name: fieldName }),
          ]),
        );

        const buyerFields = await getFields(request);
        expect(buyerFields.map((field) => field.id)).not.toContain(fieldId);

        await marketplacePage.goto();
        await marketplacePage.buyOfferByDescription(description);

        await expect(marketplacePage.notificationMessage).toHaveText(
          expectedSuccessMessage,
        );
      });

      await test.step('verify purchase in transaction history', async () => {
        await marketplacePage.transactionHistory.click();

        await expect(marketplacePage.transactionType).toHaveCount(1);
        await expect(marketplacePage.transactionType).toHaveText(
          `Purchase: field #${fieldId}`,
        );
        await expect(marketplacePage.transactionAmount).toHaveCount(1);
        expect(await marketplacePage.getLastTransactionAmount()).toBe(-price);
      });

      await test.step('verify ownership transfer', async () => {
        const buyerFields = await getFields(request);

        expect(buyerFields).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: fieldId, name: fieldName }),
          ]),
        );

        const sellerFields = await getFields(sellerApi);
        expect(sellerFields.map((field) => field.id)).not.toContain(fieldId);
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
      const expectedErrorMessage =
        'Insufficient funds to complete purchase (no overdraft allowed)';
      const balance = await getAccountBalance(request);

      await marketplacePage.goto();

      // Empty the account before attempting a purchase
      await addTransaction(request, {
        type: 'expense',
        amount: balance,
        description: 'Drain balance to test overdraft protection',
        category: 'general',
      });
      expect(await getAccountBalance(request), 'balance must be 0').toBe(0);

      // Attempt a purchase without sufficient funds
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
      const expectedSuccessMessage = 'Offer created successfully!';
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
