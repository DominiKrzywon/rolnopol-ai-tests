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
    const expectedSubtitle = 'User Login & Account Access';

    await loginPage.goto();

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
    const expectedHeading =
      'API documentation for the Rolnopol service with versioning support';

    await apiDocsPage.goto();

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
    const expectedSubtitle = 'Rolnopol System Guide & API Reference';

    await docsPage.goto();

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
    const expectedSubtitle = 'Create Your User Account';

    await registerPage.goto();

    await expect(registerPage.registerSubtitle).toHaveText(expectedSubtitle);
  },
);
