import {
  type APIRequestContext,
  request as playwrightRequest,
} from '@playwright/test';
import { loginAs, registerVerifiedUser } from 'src/api/auth.api';
import { prepareRandomUser } from 'src/factories/user.factory';
import { test as baseTest } from 'src/fixtures/auth.fixture';

type FinancialFixtures = {
  transferRecipient: {
    recipientApi: APIRequestContext;
    recipientId: number;
  };
};

export const test = baseTest.extend<FinancialFixtures>({
  transferRecipient: async ({ request: _request }, use) => {
    const recipientApi = await playwrightRequest.newContext();

    try {
      const recipient = prepareRandomUser();
      await registerVerifiedUser(recipientApi, recipient);
      const session = await loginAs(recipientApi, recipient);

      await use({
        recipientApi,
        recipientId: session.id,
      });
    } finally {
      await recipientApi.dispose();
    }
  },
});

export { expect } from 'src/fixtures/auth.fixture';
