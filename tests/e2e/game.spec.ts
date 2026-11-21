/**
 * Bot chơi phần khung trên trình duyệt thật (Chrome headless): Hub 2026 → Ngày ký ức → Hub → Album → điện thoại.
 * Bot bấm nút thật (data-act) và gõ phím thật; chỉ "đi tắt" ở việc di chuyển trên bản đồ.
 * Ảnh chụp các điểm chính lưu ở shots/game/ (không commit).
 */
import { expect, test, type Page, type Route } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { validateBatch, FORBIDDEN_PROP_KEYS, type CollectBatch } from '../../shared/events';
import { RELEASES } from '../../src/content/release';

/** Các Ngày của bản thử, đúng thứ tự chơi (nguồn: src/content/release.ts). */
const DAYS = RELEASES.test.memory_day_ids;
const allDays = (state: string, except: Record<string, string> = {}) => Object.fromEntries(DAYS.map((d) => [d, except[d] ?? state]));

const SHOTS = 'shots/game';
mkdirSync(SHOTS, { recursive: true });

type GameState = {
  flow: string; mode: string | null; day: string | null; replay: boolean; phase: string; step: string | null; active: string[];
  days: Record<string, string>; quests: Record<string, string>; artifacts: Record<string, string>; pages: Record<string, string>;
  flags: Record<string, unknown>; tone_counts: Record<string, Record<string, number>>; phone: Record<string, number>; pde_done: string[];
  public_demo_done: boolean; gender: string; name_length: number; cast: Record<string, string>; attempt_id: string;
  player: { x: number; z: number } | null;
  ui: { panel: string | null; dialogue: string | null; who: string | null; objective: string | null; feedback: boolean; prompt: string | null };
};
type BotOpts = { name?: string; gender?: 'male' | 'female'; optional?: boolean };

const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
};

/** Có Firestore Emulator (FIRESTORE_EMULATOR_HOST) → test "bot chơi hết" gửi qua /api/collect thật và đọc lại dữ liệu đã ghi. */
const EMULATOR = !!process.env.FIRESTORE_EMULATOR_HOST;

/**
 * Giữ lại mọi lô event trình duyệt gửi đi để kiểm.
 * Mặc định đứng thay server (trả lời như /api/collect). `real` = cho đi tiếp tới /api/collect thật rồi ghi lại câu trả lời.
 */
async function captureCollect(page: Page, real = false) {
  const batches: CollectBatch[] = [];
  const replies: { ok?: boolean; accepted?: number; dropped?: unknown[]; duplicate?: boolean }[] = [];
  await page.route('**/api/collect', async (route: Route) => {
    const body = route.request().postDataJSON() as CollectBatch;
    batches.push(body);
    if (real) {
      const res = await route.fetch();
      replies.push(await res.json().catch(() => ({ ok: false })));
      await route.fulfill({ response: res });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, accepted: body.events?.length ?? 0, dropped: [] }) });
    }
  });
  return Object.assign(batches, { replies });
}

async function openGame(page: Page, query = '') {
  await page.goto(`/?play=1${query}`);
  await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 60_000 });
}
const state = (page: Page) => page.evaluate(() => window.__game!.state() as unknown as GameState);
const step = (page: Page, opts: BotOpts) => page.evaluate((o) => window.__game!.botStep(o), opts);

/** Cho bot chơi tới khi `until` đúng. Trả về nhật ký nhãn. */
async function drive(page: Page, opts: BotOpts, until: (label: string, s: GameState) => boolean, hooks: { each?: (label: string, s: GameState) => Promise<void> | void; maxMs?: number } = {}) {
  const log: string[] = [];
  const t0 = Date.now();
  for (;;) {
    const label = await step(page, opts);
    const s = await state(page);
    if (label !== 'wait' && label !== log[log.length - 1]) log.push(label);
    await hooks.each?.(label, s);
    if (until(label, s)) return log;
    if (Date.now() - t0 > (hooks.maxMs ?? 150_000)) throw new Error(`bot kẹt. Nhật ký: ${log.join(' → ')}\nTrạng thái: ${JSON.stringify(s)}`);
    await page.waitForTimeout(70);
  }
}

test.use({ actionTimeout: 20_000 });

