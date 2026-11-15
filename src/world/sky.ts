import * as THREE from 'three';
import { canvasTexture } from '../render/canvasTex';

/** Vòm trời chuyển màu + vài đám mây. Màu lấy từ preset ánh sáng (world/variants.ts) — không nằm trong file Blender. */
export function skyDome(sky: [string, string, string] = ['#8fc4ef', '#bfe0f7', '#f3ecd9']): THREE.Mesh {
  const tex = canvasTexture(4, 256, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, sky[0]); grd.addColorStop(0.45, sky[1]); grd.addColorStop(0.62, sky[2]); grd.addColorStop(1, sky[2]);
    g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(180, 24, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.material.userData.outlineParameters = { visible: false };
  m.renderOrder = -1;
  return m;
}

let cloudMat: THREE.MeshBasicMaterial | null = null;
export function clouds(): THREE.Group {
  const g = new THREE.Group();
  if (!cloudMat) {
    cloudMat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0.95 });
    cloudMat.userData.outlineParameters = { visible: false };
  }
  const spots: [number, number, number, number][] = [[-60, 40, -120, 1.2], [20, 52, -140, 1.6], [80, 38, -110, 1], [-20, 60, -150, 1.3]];
  for (const [x, y, z, s] of spots) {
    const c = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(5 + (i % 3) * 2, 12, 8), cloudMat);
      b.position.set((i - 2) * 6, Math.sin(i * 1.7) * 2, Math.cos(i) * 2); b.scale.y = 0.6; c.add(b);
    }
    c.position.set(x, y, z); c.scale.setScalar(s); g.add(c);
  }
  return g;
}
