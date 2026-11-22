/**
 * Kiểm tra cấu hình thế giới (không cần trình duyệt, không cần đọc GLB — dùng bảng tóm tắt index).
 *  - validateWorld: manifest + index của MỘT bản đồ có khớp nhau và đúng quy ước không.
 *  - validateWorldContent: nội dung (Ngày ký ức, quest) có tham chiếu đúng ID có thật trong bản đồ không.
 * Cả hai đọc CẢ World Extras (src/world/maps/<map>.extras.ts): marker thêm bằng code được coi như marker trong GLB.
 * Chạy trong `npm test`, `npm run validate:world` và lúc mở game.
 */
import type { ContentPack } from '../content/types';
import type { MarkerKind, WorldExtras, WorldIndex, WorldManifest, WorldProblem } from './types';
import { WORLD_EXTRAS } from './world';

const ZONE_ID = /^zone\.[a-z0-9_]+\.[a-z0-9_]+$/;
const ASSET = /^[a-z0-9_\-/]+\.glb$/;
const MARKER_PREFIX: Record<string, string> = { spawn: 'spawn.', interact: 'itr.', spot: 'spot.', camera: 'cam.', target: 'cam.', zone: 'zone.', portal: 'portal.', trigger: 'trg.' };

/** Index (sinh từ GLB) + marker và vật chắn của World Extras — bản ghép để kiểm, KHÔNG ghi ra file index.json. */
export function indexWithExtras(index: WorldIndex, extras: WorldExtras | null | undefined): WorldIndex {
  if (!extras) return index;
  const zones: WorldIndex['zones'] = {};
  for (const [id, zi] of Object.entries(index.zones)) zones[id] = { ...zi, markers: [...zi.markers], gates: [...zi.gates] };
  for (const m of extras.markers) zones[m.zone]?.markers.push({ id: m.id, kind: m.kind, position: m.position, facing: m.facing });
  for (const c of extras.colliders) if (c.gate_zone && zones[c.zone] && !zones[c.zone].gates.includes(c.gate_zone)) zones[c.zone].gates.push(c.gate_zone);
  return { ...index, zones };
}

const EXTRA_MARKER_KINDS: MarkerKind[] = ['spawn', 'interact', 'spot', 'camera', 'target'];

/** Luật riêng của World Extras (phần còn lại — trùng ID, tiền tố, máy ảnh thiếu đích — kiểm chung với GLB qua `indexWithExtras`). */
export function validateExtras(manifest: WorldManifest, extras: WorldExtras): WorldProblem[] {
  const out: WorldProblem[] = [];
  const err = (code: string, message: string, ref?: string, zone?: string) => out.push({ level: 'error', code, ref, zone, message });
  const zones = new Set(manifest.zones.map((z) => z.id));
  const where = `Extras ${extras.map_id}`;
  if (extras.map_id !== manifest.map_id) err('extras_mismatch', `${where} gắn với bản đồ ${manifest.map_id}`, extras.map_id);
  const zoneOk = (zone: string, ref: string, what: string) => { if (!zones.has(zone)) err('extras_bad_zone', `${where}: ${what} "${ref}" khai khu "${zone}" không có trong manifest`, ref, zone); };
  for (const m of extras.markers) {
    zoneOk(m.zone, m.id, 'marker');
    if (!EXTRA_MARKER_KINDS.includes(m.kind)) err('extras_bad_kind', `${where}: marker "${m.id}" loại ${m.kind} không thêm bằng code được (chỉ ${EXTRA_MARKER_KINDS.join(', ')})`, m.id, m.zone);
    if (!m.position.every(Number.isFinite)) err('extras_bad_position', `${where}: marker "${m.id}" có toạ độ không hợp lệ`, m.id, m.zone);
  }
  const ids = new Set<string>();
  for (const c of extras.colliders) {
    zoneOk(c.zone, c.id, 'vật cản');
    if (ids.has(c.id)) err('duplicate_id', `${where}: vật cản "${c.id}" khai hai lần`, c.id, c.zone);
    ids.add(c.id);
    // gate_zone lạ được bắt ở kiểm chung (`gate_bad_zone`, vì indexWithExtras ghép nó vào `gates`); ở đây chỉ còn open_zone
    if (c.open_zone && !zones.has(c.open_zone)) err('gate_bad_zone', `${where}: vật cản "${c.id}" chỉ có khi mở khu "${c.open_zone}" — khu này không có trong manifest`, c.open_zone, c.zone);
    if (!(c.hx > 0 && c.hz > 0 && c.y1 > c.y0)) err('extras_bad_shape', `${where}: vật cản "${c.id}" có kích thước không hợp lệ`, c.id, c.zone);
  }
  for (const f of extras.floors ?? []) {
    zoneOk(f.zone, f.id, 'sàn');
    if (!(f.x1 > f.x0 && f.z1 > f.z0)) err('extras_bad_shape', `${where}: sàn "${f.id}" cần x0 < x1 và z0 < z1`, f.id, f.zone);
  }
  for (const h of extras.hideVisuals ?? []) zoneOk(h.zone, h.node, 'node ẩn');
  for (const name of extras.disableColliders) if (!name.trim()) err('extras_bad_ref', `${where}: disableColliders có tên rỗng`);
  return out;
}

