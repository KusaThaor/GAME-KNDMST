/**
 * Công cụ test của game (F9) — CHỈ có ở môi trường test: main.ts chỉ nạp file này khi __DEV_TOOLS__ = true,
 * nên bản production không chứa đoạn mã nào ở đây.
 *
 *   ?play=1&day=d.g07.03&step=<step_id>   nhảy tới một bước (các Ngày trước được coi như đã chơi xong)
 *   ?play=1&bot=release                   bot tự chơi hết các Ngày khai trong content/release.ts
 *   ?play=1&cast=B                        đổi bảng vai (D-01) để thử
 *   &gender=female                        ngoại hình dùng khi nhảy bước (mặc định nam)
 *   ?play=1&style=soft_pbr                đổi phong cách hình ảnh của bản đồ (khóa trong render/style.ts) để thử
 *
 * Bot bấm nút thật trên giao diện (data-act) và gõ phím thật; chỉ "đi tắt" ở việc di chuyển (dịch chuyển tới đích).
 */
import { ALBUM_CONFIG } from '../config/album';
import { HUB_CONFIG } from '../config/hub';
import type { ContentIndex, StepRef } from '../content/indexContent';
import { EventBus } from '../core/eventBus';
import { newSave, type SaveState } from '../core/save';
import type { GameHandle, RunOptions } from '../game/game';
import { AlbumModel } from '../systems/album';
import { HubModel } from '../systems/hub';
import { QuestEngine } from '../systems/questEngine';
import { attachInputDiagnostics, type InputDiagnostics } from './inputDiagnostics';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------- nhảy tới bước ----------

/** Làm xong một bước bằng logic thuần (không qua cảnh 3D/giao diện). */
function autoStep(engine: QuestEngine, ref: StepRef): boolean {
  const s = ref.step;
  switch (s.kind) {
    case 'talk': engine.trigger('interact', s.with); return engine.complete(s.id);
    case 'interact': case 'place': { const r = engine.trigger('interact', s.target); return r?.action === 'present' ? engine.complete(s.id) : !!r; }
    case 'goto': return !!engine.trigger('arrive', s.target);
    case 'collect': { let ok = false; for (const t of s.targets) ok = !!engine.trigger('interact', t) || ok; return ok; }
    case 'choice': return engine.complete(s.id, { option_id: s.options[0]?.id });
    case 'compose_message': return engine.complete(s.id, { option_id: s.openers[0]?.id });
    default: return engine.complete(s.id);
  }
}

/**
 * Dựng file lưu "đang ở bước X của Ngày Y": chạy engine thật trên một event bus riêng (không nối analytics, không tự lưu),
 * nên trạng thái sinh ra đúng như người chơi đã đi tới đó, mà không phát event đo lường giả.
 */
export function jumpTo(save: SaveState, idx: ContentIndex, dayId: string, stepId: string | null, gender: 'male' | 'female' = 'male'): string | null {
  const days = idx.releaseDays;
  const at = days.findIndex((d) => d.id === dayId);
  if (at < 0) return `Ngày ${dayId} không thuộc bản phát hành của môi trường này`;
  if (stepId && !idx.steps.has(stepId)) return `Không có bước ${stepId}`;

  Object.assign(save, newSave(save.attempt_id), { player_name: 'Bạn Thử', appearance: { gender, preset: 'default' }, profile_done: true });
  const bus = new EventBus();
  const engine = new QuestEngine({ idx, save, bus });
  const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
  const hub = new HubModel({ idx, save, bus, engine, album, config: HUB_CONFIG });
  const introId = idx.pack.hub.intro_quest_id;
  const visitHub = () => {
    engine.enterHub();
    for (let i = 0; i < 20 && engine.questState(introId) === 'active'; i++) { const r = engine.activeSteps().find((x) => x.quest.id === introId); if (!r || !autoStep(engine, r)) break; }
    hub.refresh(); hub.runPdes();
  };
  const playMain = (until: string | null): boolean => {
    for (let i = 0; i < 500; i++) {
      const m = engine.mainStep();
      if (!m) return until === null;
      if (m.step.id === until) return true;
      if (!autoStep(engine, m)) return false;
    }
    return false;
  };

  visitHub();
  for (const d of days.slice(0, at)) {
    engine.startDay(d.id);
    if (!playMain(null)) return `Không tự chơi hết được Ngày ${d.id}`;
    if (engine.phase === 'end_prompt') engine.answerEndPrompt('leave');
    visitHub();
  }
  engine.startDay(dayId);
  if (stepId && !playMain(stepId)) return `Bước ${stepId} không nằm trên chuỗi Main của ${dayId}`;
  return null;
}

