import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CameraManager, type Occluder } from '../../../src/actors/camera/cameraManager';
import { CAMERA_MODES, CAMERA_PRESETS, CONTROLS, DEFAULT_CAMERA_MODE, DEFAULT_CAMERA_PRESET, isControl } from '../../../src/config/camera';

const P = CAMERA_PRESETS[DEFAULT_CAMERA_PRESET];
const deg = THREE.MathUtils.degToRad;
const target = { x: 2, y: 0, z: -3 };
const settle = (c: CameraManager, t = target, n = 120) => { for (let i = 0; i < n; i++) c.update(1 / 60, t, { dx: 0, dy: 0, zoom: 0 }); };

describe('CameraManager (S2)', () => {
  it('đứng sau lưng nhân vật, đúng khoảng cách và góc của preset', () => {
    const c = new CameraManager(P);
    c.snapBehind(Math.PI, target);              // nhân vật nhìn về -z → camera ở phía +z
    const focus = new THREE.Vector3(target.x, target.y + P.look_height, target.z);
    expect(c.camera.position.distanceTo(focus)).toBeCloseTo(P.distance, 4);
    expect(c.camera.position.z).toBeGreaterThan(target.z);
    expect(c.camera.position.x).toBeCloseTo(target.x, 4);
    expect(c.camera.position.y - focus.y).toBeCloseTo(Math.sin(deg(P.pitch_deg)) * P.distance, 4);
  });

  it('chuột xoay ngang; góc dọc và zoom bị kẹp trong giới hạn của preset', () => {
    const c = new CameraManager(P);
    c.snapBehind(0, target);
    const yaw0 = c.yaw;
    c.update(1 / 60, target, { dx: 100, dy: 0, zoom: 0 });
    expect(c.yaw).not.toBe(yaw0);
    c.update(1 / 60, target, { dx: 0, dy: 5000, zoom: 0 });
    expect(c.pitch).toBeCloseTo(deg(P.max_pitch_deg), 6);
    c.update(1 / 60, target, { dx: 0, dy: -99999, zoom: 0 });
    expect(c.pitch).toBeCloseTo(deg(P.min_pitch_deg), 6);
    c.update(1 / 60, target, { dx: 0, dy: 0, zoom: 100 });
    expect(c.distance).toBe(P.max_distance);
    c.update(1 / 60, target, { dx: 0, dy: 0, zoom: -100 });
    expect(c.distance).toBe(P.min_distance);
  });

  it('điều khiển bị khóa (input = null): vẫn bám theo nhân vật nhưng không xoay', () => {
    const c = new CameraManager(P);
    c.snapBehind(0, target);
    const yaw = c.yaw, pitch = c.pitch;
    const moved = { x: 10, y: 0, z: 4 };
    for (let i = 0; i < 180; i++) c.update(1 / 60, moved, null);
    expect([c.yaw, c.pitch]).toEqual([yaw, pitch]);
    expect(c.camera.position.distanceTo(new THREE.Vector3(moved.x, P.look_height, moved.z))).toBeCloseTo(P.distance, 2);
  });

  it('bị tường che thì kéo gần ngay; hết che thì lùi ra dần', () => {
    let blockedAt: number | null = 0.4;
    const occ: Occluder = { segmentHit: () => blockedAt };
    const c = new CameraManager(P, occ);
    c.snapBehind(0, target);
    expect(c.current).toBeCloseTo(P.distance * 0.4, 5);
    blockedAt = null;
    c.update(1 / 60, target, null);
    expect(c.current).toBeGreaterThan(P.distance * 0.4);
    expect(c.current).toBeLessThan(P.distance);
    settle(c);
    expect(c.current).toBeCloseTo(P.distance, 2);
    blockedAt = 0.01;                         // sát tường: không chui vào đầu nhân vật
    c.update(1 / 60, target, null);
    expect(c.current).toBeGreaterThanOrEqual(0.6);
  });

  it('khóa cho cutscene/khung ngắm rồi trả lại đúng góc, khoảng cách, FOV trước đó', () => {
    const c = new CameraManager(P);
    c.snapBehind(0.7, target);
    c.update(1 / 60, target, { dx: 40, dy: 30, zoom: -2 });
    settle(c);
    const before = { yaw: c.yaw, pitch: c.pitch, distance: c.distance, fov: c.camera.fov, pos: c.camera.position.clone() };
    c.lock({ position: [0, 5, 10], look_at: [0, 1, 0], fov: 38 });
    expect(c.isLocked).toBe(true);
    expect(c.camera.position.toArray()).toEqual([0, 5, 10]);
    expect(c.camera.fov).toBe(38);
    c.update(1 / 60, { x: 50, y: 0, z: 50 }, { dx: 999, dy: 999, zoom: 9 });       // đang khóa: bỏ qua mọi thứ
    expect(c.camera.position.toArray()).toEqual([0, 5, 10]);
    c.lock({ position: [1, 2, 3], look_at: [0, 1, 0] });                          // đổi tư thế khi đang khóa vẫn nhớ trạng thái gốc
    c.release();
    expect(c.isLocked).toBe(false);
    expect([c.yaw, c.pitch, c.distance, c.camera.fov]).toEqual([before.yaw, before.pitch, before.distance, before.fov]);
    expect(c.camera.position.distanceTo(before.pos)).toBeLessThan(1e-6);
    c.release();                                                                   // gọi thừa không sao
  });

  it('đổi preset (bước vào lớp học): kẹp lại theo giới hạn mới, giữ hướng nhìn', () => {
    const indoor = CAMERA_PRESETS.follow_indoor;
    const c = new CameraManager(P);
    c.snapBehind(1, target);
    c.update(1 / 60, target, { dx: 0, dy: 0, zoom: 100 });       // zoom xa hết cỡ ngoài trời
    const yaw = c.yaw;
    c.setPreset(indoor);
    expect(c.presetInUse).toBe(indoor);
    expect(c.yaw).toBe(yaw);
    expect(c.distance).toBe(indoor.max_distance);
    expect(c.pitch).toBeGreaterThanOrEqual(deg(indoor.min_pitch_deg));
    settle(c, target, 240);
    expect(c.camera.fov).toBe(indoor.fov);
  });
});

