/**
 * Logic thuần cho chuột / touchpad / cảm ứng — không đụng DOM, để test đơn vị được.
 * input.ts gọi vào đây; số ngưỡng/độ nhạy lấy từ POINTER_INPUT (src/config/camera.ts).
 *
 *  - LookGestures: theo dõi từng ngón/chuột theo pointerId. Kéo quá ngưỡng mới xoay (dưới ngưỡng = bấm).
 *    Hai ngón cảm ứng cùng lúc = chụm để zoom (không xoay).
 *  - wheelZoomSteps: đổi một sự kiện `wheel` (chuột, touchpad cuộn 2 ngón, touchpad chụm có ctrlKey) ra số nấc zoom.
 *  - joystickVector: đổi độ lệch của nút tròn ảo ra ý định di chuyển.
 */
import type { PointerInputConfig } from '../config/camera';

export type PointerKind = 'mouse' | 'touch' | 'pen';
export interface LookDelta { dx: number; dy: number; zoom: number }

interface Track { kind: PointerKind; x: number; y: number; sx: number; sy: number; dragging: boolean }

export class LookGestures {
  private tracks = new Map<number, Track>();
  private dx = 0; private dy = 0; private zoom = 0;

  constructor(private cfg: Pick<PointerInputConfig, 'drag_threshold_px' | 'touch_look_scale' | 'pinch_px_per_step'>) {}

  get active(): number { return this.tracks.size; }
  isDragging(id: number): boolean { return !!this.tracks.get(id)?.dragging; }

  down(id: number, kind: PointerKind, x: number, y: number): void {
    this.tracks.set(id, { kind, x, y, sx: x, sy: y, dragging: false });
  }

  move(id: number, x: number, y: number): void {
    const t = this.tracks.get(id);
    if (!t) return;
    const pinch = this.pinchPair();
    if (pinch && pinch.includes(t)) {
      const [a, b] = pinch;
      const before = Math.hypot(a.x - b.x, a.y - b.y);
      t.x = x; t.y = y;
      const after = Math.hypot(a.x - b.x, a.y - b.y);
      this.zoom -= (after - before) / this.cfg.pinch_px_per_step;   // xa ra = phóng gần
      a.dragging = b.dragging = true;
      return;
    }
    if (!t.dragging) {
      const th = t.kind === 'mouse' ? this.cfg.drag_threshold_px.mouse : this.cfg.drag_threshold_px.touch;
      if (Math.hypot(x - t.sx, y - t.sy) >= th) t.dragging = true;      // bắt đầu kéo từ đây, không cộng đoạn ngưỡng
      t.x = x; t.y = y;
      return;
    }
    const k = t.kind === 'mouse' ? 1 : this.cfg.touch_look_scale;
    this.dx += (x - t.x) * k;
    this.dy += (y - t.y) * k;
    t.x = x; t.y = y;
  }

  /** Thả ngón/chuột. Trả `true` nếu đó là một lần kéo (để bỏ cú "click" trình duyệt bắn ra sau). */
  up(id: number): boolean {
    const t = this.tracks.get(id);
    this.tracks.delete(id);
    return !!t?.dragging;
  }
  cancel(id: number): void { this.tracks.delete(id); }
  clear(): void { this.tracks.clear(); this.dx = this.dy = this.zoom = 0; }

  take(): LookDelta {
    const v = { dx: this.dx, dy: this.dy, zoom: this.zoom };
    this.dx = this.dy = this.zoom = 0;
    return v;
  }

  /** Hai ngón cảm ứng đầu tiên đang chạm (chụm). */
  private pinchPair(): [Track, Track] | null {
    const touches = [...this.tracks.values()].filter((t) => t.kind !== 'mouse');
    return touches.length >= 2 ? [touches[0], touches[1]] : null;
  }
}

/** deltaMode: 0 = pixel, 1 = dòng, 2 = trang. ctrlKey = touchpad đang chụm (trình duyệt quy ra wheel). */
export function wheelZoomSteps(deltaY: number, deltaMode: number, ctrlKey: boolean,
  cfg: Pick<PointerInputConfig, 'wheel_px_per_step' | 'wheel_pinch_px_per_step' | 'wheel_max_steps_per_event'>): number {
  if (!deltaY) return 0;
  const px = deltaMode === 1 ? deltaY * 33 : deltaMode === 2 ? deltaY * 800 : deltaY;
  const steps = px / (ctrlKey ? cfg.wheel_pinch_px_per_step : cfg.wheel_px_per_step);
  const m = cfg.wheel_max_steps_per_event;
  return Math.max(-m, Math.min(m, steps));
}

export interface StickVector { moving: boolean; forward: number; strafe: number; run: boolean; knobX: number; knobY: number }

/** dx/dy = ngón tay lệch khỏi tâm nút tròn (px, y hướng xuống như màn hình). */
export function joystickVector(dx: number, dy: number, cfg: PointerInputConfig['joystick']): StickVector {
  const r = cfg.radius_px;
  const len = Math.hypot(dx, dy);
  const k = len > r ? r / len : 1;
  const knobX = dx * k, knobY = dy * k;
  const mag = Math.min(1, len / r);
  if (mag < cfg.dead_zone) return { moving: false, forward: 0, strafe: 0, run: false, knobX, knobY };
  return { moving: true, forward: -knobY / r, strafe: knobX / r, run: mag >= cfg.run_at, knobX, knobY };
}
