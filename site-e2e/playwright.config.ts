import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 120000,
  use: {
    baseURL: "http://localhost:3100",
    locale: "vi-VN",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx react-scripts start",
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 240000,
    env: {
      BROWSER: "none",
      PORT: "3100",
      REACT_APP_CMS_PATHS_OVERRIDE: "/contact",
    },
  },
});
