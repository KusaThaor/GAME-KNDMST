import { describe, expect, it, vi } from 'vitest';
import type { Step } from '../../src/content/types';
import { indexContent } from '../../src/content/indexContent';
import { EventBus } from '../../src/core/eventBus';
import { newSave } from '../../src/core/save';
import { getMinigame } from '../../src/game/minigames/registry';
import {
  DEFAULT_WISH_OPTIONS,
  FOLD_BOAT,
  FoldBoatLogic,
  resolveWishOptions,
} from '../../src/game/minigames/games/mg_fold_boat';
import { createMinigameRunner } from '../../src/game/runtime/minigameRunner';
import { createPresentationQueue } from '../../src/game/runtime/presentationQueue';
import { createStepHooks } from '../../src/game/runtime/stepHooks';
import type { QuestEngine } from '../../src/systems/questEngine';
import { createUiStore } from '../../src/ui/game/store';
import { makeConfig, makePack } from './fixtures/pack';

describe('mg_fold_boat — đăng ký trò', () => {
  it('có trong registry, kiểu special, tiêu đề đúng và luật 1–3 dòng', () => {
    const game = getMinigame('mg_fold_boat');
    expect(game.id).toBe('mg_fold_boat');
    expect(game.title).toBe('Gấp thuyền giấy');
    expect(game.kind).toBe('special');
    expect(game.rules.lines.length).toBeGreaterThan(0);
    expect(game.rules.lines.length).toBeLessThanOrEqual(3);
  });
});

