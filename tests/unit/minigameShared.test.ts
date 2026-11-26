import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRng, shuffle } from '../../src/core/random';
import { createHiDpiCanvas, MG_FONT, MG_INK, mgFont } from '../../src/game/minigames/shared/canvasStage';
import { createMinigameLoop } from '../../src/game/minigames/shared/loopLifecycle';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('random — PRNG Mulberry32 & shuffle', () => {
  it('createRng tất định theo seed và sinh giá trị trong [0, 1)', () => {
    const a = createRng(42);
    const b = createRng(42);
    const c = createRng(99);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    const seqC = Array.from({ length: 10 }, () => c());
    expect(seqA).toEqual(seqB);
    expect(seqA).not.toEqual(seqC);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('shuffle trả về bản sao mới, giữ nguyên phần tử và tất định theo rand', () => {
    const src = [0, 1, 2, 3, 4, 5];
    const s1 = shuffle(src, createRng(7));
    const s2 = shuffle(src, createRng(7));
    expect(src).toEqual([0, 1, 2, 3, 4, 5]);
    expect(s1).toEqual(s2);
    expect(s1.slice().sort((x, y) => x - y)).toEqual(src);
    expect(s1).not.toEqual(src);
  });
});

describe('canvasStage — createHiDpiCanvas & hằng chung', () => {
  it('xuất đúng MG_INK, MG_FONT và mgFont', () => {
    expect(MG_INK).toBe('#3a2c26');
    expect(MG_FONT).toBe('Nunito, sans-serif');
    expect(mgFont(16)).toBe('800 16px Nunito, sans-serif');
    expect(mgFont(14, 700)).toBe('700 14px Nunito, sans-serif');
  });

  it('giới hạn DPR ≤ 2, scale context, gắn DOM và đổi tọa độ toLocal có tính inset', () => {
    const appended: unknown[] = [];
    const scale = vi.fn();
    const fakeCanvas = {
      width: 0,
      height: 0,
      dataset: {} as Record<string, string>,
      style: { cssText: '' },
      getContext: () => ({ scale }),
      getBoundingClientRect: () => ({ left: 100, top: 50, width: 256, height: 136 }),
    };
    vi.stubGlobal('window', { devicePixelRatio: 3 });
    vi.stubGlobal('document', { createElement: () => fakeCanvas });

    const parent = { append: (node: unknown) => appended.push(node) } as unknown as HTMLElement;
    const stage = createHiDpiCanvas(parent, {
      width: 480,
      height: 240,
      testId: 'mg-wipe-board',
      cursor: 'grab',
      inset: 8,
    });

    expect(stage.dpr).toBe(2);
    expect(fakeCanvas.width).toBe(960);
    expect(fakeCanvas.height).toBe(480);
    expect(fakeCanvas.dataset.testid).toBe('mg-wipe-board');
    expect(scale).toHaveBeenCalledExactlyOnceWith(2, 2);
    expect(appended).toEqual([fakeCanvas]);

    // Vùng nội dung: left=100+8=108, width=256-16=240; top=50+8=58, height=136-16=120
    expect(stage.toLocal({ clientX: 228, clientY: 118 })).toEqual({ x: 240, y: 120 });
  });
});

describe('loopLifecycle — pause, resume, pendingFinish, dispose', () => {
  it('đóng băng elapsed/now khi pause và xả pendingFinish khi resume', () => {
    vi.useFakeTimers();
    let clock = 0;
    let nextRafId = 1;
    const rafQueue = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = nextRafId++;
      rafQueue.set(id, cb);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => { rafQueue.delete(id); });

    const flushRaf = (advanceMs: number) => {
      clock += advanceMs;
      const entries = [...rafQueue.entries()];
      rafQueue.clear();
      for (const [, cb] of entries) cb(clock);
    };

    const onFinish = vi.fn();
    const onTick = vi.fn();
    const onDraw = vi.fn();
    const loop = createMinigameLoop({
      now: () => clock,
      onFinish,
      onTick,
      onDraw,
    });

    flushRaf(40);
    expect(loop.elapsed).toBe(40);
    expect(onTick).toHaveBeenCalledTimes(1);

    loop.pause();
    clock += 5000;
    expect(loop.now()).toBe(40);
    flushRaf(50);
    expect(loop.elapsed).toBe(40);
    expect(onTick).toHaveBeenCalledTimes(1);

    loop.scheduleFinish(200, () => ({ result: 'complete', score: 9 }));
    vi.advanceTimersByTime(300);
    expect(onFinish).not.toHaveBeenCalled();

    loop.resume();
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ result: 'complete', score: 9 });
    expect(rafQueue.size).toBe(0);
  });

  it('startOutro đóng băng theo pause và tự dọn listener/timer/raf khi dispose', () => {
    vi.useFakeTimers();
    let clock = 0;
    let nextRafId = 1;
    const rafQueue = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = nextRafId++;
      rafQueue.set(id, cb);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => { rafQueue.delete(id); });

    const flushRaf = (advanceMs: number) => {
      clock += advanceMs;
      const entries = [...rafQueue.entries()];
      rafQueue.clear();
      for (const [, cb] of entries) cb(clock);
    };

    const onFinish = vi.fn();
    const onDraw = vi.fn();
    const onDispose = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const target = { addEventListener, removeEventListener } as unknown as EventTarget;

    const loop = createMinigameLoop({
      now: () => clock,
      onFinish,
      onDraw,
      onDispose,
    });

    const handler = vi.fn();
    loop.on(target, 'keydown', handler);
    expect(addEventListener).toHaveBeenCalledWith('keydown', handler, undefined);

    loop.startOutro(100, () => ({ result: 'win' }));
    flushRaf(50);
    expect(onFinish).not.toHaveBeenCalled();

    loop.pause();
    flushRaf(100);
    expect(onFinish).not.toHaveBeenCalled();

    loop.resume();
    flushRaf(50);
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ result: 'win' });
    expect(onDraw).toHaveBeenCalled();

    loop.dispose();
    expect(removeEventListener).toHaveBeenCalledWith('keydown', handler, undefined);
    expect(onDispose).toHaveBeenCalledTimes(1);
    expect(rafQueue.size).toBe(0);
  });

  it('dispose dọn timer đang chờ mà không gọi onFinish', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();
    const onDispose = vi.fn();
    const loop = createMinigameLoop({ onFinish, onDispose });

    loop.scheduleFinish(500, () => ({ result: 'complete' }));
    loop.dispose();
    vi.advanceTimersByTime(1000);

    expect(onFinish).not.toHaveBeenCalled();
    expect(onDispose).toHaveBeenCalledTimes(1);
  });
});
