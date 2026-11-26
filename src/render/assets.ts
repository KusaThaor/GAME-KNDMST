import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { groundAtZero } from '../world/props/common/helpers';
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

/**
 * Nhân bản prop từ mẫu cache với `geometry` (và texture riêng nếu có) tách độc lập:
 * khi `World.dispose()` / `disposeScene()` giải phóng geometry của Ngày cũ, cache vẫn nguyên vẹn cho Ngày sau.
 */
function cloneProp(template: THREE.Group): THREE.Group {
  const copy = template.clone(true);
  copy.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.geometry) mesh.geometry = mesh.geometry.clone();
    const cloneMat = (mat: THREE.Material): THREE.Material => {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std.map) return mat;
      const cloned = mat.clone() as THREE.MeshStandardMaterial;
      cloned.map = std.map.clone();
      cloned.map.needsUpdate = true;
      return cloned;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(cloneMat) : cloneMat(mesh.material);
  });
  return copy;
}

/** Phân tích GLB đã có trong bộ nhớ (dùng cho unit test và khi tự tải bằng fetch). */
export function parseGlb(data: ArrayBuffer, path = ''): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    loader.parse(data, path, (gltf) => resolve(groundAtZero(toonify(gltf.scene))), reject);
  });
}

/**
 * Nạp một asset theo URL (vd. '/assets/props/prp_desk_2seat.glb').
 * Mỗi URL chỉ tải 1 lần và tự chuẩn hóa `min.y = 0`; mỗi lần gọi trả về bản sao tách geometry để an toàn qua `dispose()`.
 */
export async function loadProp(url: string): Promise<THREE.Group> {
  let p = cache.get(url);
  if (!p) {
    const fresh = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => parseGlb(buf, THREE.LoaderUtils.extractUrlBase(url)));
    cache.set(url, fresh);
    fresh.catch(() => cache.delete(url));
    p = fresh;
  }
  return cloneProp(await p);
}
