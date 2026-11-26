/**
 * Điều phối phần chơi (F3 + F7): nối engine (logic thuần) với cảnh 3D và giao diện.
 * Luồng: Boot → Hub(intro|idle) → chuyển cảnh → Ngày ký ức → kết Ngày → chuyển cảnh → Hub.
 */
import { CAMERA_OPTIONS, DEFAULT_CAMERA_MODE, isCameraMode, isControl } from '../config/camera';
import { GAME_CONFIG } from '../config/game';
import { ALBUM_CONFIG } from '../config/album';
import { HUB_CONFIG } from '../config/hub';
import { attachAnalytics } from '../analytics/bridge';
import { ActivePlaytime } from '../analytics/heartbeat';
import { Tracker } from '../analytics/tracker';
import { indexContent, type ContentIndex } from '../content/indexContent';
import { CONTENT, contentConfig } from '../content/pack';
import type { Gender, MemoryDay } from '../content/types';
import { formatReport, validateContent } from '../content/validate';
import { EventBus } from '../core/eventBus';
import { IdbPhotoStore } from '../core/photoStoreIdb';
import { MemoryPhotoStore, SaveStore, attachAutosave, reconcileSave, sanitizePlayerName, type PhotoStore, type SaveState } from '../core/save';
import { AlbumModel } from '../systems/album';
import { GameFlow } from '../systems/gameFlow';
import { HubModel } from '../systems/hub';
import { QuestEngine } from '../systems/questEngine';
import { ReleaseTracker } from '../systems/release';
import { ART_STYLES } from '../render/style';
import { mountGameUi } from '../ui/game/GameUi';
import { createUiStore, type UiActions, type UiState, type UiStore } from '../ui/game/store';
import { createInput, type GameInput } from './input';
import { createDayController } from './runtime/dayController';
import { createHubController, FEEDBACK_SENT_FLAG } from './runtime/hubController';
import { createMinigameRunner } from './runtime/minigameRunner';
import { createPhotoRunner } from './runtime/photoRunner';
import { createPresentationQueue, type PresentationQueue } from './runtime/presentationQueue';
import { createStepHooks } from './runtime/stepHooks';
import { createStageRunner } from './runtime/stageRunner';
import { formatGameText } from './runtime/uiAdapters';
import type { DayScene } from './scenes/dayScene';
import type { BoxItemView, HubPlayer } from './scenes/hubScene';
import { playTransitionSound } from './sfx';
import { createGameView, type GameView } from './view';

export type TransitionHook = (kind: 'to_day' | 'to_hub', info: { day?: MemoryDay }) => void | Promise<void>;
const transitionHooks: TransitionHook[] = [];
export function registerTransitionFx(hook: TransitionHook) { transitionHooks.push(hook); }

export interface GameHandle {
  idx: ContentIndex; save: SaveState; bus: EventBus; engine: QuestEngine; album: AlbumModel; hub: HubModel; flow: GameFlow;
  ui: UiStore; actions: UiActions; view: GameView; photos: PhotoStore; tracker: Tracker; input: GameInput; store: SaveStore;
  day(): { scene: DayScene; def: MemoryDay } | null;
  hubPoint(id: string): { x: number; y: number } | null;
  hubView(): { player: HubPlayer; nearest: string | null; boxOpen: boolean; boxBlend: number; items: (BoxItemView & { clickable: boolean })[] } | null;
  hubTeleport(x: number, z: number, yaw?: number): boolean;
  hubPick(px: number, py: number): string | null;
}

