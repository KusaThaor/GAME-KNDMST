import { expect, test, type Page } from '@playwright/test';

const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
};

test('trang chủ hiện build và môi trường test', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Hành Trình Thanh Xuân');
  await expect(page.locator('.build')).toContainText('môi trường test');
  expect(errors).toEqual([]);
});

for (const q of ['lab=sheet&grade=6', 'lab=sheet&grade=9&motion=mix', 'lab=yard', 'lab=yard&view=wide', 'lab=yard&fx=dust&intro=1&tweak=1', 'lab=yard&asset=desk']) {
  test(`trang thử dựng được: ${q}`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/?${q}`);
    await page.waitForFunction(() => window.__lab?.ready === true, null, { timeout: 60_000 });
    const stats = await page.evaluate(() => window.__lab!.stats());
    expect(stats.drawCalls).toBeGreaterThan(10);
    expect(stats.drawCalls).toBeLessThan(600);       // ngân sách tạm, chốt lại ở S4
    expect(errors).toEqual([]);
  });
}

test('nút gửi event thử → server nhận', async ({ page }) => {
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'cần Firestore Emulator');
  await page.goto('/');
  await page.click('#pipe');
  await expect(page.locator('#pipe-out')).toContainText('"ok": true', { timeout: 20_000 });
  await expect(page.locator('#pipe-out')).toContainText('"accepted": 1');
});
