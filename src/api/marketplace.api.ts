import { APIRequestContext, APIResponse } from '@playwright/test';
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

export async function getMyOffers(
  request: APIRequestContext,
): Promise<MarketplaceOffer[]> {
  const { offers } = await getJson<{ offers: MarketplaceOffer[] }>(
    request,
    `${BASE_API_URL}/marketplace/my-offers`,
  );

  return offers;
}

export async function getMyOffersResponse(
  request: APIRequestContext,
): Promise<APIResponse> {
  return request.get(`${BASE_API_URL}/marketplace/my-offers`);
}

export async function cancelOfferResponse(
  request: APIRequestContext,
  offerId: number,
): Promise<APIResponse> {
  return request.delete(`${BASE_API_URL}/marketplace/offers/${offerId}`);
}

export async function cancelAllMyOffers(
  request: APIRequestContext,
): Promise<void> {
  const offers = await getMyOffers(request);

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
  const offers = await getMyOffers(request);
  const offer = offers.find((item) => item.id === offerId);

  if (offer?.status === 'active') {
    await deleteOneOffer(request, offerId);
  }
}

export async function createFieldOffer(
  request: APIRequestContext,
  data: { fieldId: number; price: number; description?: string },
): Promise<number> {
  const created = await postJson<{ offer: { id: number } }>(
    request,
    `${BASE_API_URL}/marketplace/offers`,
    {
      itemType: 'field',
      itemId: data.fieldId,
      price: data.price,
      description: data.description,
    },
  );

  const offerId = created?.offer?.id;

  if (typeof offerId !== 'number' || !Number.isInteger(offerId)) {
    throw new Error(`Creating a field offer returned no valid offer ID`);
  }

  return offerId;
}
