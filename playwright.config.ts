import { defineConfig, devices } from '@playwright/test';
const base = process.env.VITE_BASE_PATH || '/';
const viewport = { width: 1280, height: 720 };
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:4173${base}`, trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm preview --port 4173 --strictPort',
    url: `http://127.0.0.1:4173${base}`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport } },
    {
      name: 'firefox',
      testMatch: /core\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], viewport },
    },
    {
      name: 'webkit',
      testMatch: /core\.spec\.ts/,
      use: { ...devices['Desktop Safari'], viewport },
    },
  ],
});
