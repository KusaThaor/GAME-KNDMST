import { describe, expect, it } from 'vitest';
import { ButtonDrag, LookGestures, WheelRouter, joystickVector, wheelZoomSteps } from '../../../src/game/gestures';
import { CAMERA_MODES, CAMERA_MODE_ORDER, DEFAULT_CAMERA_MODE, POINTER_INPUT, isCameraMode, nextCameraMode } from '../../../src/config/camera';

const CFG = POINTER_INPUT;
const T_MOUSE = CFG.drag_threshold_px.mouse;
const T_TOUCH = CFG.drag_threshold_px.touch;

describe('LookGestures — phân biệt kéo và bấm', () => {
  it('bấm rồi thả không di chuyển: không xoay, không tính là kéo', () => {
    const g = new LookGestures(CFG);
    g.down(1, 'mouse', 100, 100);
    expect(g.up(1)).toBe(false);
    expect(g.take()).toEqual({ dx: 0, dy: 0, zoom: 0 });
  });

  it('rung tay dưới ngưỡng: không xoay, vẫn là bấm', () => {
    const g = new LookGestures(CFG);
    g.down(1, 'mouse', 100, 100);
    g.move(1, 100 + T_MOUSE - 1, 100);
    g.move(1, 100, 100 + T_MOUSE - 1);
    expect(g.take()).toEqual({ dx: 0, dy: 0, zoom: 0 });
    expect(g.up(1)).toBe(false);
  });

  it('kéo quá ngưỡng: xoay theo phần đi được SAU ngưỡng (không giật), thả ra tính là kéo', () => {
    const g = new LookGestures(CFG);
    g.down(1, 'mouse', 100, 100);
    g.move(1, 100 + T_MOUSE, 100);          // vừa qua ngưỡng: bắt đầu kéo, chưa cộng
    expect(g.take().dx).toBe(0);
    g.move(1, 100 + T_MOUSE + 40, 110);
    const v = g.take();
    expect(v.dx).toBe(40);
    expect(v.dy).toBe(10);
    expect(g.isDragging(1)).toBe(true);
    expect(g.up(1)).toBe(true);
  });

  it('ngưỡng cảm ứng riêng (ngón tay rung nhiều hơn chuột) và độ nhạy cảm ứng chỉnh được', () => {
    const g = new LookGestures(CFG);
    g.down(7, 'touch', 0, 0);
    g.move(7, T_TOUCH - 1, 0);
    expect(g.isDragging(7)).toBe(false);
    g.move(7, T_TOUCH, 0);
    g.move(7, T_TOUCH + 10, 0);
    expect(g.take().dx).toBeCloseTo(10 * CFG.touch_look_scale, 6);
  });

  it('pointer lạ (chưa down) bị bỏ qua; take() trả rồi xóa', () => {
    const g = new LookGestures(CFG);
    g.move(99, 500, 500);
    expect(g.up(99)).toBe(false);
    g.down(1, 'mouse', 0, 0); g.move(1, 50, 0); g.move(1, 80, 0);
    expect(g.take().dx).toBe(30);
    expect(g.take()).toEqual({ dx: 0, dy: 0, zoom: 0 });
  });
});

describe('LookGestures — nhiều ngón (theo pointerId)', () => {
  it('chụm 2 ngón: xa ra = phóng gần (zoom âm), lại gần = lùi xa (zoom dương); không xoay', () => {
    const g = new LookGestures(CFG);
    g.down(1, 'touch', 100, 300);
    g.down(2, 'touch', 300, 300);           // cách 200 px
    g.move(2, 300 + CFG.pinch_px_per_step * 2, 300);   // xa thêm 2 nấc
    const v = g.take();
    expect(v.zoom).toBeCloseTo(-2, 6);
    expect(v.dx).toBe(0);
    expect(v.dy).toBe(0);
    g.move(1, 100 + CFG.pinch_px_per_step, 300);       // lại gần 1 nấc
    expect(g.take().zoom).toBeCloseTo(1, 6);
  });

  it('đang chụm thì thả cả hai ngón đều tính là kéo (không thành bấm vào vật)', () => {
    const g = new LookGestures(CFG);
    g.down(1, 'touch', 100, 300); g.down(2, 'touch', 300, 300);
    g.move(2, 340, 300);
    expect(g.up(1)).toBe(true);
    expect(g.up(2)).toBe(true);
  });

  it('chụm xong nhấc một ngón: ngón còn lại xoay tiếp, không giật', () => {
    const g = new LookGestures(CFG);
    g.down(1, 'touch', 100, 300); g.down(2, 'touch', 300, 300);
    g.move(2, 340, 300);
    g.up(1); g.take();
    g.move(2, 360, 300);
    expect(g.take().dx).toBeCloseTo(20 * CFG.touch_look_scale, 6);
  });

  it('cancel/clear bỏ hết trạng thái (mất focus, đổi cảnh)', () => {
    const g = new LookGestures(CFG);
    g.down(1, 'touch', 0, 0); g.move(1, 50, 0); g.move(1, 60, 0);
    g.clear();
    expect(g.take()).toEqual({ dx: 0, dy: 0, zoom: 0 });
    expect(g.active).toBe(0);
    g.down(3, 'mouse', 0, 0); g.cancel(3);
    expect(g.active).toBe(0);
  });
});

