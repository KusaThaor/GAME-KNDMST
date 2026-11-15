import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS } from '../../../src/config/camera';
import { CONTENT } from '../../../src/content/pack';
import type { ContentPack } from '../../../src/content/types';
import { WORLD_INDEXES, WORLD_MANIFESTS } from '../../../src/world/maps';
import type { WorldIndex, WorldManifest } from '../../../src/world/types';
import { validateWorld, validateWorldContent } from '../../../src/world/validate';
import { checkMap } from '../../../scripts/world-cli';
import { THCS, Z } from './helpers';

const PRESETS = Object.keys(CAMERA_PRESETS);
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const codes = (list: { level: string; code: string }[], level = 'error') => list.filter((p) => p.level === level).map((p) => p.code).sort();
const INDEX = WORLD_INDEXES.map_thcs;

describe('bản đồ thật trong repo', () => {
  it('manifest + GLB + index + file .blend nguồn khớp nhau (như npm run validate:world)', async () => {
    for (const m of Object.values(WORLD_MANIFESTS)) {
      const r = await checkMap(m, WORLD_INDEXES[m.map_id]);
      expect(r.problems.map((p) => `${p.level} ${p.code} ${p.message}`)).toEqual([]);
    }
  });
  it('nội dung chỉ tham chiếu marker có thật; khu không mở đều có vật chắn', () => {
    expect(validateWorldContent(CONTENT, WORLD_MANIFESTS, WORLD_INDEXES).map((p) => `${p.level} ${p.code} ${p.message}`)).toEqual([]);
  });
  it('map_thcs có đúng 6 khu của GDD v0.3 §4 và mọi khu đều tới được', () => {
    expect(THCS.zones.map((z) => z.id).sort()).toEqual(['base', 'classroom', 'corridor', 'field', 'gate', 'yard'].map(Z).sort());
    expect(codes(validateWorld(THCS, INDEX, PRESETS), 'warn')).toEqual([]);
  });
  it('nội dung không ghi tọa độ cho Ngày ký ức — chỉ ID', () => {
    for (const d of CONTENT.days) {
      expect(d.npc_placements.every((n) => n.marker && !n.position), d.id).toBe(true);
      expect(d.interactables.every((i) => !i.position), d.id).toBe(true);
      expect(d.cameras.every((c) => c.marker && !c.position), d.id).toBe(true);
    }
  });
});

describe('validateWorld bắt lỗi cấu hình', () => {
  const bad = (edit: (m: WorldManifest, i: WorldIndex) => void) => { const m = clone(THCS), i = clone(INDEX); edit(m, i); return validateWorld(m, i, PRESETS); };

  it('trùng ID khu, trùng file, sai mẫu ID, sai tên file, thiếu file nguồn', () => {
    expect(codes(bad((m) => { m.zones.push(clone(m.zones[0])); }))).toEqual(['duplicate_asset', 'duplicate_zone']);
    expect(codes(bad((m) => { m.zones[0].id = 'Lop Hoc'; }))).toContain('bad_id');
    expect(codes(bad((m) => { m.zones[0].asset = 'Zone 1.GLB'; }))).toContain('bad_asset');
    expect(codes(bad((m) => { m.zones[0].source = ''; }))).toContain('missing_source');
  });
  it('kết nối tới khu không có, kết nối một chiều, tự nối, khu bị cô lập', () => {
    expect(codes(bad((m) => { m.zones[0].connections.push('zone.thcs.nowhere'); }))).toEqual(['missing_ref']);
    expect(codes(bad((m) => { m.zones.find((z) => z.id === Z('base'))!.connections = []; }))).toEqual(['one_way_connection']);
    expect(codes(bad((m) => { m.zones[0].connections.push(m.zones[0].id); }))).toEqual(['self_connection']);
    const r = bad((m) => { for (const z of m.zones) z.connections = z.connections.filter((c) => c !== Z('base')); m.zones.find((z) => z.id === Z('base'))!.connections = []; });
    expect(codes(r, 'warn')).toEqual(['isolated_zone', 'unreachable_zone']);
  });
  it('preset camera không tồn tại (bản đồ hoặc khu)', () => {
    expect(codes(bad((m) => { m.camera_preset = 'nope'; }))).toEqual(['missing_camera_preset']);
    expect(codes(bad((m) => { m.zones[2].camera_preset = 'nope'; }))).toEqual(['missing_camera_preset']);
  });
  it('điểm xuất hiện mặc định không có; portal trỏ tới điểm không có; vật chắn khai khu lạ', () => {
    expect(codes(bad((m) => { m.default_spawn = 'spawn.thcs.moon'; }))).toEqual(['missing_default_spawn']);
    expect(codes(bad((_, i) => { i.zones[Z('yard')].portals.push({ id: 'portal.thcs.x', target_spawn: 'spawn.thcs.moon' }); }))).toEqual(['portal_bad_target']);
    expect(codes(bad((_, i) => { i.zones[Z('yard')].gates.push('zone.thcs.moon'); }))).toEqual(['gate_bad_zone']);
  });
  it('khu thiếu sàn, thiếu khối ranh, ID marker trùng giữa hai khu, máy ảnh thiếu đích', () => {
    expect(codes(bad((_, i) => { i.zones[Z('gate')].floors = 0; }))).toEqual(['no_floor']);
    expect(codes(bad((_, i) => { i.zones[Z('gate')].markers = i.zones[Z('gate')].markers.filter((x) => x.kind !== 'zone'); }))).toEqual(['no_zone_volume']);
    expect(codes(bad((_, i) => { i.zones[Z('gate')].markers.push(clone(i.zones[Z('yard')].markers.find((x) => x.kind === 'interact')!)); }))).toEqual(['duplicate_id']);
    expect(codes(bad((_, i) => { i.zones[Z('yard')].markers = i.zones[Z('yard')].markers.filter((x) => x.kind !== 'target'); }))).toEqual(['camera_no_target', 'camera_no_target']);
  });
  it('thiếu index, index cũ, khu chưa có trong index', () => {
    expect(codes(validateWorld(THCS, undefined, PRESETS))).toEqual(['missing_index']);
    expect(codes(bad((_, i) => { i.zones[Z('gate')].asset = 'zone_old.glb'; }))).toEqual(['index_stale']);
    expect(codes(bad((_, i) => { delete i.zones[Z('gate')]; }))).toContain('zone_not_indexed');
  });
});