describe('cấu hình camera và phím', () => {
  it('mọi preset hợp lệ; preset mặc định tồn tại', () => {
    expect(CAMERA_PRESETS[DEFAULT_CAMERA_PRESET]).toBeDefined();
    for (const [name, p] of Object.entries(CAMERA_PRESETS)) {
      expect(p.min_distance, name).toBeLessThanOrEqual(p.distance);
      expect(p.distance, name).toBeLessThanOrEqual(p.max_distance);
      expect(p.min_pitch_deg, name).toBeLessThanOrEqual(p.pitch_deg);
      expect(p.pitch_deg, name).toBeLessThanOrEqual(p.max_pitch_deg);
    }
  });
  it('preset ngoài trời đúng số trong GDD v0.3 §3 (25–40°, 5,5 m, zoom 3,5–8 m)', () => {
    expect(P).toMatchObject({ distance: 5.5, min_distance: 3.5, max_distance: 8, min_pitch_deg: 25, max_pitch_deg: 40 });
  });
  it('có đủ kiểu Chuẩn (mặc định, D-S2-01) và hai kiểu nâng cao A (giữ chuột phải), B (khóa con trỏ)', () => {
    expect(CAMERA_MODES.A.look).toBe('drag');
    expect(CAMERA_MODES.B.look).toBe('lock');
    expect(CAMERA_MODES.standard.look).toBe('free');
    expect(DEFAULT_CAMERA_MODE).toBe('standard');
  });
  it('không phím nào gán cho hai việc; phím C chỉ dành cho máy ảnh/cuộn phim', () => {
    const seen = new Map<string, string>();
    for (const [action, codes] of Object.entries(CONTROLS)) for (const code of codes) {
      expect(seen.get(code), `${code} dùng cho cả ${seen.get(code)} và ${action}`).toBeUndefined();
      seen.set(code, action);
    }
    expect(seen.get('KeyC')).toBe('film_camera');
    expect(isControl('camera_mode', 'KeyC')).toBe(false);
    expect(isControl('camera_mode', CONTROLS.camera_mode[0])).toBe(true);
  });
});
