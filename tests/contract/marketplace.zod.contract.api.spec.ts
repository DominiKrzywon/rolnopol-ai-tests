import { getMyOffersResponse } from 'src/api/marketplace.api';
import { expect, test } from 'src/fixtures/data.fixture';
import { myOffersSchema } from 'src/schemas/marketplace.zod';

test.describe('Marketplace offers response contract', () => {
  test(
    'returns an empty offers array for a newly registered owner',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-008' },
      tag: ['@api', '@marketplace', '@contract', '@happy-path'],
    },
    async ({ request, apiSession: _ }) => {
      const response = await getMyOffersResponse(request);
      expect(response.status()).toBe(200);

      const body = await response.json();
      const result = myOffersSchema.parse(body);
      expect(result.data.offers).toHaveLength(0);
    },
  );

  test(
    'returns offers with numeric identifiers and prices',
    {
      annotation: { type: 'case-id', description: 'TC-MARKET-009' },
      tag: ['@api', '@marketplace', '@contract', '@happy-path'],
    },
    async ({ request, activeFieldOffer }) => {
      const { offerId } = activeFieldOffer;
      const response = await getMyOffersResponse(request);
      expect(response.status()).toBe(200);

      const body = await response.json();
      const result = myOffersSchema.parse(body);
      const offersTable = result.data.offers;
      const offer = offersTable.find((o) => o.id === offerId);

      expect(offer).toMatchObject({ id: offerId });
    },
  );
});
