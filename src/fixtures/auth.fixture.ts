import { applySessionCookies, loginAs, registerUser } from 'src/api/auth.api';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test as baseTest } from 'src/fixtures/test.fixture';
import { User } from 'src/models/User';

type AuthFixtures = {
  freshUser: User;
};

export const test = baseTest.extend<AuthFixtures>({
  freshUser: async ({ request, context }, use) => {
    const user = prepareRandomUser();

    await registerUser(request, user);
    const session = await loginAs(request, user);
    await applySessionCookies(context, request, session);

    await use(user);
  },
});

export { expect };
