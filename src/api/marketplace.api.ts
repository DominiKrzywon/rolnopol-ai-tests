import { APIRequestContext } from '@playwright/test';
import { deleteJson, getJson, postJson } from 'src/api/httpClient';
import { BASE_API_URL } from 'src/config/env.config';
import { MarketplaceOffer } from 'src/models/marketplace';

export async function getMarketplaceOffers(
  request: APIRequestContext,
): Promise<MarketplaceOffer[]> {
  const { offers } = await getJson<{ offers: MarketplaceOffer[] }>(
    request,
    `${BASE_API_URL}/marketplace/offers`,
  );

  return offers;
}

export async function deleteOneOffer(
  request: APIRequestContext,
  offerId: number,
): Promise<void> {
  await deleteJson(request, `${BASE_API_URL}/marketplace/offers/${offerId}`);
}

export async function cancelAllMyOffers(
  request: APIRequestContext,
): Promise<void> {
  const { offers } = await getJson<{ offers: MarketplaceOffer[] }>(
    request,
    `${BASE_API_URL}/marketplace/my-offers`,
  );

  await Promise.all(
    offers
      .filter((offer) => offer.status === 'active')
      .map((offer) => deleteOneOffer(request, offer.id)),
  );
}

export async function cancelOfferIfActive(
  request: APIRequestContext,
  offerId: number,
): Promise<void> {
  const { offers } = await getJson<{ offers: MarketplaceOffer[] }>(
    request,
    `${BASE_API_URL}/marketplace/my-offers`,
  );
  const offer = offers.find((item) => item.id === offerId);

  if (offer?.status === 'active') {
    await deleteOneOffer(request, offerId);
  }
}

export async function createFieldOffer(
  request: APIRequestContext,
  data: { fieldId: number; price: number },
): Promise<number> {
  const created = await postJson<{ offer: { id: number } }>(
    request,
    `${BASE_API_URL}/marketplace/offers`,
    { itemType: 'field', itemId: data.fieldId, price: data.price },
  );

  const offerId = created?.offer?.id;

  if (typeof offerId !== 'number' || !Number.isInteger(offerId)) {
    throw new Error(`Creating a field offer returned no valid offer ID`);
  }

  return offerId;
}
