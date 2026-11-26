/**
 * R-B4 · Phản ứng theo bước & âm thanh:
 *  - `step_activated` / `step_progress` / `step_completed`: thoại từng điểm `lines_by_target`, bộ đếm `collectProgress` (`0/3`…`3/3`), SFX `tick`.
 *  - `StepHookPart.stage`: thực thi `StageCue` `{ cue: 'sfx', sfx }` và phát SFX theo `{ cue: 'weather', preset }`.
 *  - `photo_attempt` / `photo_kept` / `message_sent` / `weather_by_step`: phát SFX tương ứng.
 *  - Đẩy sự kiện tới các bộ đồ 3D động (`dressing:m1_base`, `dressing:m1_trang2`) qua `getDayScene()?.scene`.
 */
import type * as THREE from 'three';
import type { ContentIndex } from '../../content/indexContent';
import type { StageAt, Step } from '../../content/types';
import type { EventBus } from '../../core/eventBus';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiStore } from '../../ui/game/store';
import type { M1BaseController } from '../../world/dressing/sets/m1_base';
import type { M1Trang2Controller } from '../../world/dressing/sets/m1_trang2';
import { playSfx } from '../sfx';
import type { DayScene } from '../scenes/dayScene';
import type { PresentationQueue } from './presentationQueue';
import type { StepHookPart } from './stepHooks';

export interface StepReactionsDeps {
  idx: ContentIndex;
  bus: EventBus;
  engine: Pick<QuestEngine, 'dayId' | 'flag'>;
  ui: Pick<UiStore, 'set' | 'get'>;
  getQueue: () => Pick<PresentationQueue, 'enqueue' | 'playLines'>;
  getDayScene: () => Pick<DayScene, 'scene'> | null;
  sfx?: (cue: string) => void;
}

const WEATHER_SFX: Record<string, string> = {
  rain_shower: 'sfx_summer_rain_thunder',
  rain_overcast: 'sfx_rain_pour',
  after_rain_rainbow: 'sfx_birds_after_rain',
};

function stageAtMatches(cueAt: StageAt | undefined, at: StageAt): boolean {
  const target = cueAt ?? 'start';
  if (typeof target === 'string' || typeof at === 'string') return target === at;
  return target.line === at.line;
}

function getDressingControllers(scene: THREE.Scene | undefined | null): {
  m1Base?: M1BaseController;
  m1Trang2?: M1Trang2Controller;
} {
  if (!scene) return {};
  const baseObj = scene.getObjectByName('dressing:m1_base');
  const t2Obj = scene.getObjectByName('dressing:m1_trang2');
  return {
    m1Base: baseObj?.userData?.m1Base as M1BaseController | undefined,
    m1Trang2: t2Obj?.userData?.m1Trang2 as M1Trang2Controller | undefined,
  };
}

export function createStepReactions(deps: StepReactionsDeps): StepHookPart & { dispose(): void } {
  const { idx, bus, engine, ui, getQueue, getDayScene } = deps;
  const play = deps.sfx ?? playSfx;
  let pendingCollectClear = false;

  const forwardScene = (
    name: 'day_started' | 'choice_made' | 'minigame_finished' | 'step_activated' | 'step_completed',
    payload: Record<string, unknown>,
  ) => {
    const { m1Base, m1Trang2 } = getDressingControllers(getDayScene()?.scene);
    m1Base?.onEvent(name, payload, (f) => engine.flag(f));
    m1Trang2?.onEvent(name, payload);
  };

  const playWeatherSfx = (preset: string | undefined) => {
    const cue = preset ? WEATHER_SFX[preset] : undefined;
    if (cue) play(cue);
  };

  const offs = [
    bus.on('day_started', (e) => {
      pendingCollectClear = false;
      ui.set({ collectProgress: null });
      forwardScene('day_started', e as unknown as Record<string, unknown>);
    }),
    bus.on('day_completed', () => {
      pendingCollectClear = false;
      ui.set({ collectProgress: null });
    }),
    bus.on('hub_entered', () => {
      pendingCollectClear = false;
      ui.set({ collectProgress: null });
    }),
    bus.on('step_activated', (e) => {
      const step = idx.steps.get(e.step_id)?.step;
      if (step?.kind === 'collect') {
        pendingCollectClear = false;
        ui.set({ collectProgress: step.show_counter !== false ? { done: 0, total: step.count } : null });
      } else if (!pendingCollectClear && ui.get().collectProgress) {
        ui.set({ collectProgress: null });
      }
      const dayId = engine.dayId ?? idx.steps.get(e.step_id)?.quest.memory_day_id ?? null;
      const weatherPreset = dayId ? idx.days.get(dayId)?.weather_by_step?.[e.step_id] : undefined;
      playWeatherSfx(weatherPreset);
      forwardScene('step_activated', e as unknown as Record<string, unknown>);
    }),
    bus.on('step_progress', (e) => {
      play('sfx_tick');
      const step = idx.steps.get(e.step_id)?.step;
      if (step?.kind !== 'collect') return;
      if (step.show_counter !== false) {
        ui.set({ collectProgress: { done: e.done, total: e.total } });
      }
      const lines = e.target ? step.lines_by_target?.[e.target] : undefined;
      if (lines?.length) {
        const isLast = e.done >= e.total;
        if (isLast) pendingCollectClear = true;
        void getQueue().enqueue(async () => {
          await getQueue().playLines(lines);
          if (isLast) {
            pendingCollectClear = false;
            ui.set({ collectProgress: null });
          }
        });
      }
    }),
    bus.on('step_completed', (e) => {
      if (e.kind === 'collect' && !pendingCollectClear) {
        ui.set({ collectProgress: null });
      }
      forwardScene('step_completed', e as unknown as Record<string, unknown>);
    }),
    bus.on('choice_made', (e) => {
      forwardScene('choice_made', e as unknown as Record<string, unknown>);
    }),
    bus.on('minigame_finished', (e) => {
      forwardScene('minigame_finished', e as unknown as Record<string, unknown>);
    }),
    bus.on('photo_attempt', () => play('sfx_camera_shutter')),
    bus.on('photo_kept', () => play('sfx_tick')),
    bus.on('message_sent', () => play('sfx_message_sent')),
  ];

  return {
    id: 'R-B4 reactions',
    before(step: Step) {
      if (!pendingCollectClear && step.kind !== 'collect' && ui.get().collectProgress) {
        ui.set({ collectProgress: null });
      }
      if (step.id.startsWith('q_m1_main_03.')) {
        forwardScene('step_activated', { step_id: step.id, kind: step.kind, resumed: true });
      }
      return true;
    },
    stage(step: Step, at: StageAt) {
      for (const cue of step.stage ?? []) {
        if (!stageAtMatches(cue.at, at)) continue;
        if (cue.cue === 'sfx') play(cue.sfx);
        else if (cue.cue === 'weather') playWeatherSfx(cue.preset);
      }
    },
    dispose() {
      for (const off of offs.splice(0)) off();
    },
  };
}
