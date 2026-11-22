import { describe, expect, it, vi } from 'vitest';
import type { FlagValue } from '../../src/content/types';
import { MinigameHost, recordRound } from '../../src/game/minigames/host';
import { getMinigame } from '../../src/game/minigames/registry';
import type { MinigameCtx, MinigameResult } from '../../src/game/minigames/types';

function setup() {
  let time = 0;
  let ctx: MinigameCtx;
  const instance = { pause: vi.fn(), resume: vi.fn(), dispose: vi.fn() };
  const flags: Record<string, FlagValue> = {};
  const finished = vi.fn((round: MinigameResult, _duration: number) => recordRound(flags, 'test', round));
  const hooks = { changed: vi.fn(), started: vi.fn(), finished, next: vi.fn() };
  const game = { ...getMinigame('mg_demo'), mount(_el: HTMLElement, context: MinigameCtx) {
    ctx = context;
    return instance;
  } };
  const host = new MinigameHost(game, false, { opponentId: null, difficulty: null,
    save: { get: vi.fn(), set: vi.fn() } }, hooks, () => time);
  return { host, hooks, flags, instance, play: () => host.play({} as HTMLElement),
    tick: (ms: number) => { time += ms; }, context: () => ctx };
}

describe('MinigameHost', () => {
  it('đăng ký demo và trả thẻ Xong khi id lạ', () => {
    expect(getMinigame('mg_demo').id).toBe('mg_demo');
    expect(getMinigame('unknown').id).toBe('mg_fallback');
  });

  it.each(['win', 'lose', 'draw', 'complete'] as const)('%s vẫn cho đi tiếp đúng một lần', result => {
    const { host, play, context, hooks, instance } = setup();
    expect(host.phase).toBe('rules');
    play();
    const round = { result, score: 4, hints_used: 2, stars: 1 };
    context().onFinish(round);
    context().onFinish(round);
    expect(host.result).toEqual(round);
    expect(hooks.finished).toHaveBeenCalledExactlyOnceWith(round, 0);
    host.next();
    host.next();
    expect(hooks.next).toHaveBeenCalledTimes(1);
    expect(instance.dispose).toHaveBeenCalledTimes(1);
  });

  it('dừng module và đồng hồ trong menu và màn luật', () => {
    const { host, play, context, hooks, instance, tick } = setup();
    play();
    for (const overlay of ['help', 'menu'] as const) {
      tick(1000);
      host.toggleOverlay(overlay);
      tick(10000);
      context().onFinish({ result: 'lose' });
      host.toggleOverlay(overlay);
    }
    tick(1000);
    context().onFinish({ result: 'win' });
    expect(instance.pause).toHaveBeenCalledTimes(2);
    expect(instance.resume).toHaveBeenCalledTimes(2);
    expect(hooks.finished).toHaveBeenCalledExactlyOnceWith({ result: 'win' }, 3);
  });

  it.each([true, false])('bỏ qua hoặc bỏ ván, đã chơi: %s', playing => {
    const { host, play, hooks, flags, tick } = setup();
    if (playing) { play(); tick(2000); host.toggleOverlay('menu'); }
    tick(60000);
    host.quit();
    expect(hooks.started).toHaveBeenCalledTimes(1);
    expect(hooks.finished).toHaveBeenCalledExactlyOnceWith({ result: 'quit' }, playing ? 2 : 0);
    expect(flags['mg.test.lose']).toBe(1);
    expect(hooks.next).toHaveBeenCalledTimes(1);
  });

  it('chơi lại cập nhật thành tích, giữ kết quả truyện và bỏ callback ván trước', () => {
    const { host, play, context, flags, hooks } = setup();
    play();
    const first = context();
    first.onFinish({ result: 'lose', score: 1 });
    play();
    first.onFinish({ result: 'draw' });
    context().onFinish({ result: 'win', score: 3 });
    expect(flags).toEqual({ 'mg.test.result': 'lose', 'mg.test.lose': 1, 'mg.test.win': 1, 'mg.test.best_score': 3 });
    expect(hooks.started).toHaveBeenCalledTimes(2);
    expect(hooks.finished).toHaveBeenCalledTimes(2);
    expect(hooks.next).not.toHaveBeenCalled();
    host.next();
    expect(hooks.next).toHaveBeenCalledTimes(1);
  });
});
