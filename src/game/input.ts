/**
 * Bàn phím + chuột cho phần chơi. MỘT bộ lắng nghe cho cả đời game (tạo ở game.ts) — scene Ngày/Hub chỉ đọc trạng thái,
 * không tự gắn listener, nên chuyển cảnh bao nhiêu lần cũng không bị nhân đôi phím.
 *
 * Xoay camera có 2 kiểu (GDD v0.3 §3), đổi bằng `setLookMode`:
 *   'drag' (kiểu A): giữ chuột phải rồi rê.
 *   'lock' (kiểu B): bấm vào màn hình để khóa con trỏ, rê chuột là xoay; Esc thả con trỏ (trình duyệt tự làm).
 */
import { CONTROLS, type ControlAction } from '../config/camera';

export type LookMode = 'drag' | 'lock';

export interface GameInput {
  down: Set<string>;
  /** Có phím nào của hành động này đang được giữ không. */
  held(action: ControlAction): boolean;
  /** Chuyển động chuột dùng để xoay camera, cộng dồn từ lần đọc trước (pixel) + số nấc cuộn. */
  takeLook(): { dx: number; dy: number; zoom: number };
  setLookMode(mode: LookMode): void;
  readonly lookMode: LookMode;
  /** Con trỏ đang bị khóa (kiểu B). */
  readonly pointerLocked: boolean;
  /** Thả con trỏ (mở menu, thoại, bảng…). Kiểu B: lần bấm phím/chuột kế tiếp khi game cho phép sẽ tự khóa lại. */
  releasePointer(): void;
  /** Game báo lúc nào ĐƯỢC khóa con trỏ (đang ở Ngày ký ức, không có thoại/bảng). Mặc định: luôn được. */
  setLockGuard(fn: () => boolean): void;
  onKey(fn: (code: string) => void): void;
  onPointer(fn: (kind: 'move' | 'click', ndcX: number, ndcY: number) => void): void;
  onActivity(fn: () => void): void;
  /** Con trỏ vừa được khóa/thả. `byUser` = người chơi tự thả bằng Esc (không phải game gọi releasePointer). */
  onLockChange(fn: (locked: boolean, byUser: boolean) => void): void;
  /** Số listener đang gắn (để test chắc chắn không bị nhân đôi). */
  readonly listenerCount: number;
  dispose(): void;
}

export function createInput(el: HTMLElement): GameInput {
  const down = new Set<string>();
  let dx = 0, dy = 0, zoom = 0, dragging = false, mode: LookMode = 'drag', expectRelease = false;
  let guard: () => boolean = () => true;
  /** Game vừa tự thả con trỏ (mở thoại/bảng) → khóa lại ở thao tác kế tiếp của người chơi. */
  let resume = false;
  const keyFns: ((code: string) => void)[] = [], ptrFns: ((k: 'move' | 'click', x: number, y: number) => void)[] = [], actFns: (() => void)[] = [];
  const lockFns: ((locked: boolean, byUser: boolean) => void)[] = [];
  const typing = (e: Event) => { const t = e.target as HTMLElement | null; return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'); };
  const act = () => actFns.forEach((f) => f());
  const ndc = (e: MouseEvent): [number, number] => { const r = el.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)]; };
  const canvas = () => el.querySelector('canvas');
  const isLocked = () => !!canvas() && document.pointerLockElement === canvas();
  const requestLock = () => {
    const req = canvas()?.requestPointerLock?.();
    if (req && typeof (req as Promise<void>).catch === 'function') (req as Promise<void>).catch(() => undefined);
  };
  const tryResume = () => { if (resume && mode === 'lock' && !isLocked() && guard()) { resume = false; requestLock(); } };

  const kd = (e: KeyboardEvent) => {
    if (typing(e)) return;
    if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    act();
    if (!e.repeat) keyFns.forEach((f) => f(e.code));
    down.add(e.code);
    if (e.code !== 'Escape') tryResume();
  };
  const ku = (e: KeyboardEvent) => { down.delete(e.code); };
  const md = (e: MouseEvent) => { if (e.button === 2) dragging = true; act(); };
  const mu = (e: MouseEvent) => { if (e.button === 2) dragging = false; };
  const mm = (e: MouseEvent) => {
    if (mode === 'lock' ? isLocked() : dragging) { dx += e.movementX; dy += e.movementY; }
    if (!isLocked()) ptrFns.forEach((f) => f('move', ...ndc(e)));
  };
  const ck = (e: MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
    if (mode === 'lock' && !isLocked() && guard()) {
      // kiểu B: lần bấm đầu chỉ để khóa con trỏ
      resume = false;
      requestLock();
      return;
    }
    // con trỏ đang khóa: bấm = tương tác với thứ trước mặt (tâm màn hình)
    const [x, y] = isLocked() ? [0, 0] : ndc(e);
    ptrFns.forEach((f) => f('click', x, y));
  };
  const wh = (e: WheelEvent) => { zoom += Math.sign(e.deltaY); };
  const cm = (e: Event) => e.preventDefault();
  const blur = () => { down.clear(); dragging = false; };
  const plc = () => {
    const locked = isLocked();
    const byUser = !locked && !expectRelease;
    expectRelease = false;
    if (byUser) resume = false;
    if (!locked) { dx = 0; dy = 0; }
    lockFns.forEach((f) => f(locked, byUser));
  };

  const bound: [EventTarget, string, EventListener, AddEventListenerOptions?][] = [
    [window, 'keydown', kd as EventListener], [window, 'keyup', ku as EventListener], [window, 'blur', blur],
    [el, 'mousedown', md as EventListener], [window, 'mouseup', mu as EventListener], [el, 'mousemove', mm as EventListener],
    [el, 'click', ck as EventListener], [el, 'wheel', wh as EventListener, { passive: true }], [el, 'contextmenu', cm],
    [document, 'pointerlockchange', plc],
  ];
  for (const [t, name, fn, o] of bound) t.addEventListener(name, fn, o);
  let attached = bound.length;

  const releasePointer = () => { if (isLocked()) { expectRelease = true; resume = true; document.exitPointerLock(); } };

  return {
    down,
    held: (action) => (CONTROLS[action] as readonly string[]).some((c) => down.has(c)),
    takeLook() { const v = { dx, dy, zoom }; dx = 0; dy = 0; zoom = 0; return v; },
    setLookMode(m) { if (m === mode) return; mode = m; dragging = false; dx = 0; dy = 0; if (m === 'drag') { releasePointer(); resume = false; } },
    setLockGuard(fn) { guard = fn; },
    get lookMode() { return mode; },
    get pointerLocked() { return isLocked(); },
    releasePointer,
    onKey(fn) { keyFns.push(fn); },
    onPointer(fn) { ptrFns.push(fn); },
    onActivity(fn) { actFns.push(fn); },
    onLockChange(fn) { lockFns.push(fn); },
    get listenerCount() { return attached; },
    dispose() {
      releasePointer();
      for (const [t, name, fn] of bound) t.removeEventListener(name, fn);
      attached = 0;
    },
  };
}
