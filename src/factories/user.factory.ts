import { faker } from '@faker-js/faker';
import { User } from 'src/models/User';

export function prepareRandomUser(): User {
  const randomUser: User = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    displayName: faker.word.noun(),
  };

  return randomUser;
}
