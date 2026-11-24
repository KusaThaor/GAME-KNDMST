import * as THREE from 'three';
import {
  BatchedRenderer, ParticleSystem, RenderMode, RectangleEmitter,
  ConeEmitter, type Particle, type EmissionState,
  ConstantValue, IntervalValue, RandomColor, ColorOverLife, Gradient, Noise,
  Vector3 as QVec3, Vector4 as QVec4,
} from 'three.quarks';

/**
 * Lớp hiệu ứng hạt (three.quarks). Mọi hiệu ứng dùng chung một BatchedRenderer để gộp lượt vẽ.
 */
export interface Fx {
  batch: BatchedRenderer;
  update(dt: number): void;
  /** Bụi nắng: hạt sáng nhỏ trôi chậm trong vùng nắng — trung tính với mùa, hợp Ch1 (tháng 9, phượng chưa nở). */
  addSunMotes(opts?: SunMotesOpts): SunMotes;
  addRain(opts: { rate: number; area: number }): RainFx;
  addCampfire(position: THREE.Vector3): WeatherFx;
  dispose(): void;
}

export interface WeatherFx {
  root: THREE.Group;
  systems: ParticleSystem[];
  setActive(on: boolean): void;
}

export interface RainFx extends WeatherFx {
  setRate(rate: number): void;
}

/** RectangleEmitter mặc định phát ra phía rìa; giọt mưa cần cùng hướng rơi. */
class RainEmitter extends RectangleEmitter {
  override initialize(p: Particle, state: EmissionState) {
    super.initialize(p, state);
    p.position.set(p.position.x, 7, p.position.y);
    p.velocity.set(-0.8, -p.startSpeed, 0);
  }
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

  const weather: THREE.Group[] = [];
  const fires: THREE.PointLight[] = [];
  let time = 0;

  function register(system: ParticleSystem, parent: THREE.Object3D) {
    system.material.userData.outlineParameters = { visible: false };
    parent.add(system.emitter);
    batch.addSystem(system);
    systems.push(system);
    for (const mesh of batch.batches) {
      (mesh.material as THREE.Material).userData.outlineParameters = { visible: false };
    }
  }

  function weatherEffect(root: THREE.Group, particles: ParticleSystem[]): WeatherFx {
    scene.add(root);
    weather.push(root);
    for (const system of particles) register(system, root);
    return { root, systems: particles, setActive(on) {
      if (on === root.visible) return;
      root.visible = on;
      for (const system of particles) {
        system.emitter.visible = on;
        if (on) system.restart(); else system.stop();
      }
    } };
  }

  function particleMaterial(additive: boolean) {
    const map = softDotTexture();
    textures.push(map);
    return new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  }

  return {
    batch,
    update(dt) {
      // Quarks phát theo delta: giới hạn bước để không dồn hạt sau khi tab ngủ.
      const step = THREE.MathUtils.clamp(dt, 0, 0.1);
      time += step;
      for (const light of fires) light.intensity = 25 + 2 * Math.sin(9 * time) + 1.4 * Math.sin(17 * time);
      batch.update(step);
    },
    addRain({ rate, area }) {
      // Tuổi thọ 1 s, tối đa 1200 giọt/s; còn dư ngân sách cho nhịp phát cuối khung.
      const system = new ParticleSystem({
        looping: true, duration: 2, shape: new RainEmitter({ width: area, height: area }),
        startLife: new ConstantValue(1), startSpeed: new IntervalValue(13, 16), startSize: new ConstantValue(0.055),
        startColor: new RandomColor(new QVec4(0.75, 0.85, 1, 0.28), new QVec4(0.88, 0.93, 1, 0.55)),
        emissionOverTime: new ConstantValue(THREE.MathUtils.clamp(rate, 0, 1200)),
        renderMode: RenderMode.StretchedBillBoard, rendererEmitterSettings: { speedFactor: 0.35, lengthFactor: 2.6 },
        material: particleMaterial(false), worldSpace: false,
      });
      const root = new THREE.Group(); root.name = 'rain';
      return { ...weatherEffect(root, [system]), setRate(rate: number) {
        system.emissionOverTime = new ConstantValue(THREE.MathUtils.clamp(rate, 0, 1200));
      } };
    },
    addCampfire(position) {
      const root = new THREE.Group(); root.name = 'campfire'; root.position.copy(position);
      const light = new THREE.PointLight('#ff9b47', 25, 15, 2);
      light.position.y = 0.85; root.add(light); fires.push(light);
      const material = particleMaterial(true);
      const particles = [false, true].map(ember => {
        const system = new ParticleSystem({
          duration: 3, looping: true, shape: new ConeEmitter({ radius: ember ? 0.18 : 0.33, angle: 0.2 }),
          startLife: new IntervalValue(0.25, ember ? 1.7 : 0.8), startSpeed: new IntervalValue(0.7, ember ? 1.9 : 1.35),
          startSize: new ConstantValue(ember ? 0.045 : 0.55),
          startColor: new RandomColor(new QVec4(1, 0.19, 0.02, 0.8), new QVec4(1, 0.69, 0.12, 1)),
          emissionOverTime: new ConstantValue(ember ? 12 : 65), material, worldSpace: true,
          behaviors: [new ColorOverLife(new Gradient([[new QVec3(1, 1, 1), 0], [new QVec3(1, 0.4, 0.1), 1]],
            [[0, 0], [1, 0.15], [0, 1]]))],
        });
        system.emitter.rotation.x = -Math.PI / 2;
        return system;
      });
      return weatherEffect(root, particles);
    },
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
      register(system, scene);
      return {
        system,
        setRate(n: number) { system.emissionOverTime = new ConstantValue(n); },
      };
    },
    dispose() {
      const materials = new Set(systems.map(s => s.material));
      systems.forEach(s => s.dispose());
      materials.forEach(m => m.dispose());
      for (const mesh of batch.batches) {
        mesh.dispose();
        mesh.settings.material.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      batch.clear();
      weather.forEach(root => root.removeFromParent());
      fires.forEach(light => light.dispose());
      textures.forEach((t) => t.dispose());
      batch.removeFromParent();
    },
  };
}
