/**
 * Phong cách hình ảnh của THẾ GIỚI (bản đồ từ Blender). Art style của game CHƯA KHÓA, nên:
 *  - File Blender chỉ mang hình khối + tên vật liệu + màu gốc.
 *  - Ở đây quyết định vật liệu Blender được vẽ ra thế nào trong game (toon có viền, hay giữ PBR mềm…).
 *  - Đổi phong cách = đổi/ thêm một `ArtStyle`, KHÔNG sửa quest, va chạm, camera.
 * Xem docs/ART_STYLE_CHANGE_GUIDE.md.
 */
import * as THREE from 'three';
import { toon } from './materials';

export interface ArtStyle {
  id: string;
  label: string;
  /** Đổi màu theo TÊN vật liệu trong Blender (vd. { wall_main: '#e8d9a0' }) mà không cần mở Blender. */
  palette: Record<string, string>;
  /** Vật liệu dùng trong game cho một vật liệu Blender. Không có texture → trả vật liệu dùng chung (cache) để gộp mesh được. */
  material(src: THREE.MeshStandardMaterial, color: THREE.Color): THREE.Material;
  shadows: boolean;
}

const cache = new Map<string, THREE.Material>();
const cached = (key: string, make: () => THREE.Material) => {
  let m = cache.get(key);
  if (!m) { m = make(); cache.set(key, m); }
  return m;
};
const matKey = (style: string, src: THREE.MeshStandardMaterial, color: THREE.Color) =>
  `${style}|${color.getHexString()}|${src.transparent ? src.opacity.toFixed(2) : 1}|${src.side}`;

export const ART_STYLES: Record<string, ArtStyle> = {
  /** Phong cách hiện tại của game: toon 3 bậc sáng + viền nét vẽ, cùng kiểu với nhân vật. */
  toon_outline: {
    id: 'toon_outline', label: 'Toon 3 bậc + viền', palette: {}, shadows: true,
    material(src, color) {
      // Có texture: vật liệu riêng của bản đồ này (được giải phóng cùng scene — xem disposeScene).
      if (src.map) { const t = toon(color, {}).clone(); t.map = src.map; t.needsUpdate = true; return t; }
      return toon(color, src.transparent ? { transparent: true, opacity: src.opacity, outline: false } : src.side === THREE.DoubleSide ? { side: THREE.DoubleSide } : {});
    },
  },
  /** Ví dụ phong cách khác: giữ vật liệu kiểu Blender (PBR nhám, không viền). Dùng để chứng minh đổi style không đụng gameplay. */
  soft_pbr: {
    id: 'soft_pbr', label: 'PBR mềm, không viền', palette: {}, shadows: true,
    material(src, color) {
      const make = () => {
        const m = new THREE.MeshStandardMaterial({ color, roughness: Math.max(0.6, src.roughness ?? 0.8), metalness: 0, map: src.map ?? null, transparent: src.transparent, opacity: src.opacity, side: src.side });
        m.userData.outlineParameters = { visible: false };
        return m;
      };
      return src.map ? make() : cached(matKey('pbr', src, color), make);
    },
  },
};
export const DEFAULT_ART_STYLE = 'toon_outline';

/** Thay vật liệu của mọi mesh trong `root` theo phong cách. */
export function applyStyle<T extends THREE.Object3D>(root: T, style: ArtStyle): T {
  const done = new Map<THREE.Material, THREE.Material>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const swap = (m: THREE.Material) => {
      const src = m as THREE.MeshStandardMaterial;
      if (!src?.color) return m;
      let out = done.get(m);
      if (!out) {
        const override = style.palette[src.name];
        out = style.material(src, override ? new THREE.Color(override) : src.color);
        done.set(m, out);
      }
      return out;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
    mesh.castShadow = style.shadows; mesh.receiveShadow = style.shadows;
  });
  return root;
}
