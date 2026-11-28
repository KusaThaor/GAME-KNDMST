/**
 * Trình chạy trình bày R-B2 (cắm vào `stepHooks`):
 *  - `before`: hiển thị `step.title_card` (fade ~0.5s – giữ – fade ~0.5s) và `step.narrative.before` trên `NarratorBanner`.
 *  - `after`: hiển thị `step.narrative.after` trên `NarratorBanner`.
 *  - `stage`: thực thi cue `camera` qua `dayScene.dollyCamera(point, dolly_ms)`.
 * Lời dẫn không khóa `queue.locked()` nên người chơi vẫn di chuyển tự do; hỗ trợ skip bằng Space/click và hủy sạch khi chuyển cảnh.
 */
import type { MemoryDay, NarrativeLine, StageAt, Step } from '../../content/types';
import { evalCondition, type ConditionContext } from '../../core/conditions';
import type { UiStore } from '../../ui/game/store';
import type { DayScene } from '../scenes/dayScene';
import { CANCEL, type PresentationQueue } from './presentationQueue';
import type { StepHookPart } from './stepHooks';

export const DEFAULT_TITLE_CARD_MS = 3000;
export const DEFAULT_NARRATOR_MS = 2600;
export const DEFAULT_DOLLY_MS = 900;

export interface NarrativeRunnerDeps {
  ui: UiStore;
  fmt: (text: string) => string;
  conditions: ConditionContext;
  getQueue?: () => Pick<PresentationQueue, 'wait' | 'signal'> | null;
  getDayScene?: () => Pick<DayScene, 'dollyCamera'> | null;
  getCurrentDay?: () => MemoryDay | null;
  /** Tiêm bộ chờ tùy biến cho unit test; trả false nếu bị hủy. */
  waitMs?: (slot: string, ms: number, alive: () => boolean) => Promise<boolean>;
}

function matchesAt(cueAt: StageAt | undefined, targetAt: StageAt): boolean {
  const actual = cueAt ?? 'start';
  if (typeof targetAt === 'string') return actual === targetAt;
  return typeof actual === 'object' && actual.line === targetAt.line;
}

function resolveNarrativeText(line: NarrativeLine, conditions: ConditionContext): string | null {
  if (!line.when || evalCondition(line.when, conditions)) return line.text;
  return line.fallback || null;
}

function resolveBackdropUrl(path?: string): string | null {
  if (!path) return null;
  if (/^(https?:|data:|blob:|\/)/.test(path)) return path;
  const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : '/';
  return `${base.endsWith('/') ? base : `${base}/`}${path}`;
}

export function createNarrativeRunner(deps: NarrativeRunnerDeps): StepHookPart {
  const { ui, fmt, conditions, getQueue, getDayScene, getCurrentDay } = deps;

  const waitOrSkip = async (slot: string, ms: number, alive: () => boolean): Promise<boolean> => {
    if (!alive()) return false;
    if (deps.waitMs) return deps.waitMs(slot, ms, alive);

    const queue = getQueue?.();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), Math.max(0, ms));
    });
    if (!queue) {
      await timeout;
      return alive();
    }
    const result = await Promise.race([queue.wait(slot), timeout]);
    if (timer !== undefined) clearTimeout(timer);
    if (result === 'timeout') queue.signal(slot);
    if (result === CANCEL || !alive()) return false;
    return true;
  };

  const playNarrative = async (lines: readonly NarrativeLine[], alive: () => boolean): Promise<boolean> => {
    for (const line of lines) {
      if (!alive()) return false;
      const text = resolveNarrativeText(line, conditions);
      if (!text) continue;
      ui.set({
        narrator: {
          text: fmt(text),
          channel: line.channel ?? 'narrator',
          backdrop: resolveBackdropUrl(line.backdrop),
        },
      });
      const ok = await waitOrSkip('next', line.duration_ms ?? DEFAULT_NARRATOR_MS, alive);
      if (!ok) {
        ui.set({ narrator: null });
        return false;
      }
    }
    ui.set({ narrator: null });
    return alive();
  };

  return {
    id: 'R-B2 narrative',
    async before(step: Step, alive: () => boolean) {
      if (!alive()) return false;
      if (step.title_card) {
        const durationMs = step.title_card.duration_ms ?? DEFAULT_TITLE_CARD_MS;
        ui.set({
          titleCard: {
            title: fmt(step.title_card.title),
            subtitle: step.title_card.subtitle ? fmt(step.title_card.subtitle) : null,
            durationMs,
            backdrop: resolveBackdropUrl(step.title_card.backdrop),
          },
        });
        const ok = await waitOrSkip('title_card', durationMs, alive);
        ui.set({ titleCard: null });
        if (!ok) return false;
      }
      if (step.narrative?.before?.length) {
        if (!(await playNarrative(step.narrative.before, alive))) return false;
      }
      return alive();
    },
    async after(step: Step, alive: () => boolean) {
      if (!alive()) return false;
      if (step.narrative?.after?.length) {
        if (!(await playNarrative(step.narrative.after, alive))) return false;
      }
      return alive();
    },
    async stage(step: Step, at: StageAt) {
      const cues = step.stage;
      if (!cues?.length) return;
      const scene = getDayScene?.();
      const day = getCurrentDay?.();
      for (const cue of cues) {
        if (!matchesAt(cue.at, at) || cue.cue !== 'camera') continue;
        if (!scene) continue;
        if (cue.camera_id === null) {
          scene.dollyCamera(null, cue.dolly_ms);
          continue;
        }
        const point = day?.cameras.find((c) => c.id === cue.camera_id);
        if (!point) continue;
        const ms = cue.dolly_ms ?? DEFAULT_DOLLY_MS;
        scene.dollyCamera(point, ms);
        if (cue.wait && ms > 0) {
          await waitOrSkip('stage_camera', ms, () => true);
        }
      }
    },
  };
}
