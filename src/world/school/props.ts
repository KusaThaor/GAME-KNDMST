import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { toon } from '../../render/materials';
import { flagTexture } from '../../render/canvasTex';

/** Đồ vật sân trường dựng bằng khối (GDD 4.1, 4.5). Mọi kích thước tính bằng mét. */

export const PAL = {
  wallYellow: '#f0cd6e', wallCream: '#f6e7bf', trim: '#f8f2e2', frame: '#4f8f5a', frameDark: '#3d7348',
  glass: '#4a5c58', roof: '#b5533c', roofDark: '#953f2d', concrete: '#c9c2b4', concreteDark: '#a9a194',
  bench: '#b9bfb2', trunk: '#7b5b45', trunkDark: '#634837', leaf: '#5f9e48', leaf2: '#74b354', leaf3: '#4e8a3c',
  soil: '#8a6a4a', hedge: '#5d9645', pole: '#e9e9ea', step: '#cfc7b8',
} as const;

const shadowy = <T extends THREE.Object3D>(o: T, cast = true, receive = true) => {
  o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = cast; c.receiveShadow = receive; } });
  return o;
};

export const box = (w: number, h: number, d: number, color: string, r = 0) =>
  new THREE.Mesh(r > 0 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), toon(color));

/** Ghế đá xi măng. */
export function bench(): THREE.Group {
  const g = new THREE.Group();
  const seat = box(1.7, 0.1, 0.46, PAL.bench, 0.04); seat.position.y = 0.43; g.add(seat);
  const back = box(1.7, 0.36, 0.08, PAL.bench, 0.03); back.position.set(0, 0.72, -0.2); back.rotation.x = -0.12; g.add(back);
  for (const x of [-0.62, 0.62]) {
    const leg = box(0.14, 0.4, 0.4, '#a7ad9f', 0.03); leg.position.set(x, 0.2, 0); g.add(leg);
  }
  return shadowy(g);
}

/** Bồn cây tròn quanh gốc (bồn xi măng sơn trắng). */
export function planterRing(radius: number, height = 0.45): THREE.Group {
  const g = new THREE.Group();
  const w = 0.22;
  const profile = [new THREE.Vector2(radius - w, 0), new THREE.Vector2(radius, 0), new THREE.Vector2(radius, height), new THREE.Vector2(radius - w, height), new THREE.Vector2(radius - w, 0)];
  const ring = new THREE.Mesh(new THREE.LatheGeometry(profile, 36), toon('#efe9dc'));
  g.add(ring);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(radius - w, 32), toon(PAL.soil, { outline: false }));
  soil.rotation.x = -Math.PI / 2; soil.position.y = height - 0.08; g.add(soil);
  return shadowy(g);
}

function canopyBlob(r: number, color: string, sx: number, sy: number, sz: number) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), toon(color));
  m.scale.set(sx, sy, sz);
  return m;
}

/** Cây phượng: thân cao hơi cong, cành xòe, tán rộng mỏng như chiếc ô. `bloom` 0–1 = mức hoa đỏ (Ch1 tháng 9: 0; Ch6: 1). */
export function phuongTree(opts: { bloom?: number; seed?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  let s = opts.seed ?? 3;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const trunkMat = toon(PAL.trunk);
  const trunkH = 4.0;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, trunkH, 10), trunkMat);
  trunk.position.y = trunkH / 2; trunk.rotation.z = 0.05; g.add(trunk);
  // cành chính: xòe ngang rồi vươn lên
  const branches: [number, number, number][] = [[1.0, 0.2, 3.4], [0.95, 1.9, 3.1], [1.05, 3.4, 3.3], [0.9, 4.8, 3.0], [0.45, 2.6, 2.2]];
  for (const [tilt, yaw, len] of branches) {
    const b = new THREE.Group(); b.position.y = trunkH - 0.3; b.rotation.y = yaw; g.add(b);
    const pivot = new THREE.Group(); pivot.rotation.z = tilt; b.add(pivot);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.19, len, 8), trunkMat);
    m.position.y = len / 2; pivot.add(m);
  }
  const bloom = opts.bloom ?? 0;
  const greens = [PAL.leaf, PAL.leaf2, PAL.leaf3, '#68a84c'];
  const rings: [number, number, number][] = [[0, 1, 6.4], [1.9, 7, 6.1], [3.6, 10, 5.7], [5.0, 12, 5.25]];
  let k = 0;
  for (const [rad, n, y] of rings) {
    for (let i = 0; i < n; i++, k++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.5;
      const isFlower = rnd() < bloom * 0.75;
      const color = isFlower ? (rnd() < 0.5 ? '#e0402e' : '#ef5a33') : greens[k % greens.length];
      const blob = canopyBlob(rad === 0 ? 1.9 : 1.05 + rnd() * 0.35, color, 1.45, 0.42 + rnd() * 0.1, 1.3);
      blob.position.set(Math.cos(a) * rad, y + rnd() * 0.35, Math.sin(a) * rad);
      blob.rotation.y = rnd() * 3;
      g.add(blob);
    }
  }
  g.add(planterRing(1.35));
  return shadowy(g);
}

