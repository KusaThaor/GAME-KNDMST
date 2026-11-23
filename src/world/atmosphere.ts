/**
 * Bầu không khí của cảnh một Ngày ký ức: màu trời, sương, đèn trời (hemi), mặt trời — và về sau: mưa, cầu vồng, sao.
 *
 * BẢN KHUNG (N-04): chỉ đổi màu/cường độ theo `LIGHTING_PRESETS` (src/world/variants.ts), có chuyển dần tuyến tính
 * khi `tweenSec > 0`. N-05 điền phần còn lại (preset mới, GSAP, mưa/cầu vồng/sao qua `fx`) TRONG FILE NÀY —
 * `dayScene.ts` đã gọi sẵn `createAtmosphere()` + `update(dt)` + `dispose()`, không cần sửa thêm.
 */
import * as THREE from 'three';
import type { MemoryDay } from '../content/types';
import type { Fx } from '../render/fx';
import { skyDome } from './sky';
import { LIGHTING_PRESETS, type LightingPreset } from './variants';

export interface AtmosphereDeps {
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  /** Lớp hạt dùng chung của cảnh (mưa, tàn lửa…). */
  fx: Fx | null;
  /** Vòm trời (mesh từ `skyDome()`): đổi texture khi đổi preset. Không có → giữ nguyên trời. */
  sky?: THREE.Mesh | null;
  /** Vector lệch mặt trời so với người chơi mà cảnh dùng để bám bóng — sửa tại chỗ để đổi hướng nắng. */
  sunOffset?: THREE.Vector3;
  /** Ngày ký ức đang chơi — để N-05 đọc thời tiết theo bước. Bản khung không dùng. */
  day?: MemoryDay | null;
}

export interface Atmosphere {
  /** Tên preset đang áp (hoặc đang chuyển tới). */
  readonly preset: string;
  /** Đổi preset. `tweenSec` > 0 = chuyển dần. Tên lạ → bỏ qua, trả false. */
  set(presetName: string, tweenSec?: number): boolean;
  update(dt: number): void;
  dispose(): void;
}

interface Snapshot {
  fog: THREE.Color; hemiSky: THREE.Color; hemiGround: THREE.Color; hemiIntensity: number;
  sunColor: THREE.Color; sunIntensity: number; sunPos: THREE.Vector3;
}

const snap = (p: LightingPreset): Snapshot => ({
  fog: new THREE.Color(p.fog), hemiSky: new THREE.Color(p.hemiSky), hemiGround: new THREE.Color(p.hemiGround), hemiIntensity: p.hemiIntensity,
  sunColor: new THREE.Color(p.sunColor), sunIntensity: p.sunIntensity, sunPos: new THREE.Vector3(...p.sunPos),
});

export function createAtmosphere(scene: THREE.Scene, deps: AtmosphereDeps, initial?: string | null): Atmosphere {
  const { sun, hemi } = deps;
  const current = (): Snapshot => ({
    fog: (scene.fog as THREE.Fog | null)?.color.clone() ?? new THREE.Color('#ffffff'),
    hemiSky: hemi.color.clone(), hemiGround: hemi.groundColor.clone(), hemiIntensity: hemi.intensity,
    sunColor: sun.color.clone(), sunIntensity: sun.intensity, sunPos: deps.sunOffset?.clone() ?? sun.position.clone(),
  });
  const apply = (a: Snapshot, b: Snapshot, k: number) => {
    const fog = scene.fog as THREE.Fog | null;
    if (fog) fog.color.copy(a.fog).lerp(b.fog, k);
    hemi.color.copy(a.hemiSky).lerp(b.hemiSky, k);
    hemi.groundColor.copy(a.hemiGround).lerp(b.hemiGround, k);
    hemi.intensity = THREE.MathUtils.lerp(a.hemiIntensity, b.hemiIntensity, k);
    sun.color.copy(a.sunColor).lerp(b.sunColor, k);
    sun.intensity = THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, k);
    deps.sunOffset?.copy(a.sunPos).lerp(b.sunPos, k);
  };
  const setSky = (p: LightingPreset) => {
    const mesh = deps.sky;
    if (!mesh || typeof document === 'undefined') return;           // unit test (node): không có canvas
    const fresh = skyDome(p.sky);
    const mat = mesh.material as THREE.MeshBasicMaterial, nm = fresh.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = nm.map; mat.needsUpdate = true;
    fresh.geometry.dispose(); nm.dispose();
  };

  let name = initial && LIGHTING_PRESETS[initial] ? initial : '';
  let tween: { from: Snapshot; to: Snapshot; t: number; dur: number } | null = null;

  return {
    get preset() { return name; },
    set(presetName, tweenSec = 0) {
      const p = LIGHTING_PRESETS[presetName];
      if (!p) return false;
      name = presetName;
      const to = snap(p);
      if (tweenSec > 0) tween = { from: current(), to, t: 0, dur: tweenSec };
      else { tween = null; apply(to, to, 1); }
      setSky(p);
      return true;
    },
    update(dt) {
      if (!tween) return;
      tween.t = Math.min(tween.dur, tween.t + dt);
      apply(tween.from, tween.to, tween.t / tween.dur);
      if (tween.t >= tween.dur) tween = null;
    },
    dispose() { tween = null; },
  };
}
