import * as THREE from 'three';
import { groundAtZero } from '../common/helpers';
import { safeCanvasTexture } from './texHelper';

export interface RainbowOpts {
  radius?: number;
  width?: number;
}

/**
 * PX-41 · Cung cầu vồng sau mưa (Trang 4).
 * Trong game, cầu vồng được bật thống nhất từ một nguồn duy nhất (`sky.ts` `rainbowArc()` + `atmosphere.ts`
 * theo preset `after_rain_rainbow`). Hàm này giữ lại để tương thích test/catalog prop.
 * Vòm bán nguyệt nửa vòng tròn, gốc min.y = 0, ngân sách ≤ 300 tam giác.
 */
export function makeRainbow(opts: RainbowOpts = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'rainbow';

  const r = opts.radius ?? 28;
  const w = opts.width ?? 3.2;

  // Texture 7 dải màu cầu vồng
  const rainbowTex = safeCanvasTexture(16, 256, (g) => {
    const grad = g.createLinearGradient(0, 256, 0, 0);
    grad.addColorStop(0.0, 'rgba(230, 57, 70, 0.7)');   // Đỏ
    grad.addColorStop(0.18, 'rgba(244, 162, 97, 0.65)'); // Cam
    grad.addColorStop(0.35, 'rgba(233, 196, 106, 0.65)'); // Vàng
    grad.addColorStop(0.52, 'rgba(42, 157, 143, 0.6)');  // Lục
    grad.addColorStop(0.70, 'rgba(72, 202, 228, 0.6)');  // Lam
    grad.addColorStop(0.85, 'rgba(114, 9, 183, 0.55)');  // Chàm
    grad.addColorStop(1.0, 'rgba(181, 23, 158, 0.5)');   // Tím

    g.fillStyle = grad;
    g.fillRect(0, 0, 16, 256);
  });

  const mat = new THREE.MeshBasicMaterial({
    map: rainbowTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  mat.userData.outlineParameters = { visible: false };

  // Nửa vòng cung tròn (từ 0 đến PI)
  const segments = 28;
  const geo = new THREE.RingGeometry(r - w / 2, r + w / 2, segments, 1, 0, Math.PI);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, 0);
  root.add(mesh);

  return groundAtZero(root);
}
