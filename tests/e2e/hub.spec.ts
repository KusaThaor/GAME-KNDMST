/**
 * Phòng 2026 (hub) góc nhìn thứ nhất — bàn phím và chuột thật (page.keyboard / page.mouse).
 * Vào phòng → đi tới Hộp Kỷ Vật → E mở → lần đầu chỉ mật lệnh bấm được → Trang 1 → xong → về phòng → món kế sáng → bấm được.
 */
import { expect, test, type Page } from '@playwright/test';

type Item = { id: string; kind: 'artifact' | 'decor'; state: 'glow' | 'normal' | 'dim'; clickable: boolean };
type HubV = { player: { x: number; z: number; yaw: number; pitch: number }; nearest: string | null; boxOpen: boolean; items: Item[] };
type St = { mode: string | null; flow: string; day: string | null; days: Record<string, string>; artifacts: Record<string, string>; pages: Record<string, string>; hub: HubV | null; ui: { dialogue: string | null; panel: string | null } };
const state = (page: Page) => page.evaluate(() => window.__game!.state() as unknown as St);
const hubv = async (page: Page) => (await state(page)).hub!;
const DEG = Math.PI / 180;

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
/** Bấm Space (phím thật) cho tới khi hết thoại/thông báo. */
async function spaceThrough(page: Page, maxMs = 20_000) {
  const t0 = Date.now();
  for (;;) {
    await page.waitForTimeout(250);
    const busy = await page.evaluate(() => !!document.querySelector('[data-testid="dialogue"], [data-testid="notice"]'));
    if (!busy) { await page.waitForTimeout(300); if (!(await page.evaluate(() => !!document.querySelector('[data-testid="dialogue"], [data-testid="notice"]')))) return; }
    else await page.keyboard.press('Space');
    if (Date.now() - t0 > maxMs) throw new Error('thoại không chịu qua');
  }
}
/** Bấm chuột thật vào một vật/món trong phòng (toạ độ lấy từ chính camera của game). */
async function clickHub(page: Page, id: string) {
  const pt = await page.evaluate((x) => window.__game!.hubPoint(x), id);
  expect(pt, `không thấy ${id} trên màn hình`).not.toBeNull();
  await page.mouse.click(pt!.x, pt!.y);
}
/** Bot chơi hết Trang đang mở rồi bấm Space ở màn kết Trang để về phòng. */
async function finishDay(page: Page) {
  const t0 = Date.now();
  while (!(await page.locator('[data-testid="day-end"]').count())) {
    await page.evaluate(() => window.__game!.botStep({ name: 'Tí', optional: false }));
    await page.waitForTimeout(60);
    if (Date.now() - t0 > 200_000) throw new Error('không tới màn kết Trang');
  }
  await page.keyboard.press('Space');
  await expect.poll(async () => (await state(page)).mode, { timeout: 60_000 }).toBe('hub');
}
const item = (h: HubV, id: string) => h.items.find((i) => i.id === id);
/** Chờ camera lướt xong vào cận cảnh Hộp Kỷ Vật. */
const boxSettled = (page: Page) => expect.poll(async () => ((await hubv(page)) as HubV & { boxBlend: number }).boxBlend, { timeout: 10_000 }).toBe(1);

