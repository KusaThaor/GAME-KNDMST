import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

mkdirSync('shots/debug', { recursive: true });

test.describe('navigation HUD, minimap, and selfie capture', () => {
  test('hub + day: selfie button, quest compass, minimap, full map, and selfie download', async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.route('**/api/collect', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"accepted":0,"dropped":[]}' }));
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/?play=1&day=d.g06.01');
    await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });

    const t0 = Date.now();
    for (;;) {
      const s = await page.evaluate(() => window.__game!.state() as { mode: string | null; ui: { dialogue: string | null; panel: string | null } });
      if (s.mode === 'day' && !s.ui.dialogue && !s.ui.panel && (await page.evaluate(() => window.__game!.ready()))) break;
      await page.evaluate(() => {
        const g = window.__game!;
        const s = g.state() as { mode: string | null; ui: { dialogue: string | null } };
        if (s.mode !== 'day' || s.ui.dialogue) g.botStep({ name: 'Tí' });
      });
      await page.waitForTimeout(100);
      if (Date.now() - t0 > 90_000) throw new Error('timeout entering day');
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'shots/debug/day-hud.png' });

    await expect(page.locator('[data-act="selfie"]')).toBeVisible();
    await expect(page.locator('[data-testid="minimap"]')).toBeVisible();

    // Test clicking circular minimap expands to full map
    await page.locator('[data-testid="minimap"]').click();
    await expect(page.locator('[data-testid="full-map"]')).toBeVisible();
    await page.waitForTimeout(150);
    await page.screenshot({ path: 'shots/debug/full-map.png' });
    await page.locator('[data-act="map-close"]').click();
    await expect(page.locator('[data-testid="full-map"]')).toHaveCount(0);

    // Test selfie download + live screen after capture
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-act="selfie"]').click(),
    ]);
    await download.saveAs('shots/debug/selfie.jpg');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'shots/debug/after-selfie.png' });

    // Also test Hub mode selfie button & capture (fresh save)
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?play=1');
    await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
    await page.locator('[data-act="consent-yes"]').click({ timeout: 30_000 });
    await expect(page.locator('[data-act="selfie"]')).toBeVisible();
    const [hubDl] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-act="selfie"]').click(),
    ]);
    await hubDl.saveAs('shots/debug/hub-selfie.jpg');
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'shots/debug/hub-after-selfie.png' });

    expect(errors).toEqual([]);
  });
});
