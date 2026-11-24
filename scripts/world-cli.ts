/**
 * Công cụ dòng lệnh cho bản đồ. Gọi qua scripts/world.mjs.
 *  index    — sinh bảng tóm tắt src/world/maps/<map>.index.json từ các file GLB.
 *  validate — kiểm tra: thiếu asset, trùng ID khu, spawn không tồn tại, portal hỏng, thiếu preset camera,
 *             metadata sai quy ước, index cũ so với GLB, marker đặt trong vật cản/ngoài sàn,
 *             nội dung tham chiếu marker không có thật.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CAMERA_PRESETS } from '../src/config/camera';
import { CONTENT } from '../src/content/pack';
import { WORLD_INDEXES, WORLD_MANIFESTS } from '../src/world/maps';
import type { WorldIndex, WorldManifest, WorldProblem } from '../src/world/types';
import { formatProblems, validateWorld, validateWorldContent } from '../src/world/validate';
import { buildWorldIndex, loadWorld } from '../src/world/world';

const ROOT = process.cwd();
/** Đọc GLB từ thư mục public/ theo URL của game. */
export const readAsset = async (url: string): Promise<ArrayBuffer> => {
  const file = resolve(ROOT, 'public', url.replace(/^\//, ''));
  if (!existsSync(file)) throw new Error(`không thấy file ${file}`);
  const buf = readFileSync(file);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};
export const indexPath = (mapId: string) => resolve(ROOT, 'src/world/maps', `${mapId}.index.json`);
export const stringifyIndex = (index: WorldIndex) => `${JSON.stringify(index, null, 2)}\n`;

export async function checkMap(manifest: WorldManifest, committed: WorldIndex | undefined): Promise<{ problems: WorldProblem[]; fresh: WorldIndex }> {
  const { index: fresh, problems } = await buildWorldIndex(manifest, readAsset);
  for (const z of manifest.zones) {
    const src = resolve(ROOT, z.source ?? '');
    if (z.source && !existsSync(src)) problems.push({ level: 'error', code: 'missing_source', zone: z.id, ref: z.source, message: `Không thấy file nguồn ${z.source} của khu ${z.id}` });
  }
  problems.push(...validateWorld(manifest, fresh, Object.keys(CAMERA_PRESETS)));
  problems.push(...(await checkMarkerPlaces(manifest)));
  if (!committed) problems.push({ level: 'error', code: 'missing_index', message: `Chưa có ${manifest.map_id}.index.json — chạy: npm run world:index` });
  else if (stringifyIndex(committed) !== stringifyIndex(fresh)) problems.push({ level: 'error', code: 'index_stale', message: `${manifest.map_id}.index.json không khớp các file GLB hiện tại — chạy: npm run world:index` });
  return { problems, fresh };
}

/**
 * Marker có đứng được không: phải có sàn bên dưới và không nằm trong vật cản.
 * Điểm xuất hiện sai là LỖI (người chơi kẹt ngay khi vào); điểm tương tác/chỗ đứng sai là nhắc.
 */
export async function checkMarkerPlaces(manifest: WorldManifest, fetchAsset: (url: string) => Promise<ArrayBuffer> = readAsset): Promise<WorldProblem[]> {
  const out: WorldProblem[] = [];
  let world;
  try { world = await loadWorld(manifest, { fetchAsset }); } catch { return out; }        // thiếu file đã được báo ở bước đọc index
  for (const m of world.allMarkers()) {
    if (m.kind !== 'spawn' && m.kind !== 'interact' && m.kind !== 'spot') continue;
    const level = m.kind === 'spawn' ? 'error' : 'warn';
    const [x, y, z] = m.position;
    const g = world.ground(x, z, y);
    if (g === null) out.push({ level, code: 'marker_no_floor', zone: m.zone, ref: m.id, message: `Marker "${m.id}" không có sàn (FLOOR_*) bên dưới — nhân vật không đứng được ở đó` });
    else if (world.collision.blocked(x, z, g)) out.push({ level, code: 'marker_blocked', zone: m.zone, ref: m.id, message: `Marker "${m.id}" nằm trong một vật cản (COLLIDER_*) — dời marker ra chỗ trống` });
    if (m.kind === 'spawn' && world.zoneAt(x, z) !== m.zone) out.push({ level: 'warn', code: 'spawn_outside_zone', zone: m.zone, ref: m.id, message: `Điểm xuất hiện "${m.id}" nằm ngoài khối ranh của khu ${m.zone}` });
  }
  world.dispose();
  return out;
}

export async function run(argv: string[]): Promise<number> {
  const cmd = argv[0];
  const maps = Object.values(WORLD_MANIFESTS);
  if (cmd === 'index') {
    for (const m of maps) {
      const { index, problems } = await buildWorldIndex(m, readAsset);
      if (problems.length) console.log(formatProblems(problems));
      writeFileSync(indexPath(m.map_id), stringifyIndex(index));
      const n = Object.values(index.zones);
      console.log(`[world:index] ${m.map_id}: ${n.length} khu · ${n.reduce((a, z) => a + z.markers.length, 0)} marker · ${n.reduce((a, z) => a + z.colliders, 0)} vật cản · ${n.reduce((a, z) => a + z.triangles, 0)} tam giác → src/world/maps/${m.map_id}.index.json`);
    }
    return 0;
  }
  if (cmd === 'validate') {
    let errors = 0, warns = 0;
    const fresh: Record<string, WorldIndex> = {};
    for (const m of maps) {
      const r = await checkMap(m, WORLD_INDEXES[m.map_id]);
      fresh[m.map_id] = r.fresh;
      if (r.problems.length) console.log(formatProblems(r.problems));
      errors += r.problems.filter((p) => p.level === 'error').length;
      warns += r.problems.filter((p) => p.level === 'warn').length;
      console.log(`[validate:world] ${m.map_id}: ${m.zones.length} khu, ${r.problems.filter((p) => p.level === 'error').length} lỗi`);
    }
    const content = validateWorldContent(CONTENT, WORLD_MANIFESTS, fresh);
    if (content.length) console.log(formatProblems(content));
    errors += content.filter((p) => p.level === 'error').length;
    warns += content.filter((p) => p.level === 'warn').length;
    console.log(`[validate:world] ${errors ? 'CÓ LỖI' : 'ĐẠT'} — ${errors} lỗi, ${warns} nhắc`);
    return errors ? 1 : 0;
  }
  console.log('Dùng: node scripts/world.mjs index | validate');
  return 2;
}
