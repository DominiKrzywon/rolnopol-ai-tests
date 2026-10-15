import {
  type APIRequestContext,
  request as playwrightRequest,
} from '@playwright/test';
import { randomUUID } from 'crypto';
import { loginAs, registerVerifiedUser } from 'src/api/auth.api';
import { createField, deleteField, getFields } from 'src/api/farm.api';
import { cancelOfferIfActive, createFieldOffer } from 'src/api/marketplace.api';
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
    let fieldId: number | undefined;
    let offerId: number | undefined;

    try {
      const seller = prepareRandomUser();
      await registerVerifiedUser(sellerApi, seller);
      await loginAs(sellerApi, seller);

      const fieldName = `field_name${randomUUID()}`;
      const description = `Offer for ${fieldName}`;
      const price = 250;
      fieldId = await createField(sellerApi, {
        name: fieldName,
        area: FIELD_AREA,
      });
      offerId = await createFieldOffer(sellerApi, {
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
      try {
        try {
          if (offerId !== undefined) {
            await cancelOfferIfActive(sellerApi, offerId);
          }
        } finally {
          if (fieldId !== undefined) {
            const sellerFields = await getFields(sellerApi);
            const buyerFields = await getFields(request);

            if (sellerFields.some((field) => field.id === fieldId)) {
              await deleteField(sellerApi, fieldId);
            } else if (buyerFields.some((field) => field.id === fieldId)) {
              await deleteField(request, fieldId);
            }
          }
        }
      } finally {
        await sellerApi.dispose();
      }
    }
  },
});

export { expect };
