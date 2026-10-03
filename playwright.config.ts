import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  webServer: {
    command: "npx --yes serve@14 out -l 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3100" } },
    { name: "mobile", use: { ...devices["Pixel 5"], baseURL: "http://localhost:3100" } },
  ],
});
