/**
 * Hàng đợi trình diễn: mọi thoại, lựa chọn, thông báo, bước tự hiện chạy tuần tự và hủy sạch khi chuyển cảnh.
 */
import { GAME_CONFIG } from '../../config/game';
import type { ContentIndex, StepRef } from '../../content/indexContent';
import type { DialogueLine, Step } from '../../content/types';
import type { SaveState } from '../../core/save';
import { resolveLines, speakerName, type PlayerProfile } from '../../systems/dialogue';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiStore } from '../../ui/game/store';
import type { DayScene } from '../scenes/dayScene';
import { createStepHooks, type StepHooks } from './stepHooks';

export const CANCEL = Symbol('cancel');
const PRESENT = new Set<Step['kind']>(['cutscene', 'choice', 'photo', 'minigame', 'free', 'album_restore']);

export interface PresentationQueueDeps {
  idx: ContentIndex;
  save: SaveState;
  engine: QuestEngine;
  ui: UiStore;
  introId: string;
  profile: () => PlayerProfile;
  fmt: (text: string) => string;
  getDayScene: () => DayScene | null;
  refreshHud: () => void;
  runPhoto: (step: Extract<Step, { kind: 'photo' }>, alive: () => boolean) => Promise<void>;
  runMinigame: (step: Extract<Step, { kind: 'minigame' }>, alive: () => boolean) => Promise<void>;
  /** Điểm nối Đợt 2 (stepHooks.ts). Bỏ trống = không có phần nào cắm (hành vi như trước). */
  hooks?: StepHooks;
}

