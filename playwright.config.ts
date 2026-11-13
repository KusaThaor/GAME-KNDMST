import { defineConfig } from '@playwright/test';

// Bot kiểm thử trình duyệt. Chạy: npm run test:e2e
// (Muốn thử cả đường ống dữ liệu: bật Firestore Emulator và đặt FIRESTORE_EMULATOR_HOST trước.)
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5174',
    channel: 'chrome',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  webServer: {
    command: 'npx vite --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
