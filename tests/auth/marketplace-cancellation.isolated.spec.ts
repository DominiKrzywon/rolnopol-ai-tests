import { getMyOffers } from 'src/api/marketplace.api';
import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/data.fixture';

test.describe('marketplace isolated tests', () => {
  test(
    'should cancel offer',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-006' },
      tag: ['@marketplace', '@cancellation', '@happy-path'],
    },
    async ({ freshUser: _, request, activeFieldOffer, marketplacePage }) => {
      const expectedSuccessMessage = 'Offer cancelled successfully!';
      const { offerId, fieldId } = activeFieldOffer;
      const offers = await getMyOffers(request);
      const offer = offers.find((item) => item.id === offerId);

      expect(offer?.status).toBe('active');

      await marketplacePage.goto();
      await marketplacePage.myOffers.click();

      const [cancelResponse] = await Promise.all([
        marketplacePage.page.waitForResponse(
          (response) =>
            response.url() ===
              `${BASE_API_URL}/marketplace/offers/${offerId}` &&
            response.request().method() === 'DELETE',
        ),
        marketplacePage.cancelOffer(offerId),
      ]);

      expect(cancelResponse.status()).toBe(200);
      await expect(marketplacePage.notificationMessage).toHaveText(
        expectedSuccessMessage,
      );

      const offersAfterCancel = await getMyOffers(request);
      const offerAfterCancel = offersAfterCancel.find(
        (offer) => offer.id === offerId,
      );

      expect(offerAfterCancel).toMatchObject({
        id: offerId,
        itemId: fieldId,
        status: 'cancelled',
      });
    },
  );
});
