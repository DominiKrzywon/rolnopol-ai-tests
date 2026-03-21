import { defineConfig, devices } from "@playwright/test";
import { ENV } from "./src/config/env.config";

export const DEMO_USER_AUTH_FILE = "playwright/.auth/user.json";

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  fullyParallel: true,
  reporter: process.env.CI
    ? [["github"], ["html"]]
    : [["html", { open: "never" }]],
  use: {
    baseURL: ENV.BASE_URL,
    trace: "on",
  },

  projects: [
    {
      name: "setup-demo-user",
      testMatch: ["**/auth/**/*.setup.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "smoke-tests",
      testMatch: ["**/smoke/**.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "demo-user-tests",
      dependencies: ["setup-demo-user"],
      testMatch: ["**/auth/**/*.e2e.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: DEMO_USER_AUTH_FILE,
      },
    },
  ],
});
