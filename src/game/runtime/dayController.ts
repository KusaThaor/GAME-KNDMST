/**
 * Điều khiển một Ngày ký ức: nạp scene Ngày, HUD mục tiêu, kiểm tra lại gần / tương tác,
 * vòng lặp cập nhật scene, đổi kiểu camera và menu trong Ngày.
 */
import { CAMERA_MODES, nextCameraMode } from '../../config/camera';
import type { ContentIndex } from '../../content/indexContent';
import type { MemoryDay } from '../../content/types';
import type { EventBus } from '../../core/eventBus';
import type { SaveState } from '../../core/save';
import type { ArtStyle } from '../../render/style';
import type { GameFlow } from '../../systems/gameFlow';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiState, UiStore } from '../../ui/game/store';
import { formatProblems } from '../../world/validate';
import type { GameInput } from '../input';
import { buildDayScene, type DayControl, type DayScene } from '../scenes/dayScene';
import type { GameView } from '../view';
import type { PresentationQueue } from './presentationQueue';
import { resolveZoneName } from './zoneNames';

export interface DayControllerDeps {
  idx: ContentIndex;
  save: SaveState;
  bus: EventBus;
  engine: QuestEngine;
  flow: GameFlow;
  ui: UiStore;
  input: GameInput;
  view: GameView;
  getQueue: () => PresentationQueue;
  style: ArtStyle | undefined;
  camOpts: { modeSwitch: boolean; freeLook: boolean };
  fmt: (text: string) => string;
  setPrompt: (id: string | null, prompt: UiState['prompt']) => void;
  goHub: () => Promise<void>;
}

