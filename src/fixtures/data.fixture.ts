import { faker } from '@faker-js/faker';
import { expect, test as baseTest } from 'src/fixtures/auth.fixture';
import {
  createAnimal,
  createField,
  createStaff,
  deleteAnimal,
  deleteField,
  deleteStaff,
} from 'src/helpers/apiHelpers';
import {
  FIELD_AREA,
  getRandomAnimalType,
  STAFF_AGE,
} from 'src/helpers/testDataHelpers';
import type {
  CreatedAnimal,
  CreatedField,
  CreatedStaff,
} from 'src/types/testData';

type DataFixtures = {
  createdField: CreatedField;
  createdStaff: CreatedStaff;
  createdAnimal: CreatedAnimal;
};

export const test = baseTest.extend<DataFixtures>({
  createdField: async ({ request }, use) => {
    const name = faker.word.noun();
    const id = await createField(request, { name, area: FIELD_AREA });

    await use({ id, name });

    await deleteField(request, id).catch(() => {});
  },

  createdStaff: async ({ request }, use) => {
    const name = faker.person.firstName();
    const surname = faker.person.lastName();
    const age = STAFF_AGE;
    const id = await createStaff(request, { name, surname, age });

    await use({ id, name, surname, age });

    await deleteStaff(request, id).catch(() => {});
  },

  createdAnimal: async ({ request }, use) => {
    const type = getRandomAnimalType();
    const amount = faker.number.int({ min: 10_000, max: 99_999 });
    const id = await createAnimal(request, {
      type,
      amount,
    });

    await use({ id, type, amount });

    await deleteAnimal(request, id).catch(() => {});
  },
});

export { expect };
