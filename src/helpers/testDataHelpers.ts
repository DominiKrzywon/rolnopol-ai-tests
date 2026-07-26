import { faker } from '@faker-js/faker';

export function generateUniqueEmail(prefix: string = 'testuser'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}${randomStr}@example.com`;
}

export const FIELD_AREA = 25;
export const STAFF_AGE = 30;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function newAmount() {
  return faker.number.int({ min: 10_000, max: 99_999 });
}
const ANIMAL_TYPES = [
  'chicken',

  'cow',
  'pig',
  'sheep',
  'goat',
  'duck',
  'turkey',
  'rabbit',
  'fish',
  'shrimp',
  'oyster',
  'squid',
];

export function getRandomAnimalType(): string {
  return faker.helpers.arrayElement(ANIMAL_TYPES);
}
