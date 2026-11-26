import type { MinigameInstance, MinigameResult } from '../types';

export interface MinigameLoopOpts {
  onFinish(result: MinigameResult): void;
  /** Cập nhật mỗi khung hình; chỉ chạy khi chưa tạm dừng và chưa kết thúc. */
  onTick?(dtMs: number, elapsedMs: number): void;
  /** Vẽ khung hình. */
  onDraw?(): void;
  /** Xóa trạng thái tương tác dở dang khi tạm dừng. */
  onPause?(): void;
  /** Khôi phục trạng thái khi tiếp tục (trước lúc xả kết quả đang chờ). */
  onResume?(): void;
  /** Dọn DOM riêng của minigame khi `dispose()`. */
  onDispose?(): void;
  /** Tự động chạy `requestAnimationFrame` ngay khi tạo (mặc định `true` nếu có `onTick` hoặc `onDraw`). */
  autoStart?: boolean;
  /** Bước thời gian tối đa mỗi khung hình (ms), mặc định 100. */
  maxDtMs?: number;
  /** Nguồn đồng hồ (mặc định `performance.now`). */
  now?: () => number;
}

export interface MinigameLoop {
  readonly paused: boolean;
  readonly finished: boolean;
  readonly disposed: boolean;
  /** Thời gian đã trôi qua (ms), đóng băng hoàn toàn trong lúc `pause()`. */
  readonly elapsed: number;
  /** Thời gian hiện tại (ms) đã cộng bù phần từ khung hình gần nhất (đóng băng khi tạm dừng). */
  now(): number;
  start(): void;
  on<K extends keyof WindowEventMap>(
    target: Window, type: K, listener: (ev: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions,
  ): () => void;
  on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement, type: K, listener: (ev: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions,
  ): () => void;
  on(
    target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions,
  ): () => void;
  setTimeout(fn: () => void, ms: number): number;
  clearTimeout(id: number): void;
  /** Hẹn chốt kết thúc sau `ms`; nếu hết giờ khi đang tạm dừng thì chờ `resume()` mới gọi `onFinish`. */
  scheduleFinish(ms: number, result: MinigameResult | (() => MinigameResult)): void;
  cancelFinish(): void;
  /** Đếm ngược outro theo khung hình (đóng băng khi tạm dừng) rồi mới chốt kết thúc. */
  startOutro(ms: number, result: MinigameResult | (() => MinigameResult)): void;
  finish(result: MinigameResult | (() => MinigameResult)): void;
  pause(): void;
  resume(): void;
  dispose(): void;
  readonly instance: MinigameInstance;
}

type ResultOrGetter = MinigameResult | (() => MinigameResult);

/** Quản lý vòng đời chung của minigame: `raf`, đồng hồ đóng băng khi pause, `pendingFinish` và dọn dẹp ở `dispose()`. */
export function createMinigameLoop(opts: MinigameLoopOpts): MinigameLoop {
  const maxDt = opts.maxDtMs ?? 100;
  const clock = opts.now ?? (() => performance.now());
  const hasFrame = Boolean(opts.onTick || opts.onDraw);

  let paused = false;
  let finished = false;
  let disposed = false;
  let running = false;
  let elapsed = 0;
  let lastReal = clock();
  let raf = 0;

  let pendingResult: ResultOrGetter | null = null;
  let finishTimer: number | null = null;
  let outro: { remaining: number; result: ResultOrGetter } | null = null;

  const timers = new Set<number>();
  const listeners: (() => void)[] = [];

  const stopRaf = () => {
    if (!raf) return;
    globalThis.cancelAnimationFrame?.(raf);
    raf = 0;
  };

  const clearTimer = (id: number) => {
    if (!timers.delete(id)) return;
    globalThis.clearTimeout(id);
  };

  const clearAllTimers = () => {
    for (const id of [...timers]) globalThis.clearTimeout(id);
    timers.clear();
    finishTimer = null;
  };

  const setTimer = (fn: () => void, ms: number): number => {
    if (disposed || finished) return 0;
    const id = globalThis.setTimeout(() => {
      timers.delete(id);
      if (finishTimer === id) finishTimer = null;
      if (!disposed && !finished) fn();
    }, ms) as unknown as number;
    timers.add(id);
    return id;
  };

  const finish = (result: ResultOrGetter) => {
    if (finished || disposed) return;
    if (finishTimer !== null) {
      clearTimer(finishTimer);
      finishTimer = null;
    }
    outro = null;
    if (paused) {
      pendingResult = result;
      return;
    }
    finished = true;
    running = false;
    stopRaf();
    clearAllTimers();
    const resolved = typeof result === 'function' ? result() : result;
    opts.onFinish(resolved);
  };

  const scheduleFinish = (ms: number, result: ResultOrGetter) => {
    if (finished || disposed || finishTimer !== null || pendingResult !== null) return;
    finishTimer = setTimer(() => finish(result), ms);
  };

  const cancelFinish = () => {
    if (finishTimer !== null) {
      clearTimer(finishTimer);
      finishTimer = null;
    }
    outro = null;
    pendingResult = null;
  };

  const startOutro = (ms: number, result: ResultOrGetter) => {
    if (finished || disposed || outro !== null || pendingResult !== null) return;
    if (ms <= 0) {
      finish(result);
      return;
    }
    outro = { remaining: ms, result };
  };

  const frame = (real: number) => {
    raf = 0;
    if (disposed || finished) return;
    const cur = opts.now ? clock() : real;
    const dt = Math.min(Math.max(0, cur - lastReal), maxDt);
    lastReal = cur;
    if (!paused) {
      elapsed += dt;
      const activeOutro = outro;
      opts.onTick?.(dt, elapsed);
      if (finished || disposed) return;
      if (activeOutro && outro === activeOutro) {
        activeOutro.remaining -= dt;
        if (activeOutro.remaining <= 0) {
          const resolved = activeOutro.result;
          outro = null;
          opts.onDraw?.();
          finish(resolved);
          return;
        }
      }
    }
    opts.onDraw?.();
    if (!finished && !disposed) raf = globalThis.requestAnimationFrame(frame);
  };

  const start = () => {
    if (disposed || finished || running || !hasFrame) return;
    running = true;
    lastReal = clock();
    raf = globalThis.requestAnimationFrame(frame);
  };

  const on = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    target.addEventListener(type, listener, options);
    const off = () => target.removeEventListener(type, listener, options);
    listeners.push(off);
    return off;
  };