export function createPresentationQueue(deps: PresentationQueueDeps) {
  const { idx, save, engine, ui, introId, profile, fmt, getDayScene, refreshHud, runPhoto, runMinigame } = deps;
  const hooks = deps.hooks ?? createStepHooks();
  let epoch = 0;
  let chain: Promise<void> = Promise.resolve();
  const presented = new Set<string>();
  const tickers = new Set<(dt: number) => void>();
  const waiters = new Map<string, (v: unknown) => void>();

  const enqueue = (fn: () => Promise<void>) => {
    chain = chain.then(fn).catch((e) => console.error('[game]', e));
    return chain;
  };
  const wait = <T>(slot: string) => new Promise<T | typeof CANCEL>((resolve) => waiters.set(slot, resolve as (v: unknown) => void));
  const signal = (slot: string, value: unknown = true) => {
    const w = waiters.get(slot);
    if (w) { waiters.delete(slot); w(value); }
  };
  const cancelAll = () => {
    epoch++;
    ui.get().minigame?.dispose();
    for (const [slot, w] of [...waiters]) { waiters.delete(slot); w(CANCEL); }
    tickers.clear(); presented.clear();
    ui.set({ dialogue: null, choice: null, photo: null, minigame: null, free: null, notice: null, endPrompt: null, profile: false });
    const dayScene = getDayScene();
    dayScene?.setStandZone(null); dayScene?.setPlayerMotion(null); dayScene?.lockCamera(null);
  };

  const locked = () => {
    const s = ui.get();
    return !!(s.fade.on || s.dialogue || s.choice || s.profile || s.endPrompt || s.dayEnd || s.minigame || s.notice || s.panel || s.feedback || s.consentAsk
      || (s.photo && (s.photo.phase !== 'countdown' || s.photo.posed)));
  };

  /** Phát thoại. Có `step` → gọi `hooks.stage(step, { line: i })` trước dòng thứ i (chỉ số theo mảng gốc). */
  async function playLines(lines: DialogueLine[], step?: Step): Promise<boolean> {
    const ep = epoch;
    for (let i = 0; i < lines.length; i++) {
      if (step?.stage?.length) { await hooks.stage(step, { line: i }); if (ep !== epoch) return false; }
      const l = resolveLines([lines[i]], engine.conditions)[0];
      if (!l) continue;
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

  /**
   * Bọc một bước bằng điểm nối Đợt 2: before → stage('start') → body → stage('end') → after → complete().
   * `body` trả false = bị hủy giữa chừng (không gọi after/complete). Dùng cho cả bước "tự hiện" và talk/interact ở dayController.
   */
  async function runStep(s: Step, alive: () => boolean, body: () => Promise<boolean>, complete: () => void): Promise<boolean> {
    if (!(await hooks.before(s, alive))) return false;
    if (s.stage?.length) { await hooks.stage(s, 'start'); if (!alive()) return false; }
    if (!(await body()) || !alive()) return false;
    if (s.stage?.length) { await hooks.stage(s, 'end'); if (!alive()) return false; }
    if (!(await hooks.after(s, alive))) return false;
    complete();
    return true;
  }

  async function presentStep(ref: StepRef): Promise<void> {
    const ep = epoch, s = ref.step;
    const alive = () => ep === epoch;
    if (s.kind === 'cutscene') {
      const dayScene = getDayScene();
      const weatherShot = dayScene?.lockWeatherCamera(s.id);
      await runStep(s, alive, async () => {
        if (!(await playLines(s.lines, s))) return false; // cancelAll đã nhả camera
        if (weatherShot) getDayScene()?.lockCamera(null);
        if (ref.quest.id === introId && !save.profile_done) {
          ui.set({ profile: true });
          if ((await wait('profile')) === CANCEL || !alive()) return false;
        }
        return true;
      }, () => engine.complete(s.id));
    } else if (s.kind === 'choice') {
      if (!(await hooks.before(s, alive))) return;
      if (s.stage?.length) { await hooks.stage(s, 'start'); if (!alive()) return; }
      const p = s.prompt ? resolveLines([s.prompt], engine.conditions)[0] : undefined;
      ui.set({
        choice: {
          who: p ? speakerName(p.speaker, idx, profile()) : '',
          prompt: p ? fmt(p.text) : null,
          options: s.options.map((o) => ({ id: o.id, text: fmt(o.text), tone: o.tone ? GAME_CONFIG.tone_labels[o.tone] : null })),
        },
      });
      const pick = await wait<string>('choice');
      if (pick === CANCEL || !alive()) return;
      ui.set({ choice: null });
      // R-D0: câu phản ứng theo lựa chọn (ChoiceOption.lines) — phát trước khi báo xong bước.
      const reaction = s.options.find((o) => o.id === pick)?.lines;
      if (reaction?.length && !(await playLines(reaction))) return;
      if (s.stage?.length) { await hooks.stage(s, 'end'); if (!alive()) return; }
      if (!(await hooks.after(s, alive))) return;
      engine.complete(s.id, { option_id: pick });
    } else if (s.kind === 'photo') {
      // photoRunner tự gọi engine.complete; điểm nối chỉ bọc trước/sau (R-B3 có thể chuyển hẳn vào photoRunner).
      if (!(await hooks.before(s, alive))) return;
      if (s.stage?.length) { await hooks.stage(s, 'start'); if (!alive()) return; }
      await runPhoto(s, alive);
    } else if (s.kind === 'minigame') {
      if (!(await hooks.before(s, alive))) return;
      if (s.stage?.length) { await hooks.stage(s, 'start'); if (!alive()) return; }
      await runMinigame(s, alive);
    } else if (s.kind === 'free') {
      await runStep(s, alive, async () => {
        ui.set({ free: { text: fmt(s.prompt ?? 'Dạo quanh một chút rồi đi tiếp.') } });
        if ((await wait('free')) === CANCEL || !alive()) return false;
        ui.set({ free: null });
        return true;
      }, () => engine.complete(s.id));
    } else if (s.kind === 'album_restore') {
      await runStep(s, alive, () => notice('Album', 'Một trang Album hiện rõ trở lại.', 'album_restore'), () => engine.complete(s.id));
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

  return {
    getEpoch: () => epoch,
    enqueue,
    wait,
    signal,
    cancelAll,
    locked,
    playLines,
    notice,
    drain,
    runStep,
    hooks,
    addTicker: (fn: (dt: number) => void) => { tickers.add(fn); },
    deleteTicker: (fn: (dt: number) => void) => { tickers.delete(fn); },
    clearTickers: () => { tickers.clear(); },
    runTickers: (dt: number) => { for (const f of [...tickers]) f(dt); },
  };
}

export type PresentationQueue = ReturnType<typeof createPresentationQueue>;