describe('FoldBoatLogic — 3 nhịp gấp → chọn → tự ghi', () => {
  const swipeCurrentFold = (logic: FoldBoatLogic) => {
    const pts = logic.currentFold!.checkpoints;
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (pts.length <= 4) {
      return logic.swipeFold(first.x, first.y, last.x, last.y);
    }
    const mid = pts[Math.floor(pts.length / 2)];
    logic.swipeFold(first.x, first.y, mid.x, mid.y);
    return logic.swipeFold(mid.x, mid.y, last.x, last.y);
  };

  it('nhịp 1 (fold): chạm 1 điểm không qua nếp; vuốt dọc 4 nếp gấp thì sang nhịp chọn điều ước (không có thua)', () => {
    const logic = new FoldBoatLogic();
    expect(logic.phase).toBe('fold');
    expect(logic.foldStep).toBe(0);

    // Chạm một điểm đơn lẻ giữa nếp 1 chỉ trúng tối đa các chốt gần, chưa hoàn thành nếp
    expect(logic.swipeFold(240, 155)).toBe(false);
    expect(logic.foldStep).toBe(0);
    expect(logic.foldHitCount).toBeGreaterThan(0);
    expect(logic.chooseWish('friendship')).toBe(false);

    // Vuốt đủ 4 bước nếp gấp
    for (let s = 0; s < FOLD_BOAT.steps.length; s++) {
      expect(swipeCurrentFold(logic)).toBe(true);
    }
    expect(logic.phase).toBe('wish');
  });

  it('nhịp 1 hỗ trợ bàn phím Space/Enter hoàn thành từng nếp', () => {
    const logic = new FoldBoatLogic();
    for (let s = 0; s < FOLD_BOAT.steps.length; s++) {
      expect(logic.completeCurrentFold()).toBe(true);
    }
    expect(logic.phase).toBe('wish');
    expect(logic.completeCurrentFold()).toBe(false);
  });

  it('nhịp 2 (wish): dùng 3 điều ước mặc định hoặc đọc từ wish_options, hỗ trợ chọn theo id hoặc chỉ số', () => {
    expect(resolveWishOptions(undefined)).toEqual(DEFAULT_WISH_OPTIONS);
    expect(resolveWishOptions([])).toEqual(DEFAULT_WISH_OPTIONS);
    expect(resolveWishOptions([{ id: 'custom', text: 'Chạy thiệt xa' }])).toEqual([
      { id: 'custom', text: 'Chạy thiệt xa' },
    ]);

    const logic = new FoldBoatLogic();
    for (let s = 0; s < FOLD_BOAT.steps.length; s++) logic.completeCurrentFold();
    expect(logic.wishOptions).toEqual(DEFAULT_WISH_OPTIONS);
    expect(logic.chooseWish('unknown')).toBe(false);
    expect(logic.chooseWish(99)).toBe(false);

    expect(logic.chooseWish(1)).toBe(true);
    expect(logic.selectedWish).toEqual(DEFAULT_WISH_OPTIONS[1]);
    expect(logic.phase).toBe('write');
  });

  it('nhịp 3 (write): kéo nét ngoài cánh buồm không tính; tô đạt ≥ 85% điểm hướng dẫn → done, 3 sao', () => {
    const logic = new FoldBoatLogic();
    for (let s = 0; s < FOLD_BOAT.steps.length; s++) logic.completeCurrentFold();
    logic.chooseWish('friendship');

    // Nét vẽ nằm ngoài vùng cánh buồm
    expect(logic.traceWrite(10, 10, 80, 80)).toBe(0);
    expect(logic.phase).toBe('write');

    // Tô hàng 1 (6/12 = 50% < 85%)
    logic.traceWrite(170, 140, 310, 140);
    expect(logic.writeProgress).toBeCloseTo(0.5);
    expect(logic.phase).toBe('write');

    // Tô hàng 2 → đủ 12/12 (100% ≥ 85%) → done
    const pct = logic.traceWrite(170, 168, 310, 168);
    expect(pct).toBe(1);
    expect(logic.phase).toBe('done');
    expect(logic.result()).toEqual({ result: 'complete', stars: 3 });
  });

  it('nhịp 3 hỗ trợ giữ Space (advanceWriteByKey) để tô đủ ngưỡng và hoàn thành', () => {
    const logic = new FoldBoatLogic();
    for (let s = 0; s < FOLD_BOAT.steps.length; s++) logic.completeCurrentFold();
    logic.chooseWish('secret');

    logic.advanceWriteByKey(FOLD_BOAT.keyWriteTotalMs / 2);
    expect(logic.phase).toBe('write');
    expect(logic.writeProgress).toBeLessThan(FOLD_BOAT.writeDoneRatio);

    logic.advanceWriteByKey(FOLD_BOAT.keyWriteTotalMs / 2);
    expect(logic.phase).toBe('done');
    expect(logic.result()).toEqual({ result: 'complete', stars: 3 });
  });
});

