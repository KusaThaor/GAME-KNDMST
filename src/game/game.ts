/**
 * Điều phối phần chơi (F3 + F7): nối engine (logic thuần) với cảnh 3D và giao diện.
 * Luồng: Boot → Hub(intro|idle) → chuyển cảnh → Ngày ký ức → kết Ngày → chuyển cảnh → Hub.
 * Hub và Ngày là 2 scene riêng; mỗi Ngày nạp 1 bản đồ + 1 biến thể; rời scene nào thì giải phóng scene đó.
 */
import { CAMERA_MODES, CAMERA_OPTIONS, DEFAULT_CAMERA_MODE, isCameraMode, isControl, nextCameraMode } from '../config/camera';
import { GAME_CONFIG } from '../config/game';
import { ALBUM_CONFIG } from '../config/album';
import { HUB_CONFIG, fillCaroScore } from '../config/hub';
import { HUB_BOX_HINTS, HUB_BOX_LINES, HUB_DECOR } from '../config/hubRoom';
import { CRITERIA_LABELS, PHOTO_CONFIG, photoQuality } from '../config/photo';
import { attachAnalytics } from '../analytics/bridge';
import { ActivePlaytime } from '../analytics/heartbeat';
import { Tracker } from '../analytics/tracker';
import { indexContent, type ContentIndex, type StepRef } from '../content/indexContent';
import { CONTENT, contentConfig } from '../content/pack';
import type { AlbumEntry, DialogueLine, Gender, MemoryDay, Step } from '../content/types';
import { formatReport, validateContent } from '../content/validate';
import { EventBus, type PhotoCriteria } from '../core/eventBus';
import { IdbPhotoStore } from '../core/photoStoreIdb';
import { MemoryPhotoStore, SaveStore, attachAutosave, reconcileSave, recordMg, sanitizePlayerName, type PhotoStore, type SaveState } from '../core/save';
import { AlbumModel, autoPhotoKey } from '../systems/album';
import { formatText, resolveLines, speakerName } from '../systems/dialogue';
import { GameFlow } from '../systems/gameFlow';
import { HubModel, type PdePresentation } from '../systems/hub';
import { QuestEngine } from '../systems/questEngine';
import { ReleaseTracker } from '../systems/release';
import { ART_STYLES } from '../render/style';
import { mountGameUi } from '../ui/game/GameUi';
import { createUiStore, type AlbumView, type BoxView, type PhoneView, type UiActions, type UiState, type UiStore } from '../ui/game/store';
import { formatProblems } from '../world/validate';
import { MinigameHost } from './minigames/host';
import { getMinigame } from './minigames/registry';
import { createInput, type GameInput } from './input';
import { buildDayScene, type DayControl, type DayScene } from './scenes/dayScene';
import { buildHubScene, type BoxItemView, type HubPlayer, type HubScene } from './scenes/hubScene';
import { playTransitionSound } from './sfx';
import { createGameView, type GameView } from './view';

/** Móc gắn hiệu ứng chuyển cảnh sau này (kỷ vật phóng to, âm thanh đặc trưng của Ngày…). Mặc định: mờ dần + âm thanh. */
export type TransitionHook = (kind: 'to_day' | 'to_hub', info: { day?: MemoryDay }) => void | Promise<void>;
const transitionHooks: TransitionHook[] = [];
export function registerTransitionFx(hook: TransitionHook) { transitionHooks.push(hook); }

/** Thứ công cụ test (bot, nhảy bước) được phép chạm vào. Không dùng ở production. */
export interface GameHandle {
  idx: ContentIndex; save: SaveState; bus: EventBus; engine: QuestEngine; album: AlbumModel; hub: HubModel; flow: GameFlow;
  ui: UiStore; actions: UiActions; view: GameView; photos: PhotoStore; tracker: Tracker; input: GameInput;
  day(): { scene: DayScene; def: MemoryDay } | null;
  /** Vị trí một vật của phòng 2026 (hoặc một món trong Hộp Kỷ Vật đang mở) trên trang (px) — để test bấm chuột thật. */
  hubPoint(id: string): { x: number; y: number } | null;
  /** Phòng 2026 lúc này: người chơi đứng đâu, nhìn đâu, vật nào trong tầm, hộp mở chưa, các món trong hộp. */
  hubView(): { player: HubPlayer; nearest: string | null; boxOpen: boolean; boxBlend: number; items: (BoxItemView & { clickable: boolean })[] } | null;
  /** Đặt người chơi ở phòng 2026 tới (x, z) — công cụ test. */
  hubTeleport(x: number, z: number, yaw?: number): boolean;
  /** Vật/món mà game "thấy" dưới điểm (px) trên trang — công cụ test. */
  hubPick(px: number, py: number): string | null;
  store: SaveStore;
}

const CANCEL = Symbol('cancel');
const PRESENT = new Set<Step['kind']>(['cutscene', 'choice', 'photo', 'minigame', 'free', 'album_restore']);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Ảnh cầm tay chụp nhiều lần rồi chọn 1 (N-14 · kịch bản Trang 1 cảnh B Bước 2: "Có ba lần chụp… chọn một tấm để giữ").
 * Bước ảnh khai `shots` thì dùng `shots`; chưa khai thì lấy mặc định theo máy ảnh ở đây (tới khi dữ liệu Trang có `shots: 3` — N-01).
 * `first_line`: câu sau lần chụp đầu (nguyên văn kịch bản; NPC_B = Châu theo cast A).
 */