/** Cây bàng: tán xếp tầng nằm ngang đặc trưng. */
export function bangTree(opts: { seed?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  let s = opts.seed ?? 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 5.2, 9), toon(PAL.trunkDark));
  trunk.position.y = 2.6; g.add(trunk);
  const tiers: [number, number, number][] = [[2.5, 3.0, 7], [3.6, 2.3, 6], [4.6, 1.6, 5], [5.4, 0.7, 3]];
  for (const [y, rad, n] of tiers) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd();
      const blob = canopyBlob(0.95 + rnd() * 0.25, [PAL.leaf3, PAL.leaf, '#5a9a3e'][i % 3], 1.5, 0.32, 1.2);
      blob.position.set(Math.cos(a) * rad, y + rnd() * 0.15, Math.sin(a) * rad);
      blob.rotation.y = -a;
      g.add(blob);
      if (rad > 1) {
        const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, rad, 6), toon(PAL.trunkDark));
        br.position.set(Math.cos(a) * rad / 2, y - 0.1, Math.sin(a) * rad / 2);
        br.rotation.set(0, -a, Math.PI / 2); g.add(br);
      }
    }
  }
  g.add(planterRing(0.9, 0.4));
  return shadowy(g);
}

/** Cột cờ: bệ 3 bậc, cột trắng, cờ đỏ sao vàng (lá cờ có thể phấp phới bằng `wave`). */
export function flagpole(height = 8.5): THREE.Group & { wave: (t: number) => void } {
  const g = new THREE.Group() as THREE.Group & { wave: (t: number) => void };
  [[2.6, 0.18], [2.0, 0.18], [1.4, 0.18]].forEach(([w, h], i) => {
    const step = box(w, h, w, i % 2 ? PAL.step : '#ddd6c8', 0.02); step.position.y = h / 2 + i * h; g.add(step);
  });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, height, 10), toon(PAL.pole));
  pole.position.y = 0.54 + height / 2; g.add(pole);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), toon('#e8c45a')); knob.position.y = 0.54 + height + 0.05; g.add(knob);
  const geo = new THREE.PlaneGeometry(1.5, 1.0, 16, 6);
  const flagMat = new THREE.MeshToonMaterial({ map: flagTexture(), side: THREE.DoubleSide });
  flagMat.userData.outlineParameters = { visible: false };
  const flag = new THREE.Mesh(geo, flagMat);
  flag.position.set(0.78, 0.54 + height - 0.6, 0); flag.castShadow = true; g.add(flag);
  const base = (geo.getAttribute('position').array as Float32Array).slice();
  g.wave = (t: number) => {
    const p = geo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3] + 0.75;
      p.setZ(i, Math.sin(x * 4 - t * 5) * 0.08 * x + Math.sin(t * 2.3 + x) * 0.03 * x);
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  };
  g.wave(0);
  return shadowy(g);
}

export function hedge(len: number): THREE.Group {
  const g = new THREE.Group();
  const n = Math.max(1, Math.round(len / 1.1));
  for (let i = 0; i < n; i++) {
    const b = canopyBlob(0.55, i % 2 ? PAL.hedge : PAL.leaf3, 1.25, 0.8, 0.9);
    b.position.set(-len / 2 + (i + 0.5) * (len / n), 0.42, 0); g.add(b);
  }
  return shadowy(g);
}

export function trashBin(color = '#3f86c6'): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.75, 14), toon(color)); body.position.y = 0.375; g.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 14), toon('#2f6ea6')); lid.position.y = 0.79; g.add(lid);
  return shadowy(g);
}

export function pottedPlant(): THREE.Group {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.42, 12), toon('#c0653e')); pot.position.y = 0.21; g.add(pot);
  const leaves = canopyBlob(0.36, PAL.leaf, 1, 1.1, 1); leaves.position.y = 0.7; g.add(leaves);
  return shadowy(g);
}
