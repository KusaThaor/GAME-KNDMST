import { expect, test, type Page } from '@playwright/test';

/** BUG-T1-A: bản test mặc định ẩn Side/Daily nháp; ?drafts=1 bật lại. */
type S = { mode: string | null; quests: Record<string, string> };

async function openDay(page: Page, extra: string) {
  await page.route('**/api/collect', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"accepted":0,"dropped":[]}' }));
  await page.goto(`/?play=1&day=d.g06.01&step=q_m1_main_01.s01${extra}`);
  await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
  await page.locator('[data-act="consent-yes"]').click({ timeout: 30_000 });   // hộp đồng ý số liệu luôn hiện trước
  await expect.poll(async () => (await page.evaluate(() => window.__game!.state() as unknown as S)).mode, { timeout: 60_000 }).toBe('day');
  return page.evaluate(() => window.__game!.state() as unknown as S);
}

test('BUG-T1-A: Trang 1 mặc định không có nhiệm vụ nháp; ?drafts=1 thì có', async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const off = await openDay(page, '');
  expect(off.quests['q_m1_ai_side_01']).toBeUndefined();
  expect(off.quests['q_m1_ai_daily_01']).toBeUndefined();
  expect(await page.getByText('[PLACEHOLDER]').count()).toBe(0);

  await page.evaluate(() => localStorage.clear());
  const on = await openDay(page, '&drafts=1');
  expect(on.quests['q_m1_ai_side_01']).toBeDefined();
  expect(errors).toEqual([]);
});