/** Dựng file lưu "đang ở phòng 2026, đã qua phần mở đầu": tên Bạn Thử, đã nhập tên và chọn giới, lời dẫn đã xong. */
export function jumpToHub(save: SaveState, idx: ContentIndex, gender: 'male' | 'female' = 'male'): string | null {
  Object.assign(save, newSave(save.attempt_id), { player_name: 'Bạn Thử', appearance: { gender, preset: 'default' }, profile_done: true });
  const bus = new EventBus();
  const engine = new QuestEngine({ idx, save, bus });
  const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
  const hub = new HubModel({ idx, save, bus, engine, album, config: HUB_CONFIG });
  const introId = idx.pack.hub.intro_quest_id;
  engine.enterHub();
  for (let i = 0; i < 20 && engine.questState(introId) === 'active'; i++) {
    const r = engine.activeSteps().find((x) => x.quest.id === introId);
    if (!r || !autoStep(engine, r)) break;
  }
  hub.refresh(); hub.runPdes();
  return engine.questState(introId) === 'completed' ? null : `Không qua được phần mở đầu của phòng 2026`;
}

export function runOptionsFromUrl(params: URLSearchParams): RunOptions {
  const day = params.get('day'), cast = params.get('cast');
  // ?hub=1: bỏ qua phần mở đầu (tên, lời dẫn, bước mở hộp) và vào thẳng phòng 2026. Chỉ bản test.
  if (params.get('hub') === '1' && !day) return {
    castName: cast ?? undefined,
    artStyle: params.get('style') ?? undefined,
    prepareSave: (save, idx) => {
      const err = jumpToHub(save, idx, params.get('gender') === 'female' ? 'female' : 'male');
      if (err) console.error(`[công cụ test] ${err}`);
    },
  };
  return {
    castName: cast ?? undefined,
    artStyle: params.get('style') ?? undefined,
    prepareSave: day ? (save, idx) => {
      const err = jumpTo(save, idx, day, params.get('step'), params.get('gender') === 'female' ? 'female' : 'male');
      if (err) console.error(`[công cụ test] ${err}`);
    } : undefined,
  };
}

// ---------- bot ----------

export interface BotOptions { name?: string; gender?: 'male' | 'female'; optional?: boolean }
export interface GameToolsApi {
  ready(): boolean;
  /** Tóm tắt trạng thái để bot/test đối chiếu (không có gì ở đây đi vào analytics). */
  state(): Record<string, unknown>;
  /** Bảng chẩn đoán chuột/touchpad (chỉ khi `?inputdebug=1`). */
  inputDiagnostics?: InputDiagnostics;
  stats(): Record<string, number>;
  /** Một nhịp của bot. Trả nhãn việc vừa làm; 'done' khi không còn gì để chơi. */
  botStep(opts?: BotOptions): string;
  teleportTo(targetId: string): boolean;
  /** Đặt người chơi tới một điểm (qua đúng hàm của game: bám sàn, đẩy khỏi vật cản). */
  teleport(x: number, z: number, facing?: number): boolean;
  /** Đưa người chơi tới điểm xuất hiện mang ID này. */
  toSpawn(id: string): boolean;
  /** Bản đồ đang nạp: khu, marker, lỗi — để test đối chiếu. */
  world(): Record<string, unknown> | null;
  hubClick(id: string): void;
  hubPoint(id: string): { x: number; y: number } | null;
  /** Phòng 2026: vị trí/hướng nhìn của người chơi, vật trong tầm, hộp mở chưa, các món trong hộp (null khi không ở phòng). */
  hubView(): Record<string, unknown> | null;
  /** Đặt người chơi ở phòng 2026 tới (x, z) — có va chạm như khi đi. */
  hubTeleport(x: number, z: number, yaw?: number): boolean;
  /** Bấm một món trong Hộp Kỷ Vật (như bấm chuột vào món đó). */
  boxPick(id: string): void;
  /** Vật/món mà game "thấy" dưới điểm (px) trên trang. */
  hubPick(x: number, y: number): string | null;
  flush(): Promise<unknown>;
  bot: { running: boolean; done: boolean; steps: number; log: string[] };
}
declare global { interface Window { __game?: GameToolsApi } }

