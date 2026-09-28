import { defineConfig, devices } from '@playwright/test';
import { register } from 'tsconfig-paths';

import { ENV } from './src/config/env.config';

register({ baseUrl: '.', paths: { 'src/*': ['./src/*'] } });

export const DEMO_USER_AUTH_FILE = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  fullyParallel: true,
  metadata: {
    environment: new URL(ENV.BASE_URL).origin,
    coverage: process.env.COVERAGE_CONTEXT
      ? JSON.parse(process.env.COVERAGE_CONTEXT)
      : undefined,
  },
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'coverage-report/playwright-results.json' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'coverage-report/playwright-results.json' }],
      ],
  use: {
    baseURL: ENV.BASE_URL || 'http://localhost:3000',
    // baseURL: 'http://web:3000',
    trace: 'on',
  },

  projects: [
    {
      name: 'health-check',
      testMatch: ['**/health/health.spec.ts'],
    },

    {
      name: 'setup-demo-user',
      dependencies: ['health-check'],
      testMatch: ['**/auth/**/*.setup.ts'],
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'smoke-tests',
      dependencies: ['health-check'],
      testMatch: ['**/smoke/**.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'demo-user-tests',
      dependencies: ['setup-demo-user'],
      testMatch: ['**/auth/**/*.e2e.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: DEMO_USER_AUTH_FILE,
      },
    },

    {
      name: 'no-auth-tests',
      dependencies: ['health-check'],
      testMatch: ['**/auth/**/*.noauth.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'api-tests',
      dependencies: ['health-check'],
      testMatch: ['**/api/**/*.spec.ts'],
    },

    {
      name: 'isolated-user-tests',
      dependencies: ['health-check'],
      testMatch: ['**/*.isolated.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'visual-test',
      dependencies: ['health-check'],
      testMatch: ['**/visual/**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