describe('wheelZoomSteps — chuột, touchpad cuộn 2 ngón, touchpad chụm (ctrlKey)', () => {
  it('một nấc chuột (100 px) = 1 nấc zoom; cuộn xuống = lùi xa', () => {
    expect(wheelZoomSteps(100, 0, false, CFG)).toBeCloseTo(1, 6);
    expect(wheelZoomSteps(-100, 0, false, CFG)).toBeCloseTo(-1, 6);
  });
  it('touchpad cuộn từng chút: zoom từng chút (không nhảy cả nấc mỗi sự kiện)', () => {
    expect(Math.abs(wheelZoomSteps(4, 0, false, CFG))).toBeLessThan(0.1);
  });
  it('chụm touchpad (ctrlKey) nhạy hơn cuộn thường, cùng chiều', () => {
    const pinch = wheelZoomSteps(-3, 0, true, CFG);
    expect(pinch).toBeLessThan(0);
    expect(Math.abs(pinch)).toBeGreaterThan(Math.abs(wheelZoomSteps(-3, 0, false, CFG)));
  });
  it('đổi đơn vị dòng/trang; mỗi sự kiện không quá giới hạn', () => {
    expect(wheelZoomSteps(3, 1, false, CFG)).toBeCloseTo(Math.min(CFG.wheel_max_steps_per_event, 3 * 33 / CFG.wheel_px_per_step), 6);
    expect(wheelZoomSteps(5000, 0, false, CFG)).toBe(CFG.wheel_max_steps_per_event);
    expect(wheelZoomSteps(-1, 2, false, CFG)).toBe(-CFG.wheel_max_steps_per_event);
    expect(wheelZoomSteps(0, 0, true, CFG)).toBe(0);
  });
});

describe('joystickVector — nút tròn ảo', () => {
  const R = CFG.joystick.radius_px;
  it('trong vùng chết: đứng yên', () => {
    expect(joystickVector(R * CFG.joystick.dead_zone * 0.5, 0, CFG.joystick).moving).toBe(false);
  });
  it('kéo lên = đi tới, kéo phải = sang phải; kéo gần mép = chạy', () => {
    const up = joystickVector(0, -R * 0.5, CFG.joystick);
    expect(up).toMatchObject({ moving: true, run: false });
    expect(up.forward).toBeGreaterThan(0);
    expect(up.strafe).toBeCloseTo(0, 6);
    const right = joystickVector(R, 0, CFG.joystick);
    expect(right.strafe).toBeGreaterThan(0);
    expect(right.run).toBe(true);
  });
  it('núm không ra ngoài vòng tròn', () => {
    const v = joystickVector(R * 3, R * 4, CFG.joystick);
    expect(Math.hypot(v.knobX, v.knobY)).toBeCloseTo(R, 6);
    expect(v.run).toBe(true);
  });
});

describe('kiểu camera: Chuẩn mặc định, V xoay vòng 3 kiểu', () => {
  it('D-S2-01 đã chốt: mặc định là Chuẩn (kéo chuột trái/phải, không khóa con trỏ)', () => {
    expect(DEFAULT_CAMERA_MODE).toBe('standard');
    expect(CAMERA_MODES.standard.look).toBe('free');
  });
  it('vòng: Chuẩn → A → B → Chuẩn', () => {
    expect(CAMERA_MODE_ORDER).toEqual(['standard', 'A', 'B']);
    expect(nextCameraMode('standard')).toBe('A');
    expect(nextCameraMode('A')).toBe('B');
    expect(nextCameraMode('B')).toBe('standard');
  });
  it('giá trị lưu lạ (bản lưu hỏng/cũ) được nhận ra', () => {
    expect(isCameraMode('A')).toBe(true);
    expect(isCameraMode('standard')).toBe(true);
    expect(isCameraMode('C')).toBe(false);
    expect(isCameraMode(undefined)).toBe(false);
  });
});

