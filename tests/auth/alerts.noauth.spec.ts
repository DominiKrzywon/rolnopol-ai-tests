import { expect, test } from 'src/fixtures/test.fixture';

test.describe('Alerts page', () => {
  test(
    'should display available main controls',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-001' },
      tag: ['@alerts', '@happy-path'],
    },
    async ({ alertsPage }) => {
      await alertsPage.goto();

      await expect(alertsPage.alertsHeader).toBeVisible();
      await expect(alertsPage.searchInput).toBeVisible();
      await expect(alertsPage.searchInput).toBeEnabled();
      await expect(alertsPage.regionSelect).toBeVisible();
      await expect(alertsPage.regionSelect).toBeEnabled();
      await expect(alertsPage.refreshButton).toBeVisible();
      await expect(alertsPage.refreshButton).toBeEnabled();
    },
  );
});
