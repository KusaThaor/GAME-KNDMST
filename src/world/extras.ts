/**
 * World Extras (N-04, quyết định D3): thêm marker / vật cản / sàn, tắt vật cản và ẩn phần để nhìn của GLB — BẰNG CODE,
 * không xuất lại Blender. Dữ liệu từng bản đồ ở `src/world/maps/<map_id>.extras.ts` (`export const EXTRAS: WorldExtras`),
 * tự nạp vào `WORLD_EXTRAS` (khai ở world.ts để file dữ liệu import được tiện ích ở đây mà không vòng). `loadWorld()` gộp extras sau khi đọc GLB, trước `world.finish()`;
 * `npm run validate:world` cũng đọc extras (src/world/validate.ts).
 */
import * as THREE from 'three';
import type { ZoneParse } from './parse';
import type { ColliderShape, ExtraCollider, Marker, WorldExtras, WorldProblem } from './types';
import type { World } from './world';

/** Tên vật cản trong GLB: `htx_id` nếu có, không thì tên object (`COLLIDER_<tên>`). So khớp cả hai cách viết. */
export const colliderMatches = (id: string, name: string) => id === name || id === `COLLIDER_${name}` || `COLLIDER_${id}` === name;

/**
 * Ẩn phần để nhìn của một khu theo tên node (cả nhánh). Chạy TRƯỚC `world.addZone()` (trước khi gộp mesh).
 * Trả về tên node đã tìm thấy.
 */
export function hideZoneVisuals(z: ZoneParse, extras: WorldExtras): string[] {
  const want = (extras.hideVisuals ?? []).filter((h) => h.zone === z.zone).map((h) => h.node);
  if (!want.length) return [];
  const found: THREE.Object3D[] = [];
  z.visuals.traverse((o) => { if (want.includes(o.name)) found.push(o); });
  for (const o of found) o.removeFromParent();
  return [...new Set(found.map((o) => o.name))];
}

/**
 * Gộp extras vào một World đang nạp (đã `addZone` xong, CHƯA `finish`). Trả danh sách vật cản cuối cùng để đưa vào `finish()`.
 * Mục thuộc khu không nạp được bị bỏ qua lặng lẽ (lỗi nạp khu đã được báo riêng).
 * `hiddenFound` = tên node đã ẩn được (từ `hideZoneVisuals`) để báo node không có thật.
 */
export function applyExtras(world: World, extras: WorldExtras, colliders: ColliderShape[], hiddenFound: ReadonlySet<string> = new Set()): ColliderShape[] {
  const loaded = new Set(world.loadedZones);
  const complete = world.manifest.zones.every((z) => loaded.has(z.id));
  const problem = (level: WorldProblem['level'], code: string, ref: string, message: string, zone?: string) => world.problems.push({ level, code, ref, zone, message });

  // 1) tắt vật cản theo tên
  let out = colliders;
  for (const name of extras.disableColliders) {
    const before = out.length;
    out = out.filter((c) => !colliderMatches(c.id, name));
    if (out.length === before && complete) problem('error', 'extras_unknown_collider', name, `Extras ${extras.map_id}: không có vật cản "${name}" để tắt (disableColliders)`);
  }

  // 2) vật cản mới
  const ids = new Set(out.map((c) => c.id));
  for (const c of extras.colliders) {
    if (!loaded.has(c.zone)) continue;
    if (c.gate_zone && world.isOpen(c.gate_zone)) continue;
    if (c.open_zone && !world.isOpen(c.open_zone)) continue;
    if (ids.has(c.id)) { problem('error', 'duplicate_id', c.id, `Extras ${extras.map_id}: vật cản "${c.id}" trùng ID với vật cản đã có`, c.zone); continue; }
    ids.add(c.id);
    const { gate_zone: _g, open_zone: _o, ...shape } = c as ExtraCollider;
    out = [...out, shape];
  }

  // 3) marker mới
  for (const m of extras.markers) {
    if (!loaded.has(m.zone)) continue;
    if (!world.addMarker(m)) { problem('error', 'duplicate_id', m.id, `Extras ${extras.map_id}: marker "${m.id}" (loại ${m.kind}) trùng ID với marker đã có`, m.zone); continue; }
    if ((m.kind === 'spawn' || m.kind === 'interact' || m.kind === 'spot') && world.zoneAt(m.position[0], m.position[2]) !== m.zone) {
      problem('warn', 'extras_zone_mismatch', m.id, `Extras ${extras.map_id}: marker "${m.id}" khai khu ${m.zone} nhưng nằm ở ${world.zoneAt(m.position[0], m.position[2]) ?? 'ngoài mọi khu'}`, m.zone);
    }
  }

  // 4) sàn mới
  for (const f of extras.floors ?? []) {
    if (!loaded.has(f.zone)) continue;
    const geo = new THREE.PlaneGeometry(Math.abs(f.x1 - f.x0), Math.abs(f.z1 - f.z0));
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    mesh.name = `FLOOR_extra_${f.id}`;
    mesh.position.set((f.x0 + f.x1) / 2, f.y, (f.z0 + f.z1) / 2);
    mesh.updateMatrixWorld(true);
    world.addFloor(mesh);
  }

  // 5) node cần ẩn mà không thấy
  if (complete) for (const h of extras.hideVisuals ?? []) {
    if (!hiddenFound.has(h.node)) problem('warn', 'extras_unknown_visual', h.node, `Extras ${extras.map_id}: không thấy node "${h.node}" trong khu ${h.zone} để ẩn (hideVisuals)`, h.zone);
  }
  return out;
}

// ---------------------------------------------------------------- tiện ích khai báo (dùng trong maps/*.extras.ts)

type V3 = [number, number, number];
export const marker = (kind: Marker['kind'], id: string, zone: string, position: V3, facing = 0, radius?: number): Marker =>
  ({ id, kind, zone, position, facing, props: {}, ...(radius !== undefined ? { radius } : {}) });
/** Máy ảnh đặt sẵn = hai marker: `cam.<…>` (vị trí) + `cam.<…>.target` (điểm nhìn). */
export const cameraPair = (id: string, zone: string, position: V3, target: V3): Marker[] =>
  [marker('camera', id, zone, position), marker('target', `${id}.target`, zone, target)];
/** Vật cản hộp thẳng trục từ hai góc (x0,z0)–(x1,z1), cao y0…y1. */
export const boxCollider = (id: string, zone: string, x0: number, z0: number, x1: number, z1: number, y1: number, extra: Partial<ExtraCollider> = {}): ExtraCollider => ({
  id, zone, type: 'box', r: 0, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, hx: Math.abs(x1 - x0) / 2, hz: Math.abs(z1 - z0) / 2, rot: 0, y0: 0, y1, blocksCamera: true, ...extra,
});
