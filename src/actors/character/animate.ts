import type { CharacterRig } from './build';

/**
 * Animation thủ tục (không cần file animation): đứng thở, chớp mắt, đi/chạy theo tốc độ,
 * nói, 3 kiểu tạo dáng, reo mừng. GDD 10.1.
 */
export type Motion = 'idle' | 'walk' | 'run' | 'talk' | 'pose_peace' | 'pose_wave' | 'pose_tada' | 'cheer';

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export class CharacterAnimator {
  motion: Motion = 'idle';
  /** Tốc độ di chuyển thật (m/s) — dùng để bước chân khớp với quãng đường đi. */
  speed = 0;
  t: number;
  private phase = 0;
  private nextBlink: number;
  private blinkT = -1;
  private blend = 0;            // 0 = đứng, 1 = đi/chạy

  constructor(public rig: CharacterRig, seed = 0) {
    this.t = seed * 1.7;
    this.nextBlink = 1 + (seed % 3);
  }

  setMotion(m: Motion) {
    this.motion = m;
    this.rig.setExpression(m === 'cheer' || m === 'pose_peace' || m === 'pose_tada' ? 'happy' : m === 'talk' ? 'talk' : 'neutral');
    if (m === 'walk' && this.speed === 0) this.speed = 3.2;
    if (m === 'run' && this.speed === 0) this.speed = 5.5;
  }

  /** Đặt trạng thái tại một thời điểm cố định (dùng cho ảnh chụp kiểm thử lặp lại được). */
  pose(t: number) { this.t = t; this.phase = t * this.stepRate(); this.blinkT = -1; this.blend = this.moving ? 1 : 0; this.apply(); }

  private get moving() { return this.motion === 'walk' || this.motion === 'run'; }
  private stepRate() { return (this.speed || 3.2) / (this.rig.dims.legLen * 1.15); }

  update(dt: number) {
    this.t += dt;
    if (this.moving) this.phase += dt * this.stepRate();
    this.blend = lerp(this.blend, this.moving ? 1 : 0, Math.min(1, dt * 10));
    // chớp mắt ngẫu nhiên 2,5–5 giây/lần
    if (this.blinkT < 0 && this.t > this.nextBlink) this.blinkT = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      if (this.blinkT > 0.14) { this.blinkT = -1; this.nextBlink = this.t + 2.5 + Math.random() * 2.5; }
    }
    this.apply();
  }

  private apply() {
    const r = this.rig, d = r.dims, t = this.t, idle = r.def.idle;
    const run = this.motion === 'run';
    const amp = (run ? 0.85 : 0.55) * this.blend;
    const s = Math.sin(this.phase);

    // --- chân & hông
    r.legL.rotation.x = s * amp;
    r.legR.rotation.x = -s * amp;
    const breathe = Math.sin(t * 2.2 * idle.bounce) * 0.012;
    r.hips.position.y = d.legLen + Math.abs(Math.cos(this.phase)) * (run ? 0.06 : 0.03) * this.blend;
    r.torso.scale.y = 1 + breathe * (1 - this.blend);
    r.torso.rotation.x = (run ? 0.16 : 0.04) * this.blend;
    r.torso.rotation.y = s * 0.1 * this.blend;
    r.root.position.y = 0;

    // --- tay (mặc định buông thả, đánh tay ngược chân khi đi)
    const holdL = (r.armL.userData.holdIn as number | undefined) ?? 0;
    const holdR = (r.armR.userData.holdIn as number | undefined) ?? 0;
    const outL = (r.armL.userData.holdOut as number | undefined) ?? 0;
    const swing = (run ? 0.9 : 0.6) * this.blend;
    let aLx = -s * swing - holdL * (1 - this.blend * 0.5), aRx = s * swing - holdR * (1 - this.blend * 0.5);
    let aLz = 0.1 + outL + Math.sin(t * 1.9) * 0.02 + holdL * -0.15, aRz = -0.1 - Math.sin(t * 1.9) * 0.02 + holdR * 0.15;

    // --- đầu
    let headX = -idle.lookUp + Math.sin(t * 1.3) * 0.02, headZ = idle.tilt * (1 - this.blend), headY = Math.sin(t * 0.7) * 0.05 * (1 - this.blend);

    switch (this.motion) {
      case 'talk':
        headX += Math.sin(t * 5) * 0.04;
        r.setMouthOpen(0.5 + 0.5 * Math.sin(t * 16) * Math.sin(t * 5.3));
        aRx = -0.35 + Math.sin(t * 3) * 0.12; aRz = -0.25;
        break;
      case 'pose_peace':     // một tay giơ chữ V
        aRz = -2.75; aRx = -0.5; headZ = 0.12; headX = -0.05;
        break;
      case 'pose_wave':      // vẫy tay
        aLz = 2.5 + Math.sin(t * 9) * 0.35; aLx = -0.2; headZ = -0.08;
        break;
      case 'pose_tada':      // dang hai tay "ta-da"
        aLz = 1.15; aRz = -1.15; aLx = aRx = -0.35; headX = -0.08;
        break;
      case 'cheer': {        // nhảy reo
        const j = Math.abs(Math.sin(t * 5.5));
        r.root.position.y = j * 0.16;
        aLz = 2.75 + j * 0.2; aRz = -2.75 - j * 0.2; aLx = aRx = -0.45;
        r.legL.rotation.x = -j * 0.25; r.legR.rotation.x = -j * 0.1;
        headX = -0.12;
        break;
      }
    }
    r.armL.rotation.set(aLx, 0, aLz);
    r.armR.rotation.set(aRx, 0, aRz);
    r.head.rotation.set(headX, headY, headZ);

    if (r.ponytail) {
      r.ponytail.rotation.z = Math.sin(t * 2.4) * 0.06 + s * 0.15 * this.blend;
      r.ponytail.rotation.x = -0.12 * this.blend * (run ? 2 : 1);
    }
    r.setBlink(this.blinkT >= 0 ? Math.sin((this.blinkT / 0.14) * Math.PI) : 0);
  }
}
