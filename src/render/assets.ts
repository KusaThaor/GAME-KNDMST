import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { toon } from './materials';

/**
 * Nạp asset GLB xuất từ Blender (tools/blender/) và "toon hoá" để khớp phong cách cozy của game:
 * vật liệu Blender (Principled BSDF → MeshStandardMaterial) được thay bằng toon(Base Color) có viền nét vẽ.
 * Texture (nếu có) được giữ lại trên vật liệu toon.
 */
const loader = new GLTFLoader();
const cache = new Map<string, Promise<THREE.Group>>();

export function toonify<T extends THREE.Object3D>(root: T, opts: { shadows?: boolean } = {}): T {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const swap = (m: THREE.Material) => {
      const src = m as THREE.MeshStandardMaterial;
      if (!src.color) return m;
      const t = src.map ? toon(src.color, {}).clone() : toon(src.color);
      if (src.map) { t.map = src.map; t.needsUpdate = true; }
      return t;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
    if (opts.shadows ?? true) { mesh.castShadow = true; mesh.receiveShadow = true; }
  });
  return root;
}

/** Phân tích GLB đã có trong bộ nhớ (dùng cho unit test và khi tự tải bằng fetch). */
export function parseGlb(data: ArrayBuffer): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    loader.parse(data, '', (gltf) => resolve(toonify(gltf.scene)), reject);
  });
}

/** Nạp một asset theo URL (vd. '/assets/props/prp_desk_2seat.glb'). Mỗi URL chỉ tải 1 lần; mỗi lần gọi trả về bản sao. */
export async function loadProp(url: string): Promise<THREE.Group> {
  let p = cache.get(url);
  if (!p) {
    const fresh = loader.loadAsync(url).then((gltf) => toonify(gltf.scene));
    cache.set(url, fresh);
    p = fresh;
  }
  return (await p).clone(true);
}
