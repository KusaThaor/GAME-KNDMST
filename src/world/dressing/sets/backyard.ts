/**
 * BG-1 — sân sau của trường (N-04): tường rào phía đông có lối mở, tường rào bao bãi đất + Căn cứ, nhà kho, bậc lối.
 * Chỉ phần để nhìn; vật cản + marker + sàn khai ở src/world/maps/map_thcs.extras.ts (cùng hằng số BACKYARD).
 * Quy chuẩn 2.0: min.y = 0, mét, toon() + PAL, cột lặp dùng InstancedMesh, đồ tĩnh mergeStatic().
 */
import * as THREE from 'three';
import { mergeStatic } from '../../../render/merge';
import { toon } from '../../../render/materials';
import { BACKYARD, type WallSeg } from '../../maps/map_thcs.extras';
import { PAL } from '../../school/props';
import type { DressingSet } from '..';

const FIELD = 'zone.thcs.field';

function boxAt(w: number, h: number, d: number, color: string, x: number, y0: number, z: number, opts: { outline?: boolean } = {}): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, opts.outline === false ? { outline: false } : {}));
  m.position.set(x, y0 + h / 2, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** Một đoạn tường rào (thân + mũ), cùng kiểu tường trường trong GLB (wallYellow + trim). */
function wallSegment(s: WallSeg): THREE.Mesh[] {
  const { wallH, wallT, capH, capPad } = BACKYARD;
  const alongX = Math.abs(s.x1 - s.x0) >= Math.abs(s.z1 - s.z0);
  const len = alongX ? Math.abs(s.x1 - s.x0) : Math.abs(s.z1 - s.z0);
  const cx = (s.x0 + s.x1) / 2, cz = (s.z0 + s.z1) / 2;
  const [w, d] = alongX ? [len, wallT] : [wallT, len];
  const [cw, cd] = alongX ? [len + capPad, wallT + capPad] : [wallT + capPad, len + capPad];
  return [boxAt(w, wallH, d, PAL.wallYellow, cx, 0, cz), boxAt(cw, capH, cd, PAL.trim, cx, wallH, cz)];
}

/** Vị trí cột: hai đầu mỗi đoạn + mỗi `pillarStep` mét (bỏ điểm trùng). */
export function pillarSpots(segs: readonly WallSeg[], step: number = BACKYARD.pillarStep): [number, number][] {
  const out: [number, number][] = [];
  const add = (x: number, z: number) => { if (!out.some(([a, b]) => Math.hypot(a - x, b - z) < 0.5)) out.push([x, z]); };
  for (const s of segs) {
    const len = Math.hypot(s.x1 - s.x0, s.z1 - s.z0);
    const n = Math.max(1, Math.round(len / step));
    for (let i = 0; i <= n; i++) add(s.x0 + ((s.x1 - s.x0) * i) / n, s.z0 + ((s.z1 - s.z0) * i) / n);
  }
  return out;
}

function pillars(segs: readonly WallSeg[]): THREE.InstancedMesh {
  const spots = pillarSpots(segs);
  const h = BACKYARD.wallH + 0.22;
  const geo = new THREE.BoxGeometry(0.4, h, 0.4);
  geo.translate(0, h / 2, 0);
  const mesh = new THREE.InstancedMesh(geo, toon(PAL.trim), spots.length);
  const m = new THREE.Matrix4();
  spots.forEach(([x, z], i) => mesh.setMatrixAt(i, m.makeTranslation(x, 0, z)));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingBox(); mesh.computeBoundingSphere();
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.name = 'backyard_pillars';
  return mesh;
}

/** Nhà kho 4 × 3 × 2,6 m: bệ, tường vữa, cửa xanh (mặt trước +z), cửa sổ hông, mái tôn dốc. Gốc = tâm đáy, min.y = 0. */
export function makeShed(w: number = BACKYARD.shed.w, d: number = BACKYARD.shed.d, h: number = BACKYARD.shed.h): THREE.Group {
  const g = new THREE.Group();
  g.name = 'backyard_shed';
  const plinth = 0.2, roofT = 0.08, slope = 0.12;
  const roofD = d + 0.6;
  const rise = Math.sin(slope) * roofD / 2 + Math.cos(slope) * roofT / 2;      // nửa chiều cao mái nghiêng
  const bodyTop = h - rise;                                                                  // tới giữa mái; mái thấp dần về trước (+z)
  g.add(boxAt(w + 0.12, plinth, d + 0.12, PAL.concreteDark, 0, 0, 0));
  g.add(boxAt(w, bodyTop - plinth, d, PAL.wallCream, 0, plinth, 0));
  g.add(boxAt(w, rise - 0.06, 0.12, PAL.wallCream, 0, bodyTop, -d / 2 + 0.06));             // bịt khe dưới đầu mái cao (sau)
  g.add(boxAt(1.1, 1.9, 0.06, PAL.frame, -w * 0.18, plinth, d / 2 + 0.03));                 // cửa
  g.add(boxAt(0.08, 1.9, 0.08, PAL.frameDark, -w * 0.18 + 0.6, plinth, d / 2 + 0.05));       // khung cửa
  g.add(boxAt(0.06, 0.6, 0.8, PAL.glass, w / 2 + 0.03, plinth + 1.1, 0));                   // cửa sổ hông
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, roofT, roofD), toon(PAL.concreteDark));
  roof.rotation.x = slope;                                                                   // dốc về phía sau
  roof.position.set(0, h - rise, 0);
  roof.castShadow = true; roof.receiveShadow = true;
  g.add(roof);
  return g;
}

/** Dây chắn lối mới khi bãi đất chưa mở (giống dây chắn ở lối ngõ trong GLB). */
function rope(): THREE.Group {
  const g = new THREE.Group();
  const { x, z0, z1 } = BACKYARD.opening;
  for (const z of [z0 + 0.3, z1 - 0.3]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 6), toon(PAL.trunk));
    post.position.set(x, 0.55, z); post.castShadow = true; g.add(post);
  }
  g.add(boxAt(0.04, 0.04, z1 - z0 - 0.6, PAL.soil, x, 0.85, (z0 + z1) / 2));
  return g;
}

const backyard: DressingSet = {
  id: 'backyard',
  appliesTo: (ctx) => ctx.world.manifest.map_id === 'map_thcs' && !ctx.world.isPlaceholder,
  build(ctx) {
    const root = new THREE.Group();
    root.name = 'dressing:backyard';
    const segs = [...BACKYARD.eastFence, ...BACKYARD.perimeter];
    const statics = new THREE.Group();
    statics.name = 'backyard_static';
    for (const s of segs) statics.add(...wallSegment(s));
    const { x, z0, z1 } = BACKYARD.opening;
    statics.add(boxAt(0.7, 0.02, z1 - z0, PAL.concrete, x, 0, (z0 + z1) / 2, { outline: false }));     // bậc lối, che khe sàn
    const shed = makeShed();
    shed.position.set(BACKYARD.shed.cx, 0, BACKYARD.shed.cz);
    shed.rotation.y = BACKYARD.shed.facing;
    statics.add(shed);
    if (!ctx.world.isOpen(FIELD)) statics.add(rope());
    root.add(mergeStatic(statics), pillars(segs));
    return root;
  },
};

export default backyard;