describe('validateWorldContent bắt nội dung trỏ sai', () => {
  const bad = (edit: (p: ContentPack) => void) => { const p = clone(CONTENT); edit(p); return validateWorldContent(p, WORLD_MANIFESTS, WORLD_INDEXES); };
  const day = (p: ContentPack) => p.days.find((d) => d.id === 'd.g07.03')!;

  it('vật tương tác, chỗ đứng, máy ảnh, vòng đứng, điểm xuất hiện không có marker', () => {
    expect(codes(bad((p) => { day(p).interactables.push({ id: 'itr.thcs.ufo', label: 'x', kind: 'object' }); }))).toEqual(['missing_marker']);
    expect(codes(bad((p) => { day(p).npc_placements[0].marker = 'spot.thcs.moon'; }))).toEqual(['missing_marker']);
    expect(codes(bad((p) => { delete day(p).npc_placements[0].marker; }))).toEqual(['npc_no_place']);
    expect(codes(bad((p) => { day(p).cameras[0].marker = 'cam.thcs.moon'; }))).toEqual(['missing_marker']);
    expect(codes(bad((p) => { day(p).spawn_point = 'spawn.thcs.moon'; }))).toEqual(['missing_marker']);
    expect(codes(bad((p) => { const s = p.quests.find((q) => q.id === 'q_m1_main_05')!.steps.find((x) => x.kind === 'photo')!; if (s.kind === 'photo') s.stand_zone = { marker: 'spot.thcs.moon', radius: 1 }; }))).toEqual(['missing_marker']);
  });
  it('khu của nội dung và của manifest phải trùng nhau', () => {
    expect(codes(bad((p) => { p.maps[0].zones.pop(); }))).toEqual(['zone_missing_in_content']);
    expect(codes(bad((p) => { p.maps[0].zones.push({ zone_id: 'zone.thcs.moon', name: 'x' }); }))).toEqual(['zone_missing_in_world']);
  });
  it('nhắc: đích nằm ở khu không mở; khai sai khu; bản đồ chưa có manifest', () => {
    expect(codes(bad((p) => { day(p).open_zones = [Z('yard')]; }), 'warn')).toContain('target_in_closed_zone');
    expect(codes(bad((p) => { day(p).interactables[0].zone_id = Z('base'); }), 'warn')).toEqual(['zone_mismatch']);
    expect(codes(bad((p) => { p.maps.push({ id: 'map_town', zones: [], variants: [], spawn_points: [] }); }), 'warn')).toEqual(['map_without_world']);
  });
  it('vị trí ghi bằng số (kiểu cũ) vẫn được chấp nhận cho bản đồ chưa có file Blender', () => {
    expect(bad((p) => { day(p).interactables.push({ id: 'itr.thcs.legacy', label: 'x', kind: 'object', position: [1, 2] }); })).toEqual([]);
  });
});