const MULTI_SHOT: Record<string, { shots: number; first_line?: DialogueLine }> = {
  'cam.d0601.grocery': { shots: 3, first_line: { speaker: 'NPC_B', text: 'Khoan! Đức, tóc ông dựng kìa!' } },
};
/** Máy quay ngược nên khung lệch: [ngửa lên, xoay ngang] (độ) cho từng lần — lần 1 chỉ thấy trán, lần 2 lệch nhẹ, lần 3 đúng khung. */
const SELFIE_AIM: [number, number][] = [[14, 9], [5, -4], [0, 0]];
function photoShots(s: Extract<Step, { kind: 'photo' }>): number {
  if (s.mode !== 'handheld') return 1;
  const n = Math.floor(s.shots ?? MULTI_SHOT[s.camera_id]?.shots ?? 1);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

export interface RunOptions {
  /** Công cụ test sửa file lưu trước khi engine nạp (nhảy tới bước). */
  prepareSave?: (save: SaveState, idx: ContentIndex) => void;
  castName?: string;
  /** Phong cách hình ảnh của bản đồ (khóa trong ART_STYLES). Mặc định: DEFAULT_ART_STYLE. */
  artStyle?: string;
}

export async function runGame(container: HTMLElement, opts: RunOptions = {}): Promise<GameHandle> {
  const t0 = performance.now();
  const idx = indexContent(CONTENT, contentConfig(__APP_ENV__, opts.castName));
  const report = validateContent(CONTENT, idx.config);
  if (report.errors.length) console.error(`[content] gói nội dung có lỗi:\n${formatReport(report)}`);

  const store = new SaveStore(window.localStorage);
  const loaded = store.load();
  const save = reconcileSave(loaded.save, idx);
  opts.prepareSave?.(save, idx);
  let photos: PhotoStore;
  try { photos = 'indexedDB' in window ? new IdbPhotoStore() : new MemoryPhotoStore(); } catch { photos = new MemoryPhotoStore(); }

  const bus = new EventBus();
  const tracker = new Tracker({ releaseStage: GAME_CONFIG.release_stage });
  attachAnalytics({ bus, idx, save, tracker });
  attachAutosave(bus, store, () => save);
  const engine = new QuestEngine({ idx, save, bus });
  const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
  const hub = new HubModel({ idx, save, bus, engine, album, config: HUB_CONFIG });
  new ReleaseTracker({ idx, save, bus });
  const flow = new GameFlow(bus);
  tracker.track('game_load_started');

  const view = createGameView(container);
  const uiEl = document.createElement('div');
  container.appendChild(uiEl);
  const ui = createUiStore();
  const input = createInput(container);
  // Bản lưu có giá trị lạ (hỏng/bản cũ hơn) → về kiểu mặc định. Bản lưu cũ có 'A'/'B' giữ nguyên lựa chọn.
  // Đổi kiểu camera / Nhìn tự do: tắt theo quyết định 16/11 (CAMERA_OPTIONS). Bản test bật tạm bằng ?camtest=1.
  const camTest = __DEV_TOOLS__ && new URLSearchParams(location.search).get('camtest') === '1';
  const camOpts = { modeSwitch: CAMERA_OPTIONS.allow_mode_switch || camTest, freeLook: CAMERA_OPTIONS.allow_free_look || camTest };
  // Không cho đổi kiểu → luôn "Chuẩn" (kể cả bản lưu cũ đang ở A/B). Bản lưu có giá trị lạ → mặc định.
  if (!camOpts.modeSwitch || !isCameraMode(save.settings?.camera_mode)) save.settings = { ...save.settings, camera_mode: DEFAULT_CAMERA_MODE };
  if (!camOpts.freeLook && save.settings.free_look) save.settings = { ...save.settings, free_look: false };
  const style = ART_STYLES[opts.artStyle ?? ''];        // undefined → phong cách mặc định
  const profile = () => ({ player_name: save.player_name, gender: save.appearance.gender });
  // {quan}–{duc} (tin Rộn ràng, B9b) = tỉ số caro.series hiện hành, mặc định 3–3 — việc treo từ N-14, sau N-08.
  const fmt = (text: string) => fillCaroScore(formatText(text, profile()), HUB_CONFIG, save.caro.series);
  const introId = idx.pack.hub.intro_quest_id;
  const introDone = () => save.quests[introId]?.state === 'completed';

  let hubScene: HubScene | null = null;
  let dayScene: DayScene | null = null;
  let currentDay: MemoryDay | null = null;
  let epoch = 0;
  const presented = new Set<string>();
  const tickers = new Set<(dt: number) => void>();
  const waiters = new Map<string, (v: unknown) => void>();
  const photoUrls = new Map<string, string>();
  const flipped = new Set<string>();
  let phoneThread: string | null = null, phoneDraft: string | null = null;
  let promptId: string | null = null;
  let photoPosed = false;
  // phòng 2026: con trỏ chuột (nhìn theo), vật dưới con trỏ trong tầm với, đang trình diễn một món trong hộp,
  // đã nói câu "mở hộp" trong lượt về phòng này chưa
  let hubCursor: { x: number; y: number } | null = null;
  let hubMouseHover: string | null = null;
  let boxBusy = false;
  let boxLinesSaid = false;
  let photoPicked = 0;

  // ---------- hàng đợi trình diễn: mọi thoại/ảnh/thông báo chạy lần lượt ----------
  let chain: Promise<void> = Promise.resolve();
  const enqueue = (fn: () => Promise<void>) => { chain = chain.then(fn).catch((e) => console.error('[game]', e)); return chain; };
  const wait = <T>(slot: string) => new Promise<T | typeof CANCEL>((resolve) => waiters.set(slot, resolve as (v: unknown) => void));
  const signal = (slot: string, value: unknown = true) => { const w = waiters.get(slot); if (w) { waiters.delete(slot); w(value); } };
  const cancelAll = () => {
    epoch++;
    ui.get().minigame?.dispose();
    for (const [slot, w] of [...waiters]) { waiters.delete(slot); w(CANCEL); }
    tickers.clear(); presented.clear();
    ui.set({ dialogue: null, choice: null, photo: null, minigame: null, free: null, notice: null, endPrompt: null, profile: false });
    dayScene?.setStandZone(null); dayScene?.setPlayerMotion(null); dayScene?.lockCamera(null);
  };

  const locked = () => {
    const s = ui.get();
    return !!(s.fade.on || s.dialogue || s.choice || s.profile || s.endPrompt || s.dayEnd || s.minigame || s.notice || s.panel || s.feedback || s.consentAsk
      || (s.photo && (s.photo.phase !== 'countdown' || s.photo.posed)));
  };

  // ---------- thoại, lựa chọn, thông báo ----------
  async function playLines(lines: DialogueLine[]): Promise<boolean> {
    const ep = epoch;
    for (const l of resolveLines(lines, engine.conditions)) {
      const chr = idx.resolveActor(l.speaker);
      ui.set({ dialogue: { who: speakerName(l.speaker, idx, profile()), color: chr?.ui_color ?? '#3a2c26', text: fmt(l.text) } });
      if ((await wait('next')) === CANCEL || ep !== epoch) return false;
    }
    ui.set({ dialogue: null });
    return true;
  }
  async function notice(title: string, text: string, effect = 'plain'): Promise<boolean> {
    const ep = epoch;
    ui.set({ notice: { title, text, effect } });
    const r = await wait('next');
    if (r === CANCEL || ep !== epoch) return false;
    ui.set({ notice: null });
    return true;
  }

  async function presentStep(ref: StepRef): Promise<void> {
    const ep = epoch, s = ref.step;
    const alive = () => ep === epoch;
    if (s.kind === 'cutscene') {
      const weatherShot = dayScene?.lockWeatherCamera(s.id);
      if (!(await playLines(s.lines))) return; // cancelAll đã nhả camera
      if (weatherShot) dayScene?.lockCamera(null);
      if (ref.quest.id === introId && !save.profile_done) {
        ui.set({ profile: true });
        if ((await wait('profile')) === CANCEL || !alive()) return;
      }
      engine.complete(s.id);
    } else if (s.kind === 'choice') {
      const p = s.prompt ? resolveLines([s.prompt], engine.conditions)[0] : undefined;
      ui.set({ choice: { who: p ? speakerName(p.speaker, idx, profile()) : '', prompt: p ? fmt(p.text) : null, options: s.options.map((o) => ({ id: o.id, text: fmt(o.text), tone: o.tone ? GAME_CONFIG.tone_labels[o.tone] : null })) } });
      const pick = await wait<string>('choice');
      if (pick === CANCEL || !alive()) return;
      ui.set({ choice: null });
      engine.complete(s.id, { option_id: pick });
    } else if (s.kind === 'photo') {
      await runPhoto(s, alive);
    } else if (s.kind === 'minigame') {
      if (s.lines?.length && !(await playLines(s.lines))) return; // thoại của bước phát trước khi mở trò (chơi thật hay "Bỏ qua" đều nghe) [N-01]
      const mg = { game_id: s.game, context: 'story' as const, page_id: engine.dayId, opponent_id: s.opponent ?? null, difficulty: null };
      const prefix = `mg.${s.game}.`;
      const host = new MinigameHost(getMinigame(s.game), save.minigames_story[s.game] !== undefined, {
        opponentId: mg.opponent_id, difficulty: mg.difficulty,
        save: {
          get(key) {
            const raw = save.flags[prefix + 'data.' + key];
            return typeof raw === 'string' ? JSON.parse(raw) : undefined;
          },
          set(key, value) {
            const name = prefix + 'data.' + key;
            const json = JSON.stringify(value);
            if (json === undefined) delete save.flags[name];
            else save.flags[name] = json;
            bus.emit('save_requested', { reason: 'minigame_data' });
          },
        },
      }, {
        changed: () => ui.set({ minigame: host }),
        started: () => bus.emit('minigame_started', mg),
        finished(round, duration_s) {
          recordMg(save, s.game, round, mg.opponent_id, mg.context);
          bus.emit('minigame_finished', { ...mg, duration_s, result: round.result,
            stars: round.stars ?? null, hints_used: round.hints_used ?? null, score: round.score ?? null });
          bus.emit('save_requested', { reason: 'minigame_result' });
        },
        next: () => signal('minigame'),
      });
      const done = wait('minigame');
      ui.set({ minigame: host });
      if ((await done) === CANCEL || !alive()) return;
      ui.set({ minigame: null });
      engine.complete(s.id);
    } else if (s.kind === 'free') {
      ui.set({ free: { text: fmt(s.prompt ?? 'Dạo quanh một chút rồi đi tiếp.') } });
      if ((await wait('free')) === CANCEL || !alive()) return;
      ui.set({ free: null });
      engine.complete(s.id);
    } else if (s.kind === 'album_restore') {
      if (!(await notice('Album', 'Một trang Album hiện rõ trở lại.', 'album_restore'))) return;
      engine.complete(s.id);
    }
  }

  /** Trình diễn mọi bước đang chờ thuộc loại "tự hiện" cho tới khi hết. */
  async function drain(): Promise<void> {
    for (;;) {
      refreshHud();
      const next = engine.activeSteps().find((r) => PRESENT.has(r.step.kind) && !presented.has(r.step.id));
      if (!next) return;
      presented.add(next.step.id);
      await presentStep(next);
    }
  }

  // ---------- ảnh ----------
  async function runPhoto(s: Extract<Step, { kind: 'photo' }>, alive: () => boolean): Promise<void> {
    const scene = dayScene, day = currentDay;
    const point = day?.cameras.find((c) => c.id === s.camera_id);
    if (!scene || !point) { engine.complete(s.id); return; }
    const cam = scene.cameraFor(point);
    if (!cam) { engine.complete(s.id); return; }        // bản đồ thiếu marker máy ảnh: không chặn quest
    const spot = scene.standSpot(s.stand_zone);
    const base = { mode: s.mode, url: null, marks: [], score: 0, display: PHOTO_CONFIG.quality_display, posed: false } as const;
    const marksOf = (c: PhotoCriteria) => (Object.keys(CRITERIA_LABELS) as (keyof PhotoCriteria)[]).map((k) => ({ label: CRITERIA_LABELS[k], ok: c[k] }));
    // Chụp nhiều lần (N-14): mỗi lần lệch khung theo SELFIE_AIM, xong cả loạt thì người chơi chọn 1 tấm.
    const total = photoShots(s);
    const firstLine = total > 1 ? MULTI_SHOT[s.camera_id]?.first_line : undefined;
    const aimed = (n: number) => {
      const [pitch, yaw] = SELFIE_AIM[n] ?? [0, 0];
      if (total === 1 || (!pitch && !yaw)) return cam;
      const c = cam.clone();
      c.rotateY((yaw * Math.PI) / 180); c.rotateX((pitch * Math.PI) / 180); c.updateMatrixWorld(true);
      return c;
    };
    for (let retry = 0; ; retry++) {
      const takes: { blob: Blob; criteria: PhotoCriteria }[] = [];
      for (let n = 0; n < total; n++) {
        photoPosed = false;
        const shotNo = total > 1 ? { shot: { index: n + 1, total } } : {};
        if (s.mode !== 'auto') {
          scene.setStandZone(spot);
          scene.lockCamera(point);                          // khung ngắm: nhìn qua máy ảnh đặt sẵn
          ui.set({ photo: { ...base, ...shotNo, marks: [], phase: 'ready', seconds: s.mode === 'timer' ? PHOTO_CONFIG.timer_seconds : 0 } });
          const started = await wait('photo_start');
          scene.lockCamera(null);                           // hẹn giờ: về góc thứ ba để chạy vào vòng sáng
          if (started === CANCEL || !alive()) return;
          if (s.mode === 'timer') {
            let left = PHOTO_CONFIG.timer_seconds;
            ui.set({ photo: { ...base, marks: [], phase: 'countdown', seconds: left } });
            const done = wait('photo_shutter');
            const tick = (dt: number) => {
              const before = Math.ceil(left); left -= dt;
              const cur = ui.get().photo;
              if (cur && (Math.ceil(left) !== before || cur.posed !== photoPosed)) ui.set({ photo: { ...cur, seconds: left, posed: photoPosed } });
              if (left <= 0) { tickers.delete(tick); signal('photo_shutter'); }
            };
            tickers.add(tick);
            if ((await done) === CANCEL || !alive()) return;
          }
        }
        const shotCam = aimed(n);
        const criteria: PhotoCriteria = {
          all_in_frame: scene.allInFrame(shotCam, s.subjects),
          player_in_zone: spot ? Math.hypot(scene.playerPosition.x - spot.center[0], scene.playerPosition.z - spot.center[1]) <= spot.radius : true,
          posed_in_time: s.mode === 'timer' ? photoPosed : true,
        };
        scene.setGizmosVisible(false);
        const shot = view.capture(scene.scene, shotCam, PHOTO_CONFIG.jpeg);
        scene.setGizmosVisible(true);
        const blob = await shot;
        if (!alive()) return;
        bus.emit('photo_attempt', { step_id: s.id, mode: s.mode, retry_index: retry, ...criteria });
        takes.push({ blob, criteria });
        if (n === 0 && retry === 0 && firstLine) {         // lần 1 lệch khung → câu của Châu (chỉ ở lượt chụp đầu)
          ui.set({ photo: null });
          if (!(await playLines([firstLine]))) return;
        }
      }
      let pick = 0;
      if (s.mode !== 'auto' && total === 1) {
        const { criteria, blob } = takes[0];
        const q = photoQuality(criteria, PHOTO_CONFIG);
        const url = URL.createObjectURL(blob);
        ui.set({ photo: { ...base, phase: 'preview', seconds: 0, url, score: q.score, display: q.display, marks: marksOf(criteria) } });
        const decide = await wait<'keep' | 'retry'>('photo_decide');
        URL.revokeObjectURL(url);
        if (decide === CANCEL || !alive()) return;
        if (decide === 'retry') { scene.setPlayerMotion(null); continue; }
      } else if (total > 1) {
        // Màn chọn 1 tấm: mặc định chọn tấm cuối (đúng khung nhất); bấm tấm khác (hoặc phím 1–n) rồi "Giữ ảnh này".
        const urls = takes.map((t) => URL.createObjectURL(t.blob));
        photoPicked = total - 1;
        ui.set({ photo: { ...base, marks: [], phase: 'pick', seconds: 0, picked: photoPicked,
          picks: takes.map((t, i) => ({ url: urls[i], marks: marksOf(t.criteria), score: photoQuality(t.criteria, PHOTO_CONFIG).score })) } });
        const decide = await wait<'keep' | 'retry'>('photo_decide');
        urls.forEach((u) => URL.revokeObjectURL(u));
        if (decide === CANCEL || !alive()) return;
        if (decide === 'retry') { scene.setPlayerMotion(null); continue; }
        pick = Math.min(Math.max(0, photoPicked), total - 1);
      }
      // "Giữ ảnh này": hoàn thành bước — chất lượng ảnh không chặn quest.
      const keys = takes.map(() => `ph_${crypto.randomUUID()}`);
      await Promise.all(takes.map((t, i) => photos.put(keys[i], t.blob).catch(() => undefined)));
      const removed = total > 1 ? album.keepShots(s.album_entry_id, keys, pick).removed : [album.addVariant(s.album_entry_id, keys[0]).removed];
      for (const k of removed) if (k) void photos.delete(k).catch(() => undefined);
      const oldUrl = photoUrls.get(s.album_entry_id);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      photoUrls.delete(s.album_entry_id);
      bus.emit('photo_kept', { step_id: s.id, mode: s.mode, retry_index: retry, ...takes[pick].criteria });
      ui.set({ photo: null });
      engine.complete(s.id);          // ảnh tự chụp dự phòng được chụp trong lúc này (nhân vật còn đang tạo dáng)
      scene.setStandZone(null); scene.setPlayerMotion(null);
      return;
    }
  }

  // Máy ảnh ảo tự chụp ở khoảnh khắc chốt (nguồn B / ảnh dự phòng).
  bus.on('step_completed', (e) => {
    const scene = dayScene, day = currentDay;
    if (!scene || !day) return;
    for (const entry of idx.pack.album_entries) {
      if (entry.snapshot?.at_step_id !== e.step_id) continue;
      const point = day.cameras.find((c) => c.id === entry.snapshot!.camera_id);
      const cam = point && scene.cameraFor(point);
      if (!cam) continue;
      scene.setGizmosVisible(false);
      const shot = view.capture(scene.scene, cam, PHOTO_CONFIG.jpeg);
      scene.setGizmosVisible(true);
      void shot.then((blob) => photos.put(autoPhotoKey(entry.id), blob)).then(() => { photoUrls.delete(entry.id); }).catch(() => undefined);
    }
  });

  /** Ảnh của một ô. Nếu trong máy không còn ảnh nào (IndexedDB bị xóa) → dựng lại cảnh và chụp lại ảnh tự chụp. */
  async function photoUrl(entry: AlbumEntry): Promise<string | null> {
    const cached = photoUrls.get(entry.id);
    if (cached) return cached;
    let data = (await album.resolvePhoto(entry.id, photos))?.data ?? null;
    if (!data && entry.snapshot) {
      const day = idx.dayOfPage(entry.page_id);
      const point = day?.cameras.find((c) => c.id === entry.snapshot!.camera_id);
      if (day && point) {
        const tmp = await buildDayScene(day, idx, save.appearance.gender, { style, flag: n => engine.flag(n), stepId: entry.snapshot.at_step_id });
        const cam = tmp.cameraFor(point);
        if (cam) {
          tmp.update(0, 0, { move: null, look: null }); tmp.setGizmosVisible(false);
          data = await view.capture(tmp.scene, cam, PHOTO_CONFIG.jpeg);
          await photos.put(autoPhotoKey(entry.id), data).catch(() => undefined);
        }
        tmp.dispose();
      }
    }
    if (!data) return null;
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data as BlobPart], { type: 'image/jpeg' }));
    photoUrls.set(entry.id, url);
    return url;
  }

  // ---------- HUD ----------
  function refreshHud() {
    const steps = engine.activeSteps();
    const main = engine.mainStep() ?? steps[0];
    ui.set({
      objective: main?.step.objective ? fmt(main.step.objective) : main ? fmt(main.quest.title) : null,
      quests: engine.optionalQuests().map((q) => ({ title: fmt(q.quest.title), type: q.quest.type, state: q.state })),
      canEndDay: engine.phase === 'free_after_main',
    });
    dayScene?.setHighlights(engine.targetsOfInterest());
  }

  // ---------- chuyển cảnh ----------
  async function fadeTo(label: string, kind: 'to_day' | 'to_hub', day?: MemoryDay) {
    ui.set({ fade: { on: true, label }, prompt: null });
    playTransitionSound(kind);
    await Promise.all([sleep(480), ...transitionHooks.map((h) => h(kind, { day }))]);
  }
  function teardown() {
    view.setScene(null, null);
    hubScene?.dispose(); hubScene = null;
    dayScene?.dispose(); dayScene = null; currentDay = null;
    for (const u of photoUrls.values()) URL.revokeObjectURL(u);
    photoUrls.clear();
  }
  function refreshHubScene() {
    if (!hubScene) return;
    hubScene.setLighting(hub.lightingPreset());
    hubScene.setShelf(hub.shelf());
    hubScene.setBoxItems(boxItems());
  }

  // ---------- Hộp Kỷ Vật (cận cảnh 3D) ----------
  /** Lần đầu = kỷ vật của Trang đầu tiên đang sáng (chưa chơi Trang 1): chỉ món đó bấm được. */
  const firstArtifactId = () => idx.artifactOfDay(idx.releaseDays[0]?.id ?? '')?.id ?? null;
  const boxFirstTime = () => { const id = firstArtifactId(); return !!id && hub.canOpen(id) === 'first'; };
  /** Các món đang nằm trong hộp: kỷ vật chưa lên kệ (theo thứ tự Trang) + đồ linh tinh. */
  function boxItems(): (BoxItemView & { clickable: boolean; name: string })[] {
    const first = boxFirstTime();
    const arts = hub.compartments().filter((c) => c.open).flatMap((c) => c.artifacts)
      .filter((x) => x.state === 'glowing' || x.state === 'dim')
      .map(({ artifact, state }) => ({
        id: artifact.id, kind: 'artifact' as const, shape: artifact.shape ?? 'box', name: fmt(artifact.name),
        state: state === 'glowing' ? 'glow' as const : 'dim' as const,
        clickable: state === 'glowing' || !first,                       // lần đầu: món mờ không bấm được
      }));
    const decor = HUB_DECOR.map((d) => ({ id: d.id, kind: 'decor' as const, shape: d.shape, name: d.name, state: 'normal' as const, clickable: !first }));
    return [...arts, ...decor];
  }
  function refreshBox() {
    if (ui.get().panel !== 'box3d') return;
    const first = boxFirstTime();
    ui.set({ boxView: { hint: first ? HUB_BOX_HINTS.first : HUB_BOX_HINTS.normal, hover: ui.get().boxView?.hover ?? null, first } });
  }
  /** Nói vài câu khi đang nhìn vào hộp (không chuyển cảnh). */
  async function sayBox(lines: DialogueLine[]): Promise<boolean> {
    boxBusy = true;
    try { return await playLines(lines); } finally { boxBusy = false; }
  }

  async function goHub() {
    cancelAll();
    await fadeTo('Năm 2026', 'to_hub');
    teardown();
    const first = !save.quests[introId];
    engine.enterHub();
    hub.refresh();
    input.setLookMode('drag');                           // phòng 2026: nhìn theo con trỏ (không kéo, không khóa chuột)
    hubCursor = null; hubMouseHover = null; boxBusy = false; boxLinesSaid = false;
    hubScene = buildHubScene(idx.pack.hub, HUB_CONFIG);
    refreshHubScene();
    view.setScene(hubScene.scene, hubScene.camera);
    ui.set({ mode: 'hub', inReplay: false, canEndDay: false, panel: null, dayEnd: null, fade: { on: false, label: '' } });
    bus.emit('hub_entered', { first });
    if (flow.state === 'to_hub') flow.dispatch('scene_ready');
    void enqueue(hubSettle);
  }

  /** Việc ở Hub sau mỗi thay đổi: trình diễn bước đang chờ → chạy Present-day Event → màn kết bản thử (nếu tới). */
  async function hubSettle(): Promise<void> {
    if (engine.context?.kind !== 'hub') return;
    const ep = epoch;
    for (let i = 0; i < 6; i++) {
      await drain();
      if (ep !== epoch) return;
      if (flow.state === 'hub_intro' && introDone()) flow.dispatch('intro_done');
      hub.refresh();
      const shown = hub.runPdes();
      if (!shown.length) break;
      refreshHubScene();
      for (const p of shown) { if (!(await presentPde(p)) || ep !== epoch) return; }
    }
    refreshHubScene(); refreshPanels(); refreshHud();
    if (save.public_demo_done && !save.flags['hub.demo_end_seen']) {
      // Hoàn thành đã được ghi (public_demo_completed) TRƯỚC khi màn kết và form hiện ra.
      ui.set({ panel: null });
      if (!(await playLines(idx.pack.hub.demo_end_lines)) || ep !== epoch) return;
      save.flags['hub.demo_end_seen'] = true;
      bus.emit('save_requested', { reason: 'demo_end_seen' });
      ui.set({ feedback: true });
      bus.emit('feedback_shown', { placement: 'demo_end' });
    }
  }

  function presentPde(p: PdePresentation): Promise<boolean> {
    switch (p.kind) {
      case 'album_restore': return notice('Album', `Trang "${fmt(idx.dayOfPage(p.page_id)?.title ?? p.page_id)}" hiện rõ trở lại.`, 'album_restore');
      case 'shelf': return notice('Kệ', `${fmt(idx.artifacts.get(p.artifact_id)?.name ?? p.artifact_id)} được đặt lên kệ.`);
      case 'fragment': return (async () => (await notice('Hộp Kỷ Vật', 'Một mảnh ký ức mới hiện ra trong Hộp.')) && playLines(p.recall))();
      case 'contact': return notice('Điện thoại', fmt(idx.quests.get(p.quest_id)?.title ?? 'Có một việc mới ở điện thoại.'));
      case 'reply': return notice('Điện thoại', 'Có tin nhắn mới.');
    }
  }

  async function goDay(dayId: string, replay: boolean, resume: boolean) {
    const day = idx.days.get(dayId);
    if (!day) return;
    cancelAll();
    await fadeTo(fmt(day.title), 'to_day', day);
    teardown();
    if (!resume) { engine.startDay(dayId, { replay }); save.current.zone_id = null; }
    const ep = epoch;
    const scene = await buildDayScene(day, idx, save.appearance.gender, {
      style, flag: n => engine.flag(n), bus, stepId: engine.mainStep()?.step.id, startZone: resume ? save.current.zone_id : null,
    });
    if (ep !== epoch) { scene.dispose(); return; }       // người chơi đã rời đi trong lúc tải
    currentDay = day; dayScene = scene;
    if (scene.problems.length) console.warn(`[world] ${day.map_id}:\n${formatProblems(scene.problems)}`);
    view.setScene(scene.scene, scene.camera);
    input.setLookMode(CAMERA_MODES[save.settings.camera_mode].look);
    // Tên khu hiện thoáng khi bước vào; `zone_entered` ghi một lần cho mỗi khu trong một lượt vào Ngày.
    const zoneName = (id: string | null) => idx.pack.maps.find((m) => m.id === day.map_id)?.zones.find((z) => z.zone_id === id)?.name ?? null;
    const seenZones = new Set<string>();
    const enterZone = (id: string, record: boolean) => {
      save.current.zone_id = id;
      toast(zoneName(id));
      if (record && !seenZones.has(id)) bus.emit('zone_entered', { memory_day_id: day.id, zone_id: id });
      seenZones.add(id);
    };
    scene.onZoneChange = (to) => { enterZone(to, true); bus.emit('save_requested', { reason: 'zone' }); };
    ui.set({ mode: 'day', inReplay: replay, panel: null, cameraMode: save.settings.camera_mode, fade: { on: false, label: '' } });
    if (scene.zone) enterZone(scene.zone, !resume);
    if (scene.placeholder) toast('[Bản đồ chưa tải được — đang dùng mặt bằng tạm]', 6000);
    if (flow.state === 'to_day') flow.dispatch('scene_ready');
    void enqueue(drain);
  }

  let toastTimer = 0;
  function toast(text: string | null, ms = 2600) {
    window.clearTimeout(toastTimer);
    ui.set({ toast: text });
    if (text) toastTimer = window.setTimeout(() => ui.set({ toast: null }), ms);
  }

  /** Đổi kiểu điều khiển camera Chuẩn → A → B → Chuẩn (lưu cục bộ trong file lưu; không vào analytics). */
  function toggleCameraMode() {
    if (ui.get().mode !== 'day' || !camOpts.modeSwitch) return;
    const next = nextCameraMode(save.settings.camera_mode);
    save.settings.camera_mode = next;
    input.setLookMode(CAMERA_MODES[next].look);
    ui.set({ cameraMode: next });
    toast(input.device === 'touch' ? `Camera: ${CAMERA_MODES[next].label}` : `${CAMERA_MODES[next].label}: ${CAMERA_MODES[next].hint}`, 3600);
    bus.emit('save_requested', { reason: 'settings' });
  }

  /** "Nhìn tự do": tùy chọn riêng, giữ nguyên kiểu camera đang chọn (lưu cục bộ; không vào analytics). */
  function toggleFreeLook() {
    if (!camOpts.freeLook) return;
    const on = !save.settings.free_look;
    save.settings.free_look = on;
    input.setFreeLook(on);
    ui.set({ freeLook: on });
    toast(on ? 'Nhìn tự do: BẬT — bấm vào màn hình, rồi rê touchpad để nhìn · Esc để thả' : 'Nhìn tự do: TẮT', 4200);
    bus.emit('save_requested', { reason: 'settings' });
  }

  // ---------- trong Ngày: lại gần, tương tác ----------
  function proximity() {
    if (!dayScene || engine.context?.kind !== 'day') return;
    const p = dayScene.playerPosition;
    for (const t of dayScene.targets) {
      if (locked()) break;
      const near = t.position.distanceTo(p) <= t.radius;
      if (near && engine.peek('arrive', t.id) && engine.trigger('arrive', t.id)) void enqueue(drain);
    }
    const tgt = locked() ? null : nearestUseful();
    const portal = tgt || locked() ? null : dayScene.portalPrompt();
    const id = tgt?.id ?? portal?.id ?? null;
    if (id !== promptId) { promptId = id; ui.set({ prompt: tgt ? { key: 'E', text: fmt(tgt.label) } : portal ? { key: 'E', text: fmt(portal.label) } : null }); }
  }
  function nearestUseful() {
    if (!dayScene) return null;
    const p = dayScene.playerPosition;
    return dayScene.targets.filter((t) => t.position.distanceTo(p) <= t.radius && engine.peek('interact', t.id))
      .sort((a, b) => a.position.distanceTo(p) - b.position.distanceTo(p))[0] ?? null;
  }
  // ---------- phòng 2026: lại gần, tương tác ----------
  const hubLabel = (id: string | null) => (id ? idx.pack.hub.interactables.find((i) => i.id === id)?.label ?? null : null);
  /** Mỗi khung hình: vật trong tầm với + đang nhìn về phía nó → gợi ý "E"; vật dưới con trỏ (trong tầm) được ưu tiên. */
  function hubProximity() {
    if (!hubScene || engine.context?.kind !== 'hub' || ui.get().panel === 'box3d') return;
    const id = locked() ? null : hubMouseHover ?? hubScene.nearest();
    hubScene.setHover(id);
    if (id !== promptId) { promptId = id; const label = hubLabel(id); ui.set({ prompt: label ? { key: 'E', text: label } : null }); }
  }
  function interact() {
    if (engine.context?.kind === 'hub') {
      if (locked() || !hubScene) return;
      const id = hubMouseHover ?? hubScene.nearest();
      if (id) actions.hubClick(id);
      return;
    }
    if (locked() || engine.context?.kind !== 'day') return;
    const tgt = nearestUseful();
    if (!tgt) { dayScene?.usePortal(); return; }
    const r = engine.trigger('interact', tgt.id);
    if (!r) return;
    void enqueue(async () => {
      if (r.action === 'present') {
        const s = r.ref.step;
        const lines = s.kind === 'talk' ? s.lines : s.kind === 'interact' ? s.lines ?? [] : [];
        if (await playLines(lines)) engine.complete(s.id);
      }
      await drain();
    });
  }

  // ---------- các bảng ở Hub ----------
  const boxView = (): BoxView => ({
    compartments: hub.compartments().map((c) => ({
      title: fmt(c.milestone.title), open: c.open,
      artifacts: c.artifacts.map((x) => ({ id: x.artifact.id, name: fmt(x.artifact.name), hook: fmt(x.artifact.hook_2026), state: x.state, action: hub.canOpen(x.artifact.id) })),
    })),
  });
  function albumView(): AlbumView {
    const prog = album.progress();
    const frag = (id: string) => idx.pack.fragments.find((f) => f.id === id);
    const coverId = album.coverEntryId();                  // Trang 4: ảnh cầu vồng (alb.d.g07.03.cover)
    const cover = coverId ? photoUrls.get(coverId) ?? null : null;
    return {
      progress: prog.display === 'pages' ? `${prog.pages_restored}/${prog.pages_total} trang` : `${prog.percent}%`,
      coverUrl: cover,
      pages: album.pages().map((p) => {
        const back = p.entries.find((e) => e.entry.slot_type === 'back_note' && e.owned);
        return {
          page_id: p.page_id, title: fmt(p.day.title), state: p.state, flipped: flipped.has(p.page_id),
          back: back ? { entry_id: back.entry.id, text: fmt(frag(back.entry.fragment_id)?.text ?? '') } : null,
          entries: p.entries.map(({ entry, owned, record }) => {
            const isPhoto = entry.slot_type === 'main_photo' || entry.slot_type === 'free_photo';
            const text = frag(entry.fragment_id)?.text;
            return { id: entry.id, slot_type: entry.slot_type, owned, isPhoto, text: text ? fmt(text) : null, url: photoUrls.get(entry.id) ?? null, variants: record?.variants.length ?? 0, selected: record?.selected ?? 0 };
          }),
        };
      }),
    };
  }
  function loadAlbumPhotos() {
    const todo = new Map<string, AlbumEntry>();
    for (const p of album.pages()) for (const { entry, owned } of p.entries) {
      if (!owned || photoUrls.has(entry.id) || (entry.slot_type !== 'main_photo' && entry.slot_type !== 'free_photo')) continue;
      todo.set(entry.id, entry);
    }
    // Ô bìa (đã kiểm owned + ô ảnh trong coverEntryId) có thể không nằm trên trang nào của bản phát hành.
    const coverId = album.coverEntryId(), cover = coverId ? idx.entries.get(coverId) : undefined;
    if (cover && !photoUrls.has(cover.id)) todo.set(cover.id, cover);
    for (const entry of todo.values()) void photoUrl(entry).then(() => { if (ui.get().panel === 'album') ui.set({ album: albumView() }); });
  }
  function phoneView(): PhoneView {
    const threads = idx.pack.hub.threads.map((t) => ({ id: t.id, title: fmt(t.title) }));
    const th = idx.pack.hub.threads.find((t) => t.id === phoneThread);
    if (!th) return { app: HUB_CONFIG.app_chat_name, threads, thread: null };
    const step = engine.activeSteps().map((r) => r.step).find((s) => s.kind === 'compose_message' && s.thread_id === th.id);
    return {
      app: HUB_CONFIG.app_chat_name, threads,
      thread: {
        id: th.id, title: fmt(th.title),
        // B8: nhóm chat cũ không có dòng chat nào → chỉ một dòng trạng thái (config/hub.ts)
        status: th.history.length === 0 ? HUB_CONFIG.old_chat_last_label : null,
        messages: hub.threadMessages(th.id).map((m) => ({ who: speakerName(m.speaker, idx, profile()), text: fmt(m.text), mine: m.speaker === 'player' })),
        compose: step && step.kind === 'compose_message' ? { draft: phoneDraft, openers: step.openers.map((o) => ({ id: o.id, text: fmt(o.text), tone: o.tone ? GAME_CONFIG.tone_labels[o.tone] : null })) } : null,
      },
    };
  }
  function refreshPanels() {
    const p = ui.get().panel;
    if (p === 'box') ui.set({ box: boxView() });
    if (p === 'box3d') { refreshBox(); hubScene?.setBoxItems(boxItems()); }
    if (p === 'album') { ui.set({ album: albumView() }); loadAlbumPhotos(); }
    if (p === 'phone') ui.set({ phone: phoneView() });
  }

  // ---------- hành động từ giao diện ----------
  const actions: GameHandle['actions'] = {
    consent(granted) { tracker.setConsent(granted ? 'granted' : 'denied'); ui.set({ consentAsk: false }); signal('consent'); },
    next() { signal('next'); },
    choose(id) { signal('choice', id); },
    submitProfile(name, gender: Gender) {
      const clean = sanitizePlayerName(name);
      if (!clean) return;
      save.player_name = clean; save.appearance = { gender, preset: 'default' }; save.profile_done = true;
      bus.emit('profile_set', { gender });
      bus.emit('save_requested', { reason: 'profile' });
      ui.set({ profile: false });
      signal('profile');
    },
    endPrompt(answer) { ui.set({ endPrompt: null }); engine.answerEndPrompt(answer); refreshHud(); },
    continueDayEnd() { if (!ui.get().dayEnd) return; ui.set({ dayEnd: null }); flow.dispatch('continue'); void goHub(); },
    endDayNow() { engine.requestEndDay(); },
    photoStart() { signal('photo_start'); },
    photoPose() { const p = ui.get().photo; if (p?.phase === 'countdown' && !photoPosed) { photoPosed = true; dayScene?.setPlayerMotion('pose_peace'); ui.set({ photo: { ...p, posed: true } }); } },
    photoKeep() { signal('photo_decide', 'keep'); },
    photoRetry() { signal('photo_decide', 'retry'); },
    photoPick(index) {
      const p = ui.get().photo;
      if (p?.phase !== 'pick' || !p.picks?.[index]) return;
      photoPicked = index;
      ui.set({ photo: { ...p, picked: index } });
    },
    freeContinue() { signal('free'); },
    interact,
    hubClick(id) {
      if (locked() || engine.context?.kind !== 'hub') return;
      const r = engine.trigger('interact', id);
      if (r) { hub.refresh(); void enqueue(hubSettle); }
      if (!introDone()) return;
      if (id === 'itr.hub.memory_box') actions.openPanel('box3d');
      else if (id === 'itr.hub.shelf') actions.openPanel('box');           // kệ: danh sách kỷ vật đã xong, xem lại ký ức
      else if (id === 'itr.hub.album') actions.openPanel('album');
      else if (id === 'itr.hub.phone') actions.openPanel('phone');
    },
    openPanel(p) {
      const s = ui.get();
      if (s.minigame) {
        if (p === 'menu') s.minigame.toggleOverlay('menu');
        return;
      }
      // Menu (Esc) mở được cả khi đang có thoại/thông báo/màn kết Trang: thứ bên dưới đứng chờ, đóng menu là tiếp tục.
      // Không mở khi đang chuyển cảnh hay đang điền form (tên, đồng ý, phản hồi).
      if (p === 'menu') { if (s.fade.on || s.profile || s.consentAsk || s.feedback || s.panel) return; }
      else if (s.fade.on || s.dialogue || s.choice || s.profile || s.notice || s.dayEnd || s.feedback || s.photo) return;
      if (s.mode === 'day' && p !== 'menu' && p !== 'journal') return;
      if (s.mode === 'hub' && p === 'journal') return;
      ui.set({ panel: p, wipeArmed: false, prompt: null });
      promptId = null;
      if (p === 'box') hub.refresh();
      if (p === 'album') album.markViewed();
      if (p === 'phone') { phoneThread = null; phoneDraft = null; }
      hubScene?.setBoxOpen(p === 'box3d');
      if (p === 'box3d') {
        hubMouseHover = null;
        hubScene?.setBoxItems(boxItems());
        ui.set({ boxView: { hint: '', hover: null, first: false } });
        if (!boxLinesSaid) {
          boxLinesSaid = true;
          const lines = boxFirstTime() ? HUB_BOX_LINES.open_first : HUB_BOX_LINES.open_again;
          void enqueue(async () => { if (ui.get().panel === 'box3d') await sayBox(lines); });
        }
      }
      refreshPanels();
    },
    closePanel() { ui.set({ panel: null, wipeArmed: false, boxView: null }); hubScene?.setBoxOpen(false); },
    openArtifact(id) {
      if (flow.state !== 'hub_idle') return;
      const r = hub.openArtifact(id);
      if (!r) return;
      flow.dispatch('open_day');
      void goDay(r.day_id, r.replay, false);
    },
    boxPick(id) {
      const s = ui.get();
      if (s.panel !== 'box3d' || s.dialogue || s.notice || s.choice || s.fade.on || boxBusy) return;
      const item = boxItems().find((x) => x.id === id);
      if (!item?.clickable) return;                                       // lần đầu: chỉ mẩu giấy mật lệnh bấm được
      if (item.kind === 'decor') { const d = HUB_DECOR.find((x) => x.id === id); if (d) void enqueue(async () => { await sayBox(d.lines); }); return; }
      if (!hub.canOpen(id)) { void enqueue(async () => { await sayBox(HUB_BOX_LINES.locked); }); return; }   // chưa tới lượt: chỉ nói, không chuyển cảnh
      if (flow.state !== 'hub_idle') return;
      // Kỷ vật đang sáng: Player nói câu móc (hook_2026) rồi về quá khứ — cùng một đường với trước đây (hub.openArtifact → goDay).
      const art = idx.artifacts.get(id);
      const introLines = idx.quests.get(introId)?.steps.flatMap((st) => (st.kind === 'cutscene' ? st.lines.map((l) => l.text) : [])) ?? [];
      const hook = art?.hook_2026 && !introLines.includes(art.hook_2026) ? [{ speaker: 'player', text: art.hook_2026 }] : [];
      boxBusy = true;
      void enqueue(async () => {
        const ok = await sayBox(hook);
        boxBusy = true;
        if (!ok || engine.context?.kind !== 'hub') { boxBusy = false; return; }
        ui.set({ panel: null, boxView: null });
        hubScene?.setBoxOpen(false);
        boxBusy = false;
        actions.openArtifact(id);
      });
    },
    albumFlip(pageId) {
      if (flipped.has(pageId)) flipped.delete(pageId); else {
        flipped.add(pageId);
        const back = album.pages().find((p) => p.page_id === pageId)?.entries.find((e) => e.entry.slot_type === 'back_note' && e.owned);
        if (back) album.markBackViewed(back.entry.id);
      }
      refreshPanels();
    },
    albumSelect(entryId, index) {
      if (!album.selectVariant(entryId, index)) return;
      const old = photoUrls.get(entryId);
      if (old) { URL.revokeObjectURL(old); photoUrls.delete(entryId); }
      bus.emit('save_requested', { reason: 'album_select' });
      refreshPanels();
    },
    phoneOpenThread(id) {
      phoneThread = id; phoneDraft = null;
      if (id) {
        const step = engine.activeSteps().map((r) => r.step).find((s) => s.kind === 'phone_ui' && (!s.thread_id || s.thread_id === id));
        if (step && engine.complete(step.id)) void enqueue(hubSettle);
      }
      refreshPanels();
    },
    phonePick(id) { phoneDraft = id; refreshPanels(); },
    phoneErase() { phoneDraft = null; refreshPanels(); },
    phoneSend() {
      const step = engine.activeSteps().map((r) => r.step).find((s) => s.kind === 'compose_message' && s.thread_id === phoneThread);
      if (!step || !phoneDraft) return;
      const ok = engine.complete(step.id, { option_id: phoneDraft });
      phoneDraft = null;
      refreshPanels();
      if (ok) void enqueue(hubSettle);
    },
    menuRestartDay() {
      if (!currentDay || !dayScene) return;
      cancelAll();
      if (!engine.restartDay()) return;
      dayScene.toSpawn();
      ui.set({ panel: null });
      void enqueue(drain);
    },
    menuLeaveDay() {
      if (!engine.isReplay) return;
      cancelAll();
      engine.abandonReplay();
      flow.dispatch('leave_day');
      void goHub();
    },
    menuSafeSpot() {
      dayScene?.toSpawn();
      ui.set({ panel: null });
    },
    menuWipe() {
      if (!ui.get().wipeArmed) { ui.set({ wipeArmed: true }); return; }
      void store.wipe(photos).then(() => { location.href = `${location.pathname}?play=1`; });
    },
    feedbackSubmitted() {
      if (!ui.get().feedback) return;
      ui.set({ feedback: false });
      // Biên nhận analytics độc lập với khóa document chứa ý kiến.
      bus.emit('feedback_submitted', { feedback_id: crypto.randomUUID() });
    },
    feedbackSkip() { ui.set({ feedback: false }); bus.emit('feedback_skipped', { placement: 'demo_end' }); },
    toggleCameraMode,
    toggleFreeLook,
    stick(v) { input.setStick(v); },
  };

  bus.on('day_end_prompt', (e) => ui.set({ endPrompt: { open: e.open_side_quests.length } }));
  bus.on('day_completed', (e) => {
    flow.dispatch('day_completed');
    tickers.clear();
    ui.set({ dayEnd: { title: fmt(idx.days.get(e.day_id)?.title ?? e.day_id), replay: e.is_replay }, endPrompt: null, canEndDay: false, prompt: null, photo: null, free: null });
    promptId = null;
  });

  // ---------- bàn phím, chuột ----------
  /**
   * Space/Enter = bấm nút "đi tiếp" của thứ đang hiện, đúng như click (thoại, thông báo, màn kết Trang, (minigame tự nghe phím),
   * thẻ "Đi tiếp", tạo dáng khi hẹn giờ). Bảng đang mở (menu…) thì không đụng tới thứ bên dưới. Trả true nếu đã dùng phím.
   */
  function continueKey(): boolean {
    const s = ui.get();
    if ((s.panel && s.panel !== 'box3d') || s.fade.on) return false;   // nhìn vào Hộp Kỷ Vật vẫn nói chuyện được
    if (s.dialogue || s.notice) { actions.next(); return true; }
    if (s.dayEnd) { actions.continueDayEnd(); return true; }
    if (s.minigame) return false;                                      // trò thật tự nghe phím (MinigameHost)
    if (s.photo?.phase === 'countdown') { actions.photoPose(); return true; }
    if (s.free && !s.choice && !s.endPrompt) { actions.freeContinue(); return true; }
    return false;
  }
  input.onKey((code) => {
    const s = ui.get();
    if (code === 'Space' || code === 'Enter') return continueKey();
    else if (isControl('interact', code)) interact();
    else if (/^(Digit|Numpad)[1-9]$/.test(code) && s.choice && !s.panel) { const o = s.choice.options[Number(code.slice(-1)) - 1]; if (o) actions.choose(o.id); }
    else if (/^(Digit|Numpad)[1-9]$/.test(code) && s.photo?.phase === 'pick' && !s.panel) actions.photoPick(Number(code.slice(-1)) - 1);
    else if (isControl('menu', code)) { if (s.panel) actions.closePanel(); else actions.openPanel('menu'); }
    else if (isControl('journal', code) && s.mode === 'day') { if (s.panel === 'journal') actions.closePanel(); else actions.openPanel('journal'); }
    else if (isControl('camera_mode', code) && !locked()) toggleCameraMode();
    else if (isControl('free_look', code) && s.mode === 'day' && !locked()) toggleFreeLook();
    // Phím C (film_camera) để dành cho máy ảnh cầm tay/cuộn phim — chưa làm, không gán việc khác.
  });
  // Kiểu B: chỉ khóa con trỏ khi đang đi lại trong Ngày; có thoại/bảng thì thả. Người chơi bấm Esc để thả → mở menu.
  input.setLockGuard(() => ui.get().mode === 'day' && !locked());
  input.onLockChange((isLocked, byUser) => {
    ui.set({ pointerLocked: isLocked });
    if (!isLocked && byUser && ui.get().mode === 'day' && !ui.get().panel) actions.openPanel('menu');
  });
  // Khóa con trỏ thất bại (trình duyệt/touchpad không cho): không thử lại tự động; kéo để xoay vẫn chạy như thường.
  input.onLockError(() => {
    if (ui.get().mode === 'day') toast('Trình duyệt không cho khóa chuột — vẫn xoay được bằng cách bấm giữ rồi kéo', 5000);
  });
  input.setFreeLook(!!save.settings.free_look);
  ui.set({ freeLook: !!save.settings.free_look, camOptions: camOpts });
  input.onPointer((kind, x, y) => {
    if (hubScene && engine.context?.kind === 'hub') {
      const s = ui.get();
      if (s.panel === 'box3d') {
        // cận cảnh hộp: rê chuột lên món nào thì món đó sáng + hiện tên; bấm để chọn
        const busy = !!(s.dialogue || s.notice || s.choice || s.fade.on) || boxBusy;
        const id = busy ? null : hubScene.pick(x, y);
        const item = id ? boxItems().find((i) => i.id === id && i.clickable) ?? null : null;
        hubScene.setHover(item?.id ?? null);
        if ((item?.name ?? null) !== (s.boxView?.hover ?? null) && s.boxView) ui.set({ boxView: { ...s.boxView, hover: item?.name ?? null } });
        if (kind === 'click' && item) actions.boxPick(item.id);
        return;
      }
      if (kind === 'move' && input.device !== 'touch') hubCursor = { x, y };
      // đi lại trong phòng: vật dưới con trỏ chỉ tính khi đứng đủ gần; bấm chuột = tương tác (vật dưới con trỏ, hoặc vật gần nhất)
      const id = locked() ? null : hubScene.pick(x, y);
      hubMouseHover = id && hubScene.reachable(id) ? id : null;
      if (kind === 'click') interact();
    } else if (kind === 'click') interact();
  });

  // ---------- thời gian chơi thật ----------
  const heartbeat = new ActivePlaytime({
    now: () => performance.now(),
    onBeat: (ms) => tracker.track('active_heartbeat', { active_delta_ms: ms, memory_day_id: engine.dayId, step_id: engine.mainStep()?.step.id ?? null }),
  });
  input.onActivity(() => heartbeat.markInput());
  document.addEventListener('visibilitychange', () => heartbeat.setVisible(document.visibilityState === 'visible'));
  setInterval(() => { heartbeat.setPlaying(!ui.get().fade.on && !ui.get().consentAsk && !!ui.get().mode); heartbeat.tick(); }, 5000);

  /** Phím (WASD/mũi tên, Shift) cộng với nút tròn ảo; phím được ưu tiên nếu bấm cùng lúc. */
  const moveIntent = () => {
    const f = (input.held('forward') ? 1 : 0) - (input.held('back') ? 1 : 0), s = (input.held('right') ? 1 : 0) - (input.held('left') ? 1 : 0);
    if (f || s || !input.stick) return { forward: f, strafe: s, run: input.held('run') };
    return { forward: input.stick.forward, strafe: input.stick.strafe, run: input.stick.run || input.held('run') };
  };
  input.onDeviceChange((d) => ui.set({ device: d }));
  ui.set({ device: input.device });

  // ---------- khởi động ----------
  mountGameUi(uiEl, ui, actions);
  view.start((dt, t) => {
    for (const f of [...tickers]) f(dt);
    if (dayScene) {
      const free = !locked();
      const look = input.takeLook();                    // luôn đọc để chuyển động chuột lúc đang khóa không dồn lại
      const ctl: DayControl = free
        ? { move: moveIntent(), look }
        : { move: null, look: null };
      if (!free && input.pointerLocked) input.releasePointer();
      dayScene.update(dt, t, ctl);
      proximity();
    }
    if (hubScene) {
      const free = !locked();
      const drag = input.takeLook();                    // luôn đọc để chuyển động lúc đang khóa không dồn lại
      const touch = input.device === 'touch';
      hubScene.update(dt, t, { move: free ? moveIntent() : null, cursor: free && !touch ? hubCursor : null, drag: free && touch ? drag : null });
      hubProximity();
    }
  });
  ui.set({ ready: true, placeholderBanner: idx.releaseDays.some((d) => d.main_chain.some((q) => idx.quests.get(q)?.ownership_label === 'AI_PROPOSED')) });

  const handle: GameHandle = { idx, save, bus, engine, album, hub, flow, ui, actions, view, photos, tracker, store, input,
    day: () => (dayScene && currentDay ? { scene: dayScene, def: currentDay } : null),
    hubPoint: (id) => {
      const p = hubScene?.screenPoint(id);
      if (!p) return null;
      const r = container.getBoundingClientRect();
      return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
    },
    hubView: () => (hubScene && engine.context?.kind === 'hub'
      ? { player: hubScene.player, nearest: hubScene.nearest(), boxOpen: hubScene.boxOpen, boxBlend: hubScene.boxBlend, items: boxItems().map(({ id, kind, shape, state, clickable }) => ({ id, kind, shape, state, clickable })) }
      : null),
    hubTeleport: (x, z, yaw) => { if (!hubScene) return false; hubScene.teleport(x, z, yaw); return true; },
    hubPick: (px, py) => {
      if (!hubScene) return null;
      const r = container.getBoundingClientRect();
      return hubScene.pick(((px - r.left) / r.width) * 2 - 1, -(((py - r.top) / r.height) * 2 - 1));
    },
  };

  void (async () => {
    if (tracker.consent === 'unknown') { ui.set({ consentAsk: true }); await wait('consent'); }
    const where = engine.resume();
    tracker.track('game_ready', { load_ms: Math.round(performance.now() - t0) });
    if (where === 'day' && save.current.memory_day_id) {
      bus.emit('game_resumed', { memory_day_id: save.current.memory_day_id, step_id: save.current.step_id });
      flow.dispatch('boot_resume_day');
      await goDay(save.current.memory_day_id, engine.isReplay, true);
    } else {
      if (introDone()) bus.emit('game_resumed', { memory_day_id: null, step_id: null });
      flow.dispatch(introDone() ? 'boot_idle' : 'boot_new');
      await goHub();
    }
  })();

  return handle;
}

export type { UiState };
