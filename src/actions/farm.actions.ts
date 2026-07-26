import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';
import {
  FIELD_AREA,
  getRandomAnimalType,
  newAmount,
} from 'src/helpers/testDataHelpers';
import { STAFF_AGE } from 'src/helpers/testDataHelpers';
import { AssignPage } from 'src/pages/managementPages/ManagementAssignPage';
import { ManagementPage } from 'src/pages/managementPages/ManagementMainPage';

export async function createField(
  page: Page,
  data?: { name?: string; area?: number },
): Promise<{ name: string; area: number }> {
  const name = data?.name ?? faker.word.noun();
  const area = data?.area ?? FIELD_AREA;

  const managementPage = new ManagementPage(page);
  await managementPage.addField(name, area);

  return { name, area };
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
