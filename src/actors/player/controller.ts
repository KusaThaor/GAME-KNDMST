/**
 * Điều khiển nhân vật người chơi — KHÔNG biết gì về model, quest hay phím cụ thể.
 *  - Nhận "ý định di chuyển" (tới/lui, trái/phải, chạy) + hướng camera → tính vị trí mới, có va chạm và bám sàn.
 *  - Hình ảnh nhân vật gắn vào qua `Avatar` (xem avatar.ts) nên đổi model sau này không phải sửa file này.
 *  - Dùng chung cho mọi kiểu camera (A/B hay kiểu mới): camera chỉ cung cấp góc quay ngang.
 */
import { DEFAULT_BODY, type BodyOpts } from '../../world/collision';

/** Phần thế giới mà bộ điều khiển cần: va chạm ngang + cao độ sàn. `World` đáp ứng sẵn (xem navOf trong world.ts). */
export interface Navigation {
  resolve(x: number, z: number, y: number, body: BodyOpts): { x: number; z: number; hit: boolean };
  /** Cao độ sàn dưới điểm (x, z); null = không có sàn (ngoài bản đồ). */
  ground(x: number, z: number, y: number): number | null;
}

export interface MoveIntent { forward: number; strafe: number; run: boolean }
export interface MoveConfig { walk: number; run: number; turn_sharpness: number; body: BodyOpts; max_step_up: number }
export const DEFAULT_MOVE: MoveConfig = { walk: 3.2, run: 5.5, turn_sharpness: 12, body: DEFAULT_BODY, max_step_up: 0.35 };

export type MoveState = 'idle' | 'walk' | 'run';

export class PlayerController {
  x = 0; y = 0; z = 0;
  /** Hướng mặt (radian; 0 = nhìn về +z). */
  facing = 0;
  state: MoveState = 'idle';
  /** Tốc độ thật vừa đi được (m/s) — để bước chân khớp quãng đường. */
  speed = 0;

  constructor(private nav: Navigation, private cfg: MoveConfig = DEFAULT_MOVE) {}

  setNavigation(nav: Navigation): void { this.nav = nav; }

  /** Đặt nhân vật tới một điểm (xuất hiện, dịch chuyển, "về chỗ an toàn"). Tự bám sàn. */
  teleport(x: number, z: number, facing?: number, y?: number): void {
    this.x = x; this.z = z;
    this.y = this.nav.ground(x, z, (y ?? 0) + 1) ?? y ?? 0;
    this.targetY = null;
    if (facing !== undefined) this.facing = facing;
    this.state = 'idle'; this.speed = 0;
  }

  /**
   * Mỗi khung hình. `intent` = null khi điều khiển đang khóa (thoại, menu…).
   * `cameraYaw` = góc quay ngang của camera quanh nhân vật (camera đứng ở phía +yaw so với nhân vật).
   */
  update(dt: number, intent: MoveIntent | null, cameraYaw: number): void {
    const f = intent?.forward ?? 0, s = intent?.strafe ?? 0;
    if (!f && !s) { this.state = 'idle'; this.speed = 0; this.settle(dt); return; }
    const run = !!intent?.run;
    const speed = run ? this.cfg.run : this.cfg.walk;
    // "tới" = hướng từ camera nhìn về nhân vật
    const fx = -Math.sin(cameraYaw), fz = -Math.cos(cameraYaw);
    let dx = fx * f - fz * s, dz = fz * f + fx * s;
    const len = Math.hypot(dx, dz) || 1;
    dx /= len; dz /= len;

    const startX = this.x, startZ = this.z;
    // Chia nhỏ bước để không xuyên vật mỏng khi khung hình giật (độc lập tốc độ khung hình).
    const dist = speed * dt;
    const steps = Math.max(1, Math.ceil(dist / (this.cfg.body.radius * 0.5)));
    for (let i = 0; i < steps; i++) this.step(dx * dist / steps, dz * dist / steps);

    const moved = Math.hypot(this.x - startX, this.z - startZ);
    this.speed = dt > 0 ? moved / dt : 0;
    this.state = run ? 'run' : 'walk';
    const want = Math.atan2(dx, dz);
    let d = want - this.facing;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.facing += d * Math.min(1, dt * this.cfg.turn_sharpness);
    this.settle(dt);
  }

  private step(mx: number, mz: number): void {
    const tryMove = (tx: number, tz: number): boolean => {
      const r = this.nav.resolve(tx, tz, this.y, this.cfg.body);
      const g = this.nav.ground(r.x, r.z, this.y);
      if (g === null || g - this.y > this.cfg.max_step_up) return false;     // hết sàn hoặc bậc quá cao
      this.x = r.x; this.z = r.z; this.targetY = g;
      return true;
    };
    // đi thẳng; nếu bị chặn bởi mép sàn thì thử trượt theo từng trục
    if (tryMove(this.x + mx, this.z + mz)) return;
    if (mx && tryMove(this.x + mx, this.z)) return;
    if (mz) tryMove(this.x, this.z + mz);
  }

  private targetY: number | null = null;
  /** Lên/xuống bậc mượt thay vì giật. */
  private settle(dt: number): void {
    if (this.targetY === null) return;
    const k = Math.min(1, dt * 14);
    this.y += (this.targetY - this.y) * k;
    if (Math.abs(this.targetY - this.y) < 0.002) { this.y = this.targetY; this.targetY = null; }
  }
}
