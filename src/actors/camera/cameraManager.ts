/**
 * CameraManager — một camera thứ ba bám theo nhân vật, dùng chung cho mọi khu (không viết camera riêng từng khu).
 *
 *  - Thông số lấy từ preset (src/config/camera.ts); mỗi khu có thể chỉ định preset khác (vd. trong nhà).
 *  - Kiểu điều khiển A/B chỉ khác cách lấy chuyển động chuột (giữ chuột phải / khóa con trỏ) — phần đó nằm ở game/input.ts.
 *    Ở đây chỉ nhận "độ xoay" đã tính sẵn, nên thêm kiểu C sau này không phải sửa file này.
 *  - Tự kéo gần khi bị tường che (dò đoạn thẳng từ đầu nhân vật tới camera trên dữ liệu va chạm).
 *  - Cutscene/ảnh: `lock()` giữ camera ở một tư thế cố định, `release()` trả lại đúng trạng thái trước đó.
 */
import * as THREE from 'three';
import { LOOK_SENSITIVITY, type CameraPreset } from '../../config/camera';

export interface CameraPose { position: [number, number, number]; look_at: [number, number, number]; fov?: number }
/** Chỗ camera hỏi "đoạn thẳng này có bị che không". World đáp ứng sẵn. */
export interface Occluder { segmentHit(a: [number, number, number], b: [number, number, number], pad: number): number | null }
export interface LookInput { dx: number; dy: number; zoom: number }

const deg = THREE.MathUtils.degToRad;
const clamp = THREE.MathUtils.clamp;

export class CameraManager {
  readonly camera: THREE.PerspectiveCamera;
  /** Góc quay ngang quanh nhân vật (camera đứng ở phía +yaw). */
  yaw = 0;
  pitch: number;
  /** Khoảng cách người chơi muốn (zoom). */
  distance: number;
  /** Khoảng cách thật sau khi tránh vật che. */
  current: number;
  private preset: CameraPreset;
  private focus = new THREE.Vector3();
  private hasFocus = false;
  private locked: { pose: CameraPose; saved: { yaw: number; pitch: number; distance: number; fov: number } } | null = null;
  private look = new THREE.Vector3();
  private dolly: {
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromLook: THREE.Vector3;
    toLook: THREE.Vector3;
    fromFov: number;
    toFov: number;
    elapsed: number;
    duration: number;
  } | null = null;

  constructor(preset: CameraPreset, private occluder: Occluder | null = null) {
    this.preset = preset;
    this.camera = new THREE.PerspectiveCamera(preset.fov, 16 / 9, 0.1, 400);
    this.pitch = deg(preset.pitch_deg);
    this.distance = this.current = preset.distance;
  }

  get presetInUse(): CameraPreset { return this.preset; }
  get isLocked(): boolean { return this.locked !== null; }

  /** Đổi preset (vd. bước vào lớp học). Giữ góc nhìn, chỉ kẹp lại theo giới hạn mới và đổi dần khoảng cách. */
  setPreset(preset: CameraPreset): void {
    if (preset === this.preset) return;
    const k = (this.distance - this.preset.min_distance) / Math.max(0.001, this.preset.max_distance - this.preset.min_distance);
    this.preset = preset;
    this.distance = preset.min_distance + clamp(k, 0, 1) * (preset.max_distance - preset.min_distance);
    this.pitch = clamp(this.pitch, deg(preset.min_pitch_deg), deg(preset.max_pitch_deg));
  }
  setOccluder(o: Occluder | null): void { this.occluder = o; }

  /** Đặt camera ngay sau lưng một hướng nhìn (lúc xuất hiện, sau khi dịch chuyển). */
  snapBehind(facing: number, target: { x: number; y: number; z: number }): void {
    this.yaw = facing + Math.PI;
    this.focus.set(target.x, target.y + this.preset.look_height, target.z);
    this.hasFocus = true;
    this.current = this.distance;
    this.place(1);
  }

