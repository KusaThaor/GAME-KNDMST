/**
 * Va chạm tự viết trên mặt bằng (GDD v0.3 §13: "hộp/tròn trên mặt phẳng + raycast camera"; chưa dùng physics engine).
 * Không phụ thuộc Three.js → test được bằng số thuần.
 *
 * - Người chơi là một hình tròn bán kính `radius`, cao từ `y` tới `y + bodyHeight`.
 * - Vật cản là hộp xoay quanh trục đứng hoặc hình trụ, có khoảng cao [y0, y1]. Vật thấp hơn `stepHeight` thì bước qua được.
 * - Camera: bắn một đoạn thẳng 3D từ đầu nhân vật tới vị trí camera, trả về chỗ chạm đầu tiên.
 */
import type { ColliderShape, Region } from './types';

const CELL = 8;
const key = (ix: number, iz: number) => `${ix},${iz}`;

/** Điểm (x, z) có nằm trong vùng không. */
export function regionContains(r: Region, x: number, z: number, pad = 0): boolean {
  const dx = x - r.cx, dz = z - r.cz;
  const c = Math.cos(r.rot), s = Math.sin(r.rot);
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.abs(lx) <= r.hx + pad && Math.abs(lz) <= r.hz + pad;
}

export interface BodyOpts { radius: number; bodyHeight: number; stepHeight: number }
export const DEFAULT_BODY: BodyOpts = { radius: 0.32, bodyHeight: 1.4, stepHeight: 0.32 };

export class CollisionWorld {
  readonly shapes: ColliderShape[];
  private grid = new Map<string, ColliderShape[]>();

  constructor(shapes: ColliderShape[]) {
    this.shapes = shapes;
    for (const s of shapes) {
      const ext = s.type === 'circle' ? s.r : Math.hypot(s.hx, s.hz);
      for (let ix = Math.floor((s.cx - ext) / CELL); ix <= Math.floor((s.cx + ext) / CELL); ix++) {
        for (let iz = Math.floor((s.cz - ext) / CELL); iz <= Math.floor((s.cz + ext) / CELL); iz++) {
          const k = key(ix, iz);
          const cell = this.grid.get(k);
          if (cell) cell.push(s); else this.grid.set(k, [s]);
        }
      }
    }
  }

  private near(minX: number, minZ: number, maxX: number, maxZ: number): Set<ColliderShape> {
    const out = new Set<ColliderShape>();
    for (let ix = Math.floor(minX / CELL); ix <= Math.floor(maxX / CELL); ix++) {
      for (let iz = Math.floor(minZ / CELL); iz <= Math.floor(maxZ / CELL); iz++) {
        const cell = this.grid.get(key(ix, iz));
        if (cell) for (const s of cell) out.add(s);
      }
    }
    return out;
  }

  /**
   * Đẩy hình tròn ra khỏi mọi vật cản. Trả vị trí hợp lệ gần nhất và có chạm hay không.
   * `y` = cao độ chân nhân vật (để bỏ qua vật thấp bước qua được và vật ở trên đầu).
   */
  resolve(x: number, z: number, y: number, body: BodyOpts = DEFAULT_BODY): { x: number; z: number; hit: boolean } {
    let hit = false;
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      for (const s of this.near(x - body.radius, z - body.radius, x + body.radius, z + body.radius)) {
        if (s.y1 <= y + body.stepHeight || s.y0 >= y + body.bodyHeight) continue;
        const push = s.type === 'circle' ? pushFromCircle(s, x, z, body.radius) : pushFromBox(s, x, z, body.radius);
        if (push) { x += push[0]; z += push[1]; moved = true; hit = true; }
      }
      if (!moved) break;
    }
    return { x, z, hit };
  }

  /** Hình tròn tại (x, z) có đang chồng lên vật cản nào không. */
  blocked(x: number, z: number, y: number, body: BodyOpts = DEFAULT_BODY): boolean {
    for (const s of this.near(x - body.radius, z - body.radius, x + body.radius, z + body.radius)) {
      if (s.y1 <= y + body.stepHeight || s.y0 >= y + body.bodyHeight) continue;
      if (s.type === 'circle' ? pushFromCircle(s, x, z, body.radius - 0.01) : pushFromBox(s, x, z, body.radius - 0.01)) return true;
    }
    return false;
  }

  /**
   * Đoạn thẳng A→B (3D) chạm vật cản đầu tiên ở tỉ lệ nào (0..1). null = không chạm.
   * `pad` nới vật cản ra một chút để camera không dí sát tường.
   */
  segmentHit(a: [number, number, number], b: [number, number, number], pad = 0.2, cameraOnly = true): number | null {
    let best: number | null = null;
    for (const s of this.near(Math.min(a[0], b[0]) - pad, Math.min(a[2], b[2]) - pad, Math.max(a[0], b[0]) + pad, Math.max(a[2], b[2]) + pad)) {
      if (cameraOnly && !s.blocksCamera) continue;
      const t = segmentVsShape(s, a, b, pad);
      if (t !== null && (best === null || t < best)) best = t;
    }
    return best;
  }
}

