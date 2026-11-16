import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const PORT = 4173;
const BASE = `http://localhost:${PORT}/`;
const OUT = 'shots';
mkdirSync(OUT, { recursive: true });

async function waitForServer(url, maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start in time.`);
}

async function main() {
  console.log('Starting vite preview server...');
  const server = spawn('cmd.exe', ['/c', 'npx', 'vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'inherit'
  });

  try {
    await waitForServer(BASE);
    console.log('Server is ready. Launching Chromium...');

    const browser = await chromium.launch({
      channel: 'chrome',
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
    });

    const SHOTS = [
      { name: 'assets-wide', q: 'lab=assets&view=wide&t=1.0', w: 1600, h: 900 },
      { name: 'assets-chalkboard', q: 'lab=assets&view=chalkboard&t=1.0', w: 1600, h: 900 },
      { name: 'assets-trees', q: 'lab=assets&view=trees&t=1.0', w: 1600, h: 900 }
    ];

    const errors = [];

    for (const s of SHOTS) {
      console.log(`Navigating to ${s.name} (${s.q})...`);
      const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
      page.on('pageerror', (e) => errors.push(`${s.name}: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`${s.name}: ${m.text()}`);
      });

      await page.goto(`${BASE}?${s.q}`);
      await page.waitForFunction(() => window.__lab?.ready === true, null, { timeout: 30000 });
      // Chờ thêm 1 giây để Three.js GLTF textures/shadows ổn định
      await new Promise(r => setTimeout(r, 1000));

      const stats = await page.evaluate(() => window.__lab.stats());
      const outPath = `${OUT}/${s.name}.png`;
      await page.screenshot({ path: outPath });
      console.log(`✓ Saved ${outPath} | drawCalls=${stats.drawCalls}, triangles=${stats.triangles}`);
      await page.close();
    }

    await browser.close();

    if (errors.length > 0) {
      console.warn('Console/Page warnings/errors encountered:\n' + errors.join('\n'));
    } else {
      console.log('All screenshots captured with 0 console errors!');
    }
  } finally {
    // Kill vite preview process tree
    if (server.pid) {
      try {
        spawn('taskkill', ['/pid', String(server.pid), '/T', '/F']);
      } catch {}
    }
  }
}

main().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
