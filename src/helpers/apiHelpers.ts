import { APIRequestContext } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';

type TransactionType = 'income' | 'expense';

interface TransactionPayload {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
}

interface TransactionResponse {
  success: boolean;
  timestamp: string;
  message?: string;
  error?: string;
  data?: {
    transaction: {
      id: string;
      type: TransactionType;
      amount: number;
      description: string;
      category: string;
      referenceId: string | null;
      timestamp: string;
      balanceBefore: number;
      balanceAfter: number;
    };
  };
}

export async function addTransaction(
  request: APIRequestContext,
  payload: TransactionPayload,
): Promise<TransactionResponse> {
  const response = await request.post(
    `${BASE_API_URL}/financial/transactions`,
    {
      data: payload,
    },
  );
  return response.json();
}

export async function deleteOneOffer(
  offerId: string,
  request: APIRequestContext,
): Promise<void> {
  await request.delete(`${BASE_API_URL}/marketplace/offers/${offerId}`);
}

export async function cancelAllMyOffers(
  request: APIRequestContext,
): Promise<void> {
  const response = await request.get(`${BASE_API_URL}/marketplace/my-offers`);
  const offers = await response.json();
  for (const offer of offers.data.offers) {
    await deleteOneOffer(offer.id, request);
  }
}

export async function getFields(request: APIRequestContext): Promise<unknown> {
  const response = await request.get(`${BASE_API_URL}/fields`);
  return response.json();
}

export async function getAnimals(request: APIRequestContext): Promise<unknown> {
  const response = await request.get(`${BASE_API_URL}/animals`);
  return response.json();
}

export async function createField(
  request: APIRequestContext,
  data: { name: string; area: number; district?: string },
): Promise<number> {
  const response = await request.post(`${BASE_API_URL}/fields`, { data });
  const body = await response.json();
  return body.id;
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
  return body.id;
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
