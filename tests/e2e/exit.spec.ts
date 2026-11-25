/**
 * R-P1 (chốt 25/11): bấm Thoát ở bất kỳ đâu → hiện Form phản hồi (không cần chơi hết Mốc).
 * "Quay lại chơi" đóng form; "Bỏ qua" (hoặc gửi) thì rời game về trang chủ.
 */
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page) {
  await page.route('**/api/collect', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"accepted":0,"dropped":[]}' }));
  await page.goto('/?play=1');
  await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
}

test.describe('Thoát → Form phản hồi', () => {
  test('phòng 2026: Esc → Thoát → form; Quay lại chơi đóng form; Thoát lần nữa → Bỏ qua → về trang chủ', async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await open(page);
    await page.locator('[data-act="consent-yes"]').click({ timeout: 30_000 });
    await expect(page.locator('[data-testid="dialogue"] .text')).toBeVisible({ timeout: 30_000 });

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    await page.locator('[data-act="menu-exit"]').click();
    const form = page.locator('[data-testid="feedback"]');
    await expect(form).toBeVisible();
    await expect(page.locator('[data-testid="panel-menu"]')).toHaveCount(0);
    await expect(form).not.toContainText('[PLACEHOLDER]');
    await expect(form.locator('select')).toHaveCount(4);
    await expect(form.locator('textarea[name="comment"]')).toHaveAttribute('maxlength', '300');

    await page.locator('[data-act="feedback-cancel"]').click();
    await expect(form).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get('play')).toBe('1');            // vẫn đang chơi

    await page.keyboard.press('Escape');
    await page.locator('[data-act="menu-exit"]').click();
    await expect(form).toBeVisible();
    await Promise.all([page.waitForURL((u) => !u.searchParams.has('play'), { timeout: 15_000 }), page.locator('[data-act="feedback-skip"]').click()]);
    expect(errors).toEqual([]);
  });

});
