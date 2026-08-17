import { APIRequestContext } from '@playwright/test';
import { deleteJson, getJson, postJson } from 'src/api/httpClient';
import { BASE_API_URL } from 'src/config/env.config';
import { TransactionHistory, TransactionResponse } from 'src/models/financial';

type TransactionType = 'income' | 'expense';
type OfferStatus = 'active' | 'cancelled';
export type ItemType = 'field' | 'animal';

export interface Assignment {
  userId: number;
  fieldId: number;
  staffId: number;
  id: number;
  createdAt: string;
}

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
): Promise<TransactionResponse> {
  let requestData: unknown = { ...payload };

  if (payload.type === 'income') {
    requestData = {
      ...payload,
      cardNumber: '4111111111111111',
      cvv: '123',
    };
  }

  return postJson(
    request,
    `${BASE_API_URL}/financial/transactions`,
    requestData,
  );
}

export async function getAccountBalance(
  request: APIRequestContext,
): Promise<number> {
  const { account } = await getJson<{ account: { balance: number } }>(
    request,
    `${BASE_API_URL}/financial/account`,
  );

  return account.balance;
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
    data,
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
    data,
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
    data,
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
): Promise<Assignment[]> {
  return getJson<Assignment[]>(request, `${BASE_API_URL}/fields/assign`);
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
): Promise<TransactionHistory> {
  return getJson<TransactionHistory>(
    request,
    `${BASE_API_URL}/financial/transactions${params ? '?' + params : ''}`,
  );
}

export async function getMarketplaceOffers(
  request: APIRequestContext,
): Promise<MarketplaceOffer[]> {
  const { offers } = await getJson<{ offers: MarketplaceOffer[] }>(
    request,
    `${BASE_API_URL}/marketplace/offers`,
  );

  return offers;
}
