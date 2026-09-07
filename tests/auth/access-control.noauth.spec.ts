import { expect, test } from 'src/fixtures/test.fixture';

const protectedRoutes = [
  '/profile.html',
  '/marketplace.html',
  '/financial.html',
];

test.use({ storageState: undefined });

for (const route of protectedRoutes) {
  test(`should redirect anonymous user from ${route} to login`, async ({
    page,
  }) => {
    await page.goto(route);

    await expect(page).toHaveURL('/login.html');
  });
}
