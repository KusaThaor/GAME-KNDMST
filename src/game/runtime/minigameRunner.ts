/**
 * Điều phối minigame trong câu chuyện: thoại mở đầu (`intro_lines`) → `MinigameHost`
 * (kèm cầu nối `save.flags` và sự kiện analytics) → thoại kết (`lines`) → hoàn thành bước.
 */
import type { Step } from '../../content/types';
import type { EventBus } from '../../core/eventBus';
import { recordMg, type SaveState } from '../../core/save';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiStore } from '../../ui/game/store';
import { DEFAULT_WISH_OPTIONS } from '../minigames/games/mg_fold_boat';
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

function readMgData(save: SaveState, gameId: string, key: string): unknown {
  const raw = save.flags[`mg.${gameId}.data.${key}`];
  if (typeof raw !== 'string') return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

function writeMgData(save: SaveState, gameId: string, key: string, value: unknown): void {
  const name = `mg.${gameId}.data.${key}`;
  const json = JSON.stringify(value);
  if (json === undefined) delete save.flags[name];
  else save.flags[name] = json;
}

function syncFoldBoatWish(save: SaveState): void {
  const wish = readMgData(save, 'mg_fold_boat', 'wish');
  if (typeof wish !== 'string' || !wish.trim()) return;
  save.flags['m1.boat_wish'] = wish;
  if (save.flags['m1.wish'] === undefined) save.flags['m1.wish'] = wish;
}

function prepareBoatWish(save: SaveState, engine: QuestEngine): void {
  if (readMgData(save, 'mg_boat', 'wish_text') !== undefined) return;
  const foldedText = readMgData(save, 'mg_fold_boat', 'wish_text');
  if (typeof foldedText === 'string' && foldedText.trim()) {
    writeMgData(save, 'mg_boat', 'wish_text', foldedText.trim());
    return;
  }
  const wishFlag =
    save.flags['m1.boat_wish'] ??
    engine.flag('m1.boat_wish') ??
    save.flags['m1.wish'] ??
    engine.flag('m1.wish');
  if (typeof wishFlag !== 'string' || !wishFlag.trim()) return;
  const matched = DEFAULT_WISH_OPTIONS.find((o) => o.id === wishFlag);
  writeMgData(save, 'mg_boat', 'wish_text', matched ? matched.text : wishFlag.trim());
}

export function createMinigameRunner(deps: MinigameRunnerDeps) {
  const { save, bus, engine, ui, getQueue } = deps;

  return async function runMinigame(s: Extract<Step, { kind: 'minigame' }>, alive: () => boolean): Promise<void> {
    const queue = getQueue();
    if (s.intro_lines?.length && !(await queue.playLines(s.intro_lines))) return; // thoại TRƯỚC khi mở trò; bị hủy (chơi lại Ngày…) thì không mở trò [N-01b]
    if (s.game === 'mg_boat') prepareBoatWish(save, engine);
    const mg = { game_id: s.game, context: 'story' as const, page_id: engine.dayId, opponent_id: s.opponent ?? null, difficulty: null };
    const host = new MinigameHost(getMinigame(s.game), save.minigames_story[s.game] !== undefined, {
      opponentId: mg.opponent_id,
      difficulty: mg.difficulty,
      save: {
        get(key) {
          return readMgData(save, s.game, key);
        },
        set(key, value) {
          writeMgData(save, s.game, key, value);
          bus.emit('save_requested', { reason: 'minigame_data' });
        },
      },
    }, {
      changed: () => ui.set({ minigame: host }),
      started: () => bus.emit('minigame_started', mg),
      finished(round, duration_s) {
        if (s.game === 'mg_fold_boat') syncFoldBoatWish(save);
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
    if (s.game === 'mg_fold_boat') syncFoldBoatWish(save);
    ui.set({ minigame: null });
    if (s.lines?.length && !(await queue.playLines(s.lines))) return; // thoại của bước phát SAU khi chơi xong (thắng, thua hay "Bỏ qua") [N-01]
    if (s.stage?.length) { await queue.hooks.stage(s, 'end'); if (!alive()) return; }
    if (!(await queue.hooks.after(s, alive))) return;
    engine.complete(s.id);
  };
}
