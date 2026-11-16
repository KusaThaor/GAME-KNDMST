/**
 * Điều phối phần chơi (F3 + F7): nối engine (logic thuần) với cảnh 3D và giao diện.
 * Luồng: Boot → Hub(intro|idle) → chuyển cảnh → Ngày ký ức → kết Ngày → chuyển cảnh → Hub.
 * Hub và Ngày là 2 scene riêng; mỗi Ngày nạp 1 bản đồ + 1 biến thể; rời scene nào thì giải phóng scene đó.
 */
import { CAMERA_MODES, CAMERA_OPTIONS, DEFAULT_CAMERA_MODE, isCameraMode, isControl, nextCameraMode } from '../config/camera';
import { GAME_CONFIG } from '../config/game';
import { ALBUM_CONFIG } from '../config/album';
import { HUB_CONFIG } from '../config/hub';
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
import { MemoryPhotoStore, SaveStore, attachAutosave, reconcileSave, sanitizePlayerName, type PhotoStore, type SaveState } from '../core/save';
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
import { createInput, type GameInput } from './input';
import { buildDayScene, type DayControl, type DayScene } from './scenes/dayScene';
import { buildHubScene, type HubScene } from './scenes/hubScene';
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
  /** Vị trí một vật của phòng 2026 trên trang (px) — để test bấm chuột thật. */
  hubPoint(id: string): { x: number; y: number } | null;
  store: SaveStore;
}

