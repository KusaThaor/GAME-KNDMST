/**
 * Bàn phím thật (page.keyboard): Space/Enter làm đúng việc của nút "đi tiếp" như click, Esc luôn mở được menu,
 * phím di chuyển không kẹt khi mở/đóng giao diện.
 */
import { expect, test, type Page } from '@playwright/test';

type St = { mode: string | null; flow: string; day: string | null; player: { x: number; z: number } | null; ui: { dialogue: string | null; panel: string | null } };
const state = (page: Page) => page.evaluate(() => window.__game!.state() as unknown as St);
const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
};
async function open(page: Page, query = '') {
  await page.route('**/api/collect', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"accepted":0,"dropped":[]}' }));
  await page.goto(`/?play=1${query}`);
  await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
}
const text = (page: Page, testid: string) => page.locator(`[data-testid="${testid}"]`).textContent({ timeout: 1000 }).catch(() => null);

test.describe('bàn phím thật', () => {
  test('hub: Space/Enter chuyển thoại; Esc mở menu cả khi đang có thoại, menu mở thì Space không chuyển thoại bên dưới', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    await open(page);
    await page.locator('[data-act="consent-yes"]').click({ timeout: 30_000 });
    const dlg = page.locator('[data-testid="dialogue"] .text');
    await expect(dlg).toBeVisible({ timeout: 30_000 });
    // Lời dẫn mở đầu có 2 dòng (N-08, B10: độc thoại dời ra sau khi mở thùng): Space qua dòng 1, Enter qua dòng 2.
    const l1 = await dlg.textContent();
    await page.keyboard.press('Space');
    await expect(dlg).not.toHaveText(l1!);
    const l2 = await dlg.textContent();
    // Esc khi đang có thoại → menu
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await expect(dlg).toHaveText(l2!);                                       // menu đang mở: thoại bên dưới đứng yên
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await state(page)).ui.dialogue).not.toBe(l2);   // Enter = đi tiếp (sang form tên, hết thoại)
    expect(errors).toEqual([]);
  });

  test('màn kết Trang: Space đưa về phòng 2026 như bấm "Về phòng"; Enter qua thông báo ở phòng', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectErrors(page);
    await open(page, '&day=d.g06.01&step=q_m1_main_01.s02');
    const t0 = Date.now();
    while (!(await page.locator('[data-testid="day-end"]').count())) {        // bot chơi tới màn kết Trang (không bấm nút ở đó)
      await page.evaluate(() => {
        // N-01: Trang 1 có trò thật — bot không chơi được nên bấm "Bỏ qua" như người chơi
        const skip = [...document.querySelectorAll<HTMLButtonElement>('[data-testid="minigame"] button')].find((b) => b.textContent?.trim() === 'Bỏ qua');
        if (skip) skip.click(); else window.__game!.botStep({ name: 'Tí', optional: false });
      });
      await page.waitForTimeout(60);
      if (Date.now() - t0 > 150_000) throw new Error('không tới màn kết Trang');
    }
    await page.keyboard.press('Space');
    await expect(page.locator('[data-testid="day-end"]')).toHaveCount(0, { timeout: 5000 });
    await expect.poll(async () => (await state(page)).mode, { timeout: 60_000 }).toBe('hub');
    const notice = page.locator('[data-testid="notice"]');
    await expect(notice).toBeVisible({ timeout: 30_000 });
    const n1 = await text(page, 'notice');
    await page.keyboard.press('Enter');
    await expect.poll(() => text(page, 'notice')).not.toBe(n1);
    expect(errors).toEqual([]);
  });

  test('phím đi không bị kẹt: giữ W, mở menu, thả W, đóng menu → đứng yên', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    await open(page, '&day=d.g06.01');
    const t0 = Date.now();
    for (;;) {                                                                 // qua thoại mở Trang
      const s = await state(page);
      if (s.mode === 'day' && !s.ui.dialogue && !s.ui.panel && (await page.evaluate(() => window.__game!.ready()))) break;
      await page.evaluate(() => { const g = window.__game!; const s = g.state() as { mode: string | null; ui: { dialogue: string | null } }; if (s.mode !== 'day' || s.ui.dialogue) g.botStep({ name: 'Tí' }); });
      await page.waitForTimeout(100);
      if (Date.now() - t0 > 90_000) throw new Error('không vào được Trang');
    }
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    await page.keyboard.up('KeyW');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toHaveCount(0);
    const a = (await state(page)).player!;
    await page.waitForTimeout(800);
    const b = (await state(page)).player!;
    expect(Math.hypot(b.x - a.x, b.z - a.z)).toBeLessThan(0.05);
    expect(errors).toEqual([]);
  });
});
