import { faker } from '@faker-js/faker';
import type { Request } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/test.fixture';

test.describe('contact page tests', () => {
  test(
    'should reject contact submission with empty required fields',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-002' },
      tag: ['@contact', '@negative'],
    },
    async ({ contactPage, page }) => {
      await contactPage.goto();

      const requests: Request[] = [];

      const trackRequests = (request: Request): void => {
        requests.push(request);
      };
      page.on('request', trackRequests);

      try {
        await contactPage.submitButton.click();

        await expect(contactPage.validationErrors).toHaveText([
          'Please enter your name',
          'Email is required',
          'Subject is too short',
          'Message should be at least 10 characters',
        ]);
        await expect(page).toHaveURL('/contact.html');
        expect(
          requests.filter(
            (request) =>
              request.method() === 'POST' &&
              request.url() === `${BASE_API_URL}/contact`,
          ),
        ).toHaveLength(0);
      } finally {
        page.off('request', trackRequests);
      }
    },
  );

  test(
    'should be able to send correct message',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-003' },
      tag: ['@contact', '@happy-path'],
    },
    async ({ contactPage, page }) => {
      const expectedSuccessMessageUI = 'Thanks! Message received.';
      const expectedSuccessMessageAPI = 'Message received';
      const name = faker.person.firstName();
      const email = faker.internet.email();
      const subject = faker.hacker.phrase();
      const message = faker.lorem.paragraphs(2);

      await contactPage.goto();

      const [sendResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === `${BASE_API_URL}/contact` &&
            response.request().method() === 'POST',
        ),
        contactPage.sendTheMessage(name, email, subject, message),
      ]);
      const body = await sendResponse.json();

      expect(sendResponse.status()).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe(expectedSuccessMessageAPI);
      await expect(contactPage.notificationMessage).toHaveText(
        expectedSuccessMessageUI,
      );

      await expect.soft(contactPage.nameInput).toHaveValue('');
      await expect.soft(contactPage.emailInput).toHaveValue('');
      await expect.soft(contactPage.subjectInput).toHaveValue('');
      await expect.soft(contactPage.messageInput).toHaveValue('');
    },
  );
});
