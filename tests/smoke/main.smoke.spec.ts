import { BASE_API_URL } from 'src/config/env.config';
import { expect, test } from 'src/fixtures/test.fixture';

test(
  "should display the correct page title 'Rolnopol' on homepage",
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-001' },
    tag: ['@smoke', '@critical'],
  },
  async ({ page, homePage }) => {
    await homePage.goto();

    await expect(page).toHaveTitle('Rolnopol');
  },
);

test(
  'should load login page successfully',
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-002' },
    tag: ['@smoke', '@auth'],
  },
  async ({ loginPage }) => {
    await loginPage.goto();
    const expectedSubtitle = 'User Login & Account Access';

    await expect(loginPage.loginSubtitle).toHaveText(expectedSubtitle);
  },
);

test(
  'should load API documentation page successfully',
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-003' },
    tag: ['@smoke', '@documentation'],
  },
  async ({ apiDocsPage }) => {
    await apiDocsPage.goto();
    const expectedHeading =
      'API documentation for the Rolnopol service with versioning support';

    await expect(apiDocsPage.iframe.getByText(expectedHeading)).toBeVisible();
  },
);

test(
  'should load documentation page successfully',
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-004' },
    tag: ['@smoke', '@documentation'],
  },
  async ({ docsPage }) => {
    await docsPage.goto();
    const expectedSubtitle = 'Rolnopol System Guide & API Reference';

    await expect(docsPage.docsHeaderSubtitle).toHaveText(expectedSubtitle);
  },
);

test(
  'should not display marketplace for non-logged user',
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-005' },
    tag: ['@smoke', '@critical'],
  },
  async ({ page, marketplacePage }) => {
    await marketplacePage.goto();

    await expect(page).toHaveURL('/login.html');
  },
);

test(
  'should load register page successfully',
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-006' },
    tag: ['@smoke', '@auth', '@registration'],
  },
  async ({ registerPage }) => {
    await registerPage.goto();
    const expectedSubtitle = 'Create Your User Account';

    await expect(registerPage.registerSubtitle).toHaveText(expectedSubtitle);
  },
);

test(
  'api app health check',
  {
    annotation: { type: 'case-id', description: 'TC-SMOKE-007' },
    tag: ['@smoke', '@auth', '@health'],
  },
  async ({ request }) => {
    const response = await request.get(`${BASE_API_URL}/healthcheck`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.success).toBeTruthy();
    expect(body.data.status).toEqual('healthy');
  },
);
