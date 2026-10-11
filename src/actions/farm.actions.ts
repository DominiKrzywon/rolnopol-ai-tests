import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';
import {
  FIELD_AREA,
  getRandomAnimalType,
  newAmount,
} from 'src/helpers/testDataHelpers';
import { STAFF_AGE } from 'src/helpers/testDataHelpers';
import { ApiEnvelope } from 'src/models/ApiResponse';
import { AssignPage } from 'src/pages/managementPages/ManagementAssignPage';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';

export async function createField(
  page: Page,
  data?: { name?: string; area?: number },
): Promise<{ id: number; name: string; area: number }> {
  const name = data?.name ?? faker.word.noun();
  const area = data?.area ?? FIELD_AREA;

  const managementPage = new ManagementPage(page);

  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url() === `${BASE_API_URL}/fields` &&
        response.request().method() === 'POST',
    ),
    managementPage.addField(name, area),
  ]);

  const body = (await response.json()) as ApiEnvelope<{ id: number }>;

  if (!response.ok() || typeof body.data?.id !== 'number') {
    throw new Error('Creating a field through UI returned no valid field ID');
  }
  return { id: body.data.id, name, area };
}

export async function createStaff(
  page: Page,
  data?: { name: string; surname: string; age?: number },
): Promise<{ name: string; surname: string; fullName: string }> {
  const name = data?.name ?? faker.person.firstName();
  const surname = data?.surname ?? faker.person.lastName();
  const age = data?.age ?? STAFF_AGE;

  const managementPage = new ManagementPage(page);
  await managementPage.addStaff(name, surname, age);

  return { name, surname, fullName: `${name} ${surname}` };
}

export async function createAnimalGroup(
  page: Page,
  data?: { type?: string; amount?: number; fieldName?: string },
): Promise<{ type: string; amount: number }> {
  const type = data?.type ?? getRandomAnimalType();
  const amount = data?.amount ?? newAmount();

  const managementPage = new ManagementPage(page);
  await managementPage.addAnimalGroup(type, amount, data?.fieldName);

  return { type, amount };
}

export async function assignStaff(
  page: Page,
  fieldName: string,
  staffFullName: string,
): Promise<void> {
  const assignPage = new AssignPage(page);
  await assignPage.assignStaffToField(fieldName, staffFullName);
}
