/**
 * Bàn phím + chuột + touchpad + cảm ứng cho phần chơi. MỘT bộ lắng nghe cho cả đời game (tạo ở game.ts) — scene Ngày/Hub
 * chỉ đọc trạng thái, không tự gắn listener, nên chuyển cảnh bao nhiêu lần cũng không bị nhân đôi.
 *
 * Xoay camera có 3 kiểu (src/config/camera.ts), đổi bằng `setLookMode`:
 *   'free' (Chuẩn, mặc định): kéo chuột trái hoặc phải trên vùng trống; kéo quá ngưỡng nhỏ mới xoay, bấm nhanh vẫn là bấm.
 *          Touchpad: bấm-giữ-kéo một ngón (= chuột trái) cũng xoay.
 *   'drag' (kiểu A): giữ chuột phải rồi rê.
 *   'lock' (kiểu B): bấm vào màn hình để khóa con trỏ, rê chuột là xoay; Esc thả con trỏ (trình duyệt tự làm).
 * Ở mọi kiểu: lăn chuột / cuộn 2 ngón touchpad / chụm touchpad (wheel + ctrlKey) để zoom; cảm ứng kéo một ngón trên
 * vùng trống để xoay, chụm 2 ngón để zoom. Nút tròn ảo (UI) báo ý định di chuyển qua `setStick`.
 * Phần tính toán thuần nằm ở gestures.ts (có test đơn vị).
 */
import { CONTROLS, POINTER_INPUT, type ControlAction, type LookStyle } from '../config/camera';
import { ButtonDrag, LookGestures, wheelZoomSteps } from './gestures';

export type LookMode = LookStyle;
export type InputDevice = 'keyboard' | 'touch';
export interface StickIntent { forward: number; strafe: number; run: boolean }

export interface GameInput {
  down: Set<string>;
  /** Có phím nào của hành động này đang được giữ không. */
  held(action: ControlAction): boolean;
  /** Chuyển động để xoay camera, cộng dồn từ lần đọc trước (pixel) + số nấc zoom. Gồm chuột, touchpad và cảm ứng. */
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
  /** Nút tròn ảo (cảm ứng): ý định di chuyển hiện tại; null = không chạm. */
  readonly stick: StickIntent | null;
  setStick(v: StickIntent | null): void;
  /** Người chơi đang dùng chuột/bàn phím hay cảm ứng (đổi theo thao tác gần nhất). Không vào analytics. */
  readonly device: InputDevice;
  onDeviceChange(fn: (d: InputDevice) => void): void;
  /**
   * "Nhìn tự do" (tùy chọn riêng, không phải kiểu camera): bấm vào màn hình để khóa con trỏ, rồi rê chuột/touchpad
   * (không cần bấm giữ) là xoay. Esc thả. Không tự khóa lại khi chưa bấm vào màn hình. Khóa thất bại → vẫn kéo để xoay như cũ.
   */
  readonly freeLook: boolean;
  setFreeLook(on: boolean): void;
  /** Trình duyệt từ chối khóa con trỏ (pointerlockerror hoặc promise bị từ chối). */
  onLockError(fn: () => void): void;
  /** Chỉ cho bảng chẩn đoán ở bản test (`?inputdebug=1`). null = tắt. Bản production không gắn gì vào đây. */
  setDebugTap(fn: ((e: InputDebugEntry) => void) | null): void;
  /** Số listener đang gắn (để test chắc chắn không bị nhân đôi). */
  readonly listenerCount: number;
  dispose(): void;
}

/** Một dòng nhật ký chẩn đoán: sự kiện thô + game đã quyết định gì với nó. */
export interface InputDebugEntry {
  type: string; pointerType: string; button: number; buttons: number; pointerId: number;
  x: number; y: number; mx: number; my: number; target: string; active: string;
  mode: LookMode; freeLook: boolean; dragging: boolean; captured: boolean; locked: boolean;
  /** Chuyển động xoay đang chờ camera đọc (px) — để biết sự kiện có thực sự cộng vào góc xoay không. */
  pendingDx: number; pendingDy: number;
  note: string;
}

