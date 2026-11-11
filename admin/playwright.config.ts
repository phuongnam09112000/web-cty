import { defineConfig, devices } from "@playwright/test";

export const GATEWAY_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    locale: "vi-VN",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm --prefix ../server run e2e:seed && npm --prefix ../server run dev",
      url: "http://127.0.0.1:4000/api/admin/auth/me",
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        DATABASE_URL: "mysql://root:istt-dev@127.0.0.1:3307/istt_e2e",
        PORT: "4000",
        ADMIN_ORIGIN: "http://localhost:5173",
        ADMIN_GATEWAY_SECRET: GATEWAY_SECRET,
        COOKIE_SECURE: "false",
        MEDIA_DIR: "/tmp/istt-e2e-media",
        NODE_ENV: "development",
      },
    },
    {
      command: "npx vite",
      url: "http://localhost:5173",
      reuseExistingServer: false,
      timeout: 60000,
      env: { ADMIN_GATEWAY_SECRET: GATEWAY_SECRET },
    },
  ],
});