const CANCEL = Symbol('cancel');
const PRESENT = new Set<Step['kind']>(['cutscene', 'choice', 'photo', 'minigame', 'free', 'album_restore']);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
  const fmt = (text: string) => formatText(text, profile());
  const introId = idx.pack.hub.intro_quest_id;
  const introDone = () => save.quests[introId]?.state === 'completed';

  let hubScene: HubScene | null = null;
  let dayScene: DayScene | null = null;
  let currentDay: MemoryDay | null = null;
  let epoch = 0;
  const presented = new Set<string>();
  const inside = new Set<string>();
  const tickers = new Set<(dt: number) => void>();
  const waiters = new Map<string, (v: unknown) => void>();
  const photoUrls = new Map<string, string>();
  const flipped = new Set<string>();
  let phoneThread: string | null = null, phoneDraft: string | null = null;
  let promptId: string | null = null;
  let photoPosed = false;

  // ---------- hàng đợi trình diễn: mọi thoại/ảnh/thông báo chạy lần lượt ----------
  let chain: Promise<void> = Promise.resolve();
  const enqueue = (fn: () => Promise<void>) => { chain = chain.then(fn).catch((e) => console.error('[game]', e)); return chain; };
  const wait = <T>(slot: string) => new Promise<T | typeof CANCEL>((resolve) => waiters.set(slot, resolve as (v: unknown) => void));
  const signal = (slot: string, value: unknown = true) => { const w = waiters.get(slot); if (w) { waiters.delete(slot); w(value); } };
  const cancelAll = () => {
    epoch++;
    for (const [slot, w] of [...waiters]) { waiters.delete(slot); w(CANCEL); }
    tickers.clear(); presented.clear(); inside.clear();
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
      if (!(await playLines(s.lines))) return;
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
      ui.set({ minigame: { game: s.game } });
      if ((await wait('minigame')) === CANCEL || !alive()) return;
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
    for (let retry = 0; ; retry++) {
      photoPosed = false;
      if (s.mode !== 'auto') {
        scene.setStandZone(spot);
        scene.lockCamera(point);                          // khung ngắm: nhìn qua máy ảnh đặt sẵn
        ui.set({ photo: { ...base, marks: [], phase: 'ready', seconds: s.mode === 'timer' ? PHOTO_CONFIG.timer_seconds : 0 } });
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
      const criteria: PhotoCriteria = {
        all_in_frame: scene.allInFrame(cam, s.subjects),
        player_in_zone: spot ? Math.hypot(scene.playerPosition.x - spot.center[0], scene.playerPosition.z - spot.center[1]) <= spot.radius : true,
        posed_in_time: s.mode === 'timer' ? photoPosed : true,
      };
      scene.setGizmosVisible(false);
      const shot = view.capture(scene.scene, cam, PHOTO_CONFIG.jpeg);
      scene.setGizmosVisible(true);
      const blob = await shot;
      if (!alive()) return;
      bus.emit('photo_attempt', { step_id: s.id, mode: s.mode, retry_index: retry, ...criteria });
      if (s.mode !== 'auto') {
        const q = photoQuality(criteria, PHOTO_CONFIG);
        const url = URL.createObjectURL(blob);
        ui.set({ photo: { ...base, phase: 'preview', seconds: 0, url, score: q.score, display: q.display, marks: (Object.keys(CRITERIA_LABELS) as (keyof PhotoCriteria)[]).map((k) => ({ label: CRITERIA_LABELS[k], ok: criteria[k] })) } });
        const decide = await wait<'keep' | 'retry'>('photo_decide');
        URL.revokeObjectURL(url);
        if (decide === CANCEL || !alive()) return;
        if (decide === 'retry') { scene.setPlayerMotion(null); continue; }
      }
      // "Giữ ảnh này": hoàn thành bước — chất lượng ảnh không chặn quest.
      const key = `ph_${crypto.randomUUID()}`;
      await photos.put(key, blob).catch(() => undefined);
      const { removed } = album.addVariant(s.album_entry_id, key);
      if (removed) void photos.delete(removed).catch(() => undefined);
      photoUrls.delete(s.album_entry_id);
      bus.emit('photo_kept', { step_id: s.id, mode: s.mode, retry_index: retry, ...criteria });
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
        const tmp = await buildDayScene(day, idx, save.appearance.gender, { style });
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
  }

  async function goHub() {
    cancelAll();
    await fadeTo('Năm 2026', 'to_hub');
    teardown();
    const first = !save.quests[introId];
    engine.enterHub();
    hub.refresh();
    input.setLookMode('drag');                           // phòng 2026: góc cố định, chuột để chọn vật
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
    const scene = await buildDayScene(day, idx, save.appearance.gender, { style, startZone: resume ? save.current.zone_id : null });
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
      const near = t.position.distanceTo(p) <= t.radius;
      if (near && !inside.has(t.id)) { inside.add(t.id); if (!locked() && engine.trigger('arrive', t.id)) void enqueue(drain); } else if (!near) inside.delete(t.id);
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
  function interact() {
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
    const cover = ALBUM_CONFIG.cover_entry_id && album.owned(ALBUM_CONFIG.cover_entry_id) ? photoUrls.get(ALBUM_CONFIG.cover_entry_id) ?? null : null;
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
    for (const p of album.pages()) for (const { entry, owned } of p.entries) {
      if (!owned || photoUrls.has(entry.id) || (entry.slot_type !== 'main_photo' && entry.slot_type !== 'free_photo')) continue;
      void photoUrl(entry).then(() => { if (ui.get().panel === 'album') ui.set({ album: albumView() }); });
    }
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
        messages: hub.threadMessages(th.id).map((m) => ({ who: speakerName(m.speaker, idx, profile()), text: fmt(m.text), mine: m.speaker === 'player' })),
        compose: step && step.kind === 'compose_message' ? { draft: phoneDraft, openers: step.openers.map((o) => ({ id: o.id, text: fmt(o.text), tone: o.tone ? GAME_CONFIG.tone_labels[o.tone] : null })) } : null,
      },
    };
  }
  function refreshPanels() {
    const p = ui.get().panel;
    if (p === 'box') ui.set({ box: boxView() });
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
    minigameDone() { signal('minigame'); },
    freeContinue() { signal('free'); },
    interact,
    hubClick(id) {
      if (locked() || engine.context?.kind !== 'hub') return;
      const r = engine.trigger('interact', id);
      if (r) { hub.refresh(); void enqueue(hubSettle); }
      if (!introDone()) return;
      if (id === 'itr.hub.memory_box' || id === 'itr.hub.shelf') actions.openPanel('box');
      else if (id === 'itr.hub.album') actions.openPanel('album');
      else if (id === 'itr.hub.phone') actions.openPanel('phone');
    },
    openPanel(p) {
      const s = ui.get();
      if (s.fade.on || s.dialogue || s.choice || s.profile || s.notice || s.dayEnd || s.feedback || s.photo) return;
      if (s.mode === 'day' && p !== 'menu' && p !== 'journal') return;
      if (s.mode === 'hub' && p === 'journal') return;
      ui.set({ panel: p, wipeArmed: false, prompt: null });
      promptId = null;
      if (p === 'box') hub.refresh();
      if (p === 'album') album.markViewed();
      if (p === 'phone') { phoneThread = null; phoneDraft = null; }
      hubScene?.setBoxOpen(p === 'box');
      refreshPanels();
    },
    closePanel() { ui.set({ panel: null, wipeArmed: false }); hubScene?.setBoxOpen(false); },
    openArtifact(id) {
      if (flow.state !== 'hub_idle') return;
      const r = hub.openArtifact(id);
      if (!r) return;
      flow.dispatch('open_day');
      void goDay(r.day_id, r.replay, false);
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
  input.onKey((code) => {
    const s = ui.get();
    if (code === 'Space' || code === 'Enter') { if (s.dialogue || s.notice) actions.next(); else actions.photoPose(); }
    else if (isControl('interact', code)) interact();
    else if (/^(Digit|Numpad)[1-9]$/.test(code) && s.choice) { const o = s.choice.options[Number(code.slice(-1)) - 1]; if (o) actions.choose(o.id); }
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
      const id = locked() ? null : hubScene.pick(x, y);
      hubScene.setHover(id);
      const label = idx.pack.hub.interactables.find((i) => i.id === id)?.label;
      if (id !== promptId) { promptId = id; ui.set({ prompt: label ? { key: 'Click', text: label } : null }); }
      if (kind === 'click' && id) actions.hubClick(id);
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
    hubScene?.update(dt, t);
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
