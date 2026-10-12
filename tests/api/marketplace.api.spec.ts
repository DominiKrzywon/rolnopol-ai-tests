import { request as playwrightRequest } from '@playwright/test';
import { loginAs, registerVerifiedUser } from 'src/api/auth.api';
import { getAccountBalance } from 'src/api/financial.api';
import {
  cancelOfferResponse,
  getMyOffersResponse,
} from 'src/api/marketplace.api';
import { expectApiSuccess } from 'src/assertions/api.assertions';
import { BASE_API_URL } from 'src/config/env.config';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test } from 'src/fixtures/data.fixture';
import { MarketplaceOffer } from 'src/models/marketplace';

type MyOffersData = { offers: MarketplaceOffer[] };

test.describe('marketplace API', () => {
  test(
    'should cancel an owned offer through API',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-004' },
      tag: ['@api', '@marketplace', '@crud', '@happy-path'],
    },
    async ({ request, activeFieldOffer }) => {
      const { offerId, fieldId } = activeFieldOffer;

      // Verify the offer is active before cancellation
      const beforeResponse = await getMyOffersResponse(request);
      const beforeBody = await expectApiSuccess<MyOffersData>(
        beforeResponse,
        200,
      );
      expect(beforeBody.data?.offers).toContainEqual(
        expect.objectContaining({
          id: offerId,
          itemType: 'field',
          itemId: fieldId,
          status: 'active',
        }),
      );

      // Cancel the offer as its owner
      const cancellationResponse = await cancelOfferResponse(request, offerId);
      await expectApiSuccess(cancellationResponse, 200);

      // Verify the offer is now cancelled
      const afterResponse = await getMyOffersResponse(request);
      const afterBody = await expectApiSuccess<MyOffersData>(
        afterResponse,
        200,
      );
      expect(afterBody.data?.offers).toContainEqual(
        expect.objectContaining({
          id: offerId,
          itemType: 'field',
          itemId: fieldId,
          status: 'cancelled',
        }),
      );
    },
  );

  test(
    'should reject cancellation of another user offer',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-005' },
      tag: ['@api', '@marketplace', '@crud', '@negative'],
    },
    async ({ request, activeFieldOffer }) => {
      const expectedErrorMessage = 'Not authorized to cancel this offer';
      const { offerId, fieldId } = activeFieldOffer;

      const otherUserApi = await playwrightRequest.newContext();
      try {
        const otherUser = prepareRandomUser();
        await registerVerifiedUser(otherUserApi, otherUser);
        await loginAs(otherUserApi, otherUser);

        // Attempt cancellation as another user
        const forbiddenResponse = await otherUserApi.delete(
          `${BASE_API_URL}/marketplace/offers/${offerId}`,
        );
        const forbiddenBody = await forbiddenResponse.json();

        expect(forbiddenResponse.status()).toBe(403);
        expect(forbiddenBody.success).toBe(false);
        expect(forbiddenBody.error).toEqual(expectedErrorMessage);

        // Verify the owner's offer is still active
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
    'should reject buying an owned offer',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-007' },
      tag: ['@api', '@marketplace', '@crud', '@negative'],
    },
    async ({ request, activeFieldOffer }) => {
      const expectedErrorMessage = 'Cannot buy your own offer';
      const { offerId, fieldId } = activeFieldOffer;

      const balanceBefore = await getAccountBalance(request);

      // Attempt to buy an offer as its owner
      const buyResponse = await request.post(
        `${BASE_API_URL}/marketplace/buy`,
        { data: { offerId } },
      );
      const buyBody = await buyResponse.json();

      expect(buyResponse.status()).toBe(400);
      expect(buyBody.success).toBe(false);
      expect(buyBody.error).toBe(expectedErrorMessage);

      // Verify the rejected purchase leaves the balance unchanged
      const balanceAfter = await getAccountBalance(request);
      expect(balanceBefore).toBe(balanceAfter);

      // Verify the offer remains active
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
