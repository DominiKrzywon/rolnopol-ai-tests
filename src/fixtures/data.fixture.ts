import { faker } from '@faker-js/faker';
import {
  createAnimal,
  createField,
  createStaff,
  deleteAnimal,
  deleteField,
  deleteStaff,
} from 'src/api/farm.api';
import { cancelOfferIfActive, createFieldOffer } from 'src/api/marketplace.api';
import { expect, test as baseTest } from 'src/fixtures/auth.fixture';
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

type DataFieldOffer = {
  offerId: number;
  fieldId: number;
};
type DataFixtures = {
  createdField: CreatedField;
  createdStaff: CreatedStaff;
  createdAnimal: CreatedAnimal;
  activeFieldOffer: DataFieldOffer;
};

export const test = baseTest.extend<DataFixtures>({
  createdField: async ({ freshUser: _, request }, use) => {
    const name = faker.word.noun();
    const id = await createField(request, { name, area: FIELD_AREA });

    await use({ id, name });

    await deleteField(request, id);
  },

  createdStaff: async ({ freshUser: _, request }, use) => {
    const name = faker.person.firstName();
    const surname = faker.person.lastName();
    const age = STAFF_AGE;
    const id = await createStaff(request, { name, surname, age });

    await use({ id, name, surname, age });

    await deleteStaff(request, id);
  },

  createdAnimal: async ({ freshUser: _, request }, use) => {
    const type = getRandomAnimalType();
    const amount = faker.number.int({ min: 10_000, max: 99_999 });
    const id = await createAnimal(request, {
      type,
      amount,
    });

    await use({ id, type, amount });

    await deleteAnimal(request, id);
  },

  activeFieldOffer: async ({ createdField, request }, use) => {
    const offerId = await createFieldOffer(request, {
      fieldId: createdField.id,
      price: 1000,
    });

    try {
      await use({ offerId, fieldId: createdField.id });
    } finally {
      await cancelOfferIfActive(request, offerId);
    }
  },
});

export { expect };
