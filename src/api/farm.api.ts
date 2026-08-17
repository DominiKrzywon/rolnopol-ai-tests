import { APIRequestContext } from '@playwright/test';
import { deleteJson, getJson, postJson } from 'src/api/httpClient';
import { BASE_API_URL } from 'src/config/env.config';
import { Animal, Assignment, Field } from 'src/models/farm';

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