export function validateWorld(manifest: WorldManifest, rawIndex: WorldIndex | undefined, cameraPresets: readonly string[], extras: WorldExtras | null = WORLD_EXTRAS[manifest.map_id] ?? null): WorldProblem[] {
  const out: WorldProblem[] = extras ? validateExtras(manifest, extras) : [];
  const index = rawIndex && indexWithExtras(rawIndex, extras);
  const err = (code: string, message: string, ref?: string, zone?: string) => out.push({ level: 'error', code, ref, zone, message });
  const warn = (code: string, message: string, ref?: string, zone?: string) => out.push({ level: 'warn', code, ref, zone, message });

  if (manifest.schema !== 1) err('bad_schema', `manifest ${manifest.map_id}: schema phải là 1`);
  if (!/^map_[a-z0-9_]+$/.test(manifest.map_id)) err('bad_id', `map_id "${manifest.map_id}" sai mẫu map_<slug>`, manifest.map_id);
  if (!manifest.asset_root.startsWith('/') || !manifest.asset_root.endsWith('/')) err('bad_asset_root', `asset_root "${manifest.asset_root}" phải bắt đầu và kết thúc bằng "/"`);
  if (!cameraPresets.includes(manifest.camera_preset)) err('missing_camera_preset', `Preset camera "${manifest.camera_preset}" không có trong src/config/camera.ts`, manifest.camera_preset);
  if (!manifest.zones.length) err('no_zones', `Bản đồ ${manifest.map_id} không có khu nào`);

  const ids = new Set<string>(), assets = new Set<string>();
  for (const z of manifest.zones) {
    if (!ZONE_ID.test(z.id)) err('bad_id', `ID khu "${z.id}" sai mẫu zone.<map>.<slug>`, z.id);
    if (ids.has(z.id)) err('duplicate_zone', `Khu "${z.id}" bị khai hai lần`, z.id);
    ids.add(z.id);
    if (!ASSET.test(z.asset)) err('bad_asset', `Tên file "${z.asset}" của khu ${z.id} phải là chữ thường, kết thúc .glb`, z.asset, z.id);
    if (assets.has(z.asset)) err('duplicate_asset', `File "${z.asset}" được dùng cho hai khu`, z.asset, z.id);
    assets.add(z.asset);
    if (!z.source?.endsWith('.blend')) err('missing_source', `Khu ${z.id} chưa khai file .blend nguồn (source)`, z.id, z.id);
    if (z.camera_preset && !cameraPresets.includes(z.camera_preset)) err('missing_camera_preset', `Preset camera "${z.camera_preset}" của khu ${z.id} không tồn tại`, z.camera_preset, z.id);
  }
  for (const z of manifest.zones) {
    for (const c of z.connections) {
      if (c === z.id) err('self_connection', `Khu ${z.id} tự nối với chính nó`, c, z.id);
      else if (!ids.has(c)) err('missing_ref', `Khu ${z.id} nối tới "${c}" không có trong manifest`, c, z.id);
      else if (!manifest.zones.find((o) => o.id === c)!.connections.includes(z.id)) err('one_way_connection', `Nối ${z.id} → ${c} chưa khai chiều ngược lại`, c, z.id);
    }
    if (manifest.zones.length > 1 && !z.connections.length) warn('isolated_zone', `Khu ${z.id} không nối với khu nào`, z.id, z.id);
  }
  // mọi khu phải tới được từ khu đầu tiên
  if (manifest.zones.length) {
    const seen = new Set<string>([manifest.zones[0].id]);
    const queue = [manifest.zones[0].id];
    while (queue.length) {
      const cur = queue.shift()!;
      for (const c of manifest.zones.find((z) => z.id === cur)?.connections ?? []) if (ids.has(c) && !seen.has(c)) { seen.add(c); queue.push(c); }
    }
    for (const z of manifest.zones) if (!seen.has(z.id)) warn('unreachable_zone', `Từ ${manifest.zones[0].id} không đi tới được khu ${z.id}`, z.id, z.id);
  }

  if (!index) { err('missing_index', `Chưa có bảng tóm tắt cho ${manifest.map_id} — chạy: npm run world:index`); return out; }
  if (index.map_id !== manifest.map_id) err('index_mismatch', `Index mang map_id "${index.map_id}" khác manifest "${manifest.map_id}"`);
  const owner = new Map<string, string>();
  const spawns = new Set<string>();
  const checked = new Set<string>();
  for (const z of manifest.zones) {
    if (checked.has(z.id)) continue;          // khu khai trùng đã báo ở trên; không báo dồn thêm lỗi trùng marker
    checked.add(z.id);
    const zi = index.zones[z.id];
    if (!zi) { err('zone_not_indexed', `Khu ${z.id} chưa có trong index (file ${z.asset} thiếu hoặc chưa chạy npm run world:index)`, z.id, z.id); continue; }
    if (zi.asset !== z.asset) err('index_stale', `Index của khu ${z.id} ghi file "${zi.asset}", manifest ghi "${z.asset}" — chạy lại npm run world:index`, z.id, z.id);
    if (!zi.floors) err('no_floor', `Khu ${z.id} không có sàn (FLOOR_*)`, z.id, z.id);
    if (!zi.markers.some((m) => m.kind === 'zone' && m.id === z.id)) err('no_zone_volume', `Khu ${z.id} thiếu khối ranh khu (ZONE_* có htx_id = "${z.id}")`, z.id, z.id);
    if (!zi.markers.some((m) => m.kind === 'spawn')) warn('no_spawn', `Khu ${z.id} không có điểm xuất hiện (SPAWN_*)`, z.id, z.id);
    for (const m of zi.markers) {
      const prefix = MARKER_PREFIX[m.kind];
      if (prefix && !m.id.startsWith(prefix)) warn('marker_prefix', `Marker "${m.id}" (loại ${m.kind}) nên bắt đầu bằng "${prefix}"`, m.id, z.id);
      if (m.kind === 'zone') { if (m.id !== z.id) err('zone_id_mismatch', `File của khu ${z.id} chứa khối ranh mang ID "${m.id}"`, m.id, z.id); continue; }
      const k = `${m.kind}:${m.id}`;
      if (owner.has(k)) err('duplicate_id', `ID "${m.id}" (loại ${m.kind}) có ở cả khu ${owner.get(k)} và ${z.id}`, m.id, z.id);
      owner.set(k, z.id);
      if (m.kind === 'spawn') spawns.add(m.id);
      if (m.kind === 'camera' && !zi.markers.some((t) => t.kind === 'target' && t.id === `${m.id}.target`)) err('camera_no_target', `Máy ảnh "${m.id}" thiếu marker đích "${m.id}.target"`, m.id, z.id);
    }
  }
  for (const zid of Object.keys(index.zones)) if (!ids.has(zid)) warn('index_extra_zone', `Index có khu "${zid}" không còn trong manifest — chạy lại npm run world:index`, zid);
  if (!spawns.has(manifest.default_spawn)) err('missing_default_spawn', `default_spawn "${manifest.default_spawn}" không có trong bản đồ`, manifest.default_spawn);
  for (const z of manifest.zones) for (const p of index.zones[z.id]?.portals ?? []) {
    if (!spawns.has(p.target_spawn)) err('portal_bad_target', `Portal "${p.id}" trỏ tới điểm xuất hiện "${p.target_spawn}" không tồn tại`, p.id, z.id);
  }
  for (const z of manifest.zones) for (const g of index.zones[z.id]?.gates ?? []) {
    if (!ids.has(g)) err('gate_bad_zone', `Vật chắn trong khu ${z.id} khai htx_gate_zone = "${g}" không phải khu của bản đồ`, g, z.id);
  }
  return out;
}

