/**
 * S2 Chặng 2 — điều khiển và camera trên trình duyệt thật (Chrome headless).
 * `window.__game` CHỈ dùng để đặt tình huống và đọc trạng thái; hành động được kiểm là phím/chuột/cảm ứng thật
 * (page.keyboard, page.mouse, CDP Input.*). Touchpad và cảm ứng ở đây là MÔ PHỎNG của Chrome, không phải thiết bị thật.
 */
import { expect, test, type CDPSession, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import type { CollectBatch } from '../../shared/events';

const SHOTS = 'shots/world';
mkdirSync(SHOTS, { recursive: true });

type Cam = { mode: string; look: string; state: string; freeLook: boolean; pointerLocked: boolean; yaw: number; pitch: number; distance: number; cameraDistance: number; locked: boolean };
type St = {
  mode: string | null; step: string | null; zone: string | null; device: string; listeners: number;
  player: { x: number; y: number; z: number } | null; camera: Cam | null;
  ui: { panel: string | null; dialogue: string | null; prompt: string | null };
};

const state = (page: Page) => page.evaluate(() => window.__game!.state() as unknown as St);
const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
};
async function captureCollect(page: Page) {
  const batches: CollectBatch[] = [];
  await page.route('**/api/collect', async (route) => {
    const body = route.request().postDataJSON() as CollectBatch;
    batches.push(body);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, accepted: body.events?.length ?? 0, dropped: [] }) });
  });
  return batches;
}

/** Mở game, cho bot qua câu hỏi đồng ý và lời dẫn tới khi đứng tự do trong Ngày (không thoại, không bảng). */
async function openDay(page: Page, query = '&day=d.g06.01') {
  await page.goto(`/?play=1${query}`);
  await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
  await freeInDay(page);
}
async function freeInDay(page: Page) {
  const t0 = Date.now();
  for (;;) {
    const s = await state(page);
    const ready = await page.evaluate(() => window.__game!.ready());
    if (ready && s.mode === 'day' && !s.ui.dialogue && !s.ui.panel && s.camera && !s.camera.locked) return s;
    if (Date.now() - t0 > 90_000) throw new Error(`không vào được Ngày: ${JSON.stringify(s)}`);
    // bot chỉ được bấm qua đồng ý/lời dẫn trước khi vào Ngày; trong Ngày không để bot đi
    if (s.mode !== 'day' || s.ui.dialogue) await page.evaluate(() => window.__game!.botStep({ name: 'Bot' }));
    await page.waitForTimeout(100);
  }
}
const cam = async (page: Page) => (await state(page)).camera!;
/** Chờ vài khung hình (Chrome headless vẽ bằng CPU nên chậm). */
const frames = (page: Page, n = 6) => page.evaluate((k) => new Promise<void>((r) => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

/** Lăn chuột qua CDP để gửi được cả ctrlKey (touchpad chụm) — page.mouse.wheel không gửi phím bổ trợ. */
async function wheel(cdp: CDPSession, x: number, y: number, deltaY: number, ctrl = false) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY, modifiers: ctrl ? 2 : 0 });
}
/** Ghi lại các sự kiện wheel có ctrlKey: game có chặn (preventDefault) không — nếu không, trang sẽ bị phóng to. */
const watchCtrlWheel = (page: Page) => page.evaluate(() => {
  const w = window as unknown as { __ctrlWheel: boolean[] };
  w.__ctrlWheel = [];
  window.addEventListener('wheel', (e) => { if (e.ctrlKey) w.__ctrlWheel.push(e.defaultPrevented); });
});
const ctrlWheelLog = (page: Page) => page.evaluate(() => (window as unknown as { __ctrlWheel: boolean[] }).__ctrlWheel);

test.use({ actionTimeout: 20_000, viewport: { width: 1280, height: 720 } });

