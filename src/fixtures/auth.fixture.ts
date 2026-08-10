import { BASE_API_URL, ENV } from 'src/config/env.config';
import { prepareRandomUser } from 'src/factories/user.factory';
import { expect, test as baseTest } from 'src/fixtures/test.fixture';
import { User } from 'src/models/User';

type AuthFixtures = {
  freshUser: User;
};

export const test = baseTest.extend<AuthFixtures>({
  freshUser: async ({ request, context }, use) => {
    const user = prepareRandomUser();

    const registerResponse = await request.post(`${BASE_API_URL}/register`, {
      data: {
        email: user.email,
        password: user.password,
        displayedName: user.displayName,
      },
    });
    const data = await registerResponse.json();
    expect(registerResponse.status()).toBe(201);
    expect(data.success).toBe(true);

    const loginResponse = await request.post(`${BASE_API_URL}/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(loginResponse.status()).toBe(200);

    const body = await loginResponse.json();

    const { cookies } = await request.storageState();
    await context.addCookies(cookies);
    await context.addCookies([
      { name: 'rolnopolIsLogged', value: 'true', url: ENV.BASE_URL },
      {
        name: 'rolnopolUserLabel',
        value: body.data.user.displayedName,
        url: ENV.BASE_URL,
      },
      {
        name: 'rolnopolUserId',
        value: String(body.data.user.id),
        url: ENV.BASE_URL,
      },
    ]);

    await use(user);
  },
});

export { expect };
