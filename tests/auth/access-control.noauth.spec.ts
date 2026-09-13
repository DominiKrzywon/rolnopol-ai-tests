import { expect, test } from 'src/fixtures/test.fixture';

const protectedRoutes = [
  { route: '/profile.html', caseId: 'TC-GUARD-001' },
  { route: '/marketplace.html', caseId: 'TC-GUARD-002' },
  { route: '/financial.html', caseId: 'TC-GUARD-003' },
];

test.use({ storageState: undefined });

for (const { route, caseId } of protectedRoutes) {
  test(
    `should redirect anonymous user from ${route} to login`,
    { annotation: { type: 'case-id', description: caseId } },
    async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL('/login.html');
    },
  );
}
