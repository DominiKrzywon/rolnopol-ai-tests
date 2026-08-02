import { APIRequestContext } from '@playwright/test';
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
  const response = await request.get(`${BASE_API_URL}/fields`);
  const body = (await response.json()) as ApiEnvelope<Field[]>;
  return body.data ?? [];
}

export async function getAnimals(
  request: APIRequestContext,
): Promise<Animal[]> {
  const response = await request.get(`${BASE_API_URL}/animals`);
  const body = (await response.json()) as ApiEnvelope<Animal[]>;
  return body.data ?? [];
}

export async function createField(
  request: APIRequestContext,
  data: { name: string; area: number; district?: string },
): Promise<number> {
  const response = await request.post(`${BASE_API_URL}/fields`, { data });
  const body = await response.json();
  return body.data.id;
}

export async function deleteField(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  const response = await request.delete(`${BASE_API_URL}/fields/${id}`);

  if (!response.ok()) {
    throw new Error(`Failed to delete field: ${response.statusText()}`);
  }
}

export async function createStaff(
  request: APIRequestContext,
  data: { name: string; surname: string; age: number },
): Promise<number> {
  const response = await request.post(`${BASE_API_URL}/staff`, { data });
  const body = await response.json();
  return body.data.id;
}

export async function deleteStaff(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  const response = await request.delete(`${BASE_API_URL}/staff/${id}`);

  if (!response.ok()) {
    throw new Error(`Failed to delete staff: ${response.statusText()}`);
  }
}

export async function createAnimal(
  request: APIRequestContext,
  data: { type: string; amount: number; fieldId?: number },
): Promise<number> {
  const response = await request.post(`${BASE_API_URL}/animals`, { data });
  const body = await response.json();
  return body.data.id;
}

export async function deleteAnimal(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  const response = await request.delete(`${BASE_API_URL}/animals/${id}`);

  if (!response.ok()) {
    throw new Error(`Failed to delete animals: ${response.statusText()}`);
  }
}

export async function createAssignment(
  request: APIRequestContext,
  data: { fieldId: number; staffId: number },
): Promise<number> {
  const response = await request.post(`${BASE_API_URL}/fields/assign`, {
    data,
  });
  const body = await response.json();
  return body.data.id;
}

export async function deleteAssignment(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  const response = await request.delete(`${BASE_API_URL}/fields/assign/${id}`);

  if (!response.ok()) {
    throw new Error(`Failed to delete assignment: ${response.statusText()}`);
  }
}

export async function getAssignments(
  request: APIRequestContext,
): Promise<unknown> {
  const response = await request.get(`${BASE_API_URL}/fields/assign`);
  return response.json();
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
  error?: string;
  data?: { success: boolean; amount: number };
}> {
  const response = await request.post(`${BASE_API_URL}/financial/transfer`, {
    data,
  });
  return response.json();
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
