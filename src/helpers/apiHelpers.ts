import { APIRequestContext } from '@playwright/test';
import { deleteJson, getJson, postJson } from 'src/api/httpClient';
import { BASE_API_URL } from 'src/config/env.config';
import { ApiEnvelope } from 'src/models/ApiResponse';
import { TransactionResponse } from 'src/models/TransactionResponse';

type TransactionType = 'income' | 'expense';
type OfferStatus = 'active' | 'cancelled';
export type ItemType = 'field' | 'animal';

export interface Field {
  id: number;
  name: string;
  area: number;
}

export interface Animal {
  id: number;
  type: string;
  amount: number;
}

export interface MarketplaceOffer {
  itemType: ItemType;
  id: number;
  price: number;
  description: string;
  status: OfferStatus;
}

interface TransactionPayload {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
}

export async function addTransaction(
  request: APIRequestContext,
  payload: TransactionPayload,
): Promise<ApiEnvelope<TransactionResponse>> {
  let requestData: unknown = { ...payload };

  if (payload.type === 'income') {
    requestData = {
      ...payload,
      cardNumber: '4111111111111111',
      cvv: '123',
    };
  }

  const response = await request.post(
    `${BASE_API_URL}/financial/transactions`,
    {
      data: requestData,
    },
  );

  return response.json();
}

export async function getAccountBalance(
  request: APIRequestContext,
): Promise<number> {
  const response = await request.get(`${BASE_API_URL}/financial/account`);
  const body = (await response.json()) as ApiEnvelope<{
    account: { balance: number };
  }>;

  if (!body.data) {
    throw new Error(`Failed to read account balance ${body.error}`);
  }

  return body.data.account.balance;
}

export async function deleteOneOffer(
  request: APIRequestContext,
  offerId: string,
): Promise<void> {
  await request.delete(`${BASE_API_URL}/marketplace/offers/${offerId}`);
}

export async function cancelAllMyOffers(
  request: APIRequestContext,
): Promise<void> {
  const response = await request.get(`${BASE_API_URL}/marketplace/my-offers`);
  const body = (await response.json()) as ApiEnvelope<{
    offers: MarketplaceOffer[];
  }>;

  await Promise.all(
    (body.data?.offers ?? []).map((offer) =>
      deleteOneOffer(request, String(offer.id)),
    ),
  );
}

export async function getFields(request: APIRequestContext): Promise<Field[]> {
  return getJson<Field[]>(request, `${BASE_API_URL}/fields`);
}

export async function getAnimals(
  request: APIRequestContext,
): Promise<Animal[]> {
  return getJson<Animal[]>(request, `${BASE_API_URL}/animals`);
}

export async function createField(
  request: APIRequestContext,
  data: { name: string; area: number; district?: string },
): Promise<number> {
  const created = await postJson<{ id: number }>(
    request,
    `${BASE_API_URL}/fields`,
    data,
  );
  return created.id;
}

export async function deleteField(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  await deleteJson(request, `${BASE_API_URL}/fields/${id}`);
}

export async function createStaff(
  request: APIRequestContext,
  data: { name: string; surname: string; age: number },
): Promise<number> {
  const created = await postJson<{ id: number }>(
    request,
    `${BASE_API_URL}/staff`,
    { data },
  );
  return created.id;
}

export async function deleteStaff(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  await deleteJson(request, `${BASE_API_URL}/staff/${id}`);
}

export async function createAnimal(
  request: APIRequestContext,
  data: { type: string; amount: number; fieldId?: number },
): Promise<number> {
  const created = await postJson<{ id: number }>(
    request,
    `${BASE_API_URL}/animals`,
    {
      data,
    },
  );

  return created.id;
}

export async function deleteAnimal(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  await deleteJson(request, `${BASE_API_URL}/animals/${id}`);
}

export async function createAssignment(
  request: APIRequestContext,
  data: { fieldId: number; staffId: number },
): Promise<number> {
  const created = await postJson<{ id: number }>(
    request,
    `${BASE_API_URL}/fields/assign`,
    {
      data,
    },
  );
  return created.id;
}

export async function deleteAssignment(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  await deleteJson(request, `${BASE_API_URL}/fields/assign/${id}`);
}

export async function getAssignments(
  request: APIRequestContext,
): Promise<unknown> {
  return getJson(request, `${BASE_API_URL}/fields/assign`);
}

export async function transferFunds(
  request: APIRequestContext,
  data: {
    toUserId: number;
    amount: number;
    description: string;
  },
): Promise<{
  success: boolean;
  amount: number;
}> {
  return postJson(request, `${BASE_API_URL}/financial/transfer`, data);
}

export async function getTransactions(
  request: APIRequestContext,
  params?: string,
): Promise<unknown> {
  const response = await request.get(
    `${BASE_API_URL}/financial/transactions${params ? '?' + params : ''}`,
  );
  return response.json();
}

export async function getMarketplaceOffers(
  request: APIRequestContext,
): Promise<MarketplaceOffer[]> {
  const response = await request.get(`${BASE_API_URL}/marketplace/offers`);
  const body = (await response.json()) as ApiEnvelope<{
    offers: MarketplaceOffer[];
  }>;

  return body.data?.offers ?? [];
}
