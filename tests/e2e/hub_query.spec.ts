import { expect, test } from '@playwright/test';

test('?hub=1 vào thẳng phòng 2026, bỏ qua phần mở đầu', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/api/collect', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"accepted":0,"dropped":[]}' }));
  await page.goto('/?play=1&hub=1');
  await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
  // hộp đồng ý số liệu vẫn hiện (không bỏ qua — đây là quyền của người chơi)
  await page.locator('[data-act="consent-yes"]').click({ timeout: 30_000 });
  await expect.poll(async () => page.evaluate(() => window.__game!.state() as unknown as { mode: string | null }).then((s) => s.mode), { timeout: 60_000 }).toBe('hub');
  const s = await page.evaluate(() => window.__game!.state() as unknown as { flow: string; ui: { dialogue: string | null }; name_length: number; hub: unknown });
  expect(s.flow).toBe('hub_idle');
  expect(s.ui.dialogue).toBeNull();
  expect(await page.locator('[data-act="name"]').count()).toBe(0);           // không còn form nhập tên
  expect(s.name_length).toBeGreaterThan(0);
  expect(s.hub).not.toBeNull();
  expect(errors).toEqual([]);
  await page.evaluate(() => { const g = window.__game!; void g; });
});