/** Mọi ID marker của một bản đồ theo loại. */
export function markerIds(index: WorldIndex): Record<string, Map<string, string>> {
  const by: Record<string, Map<string, string>> = {};
  for (const [zone, zi] of Object.entries(index.zones)) for (const m of zi.markers) (by[m.kind] ??= new Map()).set(m.id, zone);
  return by;
}

export function validateWorldContent(pack: ContentPack, manifests: Record<string, WorldManifest>, rawIndexes: Record<string, WorldIndex>, extrasByMap: Record<string, WorldExtras> = WORLD_EXTRAS): WorldProblem[] {
  const indexes: Record<string, WorldIndex> = Object.fromEntries(Object.entries(rawIndexes).map(([id, i]) => [id, indexWithExtras(i, extrasByMap[id])]));
  const out: WorldProblem[] = [];
  const err = (code: string, message: string, ref?: string) => out.push({ level: 'error', code, ref, message });
  const warn = (code: string, message: string, ref?: string) => out.push({ level: 'warn', code, ref, message });

  for (const map of pack.maps) {
    const manifest = manifests[map.id];
    if (!manifest) { warn('map_without_world', `Bản đồ ${map.id} trong nội dung chưa có manifest thế giới (src/world/maps/${map.id}.world.json)`, map.id); continue; }
    const a = new Set(map.zones.map((z) => z.zone_id)), b = new Set(manifest.zones.map((z) => z.id));
    for (const z of a) if (!b.has(z)) err('zone_missing_in_world', `Khu "${z}" có trong nội dung nhưng không có trong manifest ${map.id}`, z);
    for (const z of b) if (!a.has(z)) err('zone_missing_in_content', `Khu "${z}" có trong manifest nhưng chưa khai tên trong nội dung (content/base.ts → MAPS)`, z);
    const index = indexes[map.id];
    if (!index) continue;
    const ids = markerIds(index);
    for (const sp of map.spawn_points) if (!sp.position && !ids.spawn?.has(sp.id)) err('missing_marker', `Điểm xuất hiện "${sp.id}" (bản đồ ${map.id}) không có marker SPAWN_ trong Blender`, sp.id);
  }

  for (const day of pack.days) {
    const manifest = manifests[day.map_id], index = indexes[day.map_id];
    if (!manifest || !index) continue;
    const ids = markerIds(index);
    const where = `Ngày ${day.id}`;
    if (day.spawn_point && !ids.spawn?.has(day.spawn_point)) {
      const sp = pack.maps.find((m) => m.id === day.map_id)?.spawn_points.find((p) => p.id === day.spawn_point);
      if (!sp?.position) err('missing_marker', `${where}: điểm xuất hiện "${day.spawn_point}" không có trong bản đồ`, day.spawn_point);
    }
    for (const it of day.interactables) {
      if (it.position) continue;
      const zone = ids.interact?.get(it.id);
      if (!zone) err('missing_marker', `${where}: vật tương tác "${it.id}" không có marker ITR_ trong Blender (và không khai position)`, it.id);
      else if (it.zone_id && it.zone_id !== zone) warn('zone_mismatch', `${where}: "${it.id}" khai khu ${it.zone_id} nhưng marker nằm ở ${zone}`, it.id);
      else if (zone && day.open_zones && !day.open_zones.includes(zone)) warn('target_in_closed_zone', `${where}: "${it.id}" nằm ở khu ${zone} không mở trong Ngày này`, it.id);
    }
    for (const n of day.npc_placements) {
      if (n.position) continue;
      if (!n.marker) err('npc_no_place', `${where}: nhân vật ${n.actor} chưa khai marker (hoặc position)`, n.actor);
      else if (!ids.spot?.has(n.marker)) err('missing_marker', `${where}: chỗ đứng "${n.marker}" của ${n.actor} không có marker SPOT_ trong Blender`, n.marker);
    }
    for (const c of day.cameras) {
      if (c.position && c.look_at) continue;
      if (!c.marker) err('camera_no_place', `${where}: máy ảnh ${c.id} chưa khai marker (hoặc position + look_at)`, c.id);
      else if (!ids.camera?.has(c.marker)) err('missing_marker', `${where}: máy ảnh "${c.marker}" không có marker CAM_ trong Blender`, c.marker);
    }
    for (const qid of [...day.main_chain, ...day.side_quests, ...day.daily_pool]) {
      for (const s of pack.quests.find((q) => q.id === qid)?.steps ?? []) {
        if (s.kind !== 'photo' || !s.stand_zone || s.stand_zone.center) continue;
        if (!s.stand_zone.marker) err('stand_zone_no_place', `${where}: bước ${s.id} có stand_zone nhưng không khai marker hay center`, s.id);
        else if (!ids.spot?.has(s.stand_zone.marker)) err('missing_marker', `${where}: vòng đứng "${s.stand_zone.marker}" (bước ${s.id}) không có marker SPOT_`, s.stand_zone.marker);
      }
    }
    // Khu không mở phải có vật chắn dựng trong Blender, nếu không người chơi vẫn đi vào được.
    if (day.open_zones) {
      const gated = new Set(Object.values(index.zones).flatMap((z) => z.gates));
      for (const z of manifest.zones) if (!day.open_zones.includes(z.id) && !gated.has(z.id)) warn('closed_zone_no_gate', `${where}: khu ${z.id} không mở nhưng bản đồ chưa có vật chắn (htx_gate_zone) cho khu này`, z.id);
    }
  }
  return out;
}

export function formatProblems(list: WorldProblem[]): string {
  return list.map((p) => `${p.level === 'error' ? 'LỖI ' : 'nhắc'} [${p.code}] ${p.message}`).join('\n');
}