export interface RunOptions { prepareSave?: (save: SaveState, idx: ContentIndex) => void; castName?: string; artStyle?: string }
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function runGame(container: HTMLElement, opts: RunOptions = {}): Promise<GameHandle> {
  const t0 = performance.now();
  const idx = indexContent(CONTENT, contentConfig(__APP_ENV__, opts.castName));
  const report = validateContent(CONTENT, idx.config);
  if (report.errors.length) console.error(`[content] gói nội dung có lỗi:\n${formatReport(report)}`);

  const store = new SaveStore(window.localStorage);
  const save = reconcileSave(store.load().save, idx);
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
  const camTest = __DEV_TOOLS__ && new URLSearchParams(location.search).get('camtest') === '1';
  const camOpts = { modeSwitch: CAMERA_OPTIONS.allow_mode_switch || camTest, freeLook: CAMERA_OPTIONS.allow_free_look || camTest };
  if (!camOpts.modeSwitch || !isCameraMode(save.settings?.camera_mode)) save.settings = { ...save.settings, camera_mode: DEFAULT_CAMERA_MODE };
  if (!camOpts.freeLook && save.settings.free_look) save.settings = { ...save.settings, free_look: false };

  const style = ART_STYLES[opts.artStyle ?? ''];
  const profile = () => ({ player_name: save.player_name, gender: save.appearance.gender });
  const fmt = (text: string) => formatGameText(text, save);
  const introId = idx.pack.hub.intro_quest_id;
  const introDone = () => save.quests[introId]?.state === 'completed';

  let promptId: string | null = null;
  const setPrompt = (id: string | null, prompt: UiState['prompt']) => { if (id !== promptId) { promptId = id; ui.set({ prompt }); } };

  let queue!: PresentationQueue;
  const dayCtrl = createDayController({ idx, save, bus, engine, flow, ui, input, view, getQueue: () => queue, style, camOpts, fmt, setPrompt, goHub });
  const runMinigame = createMinigameRunner({ save, bus, engine, ui, getQueue: () => queue });
  let photo!: ReturnType<typeof createPhotoRunner>;
  /**
   * Điểm nối Đợt 2 (runtime/stepHooks.ts). Mỗi nhánh R-B* chỉ THÊM một dòng `stepHooks.register(...)` ngay dưới đây,
   * không sửa dòng khác của game.ts.
   */
  const stepHooks = createStepHooks();
  stepHooks.register(createStageRunner({ getDayScene: dayCtrl.scene }));
  queue = createPresentationQueue({
    idx, save, engine, ui, introId, profile, fmt, getDayScene: dayCtrl.scene, refreshHud: dayCtrl.refreshHud,
    runPhoto: (s, alive) => photo.runPhoto(s, alive), runMinigame, hooks: stepHooks,
  });
  photo = createPhotoRunner({ idx, save, bus, engine, album, photos, view, ui, queue, style, getDayScene: dayCtrl.scene, getCurrentDay: dayCtrl.currentDay });
  const hubCtrl = createHubController({
    idx, save, bus, engine, album, hub, flow, ui, input, view, queue, photo, introId, introDone, profile, fmt, setPrompt, refreshHud: dayCtrl.refreshHud, goDay,
  });

  async function fadeTo(label: string, kind: 'to_day' | 'to_hub', day?: MemoryDay) {
    ui.set({ fade: { on: true, label }, prompt: null });
    playTransitionSound(kind);
    await Promise.all([sleep(480), ...transitionHooks.map((h) => h(kind, { day }))]);
  }
  const teardown = () => { view.setScene(null, null); hubCtrl.dispose(); dayCtrl.dispose(); photo.clearUrls(); };
  async function goHub() { queue.cancelAll(); await fadeTo('Năm 2026', 'to_hub'); teardown(); hubCtrl.mount(); }
  async function goDay(dayId: string, replay: boolean, resume: boolean) {
    const day = idx.days.get(dayId);
    if (!day) return;
    queue.cancelAll(); await fadeTo(fmt(day.title), 'to_day', day); teardown(); await dayCtrl.mount(day, replay, resume);
  }
  const interact = () => { if (engine.context?.kind === 'hub') hubCtrl.interact(actions.openPanel); else dayCtrl.interact(); };

  /** Rời game = về trang chủ (bỏ `?play=1`). Tiến trình đã lưu ở `save_requested`; analytics tự gửi nốt khi `pagehide`. */
  const leaveGame = () => { location.href = location.pathname; };

  const actions: GameHandle['actions'] = {
    consent: (granted) => { tracker.setConsent(granted ? 'granted' : 'denied'); ui.set({ consentAsk: false }); queue.signal('consent'); },
    next: () => queue.signal('next'),
    choose: (id) => queue.signal('choice', id),
    submitProfile(name, gender: Gender) {
      const clean = sanitizePlayerName(name);
      if (!clean) return;
      save.player_name = clean; save.appearance = { gender, preset: 'default' }; save.profile_done = true;
      bus.emit('profile_set', { gender }); bus.emit('save_requested', { reason: 'profile' });
      ui.set({ profile: false }); queue.signal('profile');
    },
    endPrompt: (answer) => { ui.set({ endPrompt: null }); engine.answerEndPrompt(answer); dayCtrl.refreshHud(); },
    continueDayEnd: () => { if (!ui.get().dayEnd) return; ui.set({ dayEnd: null }); flow.dispatch('continue'); void goHub(); },
    endDayNow: () => engine.requestEndDay(),
    photoStart: () => queue.signal('photo_start'), photoPose: photo.pose,
    photoKeep: () => queue.signal('photo_decide', 'keep'), photoRetry: () => queue.signal('photo_decide', 'retry'), photoPick: photo.pick,
    freeContinue: () => queue.signal('free'), interact,
    hubClick: (id) => hubCtrl.hubClick(id, actions.openPanel),
    openPanel(p) {
      const s = ui.get();
      if (s.minigame) { if (p === 'menu') s.minigame.toggleOverlay('menu'); return; }
      if (p === 'menu' ? (s.fade.on || s.profile || s.consentAsk || s.feedback || s.panel) : (s.fade.on || s.dialogue || s.choice || s.profile || s.notice || s.dayEnd || s.feedback || s.photo)) return;
      if ((s.mode === 'day' && p !== 'menu' && p !== 'journal') || (s.mode === 'hub' && p === 'journal')) return;
      ui.set({ panel: p, wipeArmed: false, prompt: null }); promptId = null; hubCtrl.onOpenPanel(p);
    },
    closePanel: () => { ui.set({ panel: null, wipeArmed: false, boxView: null }); hubCtrl.onClosePanel(); },
    openArtifact: hubCtrl.openArtifact, boxPick: hubCtrl.boxPick, albumFlip: hubCtrl.albumFlip, albumSelect: hubCtrl.albumSelect,
    phoneOpenThread: hubCtrl.phoneOpenThread, phonePick: hubCtrl.phonePick, phoneErase: hubCtrl.phoneErase, phoneSend: hubCtrl.phoneSend,
    menuRestartDay: dayCtrl.menuRestartDay, menuLeaveDay: dayCtrl.menuLeaveDay, menuSafeSpot: dayCtrl.menuSafeSpot,
    menuWipe: () => { if (!ui.get().wipeArmed) ui.set({ wipeArmed: true }); else void store.wipe(photos).then(() => { location.href = `${location.pathname}?play=1`; }); },
    menuExit: () => {
      // R-P1: bấm Thoát ở bất kỳ đâu → lưu, hiện Form phản hồi (một lần mỗi bản lưu), xong form thì rời game.
      const s = ui.get();
      if (s.feedback || s.fade.on) return;
      if (s.panel) actions.closePanel();
      bus.emit('save_requested', { reason: 'exit' });
      if (save.flags[FEEDBACK_SENT_FLAG]) { leaveGame(); return; }
      ui.set({ feedback: 'exit' });
      bus.emit('feedback_shown', { placement: 'exit' });
    },
    feedbackSubmitted: () => {
      const placement = ui.get().feedback;
      if (!placement) return;
      ui.set({ feedback: false });
      save.flags[FEEDBACK_SENT_FLAG] = true; bus.emit('save_requested', { reason: 'feedback_sent' });
      bus.emit('feedback_submitted', { feedback_id: crypto.randomUUID() });
      if (placement === 'exit') leaveGame();
    },
    feedbackSkip: () => {
      const placement = ui.get().feedback;
      if (!placement) return;
      ui.set({ feedback: false });
      bus.emit('feedback_skipped', { placement });
      if (placement === 'exit') leaveGame();
    },
    feedbackCancel: () => { if (ui.get().feedback === 'exit') ui.set({ feedback: false }); },
    toggleCameraMode: dayCtrl.toggleCameraMode, toggleFreeLook: dayCtrl.toggleFreeLook, stick: (v) => input.setStick(v),
  };

  bus.on('day_end_prompt', (e) => ui.set({ endPrompt: { open: e.open_side_quests.length } }));
  bus.on('day_completed', (e) => {
    flow.dispatch('day_completed'); queue.clearTickers(); promptId = null;
    ui.set({ dayEnd: { title: fmt(idx.days.get(e.day_id)?.title ?? e.day_id), replay: e.is_replay }, endPrompt: null, canEndDay: false, prompt: null, photo: null, free: null });
  });

  function continueKey(): boolean {
    const s = ui.get();
    if ((s.panel && s.panel !== 'box3d') || s.fade.on) return false;
    if (s.dialogue || s.notice) { actions.next(); return true; }
    if (s.dayEnd) { actions.continueDayEnd(); return true; }
    if (s.minigame) return false;
    if (s.photo?.phase === 'countdown') { actions.photoPose(); return true; }
    if (s.free && !s.choice && !s.endPrompt) { actions.freeContinue(); return true; }
    return false;
  }
  input.onKey((code) => {
    const s = ui.get();
    if (code === 'Space' || code === 'Enter') return continueKey();
    if (isControl('interact', code)) interact();
    else if (/^(Digit|Numpad)[1-9]$/.test(code) && s.choice && !s.panel) { const o = s.choice.options[Number(code.slice(-1)) - 1]; if (o) actions.choose(o.id); }
    else if (/^(Digit|Numpad)[1-9]$/.test(code) && s.photo?.phase === 'pick' && !s.panel) actions.photoPick(Number(code.slice(-1)) - 1);
    else if (isControl('menu', code)) { if (s.panel) actions.closePanel(); else actions.openPanel('menu'); }
    else if (isControl('journal', code) && s.mode === 'day') { if (s.panel === 'journal') actions.closePanel(); else actions.openPanel('journal'); }
    else if (isControl('camera_mode', code) && !queue.locked()) dayCtrl.toggleCameraMode();
    else if (isControl('free_look', code) && s.mode === 'day' && !queue.locked()) dayCtrl.toggleFreeLook();
    // Phím C (film_camera) để dành cho máy ảnh cầm tay/cuộn phim — chưa làm, không gán việc khác.
  });
  input.setLockGuard(() => ui.get().mode === 'day' && !queue.locked());
  input.onLockChange((isLocked, byUser) => { ui.set({ pointerLocked: isLocked }); if (!isLocked && byUser && ui.get().mode === 'day' && !ui.get().panel) actions.openPanel('menu'); });
  input.onLockError(() => { if (ui.get().mode === 'day') dayCtrl.toast('Trình duyệt không cho khóa chuột — vẫn xoay được bằng cách bấm giữ rồi kéo', 5000); });
  input.setFreeLook(!!save.settings.free_look);
  input.onPointer((kind, x, y) => { if (!hubCtrl.handlePointer(kind, x, y, interact) && kind === 'click') interact(); });
  input.onDeviceChange((d) => ui.set({ device: d }));
  ui.set({ freeLook: !!save.settings.free_look, camOptions: camOpts, device: input.device });

  const heartbeat = new ActivePlaytime({ now: () => performance.now(), onBeat: (ms) => tracker.track('active_heartbeat', { active_delta_ms: ms, memory_day_id: engine.dayId, step_id: engine.mainStep()?.step.id ?? null }) });
  input.onActivity(() => heartbeat.markInput());
  document.addEventListener('visibilitychange', () => heartbeat.setVisible(document.visibilityState === 'visible'));
  setInterval(() => { heartbeat.setPlaying(!ui.get().fade.on && !ui.get().consentAsk && !!ui.get().mode); heartbeat.tick(); }, 5000);

  const moveIntent = () => {
    const f = (input.held('forward') ? 1 : 0) - (input.held('back') ? 1 : 0), s = (input.held('right') ? 1 : 0) - (input.held('left') ? 1 : 0);
    return f || s || !input.stick ? { forward: f, strafe: s, run: input.held('run') } : { forward: input.stick.forward, strafe: input.stick.strafe, run: input.stick.run || input.held('run') };
  };

  mountGameUi(uiEl, ui, actions);
  view.start((dt, t) => { queue.runTickers(dt); dayCtrl.tick(dt, t, moveIntent); hubCtrl.tick(dt, t, moveIntent); });
  ui.set({ ready: true, placeholderBanner: idx.releaseDays.some((d) => d.main_chain.some((q) => idx.quests.get(q)?.ownership_label === 'AI_PROPOSED')) });

  void (async () => {
    if (tracker.consent === 'unknown') { ui.set({ consentAsk: true }); await queue.wait('consent'); }
    const where = engine.resume();
    tracker.track('game_ready', { load_ms: Math.round(performance.now() - t0) });
    if (where === 'day' && save.current.memory_day_id) {
      bus.emit('game_resumed', { memory_day_id: save.current.memory_day_id, step_id: save.current.step_id });
      flow.dispatch('boot_resume_day'); await goDay(save.current.memory_day_id, engine.isReplay, true);
    } else {
      if (introDone()) bus.emit('game_resumed', { memory_day_id: null, step_id: null });
      flow.dispatch(introDone() ? 'boot_idle' : 'boot_new'); await goHub();
    }
  })();

  return {
    idx, save, bus, engine, album, hub, flow, ui, actions, view, photos, tracker, store, input,
    day: dayCtrl.dayHandle, hubPoint: (id) => hubCtrl.hubPoint(container, id), hubView: hubCtrl.hubView,
    hubTeleport: hubCtrl.hubTeleport, hubPick: (px, py) => hubCtrl.hubPick(container, px, py),
  };
}

export type { UiState };
