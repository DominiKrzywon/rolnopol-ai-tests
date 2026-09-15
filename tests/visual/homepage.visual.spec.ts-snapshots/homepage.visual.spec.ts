import { expect, test } from '@playwright/test';

import { HomePage } from '../../../src/pages/HomePage';

test(
  'should match homepage visual snapshot',
  {
    annotation: { type: 'case-id', description: 'TC-VIS-001' },
    tag: ['@smoke', '@critical', '@visual'],
  },
  async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await expect(homePage.header).toBeVisible();

    await expect(page).toHaveScreenshot('homepage.png', {
      animations: 'disabled',
      mask: [
        homePage.statsSection,
        homePage.modernKpiSection,
        homePage.dynamicInsight,
      ],
    });
  },
);
