import { APIRequestContext } from '@playwright/test';
import { deleteJson, getJson } from 'src/api/httpClient';
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
