import { faker } from '@faker-js/faker';
import { generateUniqueEmail } from 'src/helpers/testDataHelpers';
import { User } from 'src/models/User';

export function prepareRandomUser(): User {
  const randomUser: User = {
    email: generateUniqueEmail(),
    password: faker.internet.password(),
    displayName: faker.word.noun(),
  };

  return randomUser;
}
