import * as THREE from 'three';
import { toon } from '../../render/materials';
import { signTexture } from '../../render/canvasTex';
import { PAL, box, pottedPlant } from './props';

/**
 * Dãy lớp học 2 tầng có hành lang phía trước (GDD 4.1 Z01/Z02b): tường vàng, cửa xanh lá, mái ngói đỏ.
 * Gốc tọa độ: giữa mép trước hành lang tầng trệt; mặt trước nhìn về +Z.
 */
export interface ClassBlockOpts {
  rooms: number;
  roomW?: number;
  floorH?: number;
  depth?: number;
  corridor?: number;
  labels?: [string[], string[]];   // tên lớp tầng 1, tầng 2
}

export function classBlock(o: ClassBlockOpts): THREE.Group {
  const g = new THREE.Group(); g.name = 'class-block';
  const RW = o.roomW ?? 6, FH = o.floorH ?? 3.4, D = o.depth ?? 8, C = o.corridor ?? 2.2;
  const L = o.rooms * RW;
  const base = 0.45;

  const add = (m: THREE.Mesh, x: number, y: number, z: number) => { m.position.set(x, y, z); g.add(m); return m; };

  add(box(L + 0.8, base, D + 0.6, PAL.concreteDark), 0, base / 2, -D / 2 + 0.1);
  add(box(L, 0.16, 0.55, PAL.concrete), 0, 0.08, 0.3);
  add(box(L, 0.04, C, '#e4dccb'), 0, base + 0.02, -C / 2);                       // nền hành lang
  add(box(L + 0.3, 0.3, D + 0.25, PAL.trim), 0, base + FH, -D / 2 + 0.05);        // sàn tầng 2
  add(box(L + 0.3, 0.3, D + 0.25, PAL.trim), 0, base + FH * 2, -D / 2 + 0.05);    // trần tầng 2
  add(box(L, FH * 2, 0.22, PAL.wallYellow), 0, base + FH, -D);                    // tường sau
  for (const s of [-1, 1]) add(box(0.24, FH * 2, D, PAL.wallYellow), s * L / 2, base + FH, -D / 2);

  for (let f = 0; f < 2; f++) {
    const y0 = base + f * FH + (f ? 0.15 : 0);
    add(box(L, FH, 0.22, PAL.wallYellow), 0, y0 + FH / 2, -C);                   // tường trước phòng
    add(box(L, 0.22, 0.24, PAL.wallCream), 0, y0 + 0.11, -C + 0.02);              // chân tường
    for (let i = 0; i <= o.rooms; i++) {
      add(box(0.42, FH, 0.42, PAL.trim, 0.03), -L / 2 + i * RW, y0 + FH / 2, -0.21);  // cột hành lang
    }
    for (let r = 0; r < o.rooms; r++) {
      const x0 = -L / 2 + r * RW;
      // cửa ra vào
      add(box(1.06, 2.25, 0.1, PAL.frame, 0.02), x0 + 1.05, y0 + 1.13, -C + 0.13);
      add(box(0.42, 1.9, 0.04, PAL.frameDark), x0 + 0.82, y0 + 1.1, -C + 0.19);
      add(box(0.42, 1.9, 0.04, PAL.frameDark), x0 + 1.28, y0 + 1.1, -C + 0.19);
      // cửa sổ có nan chớp
      for (const wx of [x0 + 2.8, x0 + 4.65]) {
        add(box(1.5, 1.15, 0.08, PAL.frame, 0.02), wx, y0 + 1.62, -C + 0.12);
        add(box(1.3, 0.95, 0.04, PAL.glass), wx, y0 + 1.62, -C + 0.17);
        for (let k = 0; k < 4; k++) add(box(1.3, 0.05, 0.05, PAL.frameDark), wx, y0 + 1.27 + k * 0.23, -C + 0.2);
        add(box(0.05, 0.95, 0.06, PAL.frame), wx, y0 + 1.62, -C + 0.2);
      }
      // bảng tên lớp trên cửa
      const label = o.labels?.[f]?.[r];
      if (label) {
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.32), new THREE.MeshToonMaterial({ map: signTexture(label, { border: '#1f3d7a' }) }));
        (sign.material as THREE.Material).userData.outlineParameters = { visible: true, thickness: 0.003, color: [0.2, 0.15, 0.12] };
        sign.userData.noMerge = true;
        add(sign, x0 + 1.05, y0 + 2.6, -C + 0.13);
      }
    }
  }

  // lan can tầng 2: tường thấp + song chắn
  const y2 = base + FH + 0.15;
  add(box(L, 0.5, 0.16, PAL.wallCream), 0, y2 + 0.25, -0.08);
  add(box(L + 0.1, 0.08, 0.24, PAL.frame), 0, y2 + 1.02, -0.08);
  const bars = Math.floor(L / 0.22);
  const barGeo = new THREE.BoxGeometry(0.05, 0.5, 0.05);
  const barMesh = new THREE.InstancedMesh(barGeo, toon(PAL.frame), bars);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < bars; i++) { m4.makeTranslation(-L / 2 + 0.11 + i * 0.22, y2 + 0.75, -0.08); barMesh.setMatrixAt(i, m4); }
  barMesh.castShadow = true; g.add(barMesh);

  // mái ngói hai mái
  const over = 0.8, rise = 2.4, half = D / 2 + over;
  const shape = new THREE.Shape([new THREE.Vector2(-half, 0), new THREE.Vector2(half, 0), new THREE.Vector2(0, rise)]);
  const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: L + 1.4, bevelEnabled: false });
  roofGeo.translate(0, 0, -(L + 1.4) / 2);
  const roof = new THREE.Mesh(roofGeo, toon(PAL.roof));
  roof.rotation.y = Math.PI / 2; roof.position.set(0, base + FH * 2 + 0.15, -D / 2 + 0.05);
  g.add(roof);
  // đường ngói (sọc)
  for (let k = 1; k < 6; k++) {
    const t = k / 6;
    for (const s of [-1, 1]) {
      const strip = box(L + 1.42, 0.04, 0.05, PAL.roofDark);
      strip.position.set(0, base + FH * 2 + 0.15 + rise * t, -D / 2 + 0.05 + s * half * (1 - t));
      g.add(strip);
    }
  }
  const ridge = box(L + 1.5, 0.14, 0.3, PAL.roofDark, 0.04); ridge.position.set(0, base + FH * 2 + 0.15 + rise, -D / 2 + 0.05); g.add(ridge);

  // chậu kiểng dọc hành lang
  for (let i = 0; i < o.rooms; i++) {
    const p = pottedPlant(); p.position.set(-L / 2 + i * RW + 3.75, base, -0.55); g.add(p);
  }

  g.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  return g;
}