test.describe('S2 Chặng 2 — kiểu điều khiển "Chuẩn" (chuột, touchpad)', () => {
  test('ca 4 (chốt 16/11): luôn camera "Chuẩn" — không có nút đổi camera, V và L không làm gì; bản lưu cũ đang ở A tải lên thành Chuẩn; không gửi kiểu camera đi', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    const batches = await captureCollect(page);
    await openDay(page);
    expect((await cam(page)).mode).toBe('standard');
    expect((await cam(page)).look).toBe('free');
    await expect(page.locator('[data-act="camera-mode"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="keys"]')).toContainText('Kéo chuột để xoay camera');
    await page.keyboard.press('KeyV');
    await page.keyboard.press('KeyL');
    await frames(page, 2);
    expect((await cam(page)).mode).toBe('standard');
    expect((await cam(page)).freeLook).toBe(false);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    await expect(page.locator('[data-act="menu-camera-mode"], [data-act="menu-free-look"]')).toHaveCount(0);
    await page.locator('[data-act="resume"]').click();

    // bản lưu cũ ở kiểu A + Nhìn tự do: tạo bằng bản test có ?camtest=1, rồi mở lại như người chơi thường
    await page.goto('/?play=1&camtest=1');
    await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
    await freeInDay(page);
    await page.keyboard.press('KeyV');
    await page.keyboard.press('KeyL');
    expect((await cam(page)).mode).toBe('A');
    expect((await cam(page)).freeLook).toBe(true);
    await page.waitForTimeout(800);                         // tự lưu chạy sau một nhịp
    await page.goto('/?play=1');
    await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
    await freeInDay(page);
    expect((await cam(page)).mode).toBe('standard');
    expect((await cam(page)).look).toBe('free');
    expect((await cam(page)).freeLook).toBe(false);

    await page.evaluate(() => window.__game!.flush());
    const json = JSON.stringify(batches);
    expect(json).not.toMatch(/camera_mode|"standard"|look_mode|pointer_type|device|free_look/i);
    expect(errors).toEqual([]);
  });

  test('ca 4b (bản test ?camtest=1 — code A/B còn giữ để bật lại sau): V xoay vòng Chuẩn → A → B → Chuẩn', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page, '&day=d.g06.01&camtest=1');
    const btn = page.locator('[data-act="camera-mode"]');
    await expect(btn).toContainText('Camera Chuẩn');
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('KeyV');
      await frames(page, 2);
      const c = await cam(page);
      seen.push(`${c.mode}/${c.look}/${(await btn.textContent())?.replace(/\s+/g, ' ').trim()}`);
    }
    expect(seen).toEqual(['A/drag/Camera A V', 'B/lock/Camera B V', 'standard/free/Camera Chuẩn V']);
    expect(errors).toEqual([]);
  });

  test('ca 5: kéo chuột trái xoay; bấm nhanh không xoay; kéo trên nút giao diện không xoay; lăn/chụm touchpad zoom trong giới hạn, trang không bị phóng', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page);
    const cdp = await page.context().newCDPSession(page);
    await watchCtrlWheel(page);
    // điểm trống trên màn hình: nửa phải, hơi cao (tránh nhân vật ở giữa và nút ở góc trên)
    const X = 1000, Y = 300;

    // bấm nhanh: không đổi góc
    let c0 = await cam(page);
    await page.mouse.click(X, Y);
    await frames(page);
    expect((await cam(page)).yaw).toBe(c0.yaw);

    // rung tay dưới ngưỡng (3 px) rồi thả: vẫn là bấm, không xoay
    await page.mouse.move(X, Y); await page.mouse.down();
    await page.mouse.move(X + 3, Y + 2, { steps: 3 });
    await page.mouse.up();
    await frames(page);
    expect((await cam(page)).yaw).toBe(c0.yaw);

    // kéo chuột trái: góc ngang đổi, không mở thoại/bảng
    await page.mouse.move(X, Y); await page.mouse.down();
    await page.mouse.move(X + 160, Y + 20, { steps: 12 });
    await page.mouse.up();
    await frames(page);
    let c1 = await cam(page);
    expect(Math.abs(c1.yaw - c0.yaw)).toBeGreaterThan(0.2);
    expect((await state(page)).ui.dialogue).toBeNull();

    // kéo chuột phải cũng xoay
    c0 = c1;
    await page.mouse.move(X, Y); await page.mouse.down({ button: 'right' });
    await page.mouse.move(X - 160, Y, { steps: 12 });
    await page.mouse.up({ button: 'right' });
    await frames(page);
    c1 = await cam(page);
    expect(Math.abs(c1.yaw - c0.yaw)).toBeGreaterThan(0.2);

    // kéo bắt đầu trên nút "Sổ tay": không xoay
    c0 = c1;
    const box = (await page.locator('[data-act="journal"]').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(box.x - 200, box.y + 200, { steps: 12 });
    await page.mouse.up();
    await frames(page);
    expect((await cam(page)).yaw).toBe(c0.yaw);
    if ((await state(page)).ui.panel) await page.keyboard.press('Escape');   // (nhả chuột ngoài nút thì không mở; phòng hờ)

    // lăn chuột: 1 nấc = 0,5 m; lăn mãi vẫn kẹp ở 8 m
    const d0 = (await cam(page)).distance;
    await wheel(cdp, X, Y, 100);
    await frames(page);
    expect((await cam(page)).distance).toBeCloseTo(Math.min(8, d0 + 0.5), 5);
    for (let i = 0; i < 12; i++) await wheel(cdp, X, Y, 100);
    await frames(page);
    expect((await cam(page)).distance).toBe(8);

    // chụm touchpad (wheel + ctrlKey, số nhỏ): phóng gần; kẹp ở 3,5 m; trình duyệt không được tự phóng trang
    for (let i = 0; i < 6; i++) await wheel(cdp, X, Y, -6, true);
    await frames(page);
    const d1 = (await cam(page)).distance;
    expect(d1).toBeLessThan(8);
    for (let i = 0; i < 16; i++) await wheel(cdp, X, Y, -40, true);   // mỗi sự kiện tối đa 1 nấc (0,5 m)
    await frames(page);
    expect((await cam(page)).distance).toBe(3.5);
    const log = await ctrlWheelLog(page);
    expect(log.length).toBeGreaterThan(0);
    expect(log.every(Boolean)).toBe(true);
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1);
    await page.screenshot({ path: `${SHOTS}/05-chuan-zoom-gan.png` });
    expect(errors).toEqual([]);
  });

  test('ca 12: touchpad mô phỏng — cuộn 2 ngón zoom từ từ, kéo một ngón (= chuột trái) xoay, không cần chuột phải', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page);
    const cdp = await page.context().newCDPSession(page);
    const X = 1000, Y = 300;

    // cuộn 2 ngón: nhiều sự kiện nhỏ (4 px), mỗi sự kiện chỉ đổi một chút
    const d0 = (await cam(page)).distance;
    await wheel(cdp, X, Y, 4);
    await frames(page);
    const step1 = (await cam(page)).distance - d0;
    expect(step1).toBeGreaterThan(0);
    expect(step1).toBeLessThan(0.1);
    for (let i = 0; i < 40; i++) await wheel(cdp, X, Y, 4);
    await frames(page);
    expect((await cam(page)).distance).toBeGreaterThan(d0 + 0.5);
    expect((await cam(page)).distance).toBeLessThanOrEqual(8);

    // kéo một ngón trên touchpad = giữ chuột trái và rê (CDP gửi đúng như touchpad: button left, không có chuột phải)
    const c0 = await cam(page);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: X, y: Y, button: 'left', buttons: 1, clickCount: 1 });
    for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: X - i * 12, y: Y + i * 3, button: 'left', buttons: 1 });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: X - 120, y: Y + 30, button: 'left', buttons: 0, clickCount: 1 });
    await frames(page);
    const c1 = await cam(page);
    expect(Math.abs(c1.yaw - c0.yaw)).toBeGreaterThan(0.2);
    expect(c1.pitch).toBeGreaterThanOrEqual(c0.pitch);
    expect((await state(page)).ui.dialogue).toBeNull();     // kéo xong không bị coi là bấm vào vật
    expect(errors).toEqual([]);
  });
});