test.describe('phần khung game', () => {
  test('bot chơi hết bản thử: mở đầu → các Ngày của bản thử → Album → điện thoại → màn kết; event đúng và không lọt tên', async ({ page }) => {
    test.setTimeout(480_000);
    const NAME = 'Bảo Ngọc';
    const errors = collectErrors(page);
    const batches = await captureCollect(page, EMULATOR);
    await page.setViewportSize({ width: 960, height: 540 });
    await openGame(page);

    const shot = new Set<string>();
    const snap = async (name: string) => { if (shot.has(name)) return; shot.add(name); await page.screenshot({ path: `${SHOTS}/${String(shot.size).padStart(2, '0')}-${name}.png` }); };
    const lines: string[] = [];
    let onScreen: string[] = [];
    const visible = (id: string) => onScreen.includes(id);

    const log = await drive(page, { name: NAME, gender: 'female' }, (label) => label === 'feedback', {
      each: async (_label, s) => {
        if (s.ui.dialogue && lines[lines.length - 1] !== s.ui.dialogue) lines.push(s.ui.dialogue);
        onScreen = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-testid]')].map((e) => e.dataset.testid ?? ''));
        if (visible('profile')) await snap('hub-nhap-ten');
        else if (visible('panel-box')) await snap(s.days['d.g06.01'] === 'completed' ? 'hub-hop-ky-vat-ngay-2' : 'hub-hop-ky-vat');
        else if (visible('photo-countdown')) await snap('ngay-anh-hen-gio');
        else if (visible('photo-preview')) await snap('ngay-anh-xem-truoc');
        else if (visible('day-end')) await snap(`ket-ngay-${Object.values(s.days).filter((x) => x === 'completed').length}`);
        else if (visible('notice')) await snap(`hub-thong-bao-${s.pde_done.length}`);
        else if (visible('draft')) await snap('dien-thoai-soan-tin');
        else if (visible('feedback')) await snap('man-ket-form');
        else if (s.mode === 'day' && s.ui.dialogue) await snap(`ngay-thoai-${s.day}`);
        else if (s.mode === 'day' && s.ui.prompt) await snap(`ngay-goi-y-${s.day}`);
      },
      maxMs: 400_000,
    });
    console.log('nhật ký bot:', log.join(' → '));

    // ---- tiến trình ----
    const s = await state(page);
    expect(s.days).toEqual(allDays('completed'));
    expect(Object.keys(s.artifacts)).toHaveLength(DAYS.length);          // mỗi Ngày đúng một kỷ vật dẫn vào
    expect(new Set(Object.values(s.artifacts))).toEqual(new Set(['on_shelf']));
    for (const d of DAYS) {
      expect(['restored', 'enriched', 'complete'], `trang ${d}`).toContain(s.pages[`page.${d}`]);
      expect(s.quests[`q_m1_daily_01@${d}`], `daily ${d}`).toBe('completed');   // Daily: 1 lần mỗi Ngày, khóa theo Ngày
    }
    expect(s.quests['q_m1_side_01']).toBe('completed');                 // Side làm xong mà không chặn Main
    expect(s.quests['q_hub_pd_03']).toBe('completed');
    expect(s.phone['thread.old_group']).toBe(1);                         // đã gửi 1 tin
    expect(s.public_demo_done).toBe(true);
    expect(s.gender).toBe('female');
    expect(s.name_length).toBe(Array.from(NAME).length);
    expect(log).toContain('photo-pose');
    expect(log).toContain('phone-send');

    // ---- hội thoại: tên có dấu + biến thể nam/nữ (F5) ----
    const all = lines.join('\n');
    expect(all).toContain(NAME);
    expect(all).toContain('Mới quen một bữa mà bà mày tao rồi hả?');   // d_g06_01: {g:ông|bà}, Player nữ
    expect(all).not.toContain('Mới quen một bữa mà ông mày tao rồi hả?');
    expect(all).not.toMatch(/\{player_name\}|\{g:/);
    // dòng có điều kiện (when + fallback): nội dung thật Trang 1–4 chưa dùng; cơ chế kiểm ở tests/unit/dialogue.test.ts

    // ---- Album trong phòng (F6) ----
    await expect(page.locator('[data-testid="feedback"]')).toHaveCount(0);   // bot đã bấm "Bỏ qua" ở form
    await page.evaluate(() => window.__game!.hubClick('itr.hub.album'));
    await expect(page.locator('[data-testid="panel-album"]')).toBeVisible();
    await expect(page.locator('[data-testid="album-progress"]')).toHaveText(`${DAYS.length}/${DAYS.length} trang`);
    for (const d of DAYS) await expect(page.locator(`[data-page="page.${d}"] [data-testid="album-photo"]`).first(), `ảnh trang ${d}`).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.g-cover img')).toBeVisible();
    // ghi chú hiện trong Album (nội dung thật Trang 1–4 không có ghi chú mang tên Player; tên Player đã kiểm ở hội thoại phía trên)
    await expect(page.locator('[data-page="page.d.g06.01"]')).toContainText('bắt đầu từ một mẩu giấy mật lệnh');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/90-album.png` });
    await page.locator('[data-act="flip-page.d.g07.03"]').click();
    await expect(page.locator('[data-testid="photo-back"]')).toBeVisible();
    await page.locator('[data-act="close"]').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}/91-hub-sau-2-ngay.png` });

    // ---- analytics (F8) ----
    await page.evaluate(() => window.__game!.flush());
    await page.waitForTimeout(300);
    const dropped = batches.flatMap((b) => validateBatch(b).dropped);
    expect(dropped).toEqual([]);                                          // server sẽ nhận hết, không bỏ event nào
    const events = batches.flatMap((b) => b.events);
    const names = events.map((e) => e.name);
    for (const n of ['game_load_started', 'game_ready', 'game_started', 'appearance_selected', 'artifact_opened', 'page_started', 'page_completed',
      'quest_started', 'quest_step_completed', 'quest_completed', 'choice_made', 'photo_attempt', 'photo_kept', 'zone_entered',
      'album_page_restored', 'album_viewed', 'photo_back_viewed', 'pd_quest_step', 'public_demo_completed', 'feedback_shown', 'feedback_skipped']) {
      expect(names, `thiếu event ${n}`).toContain(n);
    }
    expect(names.indexOf('public_demo_completed')).toBeLessThan(names.indexOf('feedback_shown'));   // ghi hoàn thành TRƯỚC form
    expect(names.filter((n) => n === 'public_demo_completed')).toHaveLength(1);
    for (const e of events.filter((x) => /^(quest_|memory_day_)/.test(x.name) || x.name === 'artifact_opened')) expect(typeof e.props?.is_replay, e.name).toBe('boolean');
    for (const e of events.filter((x) => x.name.startsWith('memory_day_'))) {
      expect(e.props?.milestone_id).toBe('m1');
      expect(String(e.props?.memory_day_id)).toMatch(/^d\.g0[67]\.\d\d$/);
      expect(String(e.props?.chapter_label)).toContain('Mốc');
    }
    expect(events.filter((e) => e.name === 'page_completed').map((e) => e.props?.page_id)).toEqual(DAYS);
    expect(events.find((e) => e.name === 'appearance_selected')?.props).toEqual({ gender: 'female' });
    const wire = JSON.stringify(batches);
    expect(wire).not.toContain(NAME);
    expect(wire).not.toContain('Bảo'); expect(wire).not.toContain('Ngọc');
    for (const t of ['Nhớ hồi tụi mình mới đủ năm đứa', 'cuốn sổ luật Căn cứ', 'được dời, không được hủy']) expect(wire).not.toContain(t);   // nội dung tin nhắn (3 câu mở lời, hub.ts)
    expect(wire).not.toContain('bắt đầu từ một mẩu giấy mật lệnh');       // nội dung ghi chú (frag.d.g06.01.02)
    expect(wire).not.toContain('chapter_id');
    for (const e of events) for (const k of Object.keys(e.props ?? {})) expect(FORBIDDEN_PROP_KEYS.has(k.toLowerCase()), `khóa cấm ${k}`).toBe(false);
    expect(new Set(events.map((e) => e.attempt_id))).toEqual(new Set([s.attempt_id]));
    expect(new Set(events.map((e) => e.visitor_id)).size).toBe(1);        // kể cả event xếp hàng trước khi hỏi đồng ý
    expect(new Set(events.map((e) => e.session_id)).size).toBe(1);

    // ---- đường ống thật: /api/collect → Firestore Emulator (chỉ khi có emulator) ----
    if (EMULATOR) {
      const { getDb, COLLECTIONS } = await import('../../api/_lib/firestore');
      expect(batches.replies.every((r) => r.ok === true && (r.dropped ?? []).length === 0), JSON.stringify(batches.replies)).toBe(true);
      const stored: string[] = [];
      for (const b of batches) {
        const snap = await getDb().collection(COLLECTIONS.batches).doc(b.batch_id).get();
        expect(snap.exists, `lô ${b.batch_id} chưa có trong Firestore`).toBe(true);
        const doc = snap.data()!;
        expect(doc.environment).toBe('test');                              // server tự gắn
        expect(doc.release_stage).toBe('prototype');
        stored.push(...(doc.events as { name: string }[]).map((e) => e.name));
        const text = JSON.stringify(doc);
        expect(text).not.toContain(NAME);
        expect(text).not.toContain('Nhớ hồi tụi mình mới đủ năm đứa');
        expect(text).not.toMatch(/player_name|"email"|"ip"/);
      }
      expect(stored).toEqual(names);                                       // Firestore có đủ đúng những event trình duyệt đã gửi
      console.log(`Firestore Emulator: ${batches.length} lô, ${stored.length} event, đủ ${new Set(stored).size} loại`);
    }

    // tên chỉ nằm trong file lưu trên máy
    expect(await page.evaluate(() => localStorage.getItem('htx.save') ?? '')).toContain(NAME);
    writeFileSync(`${SHOTS}/events.json`, JSON.stringify(names, null, 1));
    expect(errors).toEqual([]);
  });

  test('tải lại trang giữa một bước → quay về đúng checkpoint (F2)', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openGame(page);
    // tới giữa đoạn thoại của bước Main đầu tiên (bước chưa xong)
    await drive(page, { name: 'Lê Thị Út', gender: 'male', optional: false }, (_l, s) => s.day === 'd.g06.01' && s.step === 'q_m1_main_01.s01' && !!s.ui.dialogue);
    await page.reload();
    await page.waitForFunction(() => window.__game?.ready() === true, null, { timeout: 60_000 });
    let s = await state(page);
    expect(s).toMatchObject({ mode: 'day', day: 'd.g06.01', step: 'q_m1_main_01.s01', name_length: 9, gender: 'male' });
    expect(s.ui.dialogue).toBeNull();                                      // bước dở phải làm lại từ đầu bước, không tự chạy tiếp

    // làm xong bước 1 → checkpoint mới ở bước 2
    await drive(page, { optional: false }, (_l, x) => x.step === 'q_m1_main_01.s02' && !x.ui.dialogue);
    const before = await state(page);
    await page.reload();
    await page.waitForFunction(() => window.__game?.ready() === true, null, { timeout: 60_000 });
    s = await state(page);
    expect(s).toMatchObject({ mode: 'day', day: 'd.g06.01', step: 'q_m1_main_01.s02', attempt_id: before.attempt_id });
    expect(s.quests).toEqual(before.quests);
    expect(s.ui.objective).toContain('Xuống sân đá cầu');                 // mục tiêu của q_m1_main_01.s02

    // chơi tiếp được tới hết Ngày và về phòng
    await drive(page, { optional: false }, (_l, x) => x.mode === 'hub' && x.days['d.g06.01'] === 'completed' && x.artifacts['art_m1_01'] === 'on_shelf');
    expect((await state(page)).quests['q_m1_side_01']).toBe('missed');    // Side bỏ qua → missed, không chặn Main
    expect(errors).toEqual([]);
  });

  test('?day=&step= nhảy đúng bước; ?cast=B đổi bảng vai mà không sửa nội dung (F9)', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    const batches = await captureCollect(page);
    await openGame(page, '&day=d.g07.03&step=q_m1_main_05.s03&cast=B&gender=female');
    await drive(page, {}, (_l, s) => s.mode === 'day');
    const s = await state(page);
    expect(s).toMatchObject({ day: 'd.g07.03', step: 'q_m1_main_05.s03', gender: 'female' });
    expect(s.days).toEqual(allDays('completed', { 'd.g07.03': 'in_progress' }));   // các Ngày trước coi như đã xong
    expect(s.artifacts['art_m1_01']).toBe('on_shelf');
    expect(s.cast).toEqual({ NPC_A: 'chr_ha', NPC_B: 'chr_quan', NPC_C: 'chr_duc', NPC_D: 'chr_chau' });
    await page.evaluate(() => window.__game!.teleportTo('NPC_A'));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SHOTS}/80-nhay-buoc-cast-B.png` });
    // nhảy bước không được sinh event đo lường giả cho đoạn bị bỏ qua
    await page.evaluate(() => window.__game!.flush());
    const names = batches.flatMap((b) => b.events).map((e) => e.name);
    expect(names).not.toContain('page_completed');
    expect(names).not.toContain('quest_completed');
    expect(errors).toEqual([]);
  });

  test('từ chối thu thập: vẫn chơi được, không gửi gì, không ghi ID xuống máy', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    const batches = await captureCollect(page);
    await openGame(page);
    await expect(page.locator('[data-testid="consent"]')).toBeVisible({ timeout: 30_000 });
    await page.locator('[data-act="consent-no"]').click();
    await drive(page, { name: 'An', optional: false }, (_l, s) => s.day === 'd.g06.01' && s.step === 'q_m1_main_01.s02');
    expect(batches).toHaveLength(0);
    const stored = await page.evaluate(() => ({ visitor: localStorage.getItem('htx.visitor_id'), queue: localStorage.getItem('htx.queue'), consent: localStorage.getItem('htx.consent') }));
    expect(stored).toEqual({ visitor: null, queue: null, consent: 'denied' });
    expect(errors).toEqual([]);
  });

  test('chuột và bàn phím thật: đứng cạnh Hộp Kỷ Vật, bấm chuột mở hộp và chọn mật lệnh, giữ W để đi, Esc mở menu', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await openGame(page);
    // qua lời dẫn + nhập tên, dừng khi tới bước "mở Hộp Kỷ Vật"
    await drive(page, { name: 'Tí', optional: false }, (_l, s) => s.mode === 'hub' && s.active.includes('q_hub_pd_01.s02') && !s.ui.dialogue && s.name_length > 0);
    // đứng cạnh hộp (đường đi tới hộp bằng phím W: tests/e2e/hub.spec.ts), rê chuột lên hộp → gợi ý, bấm → mở
    await page.evaluate(() => window.__game!.hubTeleport(-1.9, -0.9, 0.75));
    await page.mouse.move(640, 700);                                          // rê chuột xuống → cúi nhìn hộp dưới chân
    await expect.poll(() => page.evaluate(() => window.__game!.hubPoint('itr.hub.memory_box'))).not.toBeNull();
    await expect(page.locator('[data-testid="prompt"]')).toContainText('Hộp Kỷ Vật');
    await page.screenshot({ path: `${SHOTS}/70-hub-re-chuot.png` });
    await page.mouse.click(640, 700);                                         // bấm chuột = tương tác với vật đang gợi ý
    await expect(page.locator('[data-testid="panel-box3d"]')).toBeVisible();
    await drive(page, {}, (_l, s) => !s.ui.dialogue);                         // câu "lục đồ" khi mở hộp
    await expect.poll(() => page.evaluate(() => (window.__game!.hubView() as { boxBlend: number }).boxBlend)).toBe(1);
    const items = await page.evaluate(() => (window.__game!.hubView() as { items: { id: string; state: string; clickable: boolean }[] }).items);
    expect(items.find((i) => i.id === 'art_m1_01')).toMatchObject({ state: 'glow', clickable: true });
    expect(items.find((i) => i.id === 'art_m1_05')).toMatchObject({ state: 'dim', clickable: false });   // kỷ vật tương lai chưa mở được
    await page.screenshot({ path: `${SHOTS}/71-hub-hop-ky-vat.png` });
    const art = await page.evaluate(() => window.__game!.hubPoint('art_m1_01'));
    await page.mouse.click(art!.x, art!.y);
    await page.waitForFunction(() => (window.__game!.state() as { mode: string }).mode === 'day' && window.__game!.ready(), null, { timeout: 60_000 });

    // Giữ W tới khi đi được hơn 0,5 m. Không chờ cứng 1,2 giây: ngay sau khi vào Trang, Chrome headless (vẽ bằng CPU)
    // khựng còn 1–3 khung/giây — đo được cả trên bản gốc d5531b2 — nên 1,2 giây có lúc chỉ đi được 0,3 m.
    const a = (await state(page)).player!;
    await page.keyboard.down('KeyW');
    await expect.poll(async () => { const b = (await state(page)).player!; return Math.hypot(b.x - a.x, b.z - a.z); }, { timeout: 10_000 }).toBeGreaterThan(0.5);
    await page.keyboard.up('KeyW');

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toBeVisible();
    await expect(page.locator('[data-act="restart-day"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="panel-menu"]')).toHaveCount(0);
    await page.keyboard.press('KeyJ');
    await expect(page.locator('[data-testid="panel-journal"]')).toContainText('Xem bảng phân công trực nhật');   // Side q_m1_side_01
    await page.keyboard.press('KeyJ');

    // menu "Chơi lại Ngày từ đầu": làm xong bước 1 rồi quay lại bước 1
    await drive(page, { optional: false }, (_l, s) => s.step === 'q_m1_main_01.s02' && !s.ui.dialogue);
    await page.keyboard.press('Escape');
    await page.locator('[data-act="restart-day"]').click();
    await expect.poll(async () => (await state(page)).step).toBe('q_m1_main_01.s01');
    expect((await state(page)).days['d.g06.01']).toBe('in_progress');

    // menu "Xóa tiến trình" (bấm 2 lần) → tiến trình mới, tên cũ không còn trong máy
    const attempt = (await state(page)).attempt_id;
    await page.keyboard.press('Escape');
    await page.locator('[data-act="wipe"]').click();
    await expect(page.locator('[data-act="wipe"]')).toContainText('Bấm lần nữa');
    await page.locator('[data-act="wipe"]').click();
    await page.waitForFunction((old) => { const g = window.__game; return !!g && (g.state() as { attempt_id: string }).attempt_id !== old; }, attempt, { timeout: 60_000 });
    const fresh = await state(page);
    expect(fresh.days).toEqual({});
    expect(fresh.name_length).toBe(0);
    expect(errors).toEqual([]);
  });

  test('Hub → Ngày → Hub 3 vòng: không rò bộ nhớ rõ rệt (F3)', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectErrors(page);
    await captureCollect(page);
    await openGame(page, '&day=d.g07.03&step=q_m1_main_05.s05');
    await drive(page, { optional: false }, (_l, s) => s.mode === 'hub' && s.days['d.g07.03'] === 'completed' && s.ui.feedback);
    await page.locator('[data-act="feedback-skip"]').click();

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('HeapProfiler.enable');
    const measure = async () => {
      await cdp.send('HeapProfiler.collectGarbage');
      await page.waitForTimeout(250);
      await cdp.send('HeapProfiler.collectGarbage');
      const heap = (await cdp.send('Runtime.getHeapUsage')).usedSize / 1048576;
      const st = await page.evaluate(() => window.__game!.stats());
      return { heapMB: Math.round(heap * 10) / 10, geometries: st.geometries, textures: st.textures, drawCalls: st.drawCalls };
    };
    const hubIdle = () => page.waitForFunction(() => { const s = window.__game!.state() as { mode: string; flow: string }; return s.mode === 'hub' && s.flow === 'hub_idle' && window.__game!.ready(); }, null, { timeout: 60_000 });
    const rows: Record<string, unknown>[] = [{ at: 'hub (trước)', ...(await measure()) }];
    const arts = ['art_m1_01', 'art_m1_05', 'art_m1_01', 'art_m1_05'];
    for (let i = 0; i < arts.length; i++) {
      await hubIdle();
      await page.evaluate(() => window.__game!.hubClick('itr.hub.shelf'));          // chơi lại từ kệ
      await page.locator(`[data-act="open-${arts[i]}"]`).click();
      await page.waitForFunction(() => { const s = window.__game!.state() as { mode: string; replay: boolean }; return s.mode === 'day' && s.replay && window.__game!.ready(); }, null, { timeout: 60_000 });
      await page.waitForTimeout(500);
      const inDay = await measure();
      await page.keyboard.press('Escape');
      await page.locator('[data-act="leave-day"]').click();
      await hubIdle();
      await page.waitForTimeout(300);
      rows.push({ at: `vòng ${i + 1}: trong Ngày`, ...inDay }, { at: `vòng ${i + 1}: về Hub`, ...(await measure()) });
    }
    console.table(rows);
    writeFileSync(`${SHOTS}/memory.json`, JSON.stringify(rows, null, 1));
    const hubRows = rows.filter((r) => String(r.at).includes('về Hub')) as { heapMB: number; geometries: number; textures: number }[];
    // vòng 1 còn "làm nóng" (cache vật liệu, mã JIT); so vòng 2 với vòng cuối
    expect(hubRows[3].geometries).toBeLessThanOrEqual(hubRows[1].geometries);
    expect(hubRows[3].textures).toBeLessThanOrEqual(hubRows[1].textures);
    expect(hubRows[3].heapMB - hubRows[1].heapMB).toBeLessThan(6);
    // chơi lại không đổi câu chuyện
    const s = await state(page);
    expect(s.days).toEqual(allDays('completed'));
    expect(errors).toEqual([]);
  });
});