  /** Giữ camera ở một tư thế cố định (cutscene, khung ngắm). Gọi nhiều lần = đổi tư thế, vẫn nhớ trạng thái ban đầu. */
  lock(pose: CameraPose): void {
    const saved = this.locked?.saved ?? { yaw: this.yaw, pitch: this.pitch, distance: this.distance, fov: this.camera.fov };
    this.locked = { pose, saved };
    this.dolly = null;
    this.camera.position.set(...pose.position);
    if (pose.fov) { this.camera.fov = pose.fov; this.camera.updateProjectionMatrix(); }
    this.camera.lookAt(this.look.set(...pose.look_at));
  }
  /** Lướt mượt camera (position, lookAt, fov) tới `pose` trong `durationMs` ms trong `update(dt)`. */
  dollyTo(pose: CameraPose, durationMs = 900): void {
    if (durationMs <= 0) { this.lock(pose); return; }
    const saved = this.locked?.saved ?? { yaw: this.yaw, pitch: this.pitch, distance: this.distance, fov: this.camera.fov };
    const fromPos = this.camera.position.clone();
    const fromLook = this.locked
      ? this.look.clone()
      : this.hasFocus
        ? this.focus.clone()
        : fromPos.clone().add(new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion));
    const fromFov = this.camera.fov;
    this.locked = { pose, saved };
    this.dolly = {
      fromPos,
      toPos: new THREE.Vector3(...pose.position),
      fromLook,
      toLook: new THREE.Vector3(...pose.look_at),
      fromFov,
      toFov: pose.fov ?? fromFov,
      elapsed: 0,
      duration: durationMs / 1000,
    };
  }
  /** Trả camera về bám theo nhân vật, đúng góc/khoảng cách trước khi khóa. */
  release(): void {
    if (!this.locked) return;
    const s = this.locked.saved;
    this.locked = null;
    this.dolly = null;
    this.yaw = s.yaw; this.pitch = s.pitch; this.distance = s.distance;
    if (this.camera.fov !== s.fov) { this.camera.fov = s.fov; this.camera.updateProjectionMatrix(); }
    this.current = this.distance;
    this.place(1);
  }

  /**
   * Mỗi khung hình. `input` = null khi điều khiển đang khóa (camera vẫn bám theo nhưng không xoay).
   * dx/dy là chuyển động chuột (pixel) đã được input lọc theo kiểu A/B.
   */
  update(dt: number, target: { x: number; y: number; z: number }, input: LookInput | null): void {
    if (this.locked) {
      if (this.dolly) {
        this.dolly.elapsed += Math.max(0, dt);
        const raw = Math.min(1, this.dolly.elapsed / this.dolly.duration);
        const t = raw * raw * (3 - 2 * raw);
        this.camera.position.lerpVectors(this.dolly.fromPos, this.dolly.toPos, t);
        this.look.lerpVectors(this.dolly.fromLook, this.dolly.toLook, t);
        const fov = THREE.MathUtils.lerp(this.dolly.fromFov, this.dolly.toFov, t);
        if (Math.abs(this.camera.fov - fov) > 1e-4) {
          this.camera.fov = fov;
          this.camera.updateProjectionMatrix();
        }
        this.camera.lookAt(this.look);
        if (raw >= 1) this.dolly = null;
      }
      return;
    }
    const p = this.preset;
    if (input) {
      this.yaw -= input.dx * LOOK_SENSITIVITY.yaw;
      this.pitch = clamp(this.pitch + input.dy * LOOK_SENSITIVITY.pitch, deg(p.min_pitch_deg), deg(p.max_pitch_deg));
      this.distance = clamp(this.distance + input.zoom * LOOK_SENSITIVITY.zoom_step, p.min_distance, p.max_distance);
    }
    if (this.camera.fov !== p.fov) { this.camera.fov += (p.fov - this.camera.fov) * Math.min(1, dt * 6); if (Math.abs(this.camera.fov - p.fov) < 0.05) this.camera.fov = p.fov; this.camera.updateProjectionMatrix(); }
    const k = this.hasFocus ? Math.min(1, dt * p.follow_sharpness) : 1;
    this.focus.x += (target.x - this.focus.x) * k;
    this.focus.y += (target.y + p.look_height - this.focus.y) * k;
    this.focus.z += (target.z - this.focus.z) * k;
    this.hasFocus = true;
    this.place(dt);
  }

  private place(dt: number): void {
    const h = Math.cos(this.pitch), v = Math.sin(this.pitch);
    const dirX = Math.sin(this.yaw) * h, dirY = v, dirZ = Math.cos(this.yaw) * h;
    let want = this.distance;
    if (this.occluder) {
      const a: [number, number, number] = [this.focus.x, this.focus.y, this.focus.z];
      const b: [number, number, number] = [a[0] + dirX * want, a[1] + dirY * want, a[2] + dirZ * want];
      const t = this.occluder.segmentHit(a, b, this.preset.collide_pad);
      if (t !== null) want = Math.max(0.6, want * t);
    }
    // bị che: kéo gần ngay; hết che: lùi ra từ từ (đỡ giật)
    this.current = want < this.current ? want : this.current + (want - this.current) * Math.min(1, dt * 4);
    this.camera.position.set(this.focus.x + dirX * this.current, this.focus.y + dirY * this.current, this.focus.z + dirZ * this.current);
    this.camera.lookAt(this.focus);
  }
}