function pushFromCircle(s: ColliderShape, x: number, z: number, radius: number): [number, number] | null {
  const dx = x - s.cx, dz = z - s.cz;
  const d = Math.hypot(dx, dz), min = s.r + radius;
  if (d >= min) return null;
  if (d < 1e-6) return [min, 0];
  return [(dx / d) * (min - d), (dz / d) * (min - d)];
}

function pushFromBox(s: ColliderShape, x: number, z: number, radius: number): [number, number] | null {
  const c = Math.cos(s.rot), sn = Math.sin(s.rot);
  const dx = x - s.cx, dz = z - s.cz;
  // vào hệ trục riêng của hộp (xoay ngược)
  const lx = dx * c - dz * sn, lz = dx * sn + dz * c;
  const qx = Math.max(-s.hx, Math.min(s.hx, lx)), qz = Math.max(-s.hz, Math.min(s.hz, lz));
  let px = lx - qx, pz = lz - qz;
  const d = Math.hypot(px, pz);
  if (d >= radius) return null;
  if (d < 1e-6) {
    // tâm nằm trong hộp: đẩy ra theo cạnh gần nhất
    const ox = s.hx - Math.abs(lx), oz = s.hz - Math.abs(lz);
    if (ox < oz) { px = (lx >= 0 ? 1 : -1) * (ox + radius); pz = 0; } else { px = 0; pz = (lz >= 0 ? 1 : -1) * (oz + radius); }
  } else {
    const k = (radius - d) / d;
    px *= k; pz *= k;
  }
  // về hệ trục thế giới (xoay xuôi)
  return [px * c + pz * sn, -px * sn + pz * c];
}

function segmentVsShape(s: ColliderShape, a: [number, number, number], b: [number, number, number], pad: number): number | null {
  const c = Math.cos(s.rot), sn = Math.sin(s.rot);
  const toLocal = (p: [number, number, number]): [number, number, number] => {
    const dx = p[0] - s.cx, dz = p[2] - s.cz;
    return [dx * c - dz * sn, p[1], dx * sn + dz * c];
  };
  const la = toLocal(a), lb = toLocal(b);
  const hx = (s.type === 'circle' ? s.r : s.hx) + pad, hz = (s.type === 'circle' ? s.r : s.hz) + pad;
  const min = [-hx, s.y0 - pad, -hz], max = [hx, s.y1 + pad, hz];
  let t0 = 0, t1 = 1;
  for (let i = 0; i < 3; i++) {
    const d = lb[i] - la[i];
    if (Math.abs(d) < 1e-9) { if (la[i] < min[i] || la[i] > max[i]) return null; continue; }
    let n = (min[i] - la[i]) / d, f = (max[i] - la[i]) / d;
    if (n > f) [n, f] = [f, n];
    t0 = Math.max(t0, n); t1 = Math.min(t1, f);
    if (t0 > t1) return null;
  }
  return t0;
}
