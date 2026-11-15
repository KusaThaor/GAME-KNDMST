/**
 * Cầu nối giữa NỘI DUNG một Ngày ký ức (chỉ nêu ID) và BẢN ĐỒ (marker trong file Blender).
 * Đây là "adapter ở tầng world": quest engine không biết tọa độ, bản đồ không biết quest.
 * Thiếu marker → ghi vào `problems` và ĐẶT TẠM mục đó quanh điểm xuất hiện (quest vẫn làm được, người chơi không bị kẹt);
 * `npm run validate:world` bắt lỗi này từ trước khi đưa lên.
 */
import type { CameraPoint, MapDef, MemoryDay, StandZone } from '../content/types';
import type { Marker, MarkerKind, WorldProblem } from './types';

export interface MarkerSource {
  marker(kind: MarkerKind, id: string): Marker | null;
  spawn(id?: string | null): Marker | null;
}

export interface Placed { x: number; y: number; z: number; facing: number }
export interface BoundTarget extends Placed { id: string; label: string; kind: 'object' | 'marker'; zone: string | null; radius: number | null }
export interface BoundNpc extends Placed { actor: string; motion: string }
export interface BoundCamera { position: [number, number, number]; look_at: [number, number, number]; fov: number }

export interface DayBindings {
  spawn: Placed;
  npcs: BoundNpc[];
  targets: BoundTarget[];
  problems: WorldProblem[];
}

const placed = (m: Marker, facing?: number): Placed => ({ x: m.position[0], y: m.position[1], z: m.position[2], facing: facing ?? m.facing });

export function bindDay(day: MemoryDay, map: MapDef | undefined, world: MarkerSource): DayBindings {
  const problems: WorldProblem[] = [];
  const miss = (ref: string, what: string) => problems.push({ level: 'error', code: 'missing_marker', ref, message: `Ngày ${day.id}: ${what} "${ref}" không có trong bản đồ ${day.map_id}` });

  // điểm xuất hiện: marker → (cũ) tọa độ ghi trong nội dung → điểm mặc định của bản đồ
  const def = map?.spawn_points.find((p) => p.id === day.spawn_point);
  const sm = day.spawn_point ? world.marker('spawn', day.spawn_point) : null;
  let spawn: Placed;
  if (sm) spawn = placed(sm, def?.facing);
  else if (def?.position) spawn = { x: def.position[0], y: 0, z: def.position[1], facing: def.facing ?? Math.PI };
  else {
    if (day.spawn_point) miss(day.spawn_point, 'điểm xuất hiện');
    const fb = world.spawn(null);
    spawn = fb ? placed(fb) : { x: 0, y: 0, z: 0, facing: Math.PI };
  }

  // Chỗ đặt tạm cho thứ thiếu marker: rải vòng quanh điểm xuất hiện.
  let lost = 0;
  const nearSpawn = (): Placed => {
    const a = lost * 1.1, r = 2.6 + 0.5 * (lost % 3);
    lost++;
    return { x: spawn.x + Math.sin(a) * r, y: spawn.y, z: spawn.z + Math.cos(a) * r, facing: a + Math.PI };
  };

  const npcs: BoundNpc[] = [];
  for (const n of day.npc_placements) {
    const m = n.marker ? world.marker('spot', n.marker) : null;
    if (m) npcs.push({ actor: n.actor, motion: n.motion ?? 'idle', ...placed(m, n.facing) });
    else if (n.position) npcs.push({ actor: n.actor, motion: n.motion ?? 'idle', x: n.position[0], y: 0, z: n.position[1], facing: n.facing ?? 0 });
    else { miss(n.marker ?? n.actor, `chỗ đứng của ${n.actor}`); npcs.push({ actor: n.actor, motion: n.motion ?? 'idle', ...nearSpawn() }); }
  }

  const targets: BoundTarget[] = [];
  for (const it of day.interactables) {
    const m = world.marker('interact', it.id);
    if (m) targets.push({ id: it.id, label: it.label, kind: it.kind, zone: m.zone, radius: m.radius ?? null, ...placed(m) });
    else if (it.position) targets.push({ id: it.id, label: it.label, kind: it.kind, zone: it.zone_id ?? null, radius: null, x: it.position[0], y: 0, z: it.position[1], facing: 0 });
    else { miss(it.id, 'vật tương tác'); targets.push({ id: it.id, label: it.label, kind: it.kind, zone: it.zone_id ?? null, radius: null, ...nearSpawn() }); }
  }
  return { spawn, npcs, targets, problems };
}

export function bindCamera(point: CameraPoint, world: MarkerSource): BoundCamera | null {
  const fov = point.fov ?? 40;
  if (point.marker) {
    const c = world.marker('camera', point.marker), t = world.marker('target', `${point.marker}.target`);
    if (c && t) return { position: c.position, look_at: t.position, fov };
  }
  if (point.position && point.look_at) return { position: point.position, look_at: point.look_at, fov };
  return null;
}

export function bindStandZone(zone: StandZone | null | undefined, world: MarkerSource): { center: [number, number]; y: number; radius: number } | null {
  if (!zone) return null;
  const m = zone.marker ? world.marker('spot', zone.marker) : null;
  if (m) return { center: [m.position[0], m.position[2]], y: m.position[1], radius: zone.radius };
  if (zone.center) return { center: zone.center, y: 0, radius: zone.radius };
  return null;
}