describe('minigameRunner — nối stage/after và điều ước giữa mg_fold_boat ↔ mg_boat', () => {
  function makeRunnerDeps(opts: { hookAfterResult?: boolean; log?: string[] } = {}) {
    const save = newSave('test');
    const bus = new EventBus();
    const ui = createUiStore();
    const idx = indexContent(makePack(), makeConfig());
    const complete = vi.fn();
    const engine = {
      dayId: 'd.g07.01',
      flag: (n: string) => save.flags[n],
      conditions: { flag: (n: string) => save.flags[n], questCompleted: () => false, dayCompleted: () => false },
      complete,
    } as unknown as QuestEngine;

    const hooks = createStepHooks([
      {
        id: 'test-hook',
        stage: (_s, at) => { opts.log?.push(`stage:${JSON.stringify(at)}`); },
        after: () => {
          opts.log?.push('after');
          return opts.hookAfterResult ?? true;
        },
      },
    ]);

    let queue!: ReturnType<typeof createPresentationQueue>;
    const runMinigame = createMinigameRunner({ save, bus, engine, ui, getQueue: () => queue });
    queue = createPresentationQueue({
      idx,
      save,
      engine,
      ui,
      introId: 'q_hub_pd_01',
      profile: () => ({ player_name: 'An', gender: 'male' }),
      fmt: (t) => t,
      getDayScene: () => null,
      refreshHud: () => {},
      runPhoto: async () => {},
      runMinigame,
      hooks,
    });

    return { save, bus, ui, complete, queue, runMinigame };
  }

  it('gọi hooks.stage(s, "end") và hooks.after(s, alive) trước engine.complete; after=false thì dừng', async () => {
    const log: string[] = [];
    const { ui, complete, runMinigame } = makeRunnerDeps({ log });
    const step: Extract<Step, { kind: 'minigame' }> = {
      id: 'q_m1_main_02.s03',
      kind: 'minigame',
      game: 'mg_fold_boat',
      stage: [{ cue: 'motion', actor: 'NPC_C', motion: 'cheer', at: 'end' }],
    };

    const p = runMinigame(step, () => true);
    await Promise.resolve();
    ui.get().minigame!.quit();
    await p;

    expect(log).toEqual(['stage:"end"', 'after']);
    expect(complete).toHaveBeenCalledExactlyOnceWith(step.id);

    // Nếu after trả false thì không gọi engine.complete
    const logBlocked: string[] = [];
    const blocked = makeRunnerDeps({ log: logBlocked, hookAfterResult: false });
    const p2 = blocked.runMinigame(step, () => true);
    await Promise.resolve();
    blocked.ui.get().minigame!.quit();
    await p2;
    expect(logBlocked).toEqual(['stage:"end"', 'after']);
    expect(blocked.complete).not.toHaveBeenCalled();
  });

  it('mg_fold_boat xong ghi m1.boat_wish (và m1.wish nếu chưa có); mg_boat nạp wish_text vào mg.mg_boat.data.wish_text', async () => {
    const { save, ui, runMinigame } = makeRunnerDeps();
    const foldStep: Extract<Step, { kind: 'minigame' }> = {
      id: 'q_m1_main_02.s03',
      kind: 'minigame',
      game: 'mg_fold_boat',
    };

    const pFold = runMinigame(foldStep, () => true);
    await Promise.resolve();
    const foldHost = ui.get().minigame!;
    // Giả lập mg_fold_boat lưu điều ước trước khi hoàn thành
    save.flags['mg.mg_fold_boat.data.wish'] = JSON.stringify('fun');
    save.flags['mg.mg_fold_boat.data.wish_text'] = JSON.stringify('Lớp 7 vui hơn lớp 6');
    foldHost.quit();
    await pFold;

    expect(save.flags['m1.boat_wish']).toBe('fun');
    expect(save.flags['m1.wish']).toBe('fun');

    // Chạy tiếp mg_boat → tự nạp wish_text vào mg.mg_boat.data.wish_text
    const boatStep: Extract<Step, { kind: 'minigame' }> = {
      id: 'q_m1_main_02.s04',
      kind: 'minigame',
      game: 'mg_boat',
    };
    const pBoat = runMinigame(boatStep, () => true);
    await Promise.resolve();
    expect(save.flags['mg.mg_boat.data.wish_text']).toBe(JSON.stringify('Lớp 7 vui hơn lớp 6'));
    ui.get().minigame!.quit();
    await pBoat;
  });

  it('mg_boat đọc được điều ước từ flag m1.boat_wish / m1.wish khi chưa có dữ liệu mg_fold_boat', async () => {
    const { save, ui, runMinigame } = makeRunnerDeps();
    save.flags['m1.boat_wish'] = 'friendship';
    const boatStep: Extract<Step, { kind: 'minigame' }> = {
      id: 'q_m1_main_02.s04',
      kind: 'minigame',
      game: 'mg_boat',
    };
    const pBoat = runMinigame(boatStep, () => true);
    await Promise.resolve();
    expect(save.flags['mg.mg_boat.data.wish_text']).toBe(JSON.stringify('Mai mốt vẫn chơi chung vầy'));
    ui.get().minigame!.quit();
    await pBoat;
  });
});