describe('ButtonDrag — giữ nút chuột/touchpad khi kéo (hotfix touchpad)', () => {
  it('chỉ theo dõi đúng pointerId đã bấm', () => {
    const d = new ButtonDrag();
    d.begin(1);
    expect(d.active).toBe(1);
    expect(d.stillPressed(2, 0)).toBe(true);          // pointer khác: không liên quan
    expect(d.end(2)).toBe(false);
    expect(d.end(1)).toBe(true);
    expect(d.active).toBeNull();
  });
  it('không đòi đúng một giá trị buttons: 1, 2, 3 đều là "đang giữ"', () => {
    const d = new ButtonDrag();
    d.begin(1);
    for (const b of [1, 2, 3, 5]) expect(d.stillPressed(1, b)).toBe(true);
  });
  it('trình duyệt báo buttons=0 sau khi đã từng báo đang giữ → coi như đã thả (mất pointerup)', () => {
    const d = new ButtonDrag();
    d.begin(1);
    d.stillPressed(1, 1);
    expect(d.stillPressed(1, 0)).toBe(false);
  });
  it('trình duyệt chưa từng báo buttons (luôn 0) → KHÔNG tự hủy kéo, chờ pointerup', () => {
    const d = new ButtonDrag();
    d.begin(1);
    expect(d.stillPressed(1, 0)).toBe(true);
    expect(d.stillPressed(1, 0)).toBe(true);
  });
  it('bấm lần mới thì quên trạng thái lần trước', () => {
    const d = new ButtonDrag();
    d.begin(1); d.stillPressed(1, 1); d.end(1);
    d.begin(1);
    expect(d.stillPressed(1, 0)).toBe(true);
  });
});

describe('WheelRouter — touchpad vuốt 2 ngón: ngang = xoay camera, dọc = zoom (để vừa giữ WASD vừa xoay)', () => {
  const W = CFG.wheel_look;
  it('vuốt ngang: xoay, không zoom', () => {
    const r = new WheelRouter(CFG);
    const v = r.feed(20, 2, 0, false, 0);
    expect(v.zoom).toBe(0);
    expect(v.lookDx).toBeCloseTo(-20 * W.px_scale, 6);
  });
  it('vuốt dọc / lăn chuột thường: zoom như cũ, không xoay', () => {
    const r = new WheelRouter(CFG);
    const v = r.feed(0, 100, 0, false, 0);
    expect(v.lookDx).toBe(0);
    expect(v.zoom).toBeCloseTo(wheelZoomSteps(100, 0, false, CFG), 6);
  });
  it('trong một lần vuốt, giữ nguyên hướng đã chọn (vuốt ngang hơi lệch dọc không làm zoom giật)', () => {
    const r = new WheelRouter(CFG);
    r.feed(15, 3, 0, false, 0);
    const v = r.feed(4, 9, 0, false, 16);          // cùng lần vuốt: dọc lớn hơn nhưng vẫn coi là ngang
    expect(v.zoom).toBe(0);
    expect(v.lookDx).toBeCloseTo(-4 * W.px_scale, 6);
  });
  it('nghỉ quá khoảng cách giữa hai lần vuốt → chọn lại hướng', () => {
    const r = new WheelRouter(CFG);
    r.feed(15, 0, 0, false, 0);
    const v = r.feed(0, 50, 0, false, W.gesture_gap_ms + 50);
    expect(v.lookDx).toBe(0);
    expect(v.zoom).not.toBe(0);
  });
  it('chụm touchpad (ctrlKey) luôn là zoom, không xoay', () => {
    const r = new WheelRouter(CFG);
    const v = r.feed(30, -3, 0, true, 0);
    expect(v.lookDx).toBe(0);
    expect(v.zoom).toBeCloseTo(wheelZoomSteps(-3, 0, true, CFG), 6);
  });
  it('đơn vị dòng (deltaMode=1) được đổi ra pixel; tắt tính năng thì vuốt ngang không làm gì', () => {
    expect(new WheelRouter(CFG).feed(2, 0, 1, false, 0).lookDx).toBeCloseTo(-2 * 33 * W.px_scale, 6);
    const off = new WheelRouter({ ...CFG, wheel_look: { ...W, enabled: false } });
    expect(off.feed(20, 0, 0, false, 0)).toEqual({ lookDx: 0, zoom: 0 });
  });
  it('một sự kiện không xoay quá giới hạn (máy gửi số rất lớn)', () => {
    const v = new WheelRouter(CFG).feed(100000, 0, 0, false, 0);
    expect(Math.abs(v.lookDx)).toBe(W.max_px_per_event);
  });
});
