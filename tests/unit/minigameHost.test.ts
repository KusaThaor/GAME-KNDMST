import { describe, expect, it, vi } from 'vitest';
import { getMg, newSave, recordMg } from '../../src/core/save';
import { MinigameHost } from '../../src/game/minigames/host';
import { getMinigame } from '../../src/game/minigames/registry';
import type { MinigameCtx, MinigameResult } from '../../src/game/minigames/types';

function setup(id = 'mg_demo', opponentId: string | null = null) {
  let time = 0;
  let ctx: MinigameCtx;
  const instance = { pause: vi.fn(), resume: vi.fn(), dispose: vi.fn() };
  const save = newSave('test');
  const finished = vi.fn((round: MinigameResult, _duration: number) => recordMg(save, id, round, opponentId, 'story'));
  const hooks = { changed: vi.fn(), started: vi.fn(), finished, next: vi.fn() };
  const game = { ...getMinigame(id), mount(_el: HTMLElement, context: MinigameCtx) {
    ctx = context;
    return instance;
  } };
  const host = new MinigameHost(game, false, { opponentId, difficulty: null,
    save: { get: vi.fn(), set: vi.fn() } }, hooks, () => time);
  return { host, hooks, save, instance, play: () => host.play({} as HTMLElement),
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
    const { host, play, hooks, save, tick } = setup();
    if (playing) { play(); tick(2000); host.toggleOverlay('menu'); }
    tick(60000);
    host.quit();
    expect(hooks.started).toHaveBeenCalledTimes(1);
    expect(hooks.finished).toHaveBeenCalledExactlyOnceWith({ result: 'quit' }, playing ? 2 : 0);
    host.quit();
    expect(getMg(save, 'mg_demo')).toMatchObject({ wins: 0, losses: 1, draws: 0 });
    expect(save.minigames_story.mg_demo).toEqual({ result: 'quit', stars: null });
    expect(hooks.next).toHaveBeenCalledTimes(1);
  });

  it('chơi lại cập nhật thành tích, giữ kết quả truyện và bỏ callback ván trước', () => {
    const { host, play, context, save, hooks } = setup();
    play();
    const first = context();
    first.onFinish({ result: 'lose', stars: 1 });
    play();
    first.onFinish({ result: 'draw' });
    context().onFinish({ result: 'win', stars: 3 });
    expect(save.minigames_story.mg_demo).toEqual({ result: 'lose', stars: 1 });
    expect(getMg(save, 'mg_demo')).toMatchObject({ losses: 1, wins: 1, draws: 0 });
    expect(save.flags).toEqual({});
    expect(hooks.started).toHaveBeenCalledTimes(2);
    expect(hooks.finished).toHaveBeenCalledTimes(2);
    expect(hooks.next).not.toHaveBeenCalled();
    host.next();
    expect(hooks.next).toHaveBeenCalledTimes(1);
  });

  it('thua Đức ở Caro tăng tỉ số truyện đúng một lần và ghi thành tích theo đối thủ', () => {
    const { play, context, save } = setup('mg_caro', 'chr_duc');
    play();
    expect(context().opponentId).toBe('chr_duc');
    context().onFinish({ result: 'lose' });
    expect(save.caro.series).toEqual({ quan: 3, duc: 4 });
    play();
    context().onFinish({ result: 'win' });
    expect(save.caro.series).toEqual({ quan: 3, duc: 4 });
    expect(save.minigames_story.mg_caro).toEqual({ result: 'lose', stars: null });
    expect(getMg(save, 'mg_caro', 'chr_duc')).toMatchObject({ losses: 1, wins: 1, draws: 0 });
    expect(Object.keys(save.minigames)).toEqual(['mg_caro.chr_duc']);
  });
});
