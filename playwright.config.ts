import { defineConfig, devices } from "@playwright/test";

const e2eBaseURL = "http://127.0.0.1:3000";
const jsonOut = process.env.PW_JSON?.trim();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  reporter: jsonOut
    ? [["dot"], ["json", { outputFile: jsonOut }]]
    : "dot",
  use: {
    baseURL: e2eBaseURL,
    trace: "on-first-retry",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: e2eBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