  const pause = () => {
    if (paused || disposed || finished) return;
    if (running) elapsed += Math.min(Math.max(0, clock() - lastReal), maxDt);
    paused = true;
    opts.onPause?.();
  };

  const resume = () => {
    if (!paused || disposed || finished) return;
    paused = false;
    lastReal = clock();
    opts.onResume?.();
    if (pendingResult !== null) {
      const pending = pendingResult;
      pendingResult = null;
      finish(pending);
    }
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    running = false;
    paused = false;
    pendingResult = null;
    outro = null;
    stopRaf();
    clearAllTimers();
    for (const off of listeners.splice(0)) off();
    opts.onDispose?.();
  };

  if (hasFrame && opts.autoStart !== false) start();

  const instance: MinigameInstance = { pause, resume, dispose };

  return {
    get paused() { return paused; },
    get finished() { return finished; },
    get disposed() { return disposed; },
    get elapsed() { return elapsed; },
    now() {
      if (!running || paused) return elapsed;
      return elapsed + Math.min(Math.max(0, clock() - lastReal), maxDt);
    },
    start,
    on: on as MinigameLoop['on'],
    setTimeout: setTimer,
    clearTimeout: clearTimer,
    scheduleFinish,
    cancelFinish,
    startOutro,
    finish,
    pause,
    resume,
    dispose,
    instance,
  };
}