export function attachGameTools(h: GameHandle, params: URLSearchParams): GameToolsApi {
  const q = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
  const click = (act: string): boolean => { const el = q<HTMLButtonElement>(`[data-act="${act}"]`); if (!el || el.disabled) return false; el.click(); return true; };
  const key = (code: string) => { window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })); };
  let choiceTurn = 0;

  const teleportTo = (targetId: string): boolean => {
    const d = h.day();
    const t = d?.scene.targets.find((x) => x.id === targetId);
    if (!d || !t) return false;
    // Marker tương tác đặt sẵn ở chỗ đứng được; nhân vật thì đứng lệch ra một chút (game tự đẩy khỏi vật cản).
    const off = t.kind === 'npc' ? 0.6 : 0;
    d.scene.teleport(t.position.x + off, t.position.z + off);
    return true;
  };

  /** Đích của bước Main đang chờ (nếu bước đó cần tới một chỗ/một người). */
  const mainTarget = (): string | null => {
    const st = h.engine.mainStep()?.step;
    if (!st) return null;
    if (st.kind === 'talk') return st.with;
    return st.kind === 'goto' || st.kind === 'interact' || st.kind === 'place' ? st.target : st.kind === 'collect' ? st.targets[0] ?? null : null;
  };

  function botDay(opts: BotOptions): string {
    const d = h.day();
    if (!d) return 'wait';
    const main = mainTarget();
    // Việc phụ (Side/Daily) làm trước bước Main kế tiếp, để bot đi qua hết nội dung của Ngày.
    const optional = opts.optional === false ? [] : h.engine.targetsOfInterest().filter((id) => id !== main);
    if (h.ui.get().canEndDay && !optional.length) return click('end-day') ? 'end-day' : 'wait';
    const targetId = optional[0] ?? main;
    if (!targetId) return 'wait';
    const t = d.scene.targets.find((x) => x.id === targetId);
    if (!t) return `missing-target:${targetId}`;
    if (t.position.distanceTo(d.scene.playerPosition) > t.radius * 0.9) { teleportTo(targetId); return `goto:${targetId}`; }
    key('KeyE');
    return `interact:${targetId}`;
  }

  function botHub(): string {
    const s = h.ui.get();
    const steps = h.engine.activeSteps();
    const interactStep = steps.find((r) => r.step.kind === 'interact');
    if (interactStep && interactStep.step.kind === 'interact') { h.actions.hubClick(interactStep.step.target); return `hub-click:${interactStep.step.target}`; }
    const phoneStep = steps.find((r) => r.step.kind === 'phone_ui' || r.step.kind === 'compose_message');
    if (phoneStep && (phoneStep.step.kind === 'phone_ui' || phoneStep.step.kind === 'compose_message')) {
      if (s.panel !== 'phone') { if (s.panel) click('close'); else h.actions.hubClick('itr.hub.phone'); return 'phone-open'; }
      const thread = phoneStep.step.thread_id ?? h.idx.pack.hub.threads[0]?.id;
      if (!s.phone?.thread) return click(`thread-${thread}`) ? 'phone-thread' : 'wait';
      const compose = s.phone.thread.compose;
      if (!compose) return 'wait';
      if (compose.draft === null) return click(`opener-${compose.openers[choiceTurn++ % compose.openers.length].id}`) ? 'phone-draft' : 'wait';
      return click('send') ? 'phone-send' : 'wait';
    }
    const next = h.hub.compartments().flatMap((c) => c.artifacts).find((a) => h.hub.canOpen(a.artifact.id) === 'first');
    if (next) {
      // mở Hộp Kỷ Vật (cận cảnh 3D) rồi bấm kỷ vật đang sáng — cùng hành động với chuột/phím của người chơi
      if (s.panel !== 'box3d') { if (s.panel) click('close'); else h.actions.hubClick('itr.hub.memory_box'); return 'box-open'; }
      if (h.flow.state !== 'hub_idle') return 'wait';
      h.actions.boxPick(next.artifact.id);
      return `artifact:${next.artifact.id}`;
    }
    if (s.panel) { click('close'); return 'close'; }
    return 'done';
  }

  function botStep(opts: BotOptions = {}): string {
    const s = h.ui.get();
    if (!s.ready) return 'wait';
    if (s.consentAsk) return click('consent-yes') ? 'consent' : 'wait';   // hỏi đồng ý hiện trên nền tối lúc mở game
    if (s.fade.on) return 'wait';
    if (s.dialogue) { key('Space'); return 'dialogue'; }
    if (s.notice) return click('next') ? `notice:${s.notice.effect}` : 'wait';
    if (s.choice) return click(`choice-${s.choice.options[choiceTurn++ % s.choice.options.length].id}`) ? 'choice' : 'wait';
    if (s.profile) {
      const input = q<HTMLInputElement>('[data-act="name"]');
      if (!input) return 'wait';
      if (!input.value) { input.value = opts.name ?? 'Bot'; input.dispatchEvent(new Event('input', { bubbles: true })); return 'profile-name'; }
      // mỗi nhịp một thao tác, như người thật: chọn giới xong (giao diện vẽ lại) rồi mới bấm Bắt đầu
      const g = q<HTMLButtonElement>(`[data-act="gender-${opts.gender ?? 'male'}"]`);
      if (g && !g.classList.contains('on')) { g.click(); return 'profile-gender'; }
      return click('profile-ok') ? 'profile' : 'wait';
    }
    if (s.endPrompt) return click('leave') ? 'end-prompt' : 'wait';
    if (s.dayEnd) return click('day-end-continue') ? 'day-end' : 'wait';
    if (s.photo) {
      if (s.photo.phase === 'ready') return click('photo-start') ? 'photo-start' : 'wait';
      if (s.photo.phase === 'countdown') {
        if (s.photo.posed) return 'photo-wait';
        const step = h.engine.mainStep()?.step;
        const spot = step?.kind === 'photo' ? h.day()?.scene.standSpot(step.stand_zone) : null;
        if (spot) h.day()?.scene.teleport(spot.center[0], spot.center[1], 0);
        key('Space');
        return 'photo-pose';
      }
      return click('photo-keep') ? 'photo-keep' : 'wait';
    }
    if (s.minigame) return click('minigame-done') ? 'minigame' : 'wait';
    if (s.feedback) return click('feedback-skip') ? 'feedback' : 'wait';
    if (s.free) return click('free-continue') ? 'free' : 'wait';
    if (s.mode === 'day') { if (s.panel) { click('close'); return 'close'; } return botDay(opts); }
    if (s.mode === 'hub') return botHub();
    return 'wait';
  }

  const api: GameToolsApi = {
    ready: () => h.ui.get().ready && !h.ui.get().fade.on && !!h.ui.get().mode,
    state: () => ({
      flow: h.flow.state, mode: h.ui.get().mode, day: h.engine.dayId, replay: h.engine.isReplay, phase: h.engine.phase,
      step: h.engine.mainStep()?.step.id ?? null,
      active: h.engine.activeSteps().map((r) => r.step.id),
      days: Object.fromEntries(Object.entries(h.save.days).map(([k, v]) => [k, v.state])),
      quests: Object.fromEntries(Object.entries(h.save.quests).map(([k, v]) => [k, v.state])),
      artifacts: { ...h.save.artifacts },
      pages: Object.fromEntries(h.album.pages().map((p) => [p.page_id, p.state])),
      album_progress: h.album.progress(),
      flags: { ...h.save.flags },
      tone_counts: Object.fromEntries(Object.entries(h.save.relationships).map(([k, v]) => [k, v.tone_counts])),
      phone: Object.fromEntries(Object.entries(h.save.phone).map(([k, v]) => [k, v.length])),
      pde_done: [...h.save.pde_done],
      public_demo_done: h.save.public_demo_done,
      gender: h.save.appearance.gender,
      name_length: Array.from(h.save.player_name).length,
      cast: { ...h.idx.config.cast },
      attempt_id: h.save.attempt_id,
      player: h.day() ? { x: h.day()!.scene.playerPosition.x, y: h.day()!.scene.playerPosition.y, z: h.day()!.scene.playerPosition.z } : null,
      zone: h.day()?.scene.zone ?? null,
      device: h.input.device,
      camera: h.day() ? { mode: h.save.settings.camera_mode, look: h.input.lookMode, freeLook: h.input.freeLook, pointerLocked: h.input.pointerLocked, ...h.day()!.scene.debug() } : null,
      listeners: h.input.listenerCount,
      toast: h.ui.get().toast,
      hub: h.hubView(),
      ui: { panel: h.ui.get().panel, dialogue: h.ui.get().dialogue?.text ?? null, who: h.ui.get().dialogue?.who ?? null, objective: h.ui.get().objective, feedback: h.ui.get().feedback, prompt: h.ui.get().prompt?.text ?? null },
    }),
    stats: () => {
      const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      return { ...h.view.stats(), heapMB: mem ? Math.round(mem.usedJSHeapSize / 1048576) : -1 };
    },
    botStep, teleportTo,
    teleport: (x, z, facing) => { const d = h.day(); if (!d) return false; d.scene.teleport(x, z, facing); return true; },
    toSpawn: (id) => { const d = h.day(); if (!d) return false; d.scene.toSpawn(id); return true; },
    world: () => {
      const d = h.day();
      if (!d) return null;
      return {
        placeholder: d.scene.placeholder,
        problems: d.scene.problems.map((p) => `${p.level}:${p.code}:${p.ref ?? ''}`),
        targets: d.scene.targets.map((t) => ({ id: t.id, kind: t.kind, zone: t.zone, x: t.position.x, y: t.position.y, z: t.position.z, radius: t.radius })),
      };
    },
    hubClick: (id) => h.actions.hubClick(id),
    hubPoint: (id) => h.hubPoint(id),
    hubView: () => h.hubView(),
    hubTeleport: (x, z, yaw) => h.hubTeleport(x, z, yaw),
    boxPick: (id) => h.actions.boxPick(id),
    hubPick: (x, y) => h.hubPick(x, y),
    flush: () => h.tracker.flush(),
    bot: { running: false, done: false, steps: 0, log: [] },
  };
  window.__game = api;

  if (params.get('bot') === 'release') {
    api.bot.running = true;
    void (async () => {
      let idle = 0, last = '';
      for (let i = 0; i < 6000 && idle < 10; i++) {
        await sleep(120);
        const r = botStep({ name: 'Bot', gender: params.get('gender') === 'female' ? 'female' : 'male' });
        api.bot.steps++;
        if (r !== last && r !== 'wait') { api.bot.log.push(r); last = r; }
        idle = r === 'done' ? idle + 1 : 0;
      }
      api.bot.running = false; api.bot.done = true;
      console.info(`[bot] xong sau ${api.bot.steps} nhịp:`, api.bot.log.join(' → '));
    })();
  }
  // Bảng chẩn đoán chuột/touchpad: `?play=1&inputdebug=1` (chỉ bản test).
  if (params.get('inputdebug') === '1') api.inputDiagnostics = attachInputDiagnostics(h);
  return api;
}
