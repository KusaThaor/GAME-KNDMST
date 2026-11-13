import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { execSync } from 'node:child_process';
import { devApi } from './vite.devapi';

/** build_version = YYYYMMDD-<mã commit ngắn> (ngày theo giờ Việt Nam). */
function buildVersion(): string {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).replaceAll('-', '');
  let sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  if (!sha) {
    try { sha = execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
    catch { sha = 'local'; }
  }
  return `${day}-${sha}`;
}

/** Chỉ bản Production trên Vercel (nhánh main) là "production"; mọi thứ khác là "test". */
const APP_ENV = process.env.VERCEL_ENV === 'production' ? 'production' : 'test';

export default defineConfig({
  plugins: [preact(), devApi()],
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion()),
    __APP_ENV__: JSON.stringify(APP_ENV),
    // Công cụ test (?lab=, ?bot=, ?chapter=) bị loại hẳn khỏi bản production.
    __DEV_TOOLS__: JSON.stringify(APP_ENV !== 'production'),
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
  server: { port: 5173 },
});
