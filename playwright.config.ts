import { defineConfig, devices } from "@playwright/test";
import { ENV } from "./src/config/env.config";

export default defineConfig({
  testDir: "./tests",
  timeout: 10 * 1000,
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
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
