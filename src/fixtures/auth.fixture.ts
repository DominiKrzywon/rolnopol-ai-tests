import {
  applySessionCookies,
  loginAs,
  registerVerifiedUser,
} from 'src/api/auth.api';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test as baseTest } from 'src/fixtures/test.fixture';
import { Session } from 'src/models/Session';
import { User } from 'src/models/User';

type AuthFixtures = {
  registeredUser: User;
  freshUser: User;
  apiSession: {
    user: User;
    session: Session;
  };
};

export const test = baseTest.extend<AuthFixtures>({
  registeredUser: async ({ request }, use) => {
    const user = prepareRandomUser();

    await registerVerifiedUser(request, user);

    await use(user);
  },

  apiSession: async ({ registeredUser, request }, use) => {
    const session = await loginAs(request, registeredUser);
    await use({ user: registeredUser, session });
  },

  freshUser: async ({ apiSession, request, context }, use) => {
    await applySessionCookies(context, request, apiSession.session);

    await use(apiSession.user);
  },
});

export { expect };
