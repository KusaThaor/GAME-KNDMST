// Chụp ảnh các trang thử bằng Chrome headless để Claude và chủ dự án xem (không cần mở máy thật).
// Dùng: npm run build && node scripts/shots.mjs [tên-ảnh ...]
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PORT = 4173;
const BASE = `http://localhost:${PORT}/`;
const OUT = 'shots';
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { name: 'sheet-g6', q: 'lab=sheet&grade=6&t=0.6', w: 1600, h: 760 },
  { name: 'sheet-g9', q: 'lab=sheet&grade=9&t=0.6', w: 1600, h: 760 },
  { name: 'sheet-g6-back', q: 'lab=sheet&grade=6&view=back&t=0.6', w: 1600, h: 760 },
  { name: 'sheet-g6-side', q: 'lab=sheet&grade=6&view=side&t=0.6', w: 1600, h: 760 },
  { name: 'sheet-g6-poses', q: 'lab=sheet&grade=6&motion=mix&t=0.45', w: 1600, h: 760 },
  { name: 'sheet-g9-poses', q: 'lab=sheet&grade=9&motion=mix&t=0.45', w: 1600, h: 760 },
  { name: 'yard-third', q: 'lab=yard&t=1.2', w: 1600, h: 900 },
  { name: 'yard-dialogue', q: 'lab=yard&t=1.2&dialogue=1', w: 1600, h: 900 },
  { name: 'yard-third-nohud', q: 'lab=yard&t=1.2&hud=0', w: 1600, h: 900 },
  { name: 'yard-wide', q: 'lab=yard&view=wide&hud=0&t=1.2', w: 1600, h: 900 },
  { name: 'yard-fx', q: 'lab=yard&hud=0&fx=dust&t=1.2', w: 1600, h: 900 },
  { name: 'yard-desk', q: 'lab=yard&hud=0&asset=desk&t=1.2', w: 1600, h: 900 },
  { name: 'yard-tweak', q: 'lab=yard&hud=0&fx=dust&tweak=1&t=1.2', w: 1600, h: 900 },
];
const GIFS = [
  { name: 'walk-g6', q: 'lab=sheet&grade=6&motion=walk&t=0', w: 1200, h: 560, frames: 24, dt: 1 / 15 },
  { name: 'poses-g6', q: 'lab=sheet&grade=6&motion=mix&t=0', w: 1200, h: 560, frames: 30, dt: 1 / 15 },
];

const only = process.argv.slice(2);
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const errors = [];
try {
  for (const s of SHOTS.filter((s) => !only.length || only.includes(s.name))) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    page.on('pageerror', (e) => errors.push(`${s.name}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${s.name}: ${m.text()}`); });
    await page.goto(`${BASE}?${s.q}`);
    await page.waitForFunction(() => window.__lab?.ready === true, null, { timeout: 60000 });
    const stats = await page.evaluate(() => window.__lab.stats());
    await page.screenshot({ path: `${OUT}/${s.name}.png` });
    console.log(`✓ ${s.name}.png  draw calls=${stats.drawCalls} tam giác=${stats.triangles}`);
    await page.close();
  }
  for (const g of GIFS.filter((g) => !only.length || only.includes(g.name))) {
    const page = await browser.newPage({ viewport: { width: g.w, height: g.h } });
    await page.goto(`${BASE}?${g.q}`);
    await page.waitForFunction(() => window.__lab?.ready === true, null, { timeout: 60000 });
    const dir = `${OUT}/_${g.name}`;
    rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
    for (let i = 0; i < g.frames; i++) {
      await page.evaluate((t) => window.__lab.setTime(t), i * g.dt);
      await page.screenshot({ path: `${dir}/f${String(i).padStart(3, '0')}.png` });
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '15', '-i', `${dir}/f%03d.png`,
      '-vf', 'scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer', `${OUT}/${g.name}.gif`]);
    rmSync(dir, { recursive: true, force: true });
    console.log(`✓ ${g.name}.gif  (${readdirSync(OUT).length} file trong ${OUT}/)`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
if (errors.length) { console.error('Lỗi trong trang:\n' + errors.join('\n')); process.exitCode = 1; }
