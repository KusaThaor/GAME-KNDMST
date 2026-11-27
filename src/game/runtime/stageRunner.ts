/**
 * Đạo diễn NPC theo bước quest (R-B1): cắm vào `stepHooks.stage(step, at)` để thực thi các StageCue
 * điều khiển nhân vật (`move`, `teleport`, `face`, `motion`, `visible`), ánh sáng (`weather`) và màn tối (`fade`, BUG-T1-B).
 * Các cue thuộc nhánh khác (`camera`, `sfx`, `prop`) được bỏ qua lặng lẽ.
 */
import type { StageAt, StageCue, Step } from '../../content/types';
import type { DayScene } from '../scenes/dayScene';
import type { StepHookPart } from './stepHooks';

export type StageSceneApi = Pick<
  DayScene,
  'moveActor' | 'teleportActor' | 'faceActor' | 'setActorMotion' | 'setActorVisible' | 'setWeather'
>;

/** Thời gian chờ màn tối phủ kín (khớp `transition: opacity .45s` của `.g-fade` trong styles.css). */
export const STAGE_FADE_MS = 480;

export interface StageRunnerDeps {
  getDayScene: () => StageSceneApi | null;
  /** Bật/tắt màn tối toàn màn hình (`ui.fade`). Bỏ trống = cue `fade` không làm gì. */
  setFade?: (on: boolean) => void;
  /** Chờ bao lâu sau khi bật màn tối (ms); mặc định STAGE_FADE_MS. */
  fadeMs?: number;
}

/** Kiểm tra mốc `cue.at` (mặc định 'start') có khớp với mốc `at` đang phát không. */
export function matchesStageAt(cueAt: StageAt | undefined, at: StageAt): boolean {
  const effective = cueAt ?? 'start';
  if (typeof at === 'string' || typeof effective === 'string') return effective === at;
  return effective.line === at.line;
}

async function runCue(cue: StageCue, scene: StageSceneApi): Promise<void> {
  switch (cue.cue) {
    case 'move': {
      const done = scene.moveActor(cue.actor, cue.to, cue.pace ?? 'walk');
      if (cue.wait) await done;
      else void done.catch(() => undefined);
      break;
    }
    case 'teleport':
      scene.teleportActor(cue.actor, cue.to);
      break;
    case 'face':
      scene.faceActor(cue.actor, cue.toward);
      break;
    case 'motion':
      scene.setActorMotion(cue.actor, cue.motion);
      break;
    case 'visible':
      scene.setActorVisible(cue.actor, cue.visible);
      break;
    case 'weather':
      scene.setWeather(cue.preset, cue.tween_s ?? 0);
      break;
    case 'fade':
    case 'camera':
    case 'sfx':
    case 'prop':
      break;
  }
}

export function createStageRunner(deps: StageRunnerDeps): StepHookPart {
  const fadeMs = deps.fadeMs ?? STAGE_FADE_MS;
  return {
    id: 'R-B1 stage',
    async stage(step: Step, at: StageAt): Promise<void> {
      const cues = step.stage;
      if (!cues?.length) return;
      const startScene = deps.getDayScene();
      if (!startScene) return;
      let dark = false;
      try {
        for (const cue of cues) {
          if (!matchesStageAt(cue.at, at)) continue;
          const current = deps.getDayScene();
          if (!current || current !== startScene) return;
          if (cue.cue === 'fade') {
            if (!deps.setFade) continue;
            deps.setFade(cue.on);
            dark = cue.on;
            if (cue.on && fadeMs > 0) await new Promise((r) => setTimeout(r, fadeMs));
            continue;
          }
          await runCue(cue, current);
        }
      } finally {
        // Không để kẹt màn tối khi dữ liệu quên tắt hoặc cue lỗi; nếu cảnh đã đổi thì màn tối là của lần chuyển cảnh, để nguyên.
        if (dark && deps.getDayScene() === startScene) deps.setFade?.(false);
      }
    },
  };
}
