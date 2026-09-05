import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/test.fixture';

test(
  "should display the correct page title 'Rolnopol' on homepage",
  { tag: ['@smoke', '@critical'] },
  async ({ page, homePage }) => {
    await homePage.goto();

    await expect(page).toHaveTitle('Rolnopol');
  },
);

test(
  'should load login page successfully',
  { tag: ['@smoke', '@auth'] },
  async ({ loginPage }) => {
    await loginPage.goto();
    const expectedSubtitle = 'User Login & Account Access';

    await expect(loginPage.loginSubtitle).toHaveText(expectedSubtitle);
  },
);

test(
  'should load API documentation page successfully',
  { tag: ['@smoke', '@documentation'] },
  async ({ apiDocsPage }) => {
    await apiDocsPage.goto();
    const expectedHeading =
      'API documentation for the Rolnopol service with versioning support';

    await expect(apiDocsPage.iframe.getByText(expectedHeading)).toBeVisible();
  },
);

test(
  'should load documentation page successfully',
  { tag: ['@smoke', '@documentation'] },
  async ({ docsPage }) => {
    await docsPage.goto();
    const expectedSubtitle = 'Rolnopol System Guide & API Reference';

    await expect(docsPage.docsHeaderSubtitle).toHaveText(expectedSubtitle);
  },
);

test(
  'should not display marketplace for non-logged user',
  {
    tag: ['@smoke', '@critical'],
  },
  async ({ page, marketplacePage }) => {
    await marketplacePage.goto();

    await expect(page).toHaveURL('/login.html');
  },
);

test(
  'should load register page successfully',
  { tag: ['@smoke', '@auth', '@registration'] },
  async ({ registerPage }) => {
    await registerPage.goto();
    const expectedSubtitle = 'Create Your User Account';

    await expect(registerPage.registerSubtitle).toHaveText(expectedSubtitle);
  },
);

test(
  'api app health check',
  { tag: ['@smoke', '@auth', '@health'] },
  async ({ request }) => {
    const response = await request.get(`${BASE_API_URL}/healthcheck`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.success).toBeTruthy();
    expect(body.data.status).toEqual('healthy');
  },
);
