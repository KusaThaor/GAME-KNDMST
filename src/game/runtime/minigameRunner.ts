/**
 * Điều phối minigame trong câu chuyện: thoại mở đầu (`intro_lines`) → `MinigameHost`
 * (kèm cầu nối `save.flags` và sự kiện analytics) → thoại kết (`lines`) → hoàn thành bước.
 */
import type { Step } from '../../content/types';
import type { EventBus } from '../../core/eventBus';
import { recordMg, type SaveState } from '../../core/save';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiStore } from '../../ui/game/store';
import { MinigameHost } from '../minigames/host';
import { getMinigame } from '../minigames/registry';
import { CANCEL, type PresentationQueue } from './presentationQueue';

export interface MinigameRunnerDeps {
  save: SaveState;
  bus: EventBus;
  engine: QuestEngine;
  ui: UiStore;
  getQueue: () => PresentationQueue;
}

export function createMinigameRunner(deps: MinigameRunnerDeps) {
  const { save, bus, engine, ui, getQueue } = deps;

  return async function runMinigame(s: Extract<Step, { kind: 'minigame' }>, alive: () => boolean): Promise<void> {
    const queue = getQueue();
    if (s.intro_lines?.length && !(await queue.playLines(s.intro_lines))) return; // thoại TRƯỚC khi mở trò; bị hủy (chơi lại Ngày…) thì không mở trò [N-01b]
    const mg = { game_id: s.game, context: 'story' as const, page_id: engine.dayId, opponent_id: s.opponent ?? null, difficulty: null };
    const prefix = `mg.${s.game}.`;
    const host = new MinigameHost(getMinigame(s.game), save.minigames_story[s.game] !== undefined, {
      opponentId: mg.opponent_id,
      difficulty: mg.difficulty,
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
        bus.emit('minigame_finished', {
          ...mg,
          duration_s,
          result: round.result,
          stars: round.stars ?? null,
          hints_used: round.hints_used ?? null,
          score: round.score ?? null,
        });
        bus.emit('save_requested', { reason: 'minigame_result' });
      },
      next: () => queue.signal('minigame'),
    });
    const done = queue.wait('minigame');
    ui.set({ minigame: host });
    if ((await done) === CANCEL || !alive()) return;
    ui.set({ minigame: null });
    if (s.lines?.length && !(await queue.playLines(s.lines))) return; // thoại của bước phát SAU khi chơi xong (thắng, thua hay "Bỏ qua") [N-01]
    engine.complete(s.id);
  };
}
