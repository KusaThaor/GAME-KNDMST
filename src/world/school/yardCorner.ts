import * as THREE from 'three';
import { toon } from '../../render/materials';
import { concreteTexture, canvasTexture } from '../../render/canvasTex';
import { mergeStatic } from '../../render/merge';
import { classBlock } from './classBlock';
import { PAL, bangTree, bench, box, flagpole, hedge, phuongTree, trashBin } from './props';

/**
 * Góc sân trường cho bản render thử S1 (một phần Z01/Z02 trong GDD 4.1).
 * Bản đồ đủ 6 khu sẽ dựng từ dữ liệu ở spike S2.
 */
export interface YardCorner {
  root: THREE.Group;
  anchors: Record<'phuong' | 'bang' | 'flag' | 'gate', THREE.Vector3>;
  update(t: number): void;
}

function skyDome(): THREE.Mesh {
  const tex = canvasTexture(4, 256, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#8fc4ef'); grd.addColorStop(0.45, '#bfe0f7'); grd.addColorStop(0.62, '#f3ecd9'); grd.addColorStop(1, '#f3ecd9');
    g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(180, 24, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.material.userData.outlineParameters = { visible: false };
  m.renderOrder = -1;
  return m;
}

function clouds(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0.95 });
  mat.userData.outlineParameters = { visible: false };
  const spots: [number, number, number, number][] = [[-60, 40, -120, 1.2], [20, 52, -140, 1.6], [80, 38, -110, 1], [-20, 60, -150, 1.3]];
  for (const [x, y, z, s] of spots) {
    const c = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(5 + (i % 3) * 2, 12, 8), mat);
      b.position.set((i - 2) * 6, Math.sin(i * 1.7) * 2, Math.cos(i) * 2); b.scale.y = 0.6; c.add(b);
    }
    c.position.set(x, y, z); c.scale.setScalar(s); g.add(c);
  }
  return g;
}

export function buildYardCorner(): YardCorner {
  const root = new THREE.Group(); root.name = 'yard-corner';
  root.add(skyDome(), clouds());

  // mặt sân xi măng + dải cỏ ngoài
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshToonMaterial({ map: concreteTexture(), color: '#ffffff' }));
  ground.material.userData.outlineParameters = { visible: false };
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon('#9cc27a', { outline: false }));
  grass.rotation.x = -Math.PI / 2; grass.position.y = -0.02; grass.receiveShadow = true; root.add(grass);

  const statics = new THREE.Group();
  const block = classBlock({ rooms: 5, labels: [['6A', '6B', '6C', '6D', '6E'], ['7A', '7B', '7C', '7D', '7E']] });
  block.position.set(0, 0, -11); statics.add(block);

  // tường rào bên trái + trụ
  const wall = box(0.3, 2.1, 26, PAL.wallYellow); wall.position.set(-18, 1.05, 1); statics.add(wall);
  const cap = box(0.45, 0.14, 26.2, PAL.trim); cap.position.set(-18, 2.15, 1); statics.add(cap);
  for (let z = -11; z <= 13; z += 3) { const p = box(0.55, 2.4, 0.55, PAL.trim, 0.04); p.position.set(-18, 1.2, z); statics.add(p); }

  const phuong = phuongTree({ bloom: 0 }); phuong.position.set(-5, 0, -1.2); phuong.rotation.y = 0.4; statics.add(phuong);
  const bang = bangTree(); bang.position.set(10, 0, -3.5); statics.add(bang);
  const benches: [number, number, number][] = [[-8.6, 1.4, 1.1], [-2.6, -4.2, 0.2], [11.8, 0.2, -1.3], [4.2, -6.4, 0]];
  for (const [x, z, r] of benches) { const b = bench(); b.position.set(x, 0, z); b.rotation.y = r; statics.add(b); }
  const hedges: [number, number, number][] = [[-9, -8.2, 8], [9, -8.2, 8]];
  for (const [x, z, len] of hedges) { const h = hedge(len); h.position.set(x, 0, z); statics.add(h); }
  const bin = trashBin(); bin.position.set(1.6, 0, -7.6); statics.add(bin);
  const bin2 = trashBin('#4aa36b'); bin2.position.set(2.3, 0, -7.6); statics.add(bin2);

  const merged = mergeStatic(statics);
  root.add(merged);

  const flag = flagpole(); flag.position.set(6, 0, 3); root.add(flag);

  return {
    root,
    anchors: {
      phuong: new THREE.Vector3(-5, 0, -1.2),
      bang: new THREE.Vector3(10, 0, -3.5),
      flag: new THREE.Vector3(6, 0, 3),
      gate: new THREE.Vector3(0, 0, 14),
    },
    update(t) { flag.wave(t); },
  };
}