export function createInput(el: HTMLElement): GameInput {
  const down = new Set<string>();
  let dx = 0, dy = 0, zoom = 0, dragging = false, mode: LookMode = 'drag', expectRelease = false;
  let guard: () => boolean = () => true;
  /** Game vừa tự thả con trỏ (mở thoại/bảng) → khóa lại ở thao tác kế tiếp của người chơi. */
  let resume = false;
  /** Vừa kéo xong → bỏ cú "click" trình duyệt bắn ra sau khi thả (không coi là bấm vào vật). */
  let swallowClick = false;
  let stick: StickIntent | null = null;
  let freeLook = false;
  /** Lần bấm-giữ-kéo bằng chuột/touchpad đang diễn ra (kiểu Chuẩn). */
  const mouseDrag = new ButtonDrag();
  let debugTap: ((e: InputDebugEntry) => void) | null = null;
  const lockErrFns: (() => void)[] = [];
  let lastLockErr = 0;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  let device: InputDevice = coarse ? 'touch' : 'keyboard';
  const gestures = new LookGestures(POINTER_INPUT);
  const keyFns: ((code: string) => void)[] = [], ptrFns: ((k: 'move' | 'click', x: number, y: number) => void)[] = [], actFns: (() => void)[] = [];
  const lockFns: ((locked: boolean, byUser: boolean) => void)[] = [];
  const devFns: ((d: InputDevice) => void)[] = [];
  const typing = (e: Event) => { const t = e.target as HTMLElement | null; return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'); };
  const act = () => actFns.forEach((f) => f());
  const setDevice = (d: InputDevice) => { if (d !== device) { device = d; devFns.forEach((f) => f(d)); } };
  const ndc = (e: MouseEvent): [number, number] => { const r = el.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)]; };
  const canvas = () => el.querySelector('canvas');
  const onCanvas = (e: Event) => (e.target as HTMLElement | null)?.tagName === 'CANVAS';
  const isLocked = () => !!canvas() && document.pointerLockElement === canvas();
  /** Kiểu B, hoặc đang bật "Nhìn tự do". */
  const lockWanted = () => mode === 'lock' || freeLook;
  const lockError = () => {
    const now = performance.now();
    if (now - lastLockErr < 300) return;                  // promise bị từ chối + pointerlockerror cùng lúc → báo một lần
    lastLockErr = now;
    lockErrFns.forEach((f) => f());
  };
  const requestLock = () => {
    const c = canvas();
    if (!c?.requestPointerLock) { lockError(); return; }
    try {
      const req = c.requestPointerLock() as unknown;
      if (req && typeof (req as Promise<void>).catch === 'function') (req as Promise<void>).catch(() => lockError());
    } catch { lockError(); }
  };
  const hasCapture = (id: number) => { try { return !!canvas()?.hasPointerCapture(id); } catch { return false; } };
  const tap = (e: Event, note: string) => {
    if (!debugTap) return;
    try { tapUnsafe(e, note); } catch { /* nhật ký chẩn đoán không bao giờ được làm hỏng xử lý chính */ }
  };
  const tapUnsafe = (e: Event, note: string) => {
    const p = e as PointerEvent;
    const t = e.target as HTMLElement | null;
    const desc = (n: EventTarget | null) => {
      if (!n) return '-';
      if (n === window) return 'window';
      if (n === document) return 'document';
      const h = n as HTMLElement;
      if (typeof h.tagName !== 'string') return '?';
      return `${h.tagName.toLowerCase()}${h.id ? '#' + h.id : ''}${h.dataset?.act ? `[${h.dataset.act}]` : ''}`;
    };
    debugTap!({
      type: e.type, pointerType: p.pointerType ?? '', button: p.button ?? -1, buttons: p.buttons ?? -1, pointerId: p.pointerId ?? -1,
      x: p.clientX ?? 0, y: p.clientY ?? 0, mx: p.movementX ?? 0, my: p.movementY ?? 0,
      target: desc(t), active: desc(document.activeElement), mode, freeLook,
      dragging: mouseDrag.active !== null || dragging, captured: p.pointerId !== undefined && hasCapture(p.pointerId), locked: isLocked(),
      pendingDx: dx + gestures.peek().dx, pendingDy: dy + gestures.peek().dy, note,
    });
  };
  const endMouseDrag = (id: number, completed: boolean) => {
    if (!mouseDrag.end(id)) return false;
    if (completed) { if (gestures.up(id)) swallowClick = true; } else gestures.cancel(id);
    try { if (hasCapture(id)) canvas()!.releasePointerCapture(id); } catch { /* đã thả */ }
    return true;
  };
  const tryResume = () => { if (resume && mode === 'lock' && !isLocked() && guard()) { resume = false; requestLock(); } };

  const kd = (e: KeyboardEvent) => {
    if (typing(e)) return;
    if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    act();
    setDevice('keyboard');
    if (!e.repeat) keyFns.forEach((f) => f(e.code));
    down.add(e.code);
    if (e.code !== 'Escape') tryResume();
  };
  const ku = (e: KeyboardEvent) => { down.delete(e.code); };
  const pd = (e: PointerEvent) => {
    act();
    swallowClick = false;
    if (e.pointerType === 'mouse' || e.pointerType === '') {
      setDevice('keyboard');
      if (mode === 'drag' && e.button === 2) { dragging = true; tap(e, 'A: bắt đầu giữ chuột phải'); }
      else if (mode === 'free' && (e.button === 0 || e.button === 2) && onCanvas(e) && !isLocked()) {
        if (mouseDrag.active !== null) endMouseDrag(mouseDrag.active, false);
        mouseDrag.begin(e.pointerId);
        gestures.down(e.pointerId, 'mouse', e.clientX, e.clientY);
        // giữ con trỏ: kéo ra ngoài khung/cửa sổ vẫn nhận chuyển động và nhận được lúc thả
        try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch { /* trình duyệt không cho: vẫn nghe ở window */ }
        tap(e, 'Chuẩn: bắt đầu theo dõi kéo');
      } else tap(e, mode === 'free' ? (onCanvas(e) ? (isLocked() ? 'đang khóa con trỏ: không kéo' : `bỏ qua nút ${e.button}`) : 'bấm trên giao diện: không xoay') : `kiểu ${mode}: nút ${e.button} không xoay`);
    } else {
      setDevice('touch');
      // chỉ ngón chạm vào vùng trống (canvas) mới xoay; ngón trên nút tròn/nút giao diện do UI tự lo
      if (onCanvas(e)) gestures.down(e.pointerId, 'touch', e.clientX, e.clientY);
    }
  };
  const pu = (e: PointerEvent) => {
    if (e.pointerType !== 'touch' && e.button === 2) dragging = false;
    if (endMouseDrag(e.pointerId, true)) { tap(e, swallowClick ? 'thả: là KÉO (bỏ click)' : 'thả: là BẤM'); return; }
    if (gestures.up(e.pointerId)) swallowClick = true;
    if (debugTap && e.pointerType !== 'touch') tap(e, 'thả');
  };
  const pc = (e: PointerEvent) => {
    tap(e, 'pointercancel: hủy kéo');
    if (!endMouseDrag(e.pointerId, false)) gestures.cancel(e.pointerId);
    if (e.pointerType !== 'touch') dragging = false;
  };
  /** Mất giữ con trỏ giữa chừng (phần tử bị gỡ, trình duyệt lấy lại…): vẫn nghe ở window, chỉ ghi lại. */
  const lpc = (e: PointerEvent) => tap(e, mouseDrag.active === e.pointerId ? 'mất giữ con trỏ giữa lúc kéo (vẫn nghe ở window)' : 'lostpointercapture');
  const pm = (e: PointerEvent) => {
    const mouse = e.pointerType !== 'touch' && e.pointerType !== 'pen';
    if (mouse && (lockWanted() ? isLocked() : mode === 'drag' && dragging)) {
      dx += e.movementX; dy += e.movementY;
      if (debugTap) tap(e, isLocked() ? 'khóa con trỏ: cộng movementX/Y' : 'A: cộng movementX/Y');
    }
    if (mouse && mouseDrag.active === e.pointerId) {
      if (!mouseDrag.stillPressed(e.pointerId, e.buttons)) {
        endMouseDrag(e.pointerId, true);
        tap(e, 'buttons=0: nút đã thả mà không có pointerup → kết thúc kéo');
      } else {
        const was = gestures.isDragging(e.pointerId);
        gestures.move(e.pointerId, e.clientX, e.clientY);
        if (debugTap) tap(e, gestures.isDragging(e.pointerId) ? (was ? 'Chuẩn: đang kéo → xoay' : 'Chuẩn: qua ngưỡng, bắt đầu xoay') : 'Chuẩn: chưa qua ngưỡng');
      }
    } else gestures.move(e.pointerId, e.clientX, e.clientY);
    if (!isLocked() && e.target instanceof Node && el.contains(e.target)) ptrFns.forEach((f) => f('move', ...ndc(e)));
  };
  const ck = (e: MouseEvent) => {
    if (!onCanvas(e)) return;
    if (swallowClick) { swallowClick = false; return; }
    if (lockWanted() && !isLocked() && guard() && device === 'keyboard') {
      // kiểu B / Nhìn tự do: lần bấm đầu chỉ để khóa con trỏ (đây là thao tác của người chơi, trình duyệt mới cho khóa)
      resume = false;
      tap(e, 'bấm để khóa con trỏ');
      requestLock();
      return;
    }
    // con trỏ đang khóa: bấm = tương tác với thứ trước mặt (tâm màn hình)
    const [x, y] = isLocked() ? [0, 0] : ndc(e);
    ptrFns.forEach((f) => f('click', x, y));
  };
  const wh = (e: WheelEvent) => {
    // ctrlKey = touchpad đang chụm: luôn chặn để trang không bị phóng to. Lăn trên bảng/danh sách thì để bảng tự cuộn.
    if (!onCanvas(e) && !e.ctrlKey) return;
    e.preventDefault();
    zoom += wheelZoomSteps(e.deltaY, e.deltaMode, e.ctrlKey, POINTER_INPUT);
  };
  const cm = (e: Event) => e.preventDefault();
  const blur = () => {
    down.clear(); dragging = false; stick = null;
    if (mouseDrag.active !== null) endMouseDrag(mouseDrag.active, false);
    gestures.clear();
  };
  const plc = () => {
    const locked = isLocked();
    const byUser = !locked && !expectRelease;
    expectRelease = false;
    if (byUser) resume = false;
    if (!locked) { dx = 0; dy = 0; }
    if (debugTap) tap(new Event('pointerlockchange'), locked ? 'đã khóa con trỏ' : byUser ? 'người chơi thả (Esc)' : 'game thả con trỏ');
    lockFns.forEach((f) => f(locked, byUser));
  };
  const ple = (e: Event) => { tap(e, 'pointerlockerror: trình duyệt từ chối khóa'); lockError(); };

  const bound: [EventTarget, string, EventListener, AddEventListenerOptions?][] = [
    [window, 'keydown', kd as EventListener], [window, 'keyup', ku as EventListener], [window, 'blur', blur],
    [el, 'pointerdown', pd as EventListener], [window, 'pointerup', pu as EventListener], [window, 'pointercancel', pc as EventListener],
    [window, 'pointermove', pm as EventListener],
    [el, 'click', ck as EventListener], [el, 'wheel', wh as EventListener, { passive: false }], [el, 'contextmenu', cm],
    // Safari iOS: chụm trên trang vẫn có thể phóng to dù đã `touch-action: none` ở vài phiên bản → chặn thêm.
    [document, 'gesturestart', cm], [document, 'pointerlockchange', plc], [document, 'pointerlockerror', ple],
    [el, 'lostpointercapture', lpc as EventListener],
  ];
  for (const [t, name, fn, o] of bound) t.addEventListener(name, fn, o);
  let attached = bound.length;

  const releasePointer = () => { if (isLocked()) { expectRelease = true; resume = true; document.exitPointerLock(); } };

  return {
    down,
    held: (action) => (CONTROLS[action] as readonly string[]).some((c) => down.has(c)),
    takeLook() {
      const g = gestures.take();
      const v = { dx: dx + g.dx, dy: dy + g.dy, zoom: zoom + g.zoom };
      dx = 0; dy = 0; zoom = 0;
      return v;
    },
    setLookMode(m) {
      if (m === mode) return;
      mode = m; dragging = false; dx = 0; dy = 0;
      if (mouseDrag.active !== null) endMouseDrag(mouseDrag.active, false);
      if (m !== 'lock') { releasePointer(); resume = false; }
    },
    setLockGuard(fn) { guard = fn; },
    get lookMode() { return mode; },
    get pointerLocked() { return isLocked(); },
    releasePointer,
    onKey(fn) { keyFns.push(fn); },
    onPointer(fn) { ptrFns.push(fn); },
    onActivity(fn) { actFns.push(fn); },
    onLockChange(fn) { lockFns.push(fn); },
    get stick() { return stick; },
    setStick(v) { stick = v; if (v) act(); },
    get device() { return device; },
    onDeviceChange(fn) { devFns.push(fn); },
    get freeLook() { return freeLook; },
    setFreeLook(on) {
      if (on === freeLook) return;
      freeLook = on;
      if (!on && mode !== 'lock') { releasePointer(); resume = false; }
    },
    onLockError(fn) { lockErrFns.push(fn); },
    setDebugTap(fn) { debugTap = fn; },
    get listenerCount() { return attached; },
    dispose() {
      releasePointer();
      for (const [t, name, fn] of bound) t.removeEventListener(name, fn);
      attached = 0;
      if (mouseDrag.active !== null) endMouseDrag(mouseDrag.active, false);
      gestures.clear(); stick = null; debugTap = null;
    },
  };
}