export function createDayController(deps: DayControllerDeps) {
  const { idx, save, bus, engine, flow, ui, input, view, getQueue, style, camOpts, fmt, setPrompt, goHub } = deps;

  let dayScene: DayScene | null = null;
  let currentDay: MemoryDay | null = null;
  let toastTimer = 0;
  let keyHintTimer = 0;
  let keyHintMoved = false;
  let keyHintInteracted = false;
  let lastZoneName: string | null = null;
  let unsubStepCompleted: (() => void) | null = null;

  function toast(text: string | null, ms = 2600) {
    window.clearTimeout(toastTimer);
    ui.set({ toast: text });
    if (text) toastTimer = window.setTimeout(() => ui.set({ toast: null }), ms);
  }

  function hideKeyHint() {
    window.clearTimeout(keyHintTimer);
    keyHintTimer = 0;
    if (ui.get().keyHint) ui.set({ keyHint: null });
  }

  function showKeyHint() {
    window.clearTimeout(keyHintTimer);
    keyHintMoved = false;
    keyHintInteracted = false;
    const text = input.device === 'touch'
      ? 'Kéo nút tròn để đi · Kéo màn hình để xoay · Chạm E nói chuyện'
      : 'WASD đi · Shift chạy · Kéo chuột xoay góc nhìn · E nói chuyện';
    ui.set({ keyHint: { text } });
    keyHintTimer = window.setTimeout(hideKeyHint, 5000);
  }

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

  function nearestUseful() {
    if (!dayScene) return null;
    const p = dayScene.playerPosition;
    return dayScene.targets.filter((t) => t.position.distanceTo(p) <= t.radius && engine.peek('interact', t.id))
      .sort((a, b) => a.position.distanceTo(p) - b.position.distanceTo(p))[0] ?? null;
  }

  function proximity() {
    if (!dayScene || engine.context?.kind !== 'day') return;
    const queue = getQueue();
    const p = dayScene.playerPosition;
    for (const t of dayScene.targets) {
      if (queue.locked()) break;
      const near = t.position.distanceTo(p) <= t.radius;
      if (near && engine.peek('arrive', t.id) && engine.trigger('arrive', t.id)) void queue.enqueue(queue.drain);
    }
    const tgt = queue.locked() ? null : nearestUseful();
    const portal = tgt || queue.locked() ? null : dayScene.portalPrompt();
    const id = tgt?.id ?? portal?.id ?? null;
    setPrompt(id, tgt ? { key: 'E', text: fmt(tgt.label) } : portal ? { key: 'E', text: fmt(portal.label) } : null);
  }

  function interact() {
    const queue = getQueue();
    if (queue.locked() || engine.context?.kind !== 'day') return;
    if (ui.get().keyHint) {
      keyHintInteracted = true;
      if (keyHintMoved) hideKeyHint();
    }
    const tgt = nearestUseful();
    if (!tgt) { dayScene?.usePortal(); return; }
    const r = engine.trigger('interact', tgt.id);
    if (!r) return;
    void queue.enqueue(async () => {
      if (r.action === 'present') {
        const s = r.ref.step;
        const lines = s.kind === 'talk' ? s.lines : s.kind === 'interact' ? s.lines ?? [] : [];
        const ep = queue.getEpoch();
        await queue.runStep(s, () => ep === queue.getEpoch(), () => queue.playLines(lines, s), () => engine.complete(s.id));
      }
      await queue.drain();
    });
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

  async function mount(day: MemoryDay, replay: boolean, resume: boolean) {
    const queue = getQueue();
    if (!resume) { engine.startDay(day.id, { replay }); save.current.zone_id = null; }
    const ep = queue.getEpoch();
    const scene = await buildDayScene(day, idx, save.appearance.gender, {
      style,
      flag: n => engine.flag(n),
      bus,
      stepId: engine.mainStep()?.step.id,
      startZone: resume ? save.current.zone_id : null,
    });
    if (ep !== queue.getEpoch()) { scene.dispose(); return; }       // người chơi đã rời đi trong lúc tải
    currentDay = day; dayScene = scene;
    if (scene.problems.length) console.warn(`[world] ${day.map_id}:\n${formatProblems(scene.problems)}`);
    view.setScene(scene.scene, scene.camera);
    input.setLookMode(CAMERA_MODES[save.settings.camera_mode].look);
    // Tên khu hiện thoáng khi bước vào; `zone_entered` ghi một lần cho mỗi khu trong một lượt vào Ngày.
    const zoneName = (id: string | null) => resolveZoneName(day, id, engine, idx);
    const seenZones = new Set<string>();
    const enterZone = (id: string, record: boolean) => {
      save.current.zone_id = id;
      const name = zoneName(id);
      lastZoneName = name;
      toast(name);
      if (record && !seenZones.has(id)) bus.emit('zone_entered', { memory_day_id: day.id, zone_id: id });
      seenZones.add(id);
    };
    unsubStepCompleted?.();
    unsubStepCompleted = bus.on('step_completed', () => {
      if (!dayScene || currentDay !== day || !dayScene.zone) return;
      const nextName = zoneName(dayScene.zone);
      if (nextName !== lastZoneName) {
        lastZoneName = nextName;
        toast(nextName);
      }
    });
    scene.onZoneChange = (to) => { enterZone(to, true); bus.emit('save_requested', { reason: 'zone' }); };
    ui.set({ mode: 'day', inReplay: replay, panel: null, cameraMode: save.settings.camera_mode, fade: { on: false, label: '' } });
    if (scene.zone) enterZone(scene.zone, !resume);
    if (scene.placeholder) toast('[Bản đồ chưa tải được — đang dùng mặt bằng tạm]', 6000);
    if (flow.state === 'to_day') flow.dispatch('scene_ready');
    if (day.id === 'd.g06.01' && !replay && !resume && engine.mainStep()?.step.id === 'q_m1_main_01.s01') showKeyHint();
    void queue.enqueue(queue.drain);
  }

  function dispose() {
    unsubStepCompleted?.();
    unsubStepCompleted = null;
    window.clearTimeout(toastTimer);
    window.clearTimeout(keyHintTimer);
    lastZoneName = null;
    dayScene?.dispose();
    dayScene = null;
    currentDay = null;
  }

  function menuRestartDay() {
    if (!currentDay || !dayScene) return;
    const queue = getQueue();
    queue.cancelAll();
    if (!engine.restartDay()) return;
    dayScene.toSpawn();
    ui.set({ panel: null });
    void queue.enqueue(queue.drain);
  }

  function menuLeaveDay() {
    if (!engine.isReplay) return;
    getQueue().cancelAll();
    engine.abandonReplay();
    flow.dispatch('leave_day');
    void goHub();
  }

  function menuSafeSpot() {
    dayScene?.toSpawn();
    ui.set({ panel: null });
  }

  function tick(dt: number, t: number, moveIntent: () => { forward: number; strafe: number; run: boolean }) {
    if (!dayScene) return;
    const free = !getQueue().locked();
    const intent = free ? moveIntent() : null;
    if (intent && (intent.forward || intent.strafe) && ui.get().keyHint) {
      keyHintMoved = true;
      if (keyHintInteracted) hideKeyHint();
    }
    const look = input.takeLook();                    // luôn đọc để chuyển động chuột lúc đang khóa không dồn lại
    const ctl: DayControl = free
      ? { move: intent, look }
      : { move: null, look: null };
    if (!free && input.pointerLocked) input.releasePointer();
    dayScene.update(dt, t, ctl);
    proximity();
  }

  return {
    scene: () => dayScene,
    currentDay: () => currentDay,
    dayHandle: () => (dayScene && currentDay ? { scene: dayScene, def: currentDay } : null),
    toast,
    refreshHud,
    nearestUseful,
    proximity,
    interact,
    toggleCameraMode,
    toggleFreeLook,
    mount,
    dispose,
    menuRestartDay,
    menuLeaveDay,
    menuSafeSpot,
    tick,
  };
}

export type DayController = ReturnType<typeof createDayController>;
