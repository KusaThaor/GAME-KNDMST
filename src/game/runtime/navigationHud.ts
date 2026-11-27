/**
 * Hàm tính toán thuần cho la bàn chỉ đường nhiệm vụ và bản đồ 2D top-down (minimap + toàn map).
 * Không phụ thuộc DOM hay Three.js để dễ kiểm thử đơn vị.
 */
import type { Step } from '../../content/types';

export interface MapZoneRegion {
  zone: string;
  name: string;
  open: boolean;
  cx: number;
  cz: number;
  hx: number;
  hz: number;
  rot: number;
}

export interface MapTargetPin {
  id: string;
  label: string;
  x: number;
  z: number;
  primary: boolean;
  kind: 'npc' | 'object' | 'marker';
}

export interface MapBounds {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}

export interface MinimapView {
  zones: MapZoneRegion[];
  bounds: MapBounds;
  player: { x: number; z: number; facing: number; cameraYaw: number };
  targets: MapTargetPin[];
  currentZone: string | null;
}

export interface QuestCompassView {
  label: string;
  distance: number;
  angleDeg: number;
}

export interface NavEngineLike {
  mainStep(): { step: Step } | null;
  targetsOfInterest(): string[];
}

export interface NavTargetLike {
  id: string;
  label: string;
  kind: 'npc' | 'object' | 'marker';
  position: { x: number; z: number };
}

function stepTargetIds(step: Step, activeInterest: readonly string[]): string[] {
  if (step.kind === 'talk') return [step.with];
  if (step.kind === 'goto' || step.kind === 'interact' || step.kind === 'place') return [step.target];
  if (step.kind === 'collect') {
    const remaining = step.targets.filter((id) => activeInterest.includes(id));
    return remaining.length ? remaining : step.targets;
  }
  return [];
}

/** Chọn mục tiêu chính từ `mainStep()` (ưu tiên) hoặc mục tiêu gần nhất trong `targetsOfInterest()`. */
export function resolvePrimaryTargetId(
  engine: NavEngineLike,
  targets: readonly NavTargetLike[],
  playerPos: { x: number; z: number },
  allowedIds?: ReadonlySet<string>,
): string | null {
  const byId = new Map(targets.map((t) => [t.id, t]));
  const interest = engine.targetsOfInterest();
  const main = engine.mainStep();
  const nearestOf = (ids: readonly string[]): string | null => {
    let best: string | null = null;
    let bestD = Infinity;
    for (const id of ids) {
      const t = byId.get(id);
      if (!t) continue;
      const d = Math.hypot(t.position.x - playerPos.x, t.position.z - playerPos.z);
      if (d < bestD) { best = id; bestD = d; }
    }
    return best;
  };
  if (main) {
    const mainPick = nearestOf(stepTargetIds(main.step, interest));
    if (mainPick) return mainPick;
  }
  const pool = allowedIds ? interest.filter((id) => allowedIds.has(id)) : interest;
  return nearestOf(pool);
}

/** Tính hướng (độ, 0° = phía trước camera) và khoảng cách (m) tới mục tiêu chính. */
export function computeCompass(
  player: { x: number; z: number },
  cameraYaw: number,
  target: { label: string; position: { x: number; z: number } },
): QuestCompassView {
  const dx = target.position.x - player.x;
  const dz = target.position.z - player.z;
  const distance = Math.hypot(dx, dz);
  const fx = -Math.sin(cameraYaw), fz = -Math.cos(cameraYaw);
  const rx = Math.cos(cameraYaw), rz = -Math.sin(cameraYaw);
  const fwd = dx * fx + dz * fz;
  const right = dx * rx + dz * rz;
  const angleDeg = (Math.atan2(right, fwd) * 180) / Math.PI;
  return { label: target.label, distance, angleDeg };
}

/** Bốn góc của một khối `ZoneRegion` trên mặt bằng (x, z). */
export function regionCorners(r: { cx: number; cz: number; hx: number; hz: number; rot: number }): [number, number][] {
  const c = Math.cos(r.rot), s = Math.sin(r.rot);
  const local: [number, number][] = [[-r.hx, -r.hz], [r.hx, -r.hz], [r.hx, r.hz], [-r.hx, r.hz]];
  return local.map(([lx, lz]) => [r.cx + lx * c + lz * s, r.cz - lx * s + lz * c]);
}

/** Khung bao 2D của toàn bản đồ từ các `zoneRegions` (hoặc danh sách điểm dự phòng). */
export function computeMapBounds(
  zones: readonly { cx: number; cz: number; hx: number; hz: number; rot: number }[],
  points: readonly { x: number; z: number }[] = [],
  pad = 4,
): MapBounds {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const r of zones) {
    for (const [x, z] of regionCorners(r)) {
      if (x < minX) minX = x;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (z > maxZ) maxZ = z;
    }
  }
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.z < minZ) minZ = p.z;
    if (p.x > maxX) maxX = p.x;
    if (p.z > maxZ) maxZ = p.z;
  }
  if (!Number.isFinite(minX)) return { minX: -20, minZ: -20, maxX: 20, maxZ: 20 };
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  const hw = Math.max(8, (maxX - minX) / 2 + pad);
  const hh = Math.max(8, (maxZ - minZ) / 2 + pad);
  return { minX: cx - hw, minZ: cz - hh, maxX: cx + hw, maxZ: cz + hh };
}
