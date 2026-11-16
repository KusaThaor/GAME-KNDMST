/**
 * Điều khiển cảm ứng (điện thoại/máy tính bảng): nút tròn ảo để đi, nút E để tương tác.
 * Chỉ hiện khi người chơi đang dùng cảm ứng (UiState.device). Tự viết bằng Pointer Events, không thêm thư viện.
 * Mỗi ngón theo dõi bằng pointerId → một ngón giữ nút tròn, ngón khác kéo màn hình xoay camera cùng lúc (input.ts lo phần xoay).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { POINTER_INPUT } from '../../config/camera';
import { floatingStickCenter, joystickVector } from '../../game/gestures';
import type { UiActions } from './store';

const J = POINTER_INPUT.joystick;

/**
 * Nút tròn ảo. Mặc định "nổi" (POINTER_INPUT.joystick.floating): chạm đâu trong vùng góc trái dưới thì nút hiện dưới ngón tay
 * và đo hướng đi từ chỗ đó; thả tay nút về chỗ cũ. `floating: false` = nút cố định (cách cũ, giữ làm dự phòng):
 * chỉ chạm đúng vào nút mới đi.
 */
export function TouchStick({ a }: { a: UiActions }) {
  const zone = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);
  /** Tâm nút (tọa độ màn hình) của lần chạm hiện tại. */
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, run: false, on: false });
  /** Tâm nút trong vùng chạm khi đang nổi; null = ở chỗ mặc định. */
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);

  // ẩn đi (mở thoại/bảng…) giữa lúc đang giữ → thả, không để nhân vật đi mãi
  useEffect(() => () => a.stick(null), []);

  const update = (e: PointerEvent) => {
    const o = origin.current!;
    const v = joystickVector(e.clientX - o.x, e.clientY - o.y, J);
    setKnob({ x: v.knobX, y: v.knobY, run: v.run, on: true });
    a.stick(v.moving ? { forward: v.forward, strafe: v.strafe, run: v.run } : null);
  };
  const begin = (e: PointerEvent) => {
    if (pid.current !== null) return;
    pid.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    e.preventDefault();
    if (J.floating) {
      const z = zone.current!.getBoundingClientRect();
      origin.current = floatingStickCenter(e.clientX, e.clientY, z, J.radius_px);
      setAt({ x: origin.current.x - z.left, y: origin.current.y - z.top });
    } else {
      const r = base.current!.getBoundingClientRect();
      origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    update(e);
  };
  const end = (e: PointerEvent) => {
    if (e.pointerId !== pid.current) return;
    pid.current = null;
    origin.current = null;
    setKnob({ x: 0, y: 0, run: false, on: false });
    setAt(null);
    a.stick(null);
  };
  const handlers = {
    onPointerDown: begin,
    onPointerMove: (e: PointerEvent) => { if (e.pointerId === pid.current) update(e); },
    onPointerUp: end, onPointerCancel: end, onLostPointerCapture: end,
  };
  const Z = J.zone;
  const size = J.radius_px * 2;

  return (
    <div
      ref={zone}
      class={`g-stick-zone ${J.floating ? 'floating' : ''}`}
      data-testid="stick-zone"
      style={{ width: `min(${Z.width_frac * 100}%, ${Z.max_width_px}px)`, height: `min(${Z.height_frac * 100}%, ${Z.max_height_px}px)` }}
      {...(J.floating ? handlers : {})}
    >
      <div
        ref={base}
        class={`g-stick ${knob.on ? 'on' : ''} ${knob.run ? 'run' : ''}`}
        data-testid="stick"
        style={{ width: `${size}px`, height: `${size}px`, ...(at ? { left: `${at.x - J.radius_px}px`, top: `${at.y - J.radius_px}px`, bottom: 'auto' } : {}) }}
        {...(J.floating ? {} : handlers)}
      >
        <div class="g-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
    </div>
  );
}

/** Nút E ảo: hiện khi có gợi ý tương tác. */
export function TouchInteract({ a, text }: { a: UiActions; text: string }) {
  return (
    <button class="g-touch-e" data-act="interact" onClick={a.interact}>
      <b>E</b><span>{text}</span>
    </button>
  );
}
