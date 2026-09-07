import {
  applySessionCookies,
  loginAs,
  registerVerifiedUser,
} from 'src/api/auth.api';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test as baseTest } from 'src/fixtures/test.fixture';
import { User } from 'src/models/User';

type AuthFixtures = {
  registeredUser: User;
  freshUser: User;
};

export const test = baseTest.extend<AuthFixtures>({
  registeredUser: async ({ request }, use) => {
    const user = prepareRandomUser();

    await registerVerifiedUser(request, user);

    await use(user);
  },

  freshUser: async ({ registeredUser, request, context }, use) => {
    const session = await loginAs(request, registeredUser);
    await applySessionCookies(context, request, session);

    await use(registeredUser);
  },
});

export { expect };
