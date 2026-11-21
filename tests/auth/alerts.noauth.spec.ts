import { Route } from '@playwright/test';
import { todayAlertResponse } from 'src/factories/alerts.factory';
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

test.describe('alerts API tests', () => {
  test(
    'should return empty list',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-010' },
      tag: ['@alerts'],
    },
    async ({ page, alertsPage }) => {
      const alertsUrl = '/api/v1/alerts';
      const alertForToday = ' No alerts for today.';
      const upcomingAlerts = ' No upcoming alerts.';
      const historyAlerts = ' No alerts in the last 7 days.';

      await page.route(
        (url) => url.pathname === alertsUrl,
        async (route) => {
          if (route.request().method() !== 'GET') {
            await route.continue();
            return;
          }
          await route.fulfill({
            status: 200,
            json: {
              success: true,
              data: {
                today: { alerts: [] },
                upcoming: { alerts: [] },
                history: [],
              },
            },
          });
        },
      );

      await alertsPage.goto();

      await expect(alertsPage.todayList).toHaveText(alertForToday);
      await expect(alertsPage.upcomingList).toHaveText(upcomingAlerts);
      await expect(alertsPage.historyList).toHaveText(historyAlerts);
    },
  );

  test(
    'should display one alert only',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-011' },
      tag: ['@alerts'],
    },
    async ({ page, alertsPage }) => {
      const alertsUrl = '/api/v1/alerts';
      const expectedTodayAlerts = 'Example alert message';
      const upcomingAlerts = ' No upcoming alerts.';
      const historyAlerts = ' No alerts in the last 7 days.';

      await page.route(
        (url) => url.pathname === alertsUrl,
        async (route) => {
          if (route.request().method() !== 'GET') {
            await route.continue();
            return;
          }
          await route.fulfill({
            status: 200,
            json: {
              success: true,
              data: {
                today: {
                  alerts: [
                    {
                      date: '2026-11-15',
                      severity: 'low',
                      title: 'Controlled test alert',
                      category: 'weather',
                      message: expectedTodayAlerts,
                    },
                  ],
                },
                upcoming: { alerts: [] },
                history: [],
              },
            },
          });
        },
      );

      await alertsPage.goto();

      await expect(alertsPage.todayList).toContainText(expectedTodayAlerts);
      await expect(alertsPage.upcomingList).toHaveText(upcomingAlerts);
      await expect(alertsPage.historyList).toHaveText(historyAlerts);
    },
  );

  test(
    'should send query params after change region',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-012' },
      tag: ['@alerts'],
    },
    async ({ page, alertsPage }) => {
      const alertsUrl = '/api/v1/alerts';
      const selectedRegion = 'PL-02';

      await alertsPage.goto();
      await expect(alertsPage.regionSelect).toBeEnabled();

      const [regionRequest] = await Promise.all([
        page.waitForRequest((request) => {
          const url = new URL(request.url());

          return (
            url.pathname === alertsUrl &&
            request.method() === 'GET' &&
            url.searchParams.get('region') === selectedRegion
          );
        }),
        alertsPage.selectRegion(selectedRegion),
      ]);

      const requestUrl = new URL(regionRequest.url());
      expect(requestUrl.searchParams.get('region')).toEqual(selectedRegion);
    },
  );

  test(
    'should preserve selected region after reload',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-013' },
      tag: ['@alerts'],
    },
    async ({ page, alertsPage }) => {
      const selectedRegion = 'PL-02';

      await alertsPage.goto();
      await alertsPage.selectRegion(selectedRegion);
      await page.reload();

      await expect(alertsPage.regionSelect).toHaveValue(selectedRegion);
    },
  );

  test(
    'should show loading placeholders until alerts arrive',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-014' },
      tag: ['@alerts'],
    },
    async ({ page, alertsPage }) => {
      const alertsUrl = '/api/v1/alerts';
      const expectedTodayAlerts = 'Example alert message';

      let releaseAlerts!: () => void;

      const alertsGate = new Promise<void>((resolve) => {
        releaseAlerts = resolve;
      });

      await page.route(
        (url) => url.pathname === alertsUrl,
        async (route) => {
          if (route.request().method() !== 'GET') {
            await route.continue();
            return;
          }

          await alertsGate;

          await route.fulfill({
            status: 200,
            json: {
              success: true,
              data: {
                today: {
                  alerts: [
                    {
                      date: '2026-11-15',
                      severity: 'low',
                      title: 'Controlled test alert',
                      category: 'weather',
                      message: expectedTodayAlerts,
                    },
                  ],
                },
                upcoming: { alerts: [] },
                history: [],
              },
            },
          });
        },
      );

      try {
        await alertsPage.goto();

        await expect(alertsPage.todayLoadingPlaceholders.first()).toBeVisible();

        releaseAlerts();

        await expect(alertsPage.todayList).toContainText(expectedTodayAlerts);
        await expect(alertsPage.todayLoadingPlaceholders).toHaveCount(0);
      } finally {
        releaseAlerts();
      }
    },
  );

  test(
    'should replace alerts after refresh while showing loading placeholders',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-015' },
      tag: ['@alerts'],
    },
    async ({ page, alertsPage }) => {
      const alertsUrl = '/api/v1/alerts';
      const expectedAlert1 = 'Initial alert';
      const expectedAlert2 = 'Refreshed alert';

      const alertsMatcher = (url: URL): boolean => url.pathname === alertsUrl;

      const initialAlertsHandler = async (route: Route): Promise<void> => {
        // eslint-disable-next-line playwright/no-conditional-in-test
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            json: todayAlertResponse(expectedAlert1),
          });
        } else {
          await route.continue();
        }
      };

      await page.route(alertsMatcher, initialAlertsHandler);
      await alertsPage.goto();

      await expect(alertsPage.todayList).toContainText(expectedAlert1);

      await page.unroute(alertsMatcher, initialAlertsHandler);

      let releaseRefresh!: () => void;

      const refreshGate = new Promise<void>((resolve) => {
        releaseRefresh = resolve;
      });

      const refreshedAlertsHandler = async (route: Route): Promise<void> => {
        // eslint-disable-next-line playwright/no-conditional-in-test
        if (route.request().method() === 'GET') {
          await refreshGate;

          await route.fulfill({
            status: 200,
            json: todayAlertResponse(expectedAlert2),
          });
        } else {
          await route.continue();
        }
      };

      await page.route(alertsMatcher, refreshedAlertsHandler);
      try {
        await alertsPage.refreshAlerts();

        await expect(alertsPage.todayLoadingPlaceholders.first()).toBeVisible();

        releaseRefresh();

        await expect(alertsPage.todayList).toContainText(expectedAlert2);
        await expect(alertsPage.todayList).not.toContainText(expectedAlert1);
        await expect(alertsPage.todayLoadingPlaceholders).toHaveCount(0);
      } finally {
        releaseRefresh();
      }
    },
  );

  test(
    'should show an error after a delayed alerts response fails',
    {
      annotation: { type: 'case-id', description: 'TC-PUBLIC-016' },
      tag: ['@alerts'],
    },
    async ({ page, alertsPage }) => {
      const alertsUrl = '/api/v1/alerts';
      const expectedErrorMessage = 'Alerts temporarily unavailable';

      let releaseResponse!: () => void;

      const responseGate = new Promise<void>((resolve) => {
        releaseResponse = resolve;
      });

      await page.route(
        (url) => url.pathname === alertsUrl,
        async (route) => {
          if (route.request().method() !== 'GET') {
            await route.continue();
            return;
          }
          await responseGate;

          await route.fulfill({
            status: 500,
            json: {
              success: false,
              error: expectedErrorMessage,
            },
          });
        },
      );

      try {
        await alertsPage.goto();

        await expect(alertsPage.todayLoadingPlaceholders.first()).toBeVisible();

        releaseResponse();

        await expect(alertsPage.notificationMessage).toHaveText(
          `Error: ${expectedErrorMessage}`,
        );
      } finally {
        releaseResponse();
      }
    },
  );
});
