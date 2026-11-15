import { faker } from '@faker-js/faker';
import type { Request, Route } from '@playwright/test';
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

      // Observe requests from before submission through the validation checks
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
        // Verify validation prevented a contact POST during this interval
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
      const contactUrl = `${BASE_API_URL}/contact`;
      const name = faker.person.firstName();
      const email = faker.internet.email();
      const subject = faker.hacker.phrase();
      const message = faker.lorem.paragraphs(2);

      await contactPage.goto();

      // Capture the contact response before submitting the completed form
      const [sendResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === contactUrl &&
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

      // Check every field resets after a successful submission
      await expect.soft(contactPage.nameInput).toHaveValue('');
      await expect.soft(contactPage.emailInput).toHaveValue('');
      await expect.soft(contactPage.subjectInput).toHaveValue('');
      await expect.soft(contactPage.messageInput).toHaveValue('');
    },
  );

  test(
    'should preserve contact form after server error',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-007' },
      tag: ['@contact', '@negative', '@mobile'],
    },
    async ({ contactPage, page }) => {
      const contactUrl = `${BASE_API_URL}/contact`;
      const expectedErrorMessage = 'Failed to save message.';
      const name = faker.person.firstName();
      const email = faker.internet.email();
      const subject = faker.hacker.phrase();
      const message = faker.lorem.paragraphs(2);

      await contactPage.goto();

      await page.route(contactUrl, async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }

        await route.fulfill({
          status: 500,
          json: {
            success: false,
            error: expectedErrorMessage,
          },
        });
      });

      const [sendResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === contactUrl &&
            response.request().method() === 'POST',
        ),
        contactPage.sendTheMessage(name, email, subject, message),
      ]);

      expect(sendResponse.status()).toBe(500);
      await expect(contactPage.notificationMessage.last()).toHaveText(
        expectedErrorMessage,
      );
      await expect(contactPage.nameInput).toHaveValue(name);
      await expect(contactPage.emailInput).toHaveValue(email);
      await expect(contactPage.subjectInput).toHaveValue(subject);
      await expect(contactPage.messageInput).toHaveValue(message);
      await expect(contactPage.submitButton).toBeEnabled();
    },
  );

  test(
    'should send contact message when retrying after server error',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-008' },
      tag: ['@contact', '@negative', '@mobile'],
    },
    async ({ page, contactPage }) => {
      const contactUrl = `${BASE_API_URL}/contact`;
      const expectedErrorMessage = 'Failed to save message.';
      const expectedSuccessMessage = 'Thanks! Message received.';
      const name = faker.person.firstName();
      const email = faker.internet.email();
      const subject = faker.hacker.phrase();
      const message = faker.lorem.paragraphs(2);

      await contactPage.goto();

      const failContactSubmission = async (route: Route): Promise<void> => {
        // eslint-disable-next-line playwright/no-conditional-in-test -- Only mock POST; let other contact requests, reach the API.
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }

        await route.fulfill({
          status: 500,
          json: {
            success: false,
            error: expectedErrorMessage,
          },
        });
      };

      await page.route(contactUrl, failContactSubmission, { times: 1 });

      await contactPage.sendTheMessage(name, email, subject, message);
      await expect(contactPage.notificationMessage.last()).toHaveText(
        expectedErrorMessage,
      );
      await expect(contactPage.nameInput).toHaveValue(name);
      await expect(contactPage.emailInput).toHaveValue(email);
      await expect(contactPage.subjectInput).toHaveValue(subject);
      await expect(contactPage.messageInput).toHaveValue(message);
      await expect(contactPage.submitButton).toBeEnabled();

      const [retryResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url() === contactUrl &&
            response.request().method() === 'POST',
        ),
        contactPage.submitButton.click(),
      ]);

      expect(retryResponse.status()).toBe(200);
      await expect(contactPage.successMessage).toHaveText(
        expectedSuccessMessage,
      );
      await expect(contactPage.nameInput).toHaveValue('');
      await expect(contactPage.emailInput).toHaveValue('');
      await expect(contactPage.subjectInput).toHaveValue('');
      await expect(contactPage.messageInput).toHaveValue('');
    },
  );

  test(
    'should disable Submit while contact submission is pending',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-009' },
      tag: ['@contact', '@negative'],
    },
    async ({ page, contactPage }) => {
      const contactUrl = `${BASE_API_URL}/contact`;
      const expectedSuccessMessage = 'Thanks! Message received.';
      const name = faker.person.firstName();
      const email = faker.internet.email();
      const subject = faker.hacker.phrase();
      const message = faker.lorem.paragraphs(2);

      let releaseSave!: () => void;

      const submissionGate = new Promise<void>((resolve) => {
        releaseSave = resolve;
      });

      await contactPage.goto();

      await page.route(contactUrl, async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }

        await submissionGate;
        await route.continue();
      });

      try {
        await Promise.all([
          page.waitForRequest(
            (request) =>
              request.url() === contactUrl && request.method() === 'POST',
          ),
          contactPage.sendTheMessage(name, email, subject, message),
        ]);
        await expect(contactPage.submitButton).toBeDisabled();
        await expect(contactPage.nameInput).toHaveValue(name);
        await expect(contactPage.emailInput).toHaveValue(email);
        await expect(contactPage.subjectInput).toHaveValue(subject);
        await expect(contactPage.messageInput).toHaveValue(message);

        const responsePromise = page.waitForResponse(
          (response) =>
            response.url() === contactUrl &&
            response.request().method() === 'POST',
        );
        releaseSave();

        const updatedResponse = await responsePromise;

        expect(updatedResponse.status()).toBe(200);
        await expect(contactPage.successMessage).toHaveText(
          expectedSuccessMessage,
        );
        await expect(contactPage.nameInput).toHaveValue('');
        await expect(contactPage.emailInput).toHaveValue('');
        await expect(contactPage.subjectInput).toHaveValue('');
        await expect(contactPage.messageInput).toHaveValue('');
        await expect(contactPage.submitButton).toBeEnabled();
      } finally {
        releaseSave();
      }
    },
  );
});
