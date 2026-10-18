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

      await contactPage.submitButton.click();

      await expect(contactPage.validationErrors).toHaveText([
        'Please enter your name',
        'Email is required',
        'Subject is too short',
        'Message should be at least 10 characters',
      ]);
      await expect(page).toHaveURL('/contact.html');
    },
  );
});
