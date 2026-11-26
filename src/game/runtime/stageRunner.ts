/**
 * Đạo diễn NPC theo bước quest (R-B1): cắm vào `stepHooks.stage(step, at)` để thực thi các StageCue
 * điều khiển nhân vật (`move`, `teleport`, `face`, `motion`, `visible`).
 * Các cue thuộc nhánh khác (`camera`, `weather`, `sfx`, `prop`) được bỏ qua lặng lẽ.
 */
import type { StageAt, StageCue, Step } from '../../content/types';
import type { DayScene } from '../scenes/dayScene';
import type { StepHookPart } from './stepHooks';

export type StageSceneApi = Pick<
  DayScene,
  'moveActor' | 'teleportActor' | 'faceActor' | 'setActorMotion' | 'setActorVisible'
>;

export interface StageRunnerDeps {
  getDayScene: () => StageSceneApi | null;
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
    case 'camera':
    case 'weather':
    case 'sfx':
    case 'prop':
      break;
  }
}

export function createStageRunner(deps: StageRunnerDeps): StepHookPart {
  return {
    id: 'R-B1 stage',
    async stage(step: Step, at: StageAt): Promise<void> {
      const cues = step.stage;
      if (!cues?.length) return;
      const startScene = deps.getDayScene();
      if (!startScene) return;
      for (const cue of cues) {
        if (!matchesStageAt(cue.at, at)) continue;
        const current = deps.getDayScene();
        if (!current || current !== startScene) return;
        await runCue(cue, current);
      }
    },
  };
}
