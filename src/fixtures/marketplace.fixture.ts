import {
  type APIRequestContext,
  request as playwrightRequest,
} from '@playwright/test';
import { randomUUID } from 'crypto';
import { loginAs, registerVerifiedUser } from 'src/api/auth.api';
import { createField } from 'src/api/farm.api';
import { createFieldOffer } from 'src/api/marketplace.api';
import { ENV } from 'src/config/env.config';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test as baseTest } from 'src/fixtures/data.fixture';
import { FIELD_AREA } from 'src/helpers/testDataHelpers';

type MarketplaceFixtures = {
  fieldOfferForPurchase: {
    sellerApi: APIRequestContext;
    fieldId: number;
    fieldName: string;
    offerId: number;
    price: number;
    description: string;
  };
};

export const test = baseTest.extend<MarketplaceFixtures>({
  fieldOfferForPurchase: async ({ apiSession: _, request }, use) => {
    const sellerApi = await playwrightRequest.newContext({
      baseURL: ENV.BASE_URL,
    });
    try {
      const seller = prepareRandomUser();
      await registerVerifiedUser(sellerApi, seller);
      await loginAs(sellerApi, seller);

      const fieldName = `field_name${randomUUID()}`;
      const description = `Offer for ${fieldName}`;
      const price = 250;
      const fieldId = await createField(request, {
        name: fieldName,
        area: FIELD_AREA,
      });
      const offerId = await createFieldOffer(sellerApi, {
        fieldId,
        price,
        description,
      });
      await use({
        sellerApi,
        fieldId,
        fieldName,
        offerId,
        price,
        description,
      });
    } finally {
      await sellerApi.dispose();
    }
  },
});

export { expect };