test.describe('phòng 2026 góc nhìn thứ nhất', () => {
  test('đi tới hộp → mở → chỉ mật lệnh bấm được → Trang 1 → về phòng → món kế sáng → bấm được', async ({ page }) => {
    test.setTimeout(420_000);
    const errors = collectErrors(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await open(page);
    await page.locator('[data-act="consent-yes"]').click({ timeout: 30_000 });
    await expect(page.locator('[data-testid="dialogue"]')).toBeVisible({ timeout: 30_000 });
    await spaceThrough(page);                                                   // 4 câu mở đầu bằng Space
    await page.locator('[data-act="name"]').fill('Tí');
    await page.locator('[data-act="profile-ok"]').click();
    await expect.poll(async () => (await state(page)).mode).toBe('hub');
    await expect(page.locator('[data-testid="keys"]')).toContainText('WASD');

    // ---- nhìn quanh: theo con trỏ, chỉ trong giới hạn (±65°), không quay vòng ----
    const p0 = (await hubv(page)).player;
    await page.mouse.move(1279, 360);
    await page.waitForTimeout(1500);
    const right = (await hubv(page)).player;
    expect(right.yaw).toBeLessThan(-55 * DEG);
    expect(right.yaw).toBeGreaterThanOrEqual(-65.5 * DEG);
    await page.mouse.move(0, 360);
    await page.waitForTimeout(1500);
    const left = (await hubv(page)).player;
    expect(left.yaw).toBeGreaterThan(55 * DEG);
    expect(left.yaw).toBeLessThanOrEqual(65.5 * DEG);
    expect(Math.hypot(left.x - p0.x, left.z - p0.z)).toBeLessThan(0.01);      // rê chuột không làm người chơi di chuyển

    // ---- đi tới Hộp Kỷ Vật (góc trong cùng bên trái) bằng W, nhìn về phía hộp bằng chuột ----
    await page.mouse.move(Math.round(0.18 * 1280), 330);
    await page.waitForTimeout(800);
    await page.keyboard.down('KeyW');
    await expect.poll(async () => (await hubv(page)).nearest, { timeout: 30_000 }).toBe('itr.hub.memory_box');
    await page.keyboard.up('KeyW');
    const moved = (await hubv(page)).player;
    expect(Math.hypot(moved.x - p0.x, moved.z - p0.z)).toBeGreaterThan(1.5);
    await expect(page.locator('[data-testid="prompt"]')).toContainText('Hộp Kỷ Vật');
    await page.keyboard.press('KeyE');
    await expect(page.locator('[data-testid="panel-box3d"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-box3d"]')).toHaveAttribute('data-first', 'true');
    await expect(page.locator('[data-testid="box-hint"]')).toContainText('mẩu giấy gấp tư');
    await spaceThrough(page);                                                   // câu "lục đồ" khi mở hộp
    let h = await hubv(page);
    expect(h.boxOpen).toBe(true);
    expect(item(h, 'art_m1_01')).toMatchObject({ state: 'glow', clickable: true });
    for (const id of ['art_m1_02', 'art_m1_03', 'art_m1_05']) expect(item(h, id), id).toMatchObject({ state: 'dim', clickable: false });
    expect(h.items.filter((i) => i.kind === 'decor').length).toBeGreaterThan(h.items.filter((i) => i.kind === 'artifact').length);   // phần lớn là đồ linh tinh
    expect(h.items.filter((i) => i.clickable).map((i) => i.id)).toEqual(['art_m1_01']);
    await boxSettled(page);                                                     // camera lướt xong vào cận cảnh

    // lần đầu: bấm đồ linh tinh / kỷ vật chưa tới lượt → không có gì xảy ra, vẫn ở phòng
    await clickHub(page, 'deco.ruler');
    await clickHub(page, 'art_m1_02');
    await page.waitForTimeout(800);
    expect(await page.locator('[data-testid="dialogue"]').count()).toBe(0);
    expect((await state(page)).mode).toBe('hub');

    // bấm mật lệnh → chuyển cảnh → Trang 1
    await clickHub(page, 'art_m1_01');
    await expect.poll(async () => { const s = await state(page); return `${s.mode}|${s.day}`; }, { timeout: 60_000 }).toBe('day|d.g06.01');

    // ---- xong Trang 1 → về phòng; món kế (Trang 2) sáng, Trang 3–4 còn mờ; mật lệnh đã lên kệ ----
    await finishDay(page);
    await spaceThrough(page, 30_000);                                           // thông báo Album / kệ
    h = await hubv(page);
    expect(item(h, 'art_m1_01')).toBeUndefined();
    expect(item(h, 'art_m1_02')).toMatchObject({ state: 'glow', clickable: true });
    expect(item(h, 'art_m1_03')).toMatchObject({ state: 'dim' });
    expect(item(h, 'art_m1_05')).toMatchObject({ state: 'dim' });
    expect((await state(page)).artifacts.art_m1_01).toBe('on_shelf');

    // tới hộp lần nữa (đặt sẵn cạnh hộp, nhìn về phía hộp), E mở, đồ linh tinh giờ nói một câu, kỷ vật mờ chỉ nói, không vào cảnh
    await page.evaluate(() => window.__game!.hubTeleport(-1.9, -0.9, 0.75));
    await page.mouse.move(640, 300);
    await expect.poll(async () => (await hubv(page)).nearest, { timeout: 10_000 }).toBe('itr.hub.memory_box');
    await page.keyboard.press('KeyE');
    await expect(page.locator('[data-testid="panel-box3d"]')).toHaveAttribute('data-first', 'false');
    await spaceThrough(page);
    await boxSettled(page);
    await clickHub(page, 'deco.scarf');
    await expect(page.locator('[data-testid="dialogue"]')).toContainText('Khăn quàng đỏ');
    await spaceThrough(page);
    await clickHub(page, 'art_m1_05');
    await expect(page.locator('[data-testid="dialogue"]')).toBeVisible();
    await spaceThrough(page);
    expect((await state(page)).mode).toBe('hub');
    // bấm thuyền giấy (đang sáng) → câu móc → Trang 2
    await clickHub(page, 'art_m1_02');
    await spaceThrough(page);
    await expect.poll(async () => { const s = await state(page); return `${s.mode}|${s.day}`; }, { timeout: 60_000 }).toBe('day|d.g07.01');
    expect(errors).toEqual([]);
  });

  test('tải lại trang ở phòng 2026: về đúng phòng, đúng món đang sáng, Album còn nguyên', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = collectErrors(page);
    await open(page, '&day=d.g06.01&step=q_m1_main_01.s02');
    await finishDay(page);
    await spaceThrough(page, 30_000);
    const before = await state(page);
    expect(before.days['d.g06.01']).toBe('completed');
    expect(['restored', 'enriched', 'complete']).toContain(before.pages['page.d.g06.01']);
    await page.goto('/?play=1');
    await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
    await expect.poll(async () => (await state(page)).mode, { timeout: 60_000 }).toBe('hub');
    const after = await state(page);
    expect(after.pages).toEqual(before.pages);
    expect(after.artifacts).toEqual(before.artifacts);
    expect(item(after.hub!, 'art_m1_02')).toMatchObject({ state: 'glow', clickable: true });
    expect(item(after.hub!, 'art_m1_03')).toMatchObject({ state: 'dim' });
    expect(errors).toEqual([]);
  });
});
