import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: { __BUILD_VERSION__: '"20261113-test"', __APP_ENV__: '"test"', __DEV_TOOLS__: 'true' },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
