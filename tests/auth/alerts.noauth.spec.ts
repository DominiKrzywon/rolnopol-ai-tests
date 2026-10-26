import { expect, test } from 'src/fixtures/test.fixture';

test.describe('Alerts page', () => {
  test.beforeEach(async ({ alertsPage }) => {
    await alertsPage.goto();
  });

  test(
    'should display available main controls',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-001' },
      tag: ['@alerts', '@happy-path'],
    },
    async ({ alertsPage }) => {
      await expect(alertsPage.alertsHeader).toBeVisible();
      await expect(alertsPage.searchInput).toBeVisible();
      await expect(alertsPage.searchInput).toBeEnabled();
      await expect(alertsPage.regionSelect).toBeVisible();
      await expect(alertsPage.regionSelect).toBeEnabled();
      await expect(alertsPage.refreshButton).toBeVisible();
      await expect(alertsPage.refreshButton).toBeEnabled();
    },
  );

  test(
    'should display no alerts when search has no matches',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-004' },
      tag: ['@alerts', '@happy-path'],
    },
    async ({ alertsPage }) => {
      const searchQuery = 'zzzz-no-matching-alert-73921';
      const availableAlerts = alertsPage.todayAlerts
        .or(alertsPage.upcomingAlerts)
        .or(alertsPage.historyAlerts);

      await expect(availableAlerts.first()).toBeVisible();
      await alertsPage.searchAlerts(searchQuery);

      await expect(alertsPage.todayAlerts).toHaveCount(0);
      await expect(alertsPage.upcomingAlerts).toHaveCount(0);
      await expect(alertsPage.historyAlerts).toHaveCount(0);
      await expect(alertsPage.todayCount).toHaveText('0');
      await expect(alertsPage.upcomingCount).toHaveText('0');
      await expect(alertsPage.historyCount).toHaveText('0');
    },
  );

  test(
    'should restore alerts after clearing search',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-005' },
      tag: ['@alerts', '@happy-path'],
    },
    async ({ alertsPage }) => {
      const searchQuery = 'zzzz-no-matching-alert-73921';
      const availableAlerts = alertsPage.todayAlerts
        .or(alertsPage.upcomingAlerts)
        .or(alertsPage.historyAlerts);
      await expect(availableAlerts.first()).toBeVisible();

      const initialTodayCount = await alertsPage.todayAlerts.count();
      const initialUpcomingCount = await alertsPage.upcomingAlerts.count();
      const initialHistoryCount = await alertsPage.historyAlerts.count();

      await alertsPage.searchAlerts(searchQuery);

      await expect(alertsPage.todayAlerts).toHaveCount(0);
      await expect(alertsPage.upcomingAlerts).toHaveCount(0);
      await expect(alertsPage.historyAlerts).toHaveCount(0);

      await alertsPage.searchAlerts('');

      await expect(alertsPage.todayAlerts).toHaveCount(initialTodayCount);
      await expect(alertsPage.upcomingAlerts).toHaveCount(initialUpcomingCount);
      await expect(alertsPage.historyAlerts).toHaveCount(initialHistoryCount);
    },
  );

  test(
    'should display alerts matching the search query',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-006' },
      tag: ['@alerts', '@happy-path'],
    },
    async ({ alertsPage }) => {
      const availableAlerts = alertsPage.todayAlerts
        .or(alertsPage.upcomingAlerts)
        .or(alertsPage.historyAlerts);

      const searchQuery = await availableAlerts
        .first()
        .locator('.alert-title')
        .innerText();
      await expect(availableAlerts.first()).toBeVisible();

      await alertsPage.searchAlerts(searchQuery);
      await expect(availableAlerts.first()).toBeVisible();

      const alertTexts = await availableAlerts.allInnerTexts();
      for (const alertText of alertTexts) {
        expect(alertText.toLowerCase()).toContain(searchQuery.toLowerCase());
      }
    },
  );
});
