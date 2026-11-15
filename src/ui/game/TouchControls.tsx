/**
 * Điều khiển cảm ứng (điện thoại/máy tính bảng): nút tròn ảo để đi, nút E để tương tác.
 * Chỉ hiện khi người chơi đang dùng cảm ứng (UiState.device). Tự viết bằng Pointer Events, không thêm thư viện.
 * Mỗi ngón theo dõi bằng pointerId → một ngón giữ nút tròn, ngón khác kéo màn hình xoay camera cùng lúc (input.ts lo phần xoay).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { POINTER_INPUT } from '../../config/camera';
import { joystickVector } from '../../game/gestures';
import type { UiActions } from './store';

const J = POINTER_INPUT.joystick;

export function TouchStick({ a }: { a: UiActions }) {
  const base = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, run: false, on: false });

  // ẩn đi (mở thoại/bảng…) giữa lúc đang giữ → thả, không để nhân vật đi mãi
  useEffect(() => () => a.stick(null), []);

  const update = (e: PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    const v = joystickVector(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), J);
    setKnob({ x: v.knobX, y: v.knobY, run: v.run, on: true });
    a.stick(v.moving ? { forward: v.forward, strafe: v.strafe, run: v.run } : null);
  };
  const end = (e: PointerEvent) => {
    if (e.pointerId !== pid.current) return;
    pid.current = null;
    setKnob({ x: 0, y: 0, run: false, on: false });
    a.stick(null);
  };

  return (
    <div
      ref={base}
      class={`g-stick ${knob.on ? 'on' : ''} ${knob.run ? 'run' : ''}`}
      data-testid="stick"
      style={{ width: `${J.radius_px * 2}px`, height: `${J.radius_px * 2}px` }}
      onPointerDown={(e) => {
        if (pid.current !== null) return;
        pid.current = e.pointerId;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        update(e);
      }}
      onPointerMove={(e) => { if (e.pointerId === pid.current) update(e); }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <div class="g-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
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
