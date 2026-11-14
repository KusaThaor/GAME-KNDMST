import * as THREE from 'three';
import {
  BatchedRenderer, ParticleSystem, RenderMode, RectangleEmitter,
  ConstantValue, IntervalValue, RandomColor, ColorOverLife, Gradient, Noise,
  Vector3 as QVec3, Vector4 as QVec4,
} from 'three.quarks';

/**
 * Lớp hiệu ứng hạt (three.quarks). Mọi hiệu ứng dùng chung một BatchedRenderer để gộp lượt vẽ.
 * Hiệu ứng là thử nghiệm (PROPOSED) — chưa thuộc art direction đã duyệt; bật bằng ?fx=dust ở trang thử.
 */
export interface Fx {
  batch: BatchedRenderer;
  update(dt: number): void;
  /** Bụi nắng: hạt sáng nhỏ trôi chậm trong vùng nắng — trung tính với mùa, hợp Ch1 (tháng 9, phượng chưa nở). */
  addSunMotes(opts?: SunMotesOpts): SunMotes;
  dispose(): void;
}

export interface SunMotesOpts {
  center?: THREE.Vector3;
  width?: number;
  depth?: number;
  height?: number;
  rate?: number;
}

export interface SunMotes {
  system: ParticleSystem;
  setRate(n: number): void;
}

/** Texture chấm mềm tạo bằng dữ liệu (không cần canvas/ảnh → chạy cả trong unit test). */
function softDotTexture(size = 32) {
  const data = new Uint8Array(size * size * 4);
  const c = (size - 1) / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const d = Math.hypot(x - c, y - c) / c;
    const a = Math.max(0, 1 - d) ** 2;
    const i = (y * size + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = Math.round(a * 255);
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
}

export function createFx(scene: THREE.Scene): Fx {
  const batch = new BatchedRenderer();
  scene.add(batch);
  const textures: THREE.Texture[] = [];
  const systems: ParticleSystem[] = [];

  return {
    batch,
    update(dt) { batch.update(dt); },
    addSunMotes(opts = {}) {
      const tex = softDotTexture();
      textures.push(tex);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, color: 0xffffff,
      });
      mat.userData.outlineParameters = { visible: false };
      const w = opts.width ?? 10, d = opts.depth ?? 8, h = opts.height ?? 3;
      const system = new ParticleSystem({
        looping: true,
        prewarm: true,
        duration: 6,
        shape: new RectangleEmitter({ width: w, height: d, thickness: 1 }),
        startLife: new IntervalValue(5, 9),
        startSpeed: new IntervalValue(0.05, 0.25),
        startSize: new IntervalValue(0.03, 0.08),
        startColor: new RandomColor(new QVec4(1, 0.95, 0.78, 0.55), new QVec4(1, 0.86, 0.6, 0.85)),
        emissionOverTime: new ConstantValue(opts.rate ?? 14),
        behaviors: [
          // hiện dần → mờ dần, tránh hạt bật/tắt đột ngột
          new ColorOverLife(new Gradient(
            [[new QVec3(1, 1, 1), 0], [new QVec3(1, 1, 1), 1]],
            [[0, 0], [1, 0.25], [1, 0.75], [0, 1]],
          )),
          new Noise(new ConstantValue(0.25), new ConstantValue(0.35)),
        ],
        material: mat,
        renderMode: RenderMode.BillBoard,
        worldSpace: true,
      });
      // RectangleEmitter phát theo +Z cục bộ → xoay để mặt phát nằm ngang, hạt bay lên chậm
      system.emitter.rotation.x = -Math.PI / 2;
      const c = opts.center ?? new THREE.Vector3(0, 0, 0);
      system.emitter.position.set(c.x, c.y + h * 0.35, c.z);
      scene.add(system.emitter);
      batch.addSystem(system);
      systems.push(system);
      return {
        system,
        setRate(n: number) { system.emissionOverTime = new ConstantValue(n); },
      };
    },
    dispose() {
      systems.forEach((s) => { s.emitter.removeFromParent(); s.dispose(); });
      textures.forEach((t) => t.dispose());
      batch.removeFromParent();
    },
  };
}
