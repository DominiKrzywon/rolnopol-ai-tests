import { request as playwrightRequest } from '@playwright/test';
import { loginAs, registerVerifiedUser } from 'src/api/auth.api';
import { getAccountBalance } from 'src/api/financial.api';
import { getMarketplaceOffers } from 'src/api/marketplace.api';
import { BASE_API_URL } from 'src/config/env.config';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test } from 'src/fixtures/data.fixture';

test.describe('marketplace API', () => {
  test(
    'should cancel an owned offer through API',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-004' },
      tag: ['@api', '@marketplace', '@crud', '@happy-path'],
    },
    async ({ request, activeFieldOffer }) => {
      const { offerId, fieldId } = activeFieldOffer;
      await getMarketplaceOffers(request);

      const beforeResponse = await request.get(
        `${BASE_API_URL}/marketplace/my-offers`,
      );
      const beforeBody = await beforeResponse.json();

      expect(beforeResponse.status()).toBe(200);
      expect(beforeBody.success).toBe(true);

      const activeOffer = beforeBody.data.offers.find(
        (offer: { id: number }) => offer.id === offerId,
      );

      expect(activeOffer).toMatchObject({
        id: offerId,
        itemType: 'field',
        itemId: fieldId,
        status: 'active',
      });

      const deleteResponse = await request.delete(
        `${BASE_API_URL}/marketplace/offers/${offerId}`,
      );
      const deleteBody = await deleteResponse.json();
      expect(deleteResponse.status()).toBe(200);
      expect(deleteBody.success).toBe(true);

      const afterResponse = await request.get(
        `${BASE_API_URL}/marketplace/my-offers`,
      );
      const afterBody = await afterResponse.json();

      expect(afterResponse.status()).toBe(200);
      expect(afterBody.success).toBe(true);

      const cancelledOffer = afterBody.data.offers.find(
        (offer: { id: number }) => offer.id === offerId,
      );

      expect(cancelledOffer).toMatchObject({
        id: offerId,
        itemType: 'field',
        itemId: fieldId,
        status: 'cancelled',
      });
    },
  );

  test(
    'should not delete other user offer',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-005' },
      tag: ['@api', '@marketplace', '@crud', '@happy-path'],
    },
    async ({ request, activeFieldOffer }) => {
      const expectedErrorMessage = 'Not authorized to cancel this offer';
      const { offerId, fieldId } = activeFieldOffer;
      await getMarketplaceOffers(request);

      const otherUserApi = await playwrightRequest.newContext();
      try {
        const otherUser = prepareRandomUser();
        await registerVerifiedUser(otherUserApi, otherUser);
        await loginAs(otherUserApi, otherUser);

        /// forbidden delete
        const forbiddenResponse = await otherUserApi.delete(
          `${BASE_API_URL}/marketplace/offers/${offerId}`,
        );
        const forbiddenBody = await forbiddenResponse.json();

        expect(forbiddenResponse.status()).toBe(403);
        expect(forbiddenBody.success).toBe(false);
        expect(forbiddenBody.error).toEqual(expectedErrorMessage);

        /// owner check
        const ownerResponse = await request.get(
          `${BASE_API_URL}/marketplace/my-offers`,
        );
        const ownerBody = await ownerResponse.json();

        expect(ownerResponse.status()).toBe(200);
        expect(ownerBody.success).toBe(true);

        const ownedOffer = ownerBody.data.offers.find(
          (offer: { id: number }) => offer.id === offerId,
        );

        expect(ownedOffer).toMatchObject({
          id: offerId,
          itemType: 'field',
          itemId: fieldId,
          status: 'active',
        });
      } finally {
        await otherUserApi.dispose();
      }
    },
  );

  test(
    'should not by able to buy his offer',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-006' },
      tag: ['@api', '@marketplace', '@crud', '@happy-path'],
    },
    async ({ request, activeFieldOffer }) => {
      const expectedErrorMessage = 'Cannot buy your own offer';
      const { offerId, fieldId } = activeFieldOffer;
      await getMarketplaceOffers(request);

      const balanceBefore = await getAccountBalance(request);

      const buyResponse = await request.post(
        `${BASE_API_URL}/marketplace/buy`,
        { data: { offerId } },
      );
      const buyBody = await buyResponse.json();

      expect(buyResponse.status()).toBe(400);
      expect(buyBody.success).toBe(false);
      expect(buyBody.error).toBe(expectedErrorMessage);

      const balanceAfter = await getAccountBalance(request);
      expect(balanceBefore).toBe(balanceAfter);

      const ownerResponse = await request.get(
        `${BASE_API_URL}/marketplace/my-offers`,
      );
      const ownerBody = await ownerResponse.json();

      expect(ownerResponse.status()).toBe(200);
      expect(ownerBody.success).toBe(true);

      const ownedOffer = ownerBody.data.offers.find(
        (offer: { id: number }) => offer.id === offerId,
      );

      expect(ownedOffer).toMatchObject({
        id: offerId,
        itemType: 'field',
        itemId: fieldId,
        status: 'active',
      });
    },
  );
});