// ---------------- cảm ứng (MÔ PHỎNG bằng Chrome: hasTouch + isMobile + CDP Input.dispatchTouchEvent) ----------------
type Pt = { x: number; y: number; id: number };
async function touch(cdp: CDPSession, type: 'touchStart' | 'touchMove' | 'touchEnd', points: Pt[]) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map((p) => ({ x: p.x, y: p.y, id: p.id, radiusX: 4, radiusY: 4, force: 1 })) });
}
const center = async (page: Page, sel: string) => { const b = (await page.locator(sel).boundingBox())!; return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
const pageStill = (page: Page) => page.evaluate(() => ({ scrollX: window.scrollX, scrollY: window.scrollY, scale: window.visualViewport?.scale ?? 1, docScroll: document.scrollingElement?.scrollTop ?? 0 }));

test.describe('S2 Chặng 2 — cảm ứng mô phỏng (điện thoại)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('ca 11a (dọc 390×844): nút tròn đi + kéo xoay CÙNG LÚC; chụm zoom; trang không cuộn/phóng; gợi ý theo cảm ứng', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page);
    const cdp = await page.context().newCDPSession(page);
    expect((await state(page)).device).toBe('touch');
    await expect(page.locator('[data-testid="stick"]')).toBeVisible();
    await expect(page.locator('[data-testid="keys"]')).toContainText('Kéo nút tròn để đi');
    await expect(page.locator('[data-act="camera-mode"]')).toHaveCount(0);          // V thu vào menu
    await page.screenshot({ path: `${SHOTS}/11-cam-ung-doc.png` });

    // ngón 1 giữ nút tròn (đẩy lên, chưa tới mép = đi bộ); ngón 2 kéo vùng trống bên phải
    const s0 = await state(page);
    const st = await center(page, '[data-testid="stick"]');
    const f1 = { id: 1, x: st.x, y: st.y };
    await touch(cdp, 'touchStart', [f1]);
    await touch(cdp, 'touchMove', [{ ...f1, y: st.y - 30 }]);
    const f2 = { id: 2, x: 300, y: 300 };
    await touch(cdp, 'touchStart', [{ ...f1, y: st.y - 30 }, f2]);
    for (let i = 1; i <= 10; i++) await touch(cdp, 'touchMove', [{ ...f1, y: st.y - 30 }, { ...f2, x: 300 - i * 15 }]);
    await page.waitForTimeout(1200);
    const mid = await state(page);
    await touch(cdp, 'touchEnd', [{ ...f1, y: st.y - 30 }]);                          // nhấc ngón 2
    await touch(cdp, 'touchEnd', []);                                                  // nhấc ngón 1
    await frames(page);
    const s1 = await state(page);
    expect(Math.hypot(mid.player!.x - s0.player!.x, mid.player!.z - s0.player!.z)).toBeGreaterThan(0.5);
    expect(Math.abs(mid.camera!.yaw - s0.camera!.yaw)).toBeGreaterThan(0.2);
    expect(mid.camera!.state).toBe('walk');
    expect(s1.camera!.state).toBe('idle');                                             // thả tay là dừng
    expect(s1.ui.dialogue).toBeNull();

    // kéo nút tròn ra sát mép = chạy
    await touch(cdp, 'touchStart', [{ id: 3, x: st.x, y: st.y }]);
    await touch(cdp, 'touchMove', [{ id: 3, x: st.x + 80, y: st.y }]);
    await page.waitForTimeout(500);
    expect((await state(page)).camera!.state).toBe('run');
    await touch(cdp, 'touchEnd', []);

    // chụm 2 ngón trên vùng trống: xa ra = phóng gần
    const d0 = (await cam(page)).distance;
    await touch(cdp, 'touchStart', [{ id: 4, x: 200, y: 400 }]);
    await touch(cdp, 'touchStart', [{ id: 4, x: 200, y: 400 }, { id: 5, x: 260, y: 400 }]);
    for (let i = 1; i <= 8; i++) await touch(cdp, 'touchMove', [{ id: 4, x: 200 - i * 10, y: 400 }, { id: 5, x: 260 + i * 10, y: 400 }]);
    await touch(cdp, 'touchEnd', [{ id: 4, x: 120, y: 400 }]);
    await touch(cdp, 'touchEnd', []);
    await frames(page);
    expect((await cam(page)).distance).toBeLessThan(d0);
    expect((await cam(page)).distance).toBeGreaterThanOrEqual(3.5);

    expect(await pageStill(page)).toEqual({ scrollX: 0, scrollY: 0, scale: 1, docScroll: 0 });
    expect(errors).toEqual([]);
  });

  test('ca 11b: thoại, lựa chọn, nút E, bước chụp ảnh hẹn giờ, Sổ tay, Menu, (không còn nút đổi camera) — chỉ bằng chạm', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page, '&day=d.g07.03&step=q_m1_main_05.s01');
    // đặt tình huống: đứng cạnh NPC_A (không phải hành động được kiểm)
    await page.evaluate(() => window.__game!.teleportTo('NPC_A'));
    const e = page.locator('[data-act="interact"]');
    await expect(e).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('[data-testid="prompt"]')).toHaveCount(0);               // gợi ý phím được thay bằng nút E
    await page.screenshot({ path: `${SHOTS}/11-nut-E.png` });
    await e.tap();
    await expect(page.locator('[data-testid="dialogue"]')).toBeVisible();
    await expect(page.locator('[data-testid="dialogue"] .next')).toHaveText('Chạm ▸');
    for (let i = 0; i < 10 && (await page.locator('[data-testid="dialogue"]').count()); i++) {
      await page.locator('[data-testid="dialogue"]').tap();
      await page.waitForTimeout(200);
    }
    const choice = page.locator('[data-act^="choice-"]').first();
    await expect(choice).toBeVisible({ timeout: 20_000 });
    await choice.tap();
    await expect.poll(async () => (await state(page)).step, { timeout: 20_000 }).toBe('q_m1_main_05.s03');

    // Sổ tay, Menu (thay J, Esc), đổi kiểu camera trong menu (thay V)
    await page.locator('[data-act="journal"]').tap();
    await expect(page.locator('[data-testid="panel-journal"]')).toBeVisible();
    await page.locator('[data-testid="panel-journal"] [data-act="close"]').tap();
    await page.locator('[data-act="menu"]').tap();
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/11-menu-doc.png` });
    await expect(page.locator('[data-act="menu-camera-mode"]')).toHaveCount(0);   // chốt 16/11: không đổi camera
    await page.locator('[data-act="resume"]').tap();
    await expect(page.locator('[data-testid="panel-menu"]')).toHaveCount(0);

    // đặt máy ảnh bằng nút E
    await page.evaluate(() => window.__game!.teleportTo('itr.thcs.tripod_spot'));
    await expect(e).toBeVisible({ timeout: 20_000 });
    await e.tap();
    await expect(page.locator('[data-act="photo-start"]')).toBeVisible({ timeout: 20_000 });
    await page.locator('[data-act="photo-start"]').tap();
    const pose = page.locator('[data-act="photo-pose"]');
    await expect(pose).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('[data-testid="stick"]')).toBeVisible();                 // hẹn giờ: vẫn đi được để chạy vào vòng sáng
    await pose.tap();
    await expect(page.locator('[data-act="photo-keep"]')).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: `${SHOTS}/11-anh-hen-gio.png` });
    await page.locator('[data-act="photo-keep"]').tap();
    await expect.poll(async () => (await state(page)).step, { timeout: 30_000 }).not.toBe('q_m1_main_05.s04');
    expect(await pageStill(page)).toEqual({ scrollX: 0, scrollY: 0, scale: 1, docScroll: 0 });
    expect(errors).toEqual([]);
  });

  test('ca 11c (ngang 844×390): nút tròn và nút giao diện không chồng nhau; đi + xoay được', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await openDay(page);
    const cdp = await page.context().newCDPSession(page);
    const stick = (await page.locator('[data-testid="stick"]').boundingBox())!;
    for (const sel of ['[data-act="journal"]', '[data-act="menu"]', '[data-testid="objective"]']) {
      const b = await page.locator(sel).boundingBox();
      if (!b) continue;
      const overlap = !(b.x > stick.x + stick.width || b.x + b.width < stick.x || b.y > stick.y + stick.height || b.y + b.height < stick.y);
      expect(overlap, `${sel} chồng lên nút tròn`).toBe(false);
    }
    expect(stick.y + stick.height).toBeLessThanOrEqual(390);
    await page.screenshot({ path: `${SHOTS}/11-cam-ung-ngang.png` });
    const s0 = await state(page);
    const st = { x: stick.x + stick.width / 2, y: stick.y + stick.height / 2 };
    await touch(cdp, 'touchStart', [{ id: 1, x: st.x, y: st.y }]);
    await touch(cdp, 'touchMove', [{ id: 1, x: st.x + 25, y: st.y - 25 }]);
    await touch(cdp, 'touchStart', [{ id: 1, x: st.x + 25, y: st.y - 25 }, { id: 2, x: 600, y: 150 }]);
    for (let i = 1; i <= 8; i++) await touch(cdp, 'touchMove', [{ id: 1, x: st.x + 25, y: st.y - 25 }, { id: 2, x: 600 + i * 15, y: 150 }]);
    await page.waitForTimeout(1000);
    await touch(cdp, 'touchEnd', []);
    const s1 = await state(page);
    expect(Math.hypot(s1.player!.x - s0.player!.x, s1.player!.z - s0.player!.z)).toBeGreaterThan(0.3);
    expect(Math.abs(s1.camera!.yaw - s0.camera!.yaw)).toBeGreaterThan(0.2);
    expect(await pageStill(page)).toEqual({ scrollX: 0, scrollY: 0, scale: 1, docScroll: 0 });
    expect(errors).toEqual([]);
  });
});

// ---------------- HOTFIX touchpad Windows: kéo xoay chắc chắn hơn + "Nhìn tự do" ----------------
// Touchpad thật trên Windows/Cốc Cốc KHÔNG chạy được ở đây: Chrome headless gửi chuột qua CDP (giống hệt cách touchpad
// "bấm-giữ-kéo" đến trình duyệt: pointerType=mouse, button 0). Khóa con trỏ được GIẢ LẬP (stub) để kiểm logic game,
// vì Chrome headless không khóa con trỏ thật — có 1 ca riêng ghi lại Chrome headless làm gì với yêu cầu khóa thật.
type DiagRow = { type: string; pointerId: number; buttons: number; captured: boolean; dragging: boolean; note: string; pointerType: string };
const diagRows = (page: Page) => page.evaluate(() => (window.__game as unknown as { inputDiagnostics?: { rows(): unknown[] } }).inputDiagnostics!.rows() as DiagRow[]);
const hasCapture = (page: Page, id: number) => page.evaluate((pid) => document.querySelector('#app canvas')!.hasPointerCapture(pid), id);

/** Giả lập khóa con trỏ: 'ok' = trình duyệt cho khóa, 'reject' = từ chối. `__userEsc()` = người chơi bấm Esc (trình duyệt tự thả). */
async function stubPointerLock(page: Page, outcome: 'ok' | 'reject') {
  await page.addInitScript((mode) => {
    let lockEl: Element | null = null;
    const w = window as unknown as { __lockCalls: number; __userEsc: () => void };
    w.__lockCalls = 0;
    Object.defineProperty(Document.prototype, 'pointerLockElement', { configurable: true, get: () => lockEl });
    HTMLCanvasElement.prototype.requestPointerLock = function (this: HTMLCanvasElement) {
      w.__lockCalls++;
      if (mode === 'reject') {
        setTimeout(() => document.dispatchEvent(new Event('pointerlockerror')), 0);
        return Promise.reject(new DOMException('denied', 'NotAllowedError'));
      }
      lockEl = this;
      setTimeout(() => document.dispatchEvent(new Event('pointerlockchange')), 0);
      return Promise.resolve();
    } as unknown as typeof HTMLCanvasElement.prototype.requestPointerLock;
    Document.prototype.exitPointerLock = function () { if (!lockEl) return; lockEl = null; setTimeout(() => document.dispatchEvent(new Event('pointerlockchange')), 0); };
    w.__userEsc = () => { lockEl = null; document.dispatchEvent(new Event('pointerlockchange')); };
  }, outcome);
}
const lockCalls = (page: Page) => page.evaluate(() => (window as unknown as { __lockCalls: number }).__lockCalls);

test.describe('HOTFIX touchpad — kéo xoay (Chuẩn) và Nhìn tự do (Nhìn tự do đang tắt, kiểm bằng ?camtest=1)', () => {
  const X = 1000, Y = 300;

  test('H1: kéo nút trái đổi cả yaw lẫn pitch; rê không bấm không xoay; kéo phải vẫn xoay; thả ra camera không bị đặt lại', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page);
    expect((await cam(page)).mode).toBe('standard');
    // rê không bấm (touchpad lướt một ngón)
    let c0 = await cam(page);
    await page.mouse.move(X, Y); await page.mouse.move(X + 200, Y + 80, { steps: 10 });
    await frames(page);
    expect((await cam(page)).yaw).toBe(c0.yaw);
    expect((await cam(page)).pitch).toBe(c0.pitch);
    // bấm-giữ-kéo trái: cả ngang lẫn dọc
    await page.mouse.move(X, Y); await page.mouse.down();
    await page.mouse.move(X + 150, Y + 60, { steps: 12 });
    await page.mouse.up();
    await frames(page);
    const c1 = await cam(page);
    expect(Math.abs(c1.yaw - c0.yaw)).toBeGreaterThan(0.2);
    expect(c1.pitch).not.toBe(c0.pitch);
    // không bị đặt lại sau khi thả
    await page.waitForTimeout(1000); await frames(page);
    expect((await cam(page)).yaw).toBeCloseTo(c1.yaw, 6);
    expect((await cam(page)).pitch).toBeCloseTo(c1.pitch, 6);
    // kéo phải
    c0 = c1;
    await page.mouse.move(X, Y); await page.mouse.down({ button: 'right' });
    await page.mouse.move(X - 150, Y, { steps: 12 });
    await page.mouse.up({ button: 'right' });
    await frames(page);
    expect(Math.abs((await cam(page)).yaw - c0.yaw)).toBeGreaterThan(0.2);
    expect(errors).toEqual([]);
  });

  test('H2: giữ con trỏ khi kéo (pointer capture) — kéo ra ngoài khung vẫn xoay, thả là trả lại; bảng chẩn đoán ghi đúng', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page, '&day=d.g06.01&inputdebug=1');
    await expect(page.locator('[data-testid="input-diagnostics"]')).toBeVisible();
    const cdp = await page.context().newCDPSession(page);
    const c0 = await cam(page);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: X, y: Y, button: 'left', buttons: 1, clickCount: 1 });
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: X + i * 10, y: Y, button: 'left', buttons: 1 });
    const down = (await diagRows(page)).find((r) => r.type === 'pointerdown')!;
    expect(down.note).toContain('bắt đầu theo dõi kéo');
    expect(await hasCapture(page, down.pointerId)).toBe(true);
    // ra ngoài khung hình (bên phải cửa sổ 1280 px)
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1270 + i * 20, y: Y, button: 'left', buttons: 1 });
    await frames(page);
    const mid = await cam(page);
    expect(Math.abs(mid.yaw - c0.yaw)).toBeGreaterThan(0.2);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1390, y: Y, button: 'left', buttons: 0, clickCount: 1 });
    await frames(page);
    expect(await hasCapture(page, down.pointerId)).toBe(false);
    const rows = await diagRows(page);
    expect(rows.some((r) => r.type === 'pointermove' && r.captured && r.note.includes('xoay'))).toBe(true);
    expect(rows.some((r) => r.type === 'pointerup' && r.note.includes('KÉO'))).toBe(true);
    // sao chép: có thông tin máy + nhật ký
    const text = await page.evaluate(() => (window.__game as unknown as { inputDiagnostics: { text(): string } }).inputDiagnostics.text());
    expect(text).toMatch(/ua: .*Chrome/);
    expect(text).toContain('kiểu camera đã lưu: standard');
    expect(text).toContain('pointerdown');
    await page.screenshot({ path: `${SHOTS}/H2-bang-chan-doan.png` });
    expect(errors).toEqual([]);
  });

  test('H3: pointercancel giữa lúc kéo → dừng xoay, không bị coi là bấm; buttons=0 không có pointerup → tự kết thúc', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page, '&day=d.g06.01&inputdebug=1');
    await page.mouse.move(X, Y); await page.mouse.down();
    await page.mouse.move(X + 60, Y, { steps: 6 });
    const id = (await diagRows(page)).find((r) => r.type === 'pointerdown')!.pointerId;
    await page.evaluate((pid) => window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: pid, pointerType: 'mouse', bubbles: true })), id);
    await frames(page);
    const c1 = await cam(page);
    await page.mouse.move(X + 260, Y, { steps: 10 });
    await frames(page);
    expect((await cam(page)).yaw).toBe(c1.yaw);                 // đã hủy: rê tiếp không xoay
    await page.mouse.up();
    expect(await hasCapture(page, id)).toBe(false);
    expect((await state(page)).ui.dialogue).toBeNull();

    // nhả nút mà trình duyệt "quên" gửi pointerup: sự kiện move kế tiếp báo buttons=0 → kết thúc kéo
    await page.mouse.move(X, Y); await page.mouse.down();
    await page.mouse.move(X + 60, Y, { steps: 6 });
    await page.evaluate(([pid, x, y]) => window.dispatchEvent(new PointerEvent('pointermove', { pointerId: pid, pointerType: 'mouse', buttons: 0, clientX: x, clientY: y, bubbles: true })), [id, X + 70, Y]);
    const c2 = await cam(page);
    await page.evaluate(([pid, x, y]) => window.dispatchEvent(new PointerEvent('pointermove', { pointerId: pid, pointerType: 'mouse', buttons: 0, clientX: x, clientY: y, bubbles: true })), [id, X + 300, Y]);
    await frames(page);
    expect((await cam(page)).yaw).toBe(c2.yaw);
    expect((await diagRows(page)).some((r) => r.note.includes('buttons=0'))).toBe(true);
    await page.mouse.up();
    expect(errors).toEqual([]);
  });

  test('H4: giữ W đi trong lúc kéo xoay — cả hai cùng chạy', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page);
    const s0 = await state(page);
    await page.keyboard.down('KeyW');
    await page.mouse.move(X, Y); await page.mouse.down();
    await page.mouse.move(X + 160, Y, { steps: 16 });
    await page.waitForTimeout(600);
    const mid = await state(page);
    await page.mouse.up();
    await page.keyboard.up('KeyW');
    expect(mid.camera!.state).toBe('walk');
    expect(Math.hypot(mid.player!.x - s0.player!.x, mid.player!.z - s0.player!.z)).toBeGreaterThan(0.3);
    expect(Math.abs(mid.camera!.yaw - s0.camera!.yaw)).toBeGreaterThan(0.2);
    expect(errors).toEqual([]);
  });

  test('H5: Nhìn tự do (khóa con trỏ GIẢ LẬP thành công) — L bật, bấm để khóa, rê không bấm là xoay + W đi; Esc thả, KHÔNG tự khóa lại; thoại thả con trỏ', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await stubPointerLock(page, 'ok');
    await openDay(page, '&day=d.g07.03&step=q_m1_main_05.s01&camtest=1');
    await page.keyboard.press('KeyL');
    expect((await cam(page)).freeLook).toBe(true);
    expect((await cam(page)).mode).toBe('standard');            // kiểu camera không đổi
    await expect(page.locator('[data-testid="keys"]')).toContainText('Bấm vào màn hình để nhìn tự do');
    expect(await lockCalls(page)).toBe(0);                      // bật thôi chưa khóa
    await page.mouse.click(X, Y);
    await expect.poll(async () => (await cam(page)).pointerLocked).toBe(true);
    await expect(page.locator('[data-testid="keys"]')).toContainText('Rê touchpad/chuột để nhìn');
    expect((await state(page)).ui.dialogue).toBeNull();         // bấm để khóa không bị coi là tương tác
    // rê không bấm + giữ W cùng lúc
    const s0 = await state(page);
    await page.keyboard.down('KeyW');
    await page.mouse.move(X + 120, Y + 30, { steps: 10 });
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyW');
    await frames(page);
    const s1 = await state(page);
    expect(Math.abs(s1.camera!.yaw - s0.camera!.yaw)).toBeGreaterThan(0.2);
    expect(Math.hypot(s1.player!.x - s0.player!.x, s1.player!.z - s0.player!.z)).toBeGreaterThan(0.3);
    // người chơi bấm Esc: trình duyệt thả con trỏ → menu mở
    await page.evaluate(() => (window as unknown as { __userEsc: () => void }).__userEsc());
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    expect((await cam(page)).pointerLocked).toBe(false);
    await expect(page.locator('[data-act="menu-free-look"]')).toContainText('BẬT');
    await page.locator('[data-act="resume"]').click();
    const calls = await lockCalls(page);
    await page.keyboard.press('KeyW'); await page.keyboard.press('KeyA');
    await frames(page);
    expect(await lockCalls(page)).toBe(calls);                  // không tự khóa lại khi bấm phím
    expect((await cam(page)).pointerLocked).toBe(false);
    // bấm vào màn hình thì khóa lại
    await page.mouse.click(X, Y);
    await expect.poll(async () => (await cam(page)).pointerLocked).toBe(true);
    // có thoại → game thả con trỏ; xong thoại không tự khóa lại
    await page.evaluate(() => window.__game!.teleportTo('NPC_A'));
    await page.keyboard.press('KeyE');
    await expect(page.locator('[data-testid="dialogue"]')).toBeVisible();
    await expect.poll(async () => (await cam(page)).pointerLocked).toBe(false);
    const calls2 = await lockCalls(page);
    for (let i = 0; i < 10 && (await page.locator('[data-testid="dialogue"]').count()); i++) { await page.keyboard.press('Space'); await page.waitForTimeout(150); }
    await expect(page.locator('[data-act^="choice-"]').first()).toBeVisible({ timeout: 20_000 });
    await page.keyboard.press('Digit1');
    await expect.poll(async () => (await state(page)).step, { timeout: 20_000 }).toBe('q_m1_main_05.s03');
    await freeInDay(page);
    await page.keyboard.press('KeyW');
    expect(await lockCalls(page)).toBe(calls2);                 // xong thoại: không tự khóa lại
    expect((await cam(page)).pointerLocked).toBe(false);
    // tắt bằng nút trong Menu
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    await page.locator('[data-act="menu-free-look"]').click();
    expect((await cam(page)).freeLook).toBe(false);
    expect(errors).toEqual([]);
  });

  test('H6: Nhìn tự do bị trình duyệt TỪ CHỐI (giả lập) → báo cho người chơi, không thử lại tự động, kéo để xoay vẫn chạy', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await stubPointerLock(page, 'reject');
    await openDay(page, '&day=d.g06.01&camtest=1');
    await page.keyboard.press('KeyL');
    await page.mouse.click(X, Y);
    await expect(page.locator('.hud-zone, [data-testid="toast"]').filter({ hasText: 'không cho khóa chuột' })).toBeVisible({ timeout: 10_000 });
    expect((await cam(page)).pointerLocked).toBe(false);
    expect(await lockCalls(page)).toBe(1);
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(300);
    expect(await lockCalls(page)).toBe(1);
    const c0 = await cam(page);
    await page.mouse.move(X, Y); await page.mouse.down();
    await page.mouse.move(X + 160, Y, { steps: 12 });
    await page.mouse.up();
    await frames(page);
    expect(Math.abs((await cam(page)).yaw - c0.yaw)).toBeGreaterThan(0.2);
    expect(errors).toEqual([]);
  });

  test('H7: Chrome headless với khóa con trỏ THẬT (không giả lập): hoặc khóa được, hoặc báo lỗi — không im lặng', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openDay(page, '&day=d.g06.01&camtest=1');
    await page.keyboard.press('KeyL');
    await page.mouse.click(X, Y);
    await page.waitForTimeout(1500);
    const locked = (await cam(page)).pointerLocked;
    const toast = (await state(page) as unknown as { toast: string | null }).toast ?? '';
    test.info().annotations.push({ type: 'pointer-lock-headless', description: locked ? 'khóa được' : `không khóa được; thông báo: ${toast}` });
    expect(locked || toast.includes('không cho khóa chuột')).toBe(true);
    expect(errors).toEqual([]);
  });
});
