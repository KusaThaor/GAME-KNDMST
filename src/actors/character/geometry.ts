import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** Cache hình học dùng chung giữa các nhân vật để tránh cấp phát lặp lại. */
export const geoCache = new Map<string, THREE.BufferGeometry>();

export function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined;
  if (!g) { g = make(); geoCache.set(key, g); }
  return g;
}

export const r3 = (n: number) => Math.round(n * 1000) / 1000;

export const rbox = (w: number, h: number, d: number, r: number) =>
  cached(`rb${r3(w)},${r3(h)},${r3(d)},${r3(r)}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999));

export const capsule = (rad: number, len: number) =>
  cached(`cap${r3(rad)},${r3(len)}`, () => new THREE.CapsuleGeometry(rad, Math.max(0.001, len), 5, 12));

export const sphere = (rad: number, ws = 20, hs = 14) =>
  cached(`sp${r3(rad)},${ws}`, () => new THREE.SphereGeometry(rad, ws, hs));

export const cone = (rad: number, h: number) =>
  cached(`co${r3(rad)},${r3(h)}`, () => new THREE.ConeGeometry(rad, h, 7));

export const cyl = (rt: number, rb: number, h: number, seg = 12) =>
  cached(`cy${r3(rt)},${r3(rb)},${r3(h)},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, pos?: [number, number, number], parent?: THREE.Object3D): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  if (pos) m.position.set(...pos);
  parent?.add(m);
  return m;
}

/** Đặt vật lên mặt cầu bán kính r tại góc ngang yaw (0 = chính diện, + về bên trái nhân vật) và góc dọc pitch. */
export function onSphere(obj: THREE.Object3D, r: number, yaw: number, pitch: number, lift = 0) {
  const n = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  obj.position.copy(n).multiplyScalar(r + lift);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  return obj;
}

export function shade(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r * k); c.g = Math.min(1, c.g * k); c.b = Math.min(1, c.b * k);
  return `#${c.getHexString()}`;
}
