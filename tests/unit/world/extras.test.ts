/**
 * N-04 — World Extras + điểm gắn đồ trang trí (dressing) + bầu không khí (atmosphere, bản khung).
 */
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { PlayerController } from '../../../src/actors/player/controller';
import { CAMERA_PRESETS } from '../../../src/config/camera';
import { CONTENT } from '../../../src/content/pack';
import { addDaylight } from '../../../src/render/stage';
import { createAtmosphere } from '../../../src/world/atmosphere';
import { bindCamera } from '../../../src/world/dayBindings';
import { collectSets, DRESSING_SETS, mountDressing, type DressingCtx, type DressingSet } from '../../../src/world/dressing';
import { makeShed, pillarSpots } from '../../../src/world/dressing/sets/backyard';
import { boxCollider, cameraPair, marker } from '../../../src/world/extras';
import { WORLD_INDEXES } from '../../../src/world/maps';
import { BACKYARD, EXTRAS, M2_MARKERS } from '../../../src/world/maps/map_thcs.extras';
import type { MarkerKind, WorldExtras } from '../../../src/world/types';
import { validateWorld, validateWorldContent } from '../../../src/world/validate';
import { DEFAULT_DECOR, LIGHTING_PRESETS } from '../../../src/world/variants';
import { loadWorld, World, WORLD_EXTRAS } from '../../../src/world/world';
import { readAsset } from '../../../scripts/world-cli';
import { THCS, Z, walk } from './helpers';

const load = (opts: Parameters<typeof loadWorld>[1] = {}) => loadWorld(THCS, { fetchAsset: readAsset, ...opts });
const at = (world: World, x: number, z: number) => { const c = new PlayerController(world); c.teleport(x, z, 0, 0); return c; };
const spawnAt = (world: World, id: string) => {
  const m = world.marker('spawn', id)!;
  const c = new PlayerController(world);
  c.teleport(m.position[0], m.position[2], m.facing, m.position[1]);
  return c;
};
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const PRESETS = Object.keys(CAMERA_PRESETS);
const codes = (list: { level: string; code: string }[], level = 'error') => list.filter((p) => p.level === level).map((p) => p.code).sort();
const names = (w: World) => { const out: string[] = []; w.root.traverse((o) => { out.push(o.name); }); return out; };

const ctxFor = (over: Partial<DressingCtx> = {}): DressingCtx & { updates: ((dt: number, t: number) => void)[] } => {
  const updates: ((dt: number, t: number) => void)[] = [];
  return {
    scene: new THREE.Scene(), world: World.placeholder(THCS), dayId: 'd.g07.02', decor: DEFAULT_DECOR,
    flag: (n) => (n === 'm1.base_decor' ? 'flowers' : undefined), addUpdate: (fn) => { updates.push(fn); }, updates, ...over,
  };
};
const cube = () => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

describe('dressing — sổ đăng ký đồ trang trí', () => {
  it('gom bộ từ module (một bộ hoặc mảng), xếp theo ID', () => {
    const a: DressingSet = { id: 'b', appliesTo: () => true, build: cube };
    const b: DressingSet = { id: 'a', appliesTo: () => true, build: cube };
    expect(collectSets({ './x.ts': { default: a }, './y.ts': { default: [b] }, './z.ts': {} }).map((s) => s.id)).toEqual(['a', 'b']);
    expect(DRESSING_SETS.map((s) => s.id)).toContain('backyard');
  });

  it('chỉ gắn bộ hợp lệ; đọc được flag; bộ lỗi không làm sập cảnh; dispose gỡ sạch và tắt hàm cập nhật', async () => {
    const ctx = ctxFor();
    let ticks = 0, seenFlag: unknown = null;
    const sets: DressingSet[] = [
      { id: 'on', appliesTo: (c) => c.dayId === 'd.g07.02', build: (c) => { seenFlag = c.flag('m1.base_decor'); c.addUpdate(() => { ticks++; }); return cube(); } },
      { id: 'off', appliesTo: () => false, build: cube },
      { id: 'async', appliesTo: () => true, build: async () => cube() },
      { id: 'boom', appliesTo: () => true, build: () => { throw new Error('hỏng'); } },
      { id: 'on', appliesTo: () => true, build: cube },
    ];
    const d = await mountDressing(ctx, sets);
    expect(d.mounted).toEqual(['on', 'async']);
    expect(d.failed.map((f) => f.id)).toEqual(['boom', 'on']);
    expect(seenFlag).toBe('flowers');
    expect(ctx.scene.getObjectByName('dressing')?.children.length).toBe(2);
    ctx.updates.forEach((fn) => fn(0.016, 0));
    expect(ticks).toBe(1);
    d.dispose();
    expect(ctx.scene.getObjectByName('dressing')).toBeUndefined();
    ctx.updates.forEach((fn) => fn(0.016, 0));
    expect(ticks).toBe(1);
  });
});

describe('atmosphere — bản khung', () => {
  const setup = () => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#000000', 45, 140);
    const { sun, hemi } = addDaylight(scene);
    const sunOffset = new THREE.Vector3();
    return { scene, sun, hemi, sunOffset, atm: createAtmosphere(scene, { sun, hemi, fx: null, sunOffset }, 'morning_sun') };
  };

  it('đổi ngay theo LIGHTING_PRESETS; tên lạ bị bỏ qua', () => {
    const { scene, sun, hemi, sunOffset, atm } = setup();
    expect(atm.preset).toBe('morning_sun');
    expect(atm.set('late_afternoon')).toBe(true);
    const p = LIGHTING_PRESETS.late_afternoon;
    expect((scene.fog as THREE.Fog).color.getHexString()).toBe(new THREE.Color(p.fog).getHexString());
    expect(hemi.color.getHexString()).toBe(new THREE.Color(p.hemiSky).getHexString());
    expect(sun.intensity).toBeCloseTo(p.sunIntensity);
    expect(sunOffset.toArray()).toEqual(p.sunPos);
    expect(atm.set('khong_co')).toBe(false);
    expect(atm.preset).toBe('late_afternoon');
  });

  it('chuyển dần theo tweenSec', () => {
    const { sun, atm } = setup();
    atm.set('morning_sun');
    const a = LIGHTING_PRESETS.morning_sun.sunIntensity, b = LIGHTING_PRESETS.late_afternoon.sunIntensity;
    atm.set('late_afternoon', 2);
    atm.update(1);
    expect(sun.intensity).toBeCloseTo((a + b) / 2, 5);
    atm.update(5);
    expect(sun.intensity).toBeCloseTo(b, 5);
    atm.dispose();
  });
});

describe('World Extras trên bản đồ thật map_thcs', () => {
  let world: World;
  beforeAll(async () => { world = await load(); });

  it('tự nạp extras theo map_id; nạp không lỗi, không nhắc', () => {
    expect(WORLD_EXTRAS.map_thcs).toBe(EXTRAS);
    expect(world.problems).toEqual([]);
  });

  it('có đủ marker theo bảng thẻ N-04 (đúng loại, đúng khu)', () => {
    const want: [MarkerKind, string, string][] = [
      ['interact', 'itr.thcs.class_list', 'corridor'], ['interact', 'itr.thcs.grocery_steps', 'gate'],
      ['camera', 'cam.thcs.grocery', 'gate'], ['target', 'cam.thcs.grocery.target', 'gate'],
      ...[1, 2, 3, 4, 5].map((i): [MarkerKind, string, string] => ['spot', `spot.thcs.eave_${i}`, 'corridor']),
      ['camera', 'cam.thcs.gutter', 'yard'], ['target', 'cam.thcs.gutter.target', 'yard'],
      ['interact', 'itr.thcs.base_survey_roof', 'base'], ['interact', 'itr.thcs.base_survey_stump', 'base'], ['interact', 'itr.thcs.base_survey_boxes', 'base'],
      ['camera', 'cam.thcs.base_sign', 'base'], ['target', 'cam.thcs.base_sign.target', 'base'],
      ['camera', 'cam.thcs.rainbow', 'yard'], ['target', 'cam.thcs.rainbow.target', 'yard'],
      ['spawn', 'spawn.thcs.backyard', 'field'],
    ];
    for (const [kind, id, zone] of want) {
      const m = world.marker(kind, id);
      expect(m, id).not.toBeNull();
      expect(m!.zone, id).toBe(Z(zone));
    }
    expect(world.marker('spot', 'spot.thcs.eave_3')!.position).toEqual([-13.6, 0.15, -20.4]);
  });

  it('điểm đứng/tương tác/xuất hiện mới: có sàn, không nằm trong vật cản, nằm đúng khu', () => {
    for (const m of EXTRAS.markers.filter((x) => x.kind === 'interact' || x.kind === 'spot' || x.kind === 'spawn')) {
      const g = world.ground(m.position[0], m.position[2], m.position[1]);
      expect(g, m.id).not.toBeNull();
      expect(g!, m.id).toBeCloseTo(m.position[1], 2);
      expect(world.collision.blocked(m.position[0], m.position[2], g!), m.id).toBe(false);
      expect(world.zoneAt(m.position[0], m.position[2]), m.id).toBe(m.zone);
    }
  });

  it('máy ảnh mới (rãnh nước, biển tên, tạp hóa) nhìn thẳng tới đích, không bị vật cản che', () => {
    for (const id of ['cam.thcs.gutter', 'cam.thcs.base_sign', 'cam.thcs.grocery']) {
      const b = bindCamera({ id, marker: id }, world);
      expect(b, id).not.toBeNull();
      expect(world.segmentHit(b!.position, b!.look_at, 0.05), id).toBeNull();
    }
    // ảnh thuyền: chỗ thả thuyền (itr.thcs.gutter) nằm gần giữa khung
    const b = bindCamera({ id: 'x', marker: 'cam.thcs.gutter' }, world)!;
    const cam = new THREE.PerspectiveCamera(b.fov, 4 / 3, 0.1, 400);
    cam.position.set(...b.position); cam.lookAt(new THREE.Vector3(...b.look_at)); cam.updateMatrixWorld(true);
    const v = new THREE.Vector3(...world.marker('interact', 'itr.thcs.gutter')!.position).project(cam);
    expect(Math.abs(v.x)).toBeLessThan(0.5);
    expect(Math.abs(v.y)).toBeLessThan(0.5);
  });

  it('BG-1: tường GLB wall_fence_east bị tắt + ẩn, thay bằng 2 đoạn chừa lối; sàn vá khe', async () => {
    const ids = world.collision.shapes.map((c) => c.id);
    expect(ids).not.toContain('COLLIDER_wall_fence_east');
    expect(ids).toEqual(expect.arrayContaining(['wall_fence_east_n', 'wall_fence_east_s', 'wall_backyard_s', 'backyard_shed']));
    expect(ids).not.toContain('gate_backyard_opening');                          // mở hết khu → không có dây chắn
    expect(world.ground(26.1, -12)).toBeCloseTo(0, 3);
    const raw = await load({ extras: null, merge: false });
    expect(names(raw)).toContain('WALL_fence_east');
    expect(raw.ground(26.1, -12)).toBeNull();
    expect(names(await load({ merge: false }))).not.toContain('WALL_fence_east');
  });

  it('BG-1: đi bộ sân → lối mới → sân sau → Căn cứ, không qua cổng trường; quay lại được', () => {
    const c = at(world, 18, -12);
    const zones = new Set<string>();
    const onStep = () => { const z = world.zoneAt(c.x, c.z); if (z) zones.add(z); };
    for (const p of [[30, -12], [45.5, -18], [45.5, -25]] as [number, number][]) expect(walk(c, p, { run: true, onStep }), `tới ${p}`).toBe(true);
    expect(world.zoneAt(c.x, c.z)).toBe(Z('base'));
    expect(zones.has(Z('gate'))).toBe(false);
    expect(walk(spawnAt(world, 'spawn.thcs.backyard'), [18, -12], { run: true })).toBe(true);
  });

  it('BG-1: lối ngõ → bãi đất bị chặn kể cả khi bãi đất mở; không có extras thì tường đông vẫn kín', async () => {
    const c = spawnAt(world, 'spawn.thcs.gate');
    walk(c, [33, 22], { run: true });
    expect(walk(c, [33, 14], { maxSeconds: 8 })).toBe(false);
    expect(c.z).toBeGreaterThan(18);
    const raw = await load({ extras: null });
    expect(walk(at(raw, 18, -12), [30, -12], { run: true, maxSeconds: 8 })).toBe(false);
  });

  it('bãi đất KHÔNG mở trong Ngày: dây chắn ở lối mới (vật cản gate_zone)', async () => {
    const w = await load({ openZones: [Z('yard'), Z('corridor'), Z('classroom')] });
    expect(w.problems).toEqual([]);
    expect(w.collision.shapes.map((s) => s.id)).toContain('gate_backyard_opening');
    const c = at(w, 18, -12);
    expect(walk(c, [30, -12], { run: true, maxSeconds: 8 })).toBe(false);
    expect(c.x).toBeLessThan(26);
  });
});

describe('N-04b — marker Mốc 2 (hợp đồng mã NEXT_BATCH_2026-11-23_N14-N23 mục 2)', () => {
  /** Đúng 16 mã của bảng hợp đồng: mã → [loại, khu]. */
  const CONTRACT: Record<string, [MarkerKind, string]> = {
    'cam.thcs.m2_opening': ['camera', 'yard'],
    'itr.thcs.chalk_box': ['interact', 'classroom'],
    'cam.thcs.m2_caro_board': ['camera', 'classroom'],
    'spot.thcs.guard_corridor': ['spot', 'corridor'],
    'spot.thcs.library_porch': ['spot', 'corridor'],
    'spot.thcs.phuong_root': ['spot', 'yard'],
    'itr.thcs.m2_mailbox': ['interact', 'base'],
    'cam.thcs.m2_valentine_group': ['camera', 'base'],
    'itr.thcs.m2_hoop': ['interact', 'yard'],
    'cam.thcs.m2_newspaper': ['camera', 'classroom'],
    'itr.thcs.m2_grocery_tv': ['interact', 'gate'],
    'cam.thcs.m2_tv_group': ['camera', 'gate'],
    'itr.thcs.m2_tent': ['interact', 'field'],
    'itr.thcs.m2_campfire': ['interact', 'field'],
    'cam.thcs.m2_campfire_group': ['camera', 'field'],
    'cam.thcs.m2_final_five': ['camera', 'yard'],
  };
  const CAMS = Object.keys(CONTRACT).filter((id) => CONTRACT[id][0] === 'camera');
  let world: World;
  beforeAll(async () => { world = await load(); });

  it('M2_MARKERS có ĐÚNG 16 mã hợp đồng (không thừa, không thiếu) + một đích cho mỗi máy ảnh', () => {
    expect(Object.keys(CONTRACT)).toHaveLength(16);
    expect(M2_MARKERS.filter((m) => m.kind !== 'target').map((m) => m.id).sort()).toEqual(Object.keys(CONTRACT).sort());
    expect(M2_MARKERS.filter((m) => m.kind === 'target').map((m) => m.id).sort()).toEqual(CAMS.map((id) => `${id}.target`).sort());
    for (const m of M2_MARKERS) expect(EXTRAS.markers, m.id).toContain(m);
  });

  it('mỗi mã nạp được trên bản đồ thật, đúng loại, đúng khu; vị trí (cả máy ảnh) nằm trong khu đó', () => {
    expect(world.problems).toEqual([]);
    for (const [id, [kind, zone]] of Object.entries(CONTRACT)) {
      const m = world.marker(kind, id);
      expect(m, id).not.toBeNull();
      expect(m!.zone, id).toBe(Z(zone));
      expect(world.zoneAt(m!.position[0], m!.position[2]), id).toBe(Z(zone));
    }
  });

  it('máy ảnh có cặp .target cùng khu, nhìn thẳng tới đích không bị vật cản che', () => {
    for (const id of CAMS) {
      const t = world.marker('target', `${id}.target`);
      expect(t, id).not.toBeNull();
      expect(t!.zone, id).toBe(world.marker('camera', id)!.zone);
      const b = bindCamera({ id, marker: id }, world)!;
      expect(world.segmentHit(b.position, b.look_at, 0.05), id).toBeNull();
    }
  });

  it('chủ thể của từng ảnh nằm trong khung (fov 40, 4:3)', () => {
    const inFrame = (camId: string, p: [number, number, number]) => {
      const b = bindCamera({ id: 'x', marker: camId }, world)!;
      const cam = new THREE.PerspectiveCamera(b.fov, 4 / 3, 0.1, 400);
      cam.position.set(...b.position); cam.lookAt(new THREE.Vector3(...b.look_at)); cam.updateMatrixWorld(true);
      const v = new THREE.Vector3(...p).project(cam);
      return Math.abs(v.x) < 0.9 && Math.abs(v.y) < 0.9 && v.z < 1;
    };
    const pos = (kind: MarkerKind, id: string, dy = 0): [number, number, number] => { const p = world.marker(kind, id)!.position; return [p[0], p[1] + dy, p[2]]; };
    const subjects: [string, [number, number, number][]][] = [
      ['cam.thcs.m2_opening', [1, 2, 3, 4].map((i) => pos('spot', `spot.thcs.yard_group_${i}`, 1.5))],      // đầu 4 bạn
      ['cam.thcs.m2_caro_board', [[1.04, 1.1, -28.1], [1.04, 2.3, -23.9]]],                                // hai góc bảng đen
      ['cam.thcs.m2_newspaper', [[-7.1, 1.25, -29.84], [-4.9, 2.35, -29.84]]],                             // hai góc báo tường
      ['cam.thcs.m2_valentine_group', [pos('interact', 'itr.thcs.m2_mailbox', 0.5)]],
      ['cam.thcs.m2_tv_group', [pos('interact', 'itr.thcs.m2_grocery_tv', 1.0)]],
      ['cam.thcs.m2_campfire_group', [pos('interact', 'itr.thcs.m2_campfire', 0.8)]],
      ['cam.thcs.m2_final_five', [pos('spot', 'spot.thcs.phuong_root', 1.0), [-12, 5, -6]]],                // người ở gốc + tán phượng
    ];
    for (const [cam, pts] of subjects) for (const p of pts) expect(inFrame(cam, p), `${cam} ← ${p}`).toBe(true);
    const o = world.marker('camera', 'cam.thcs.m2_opening')!, ot = world.marker('target', 'cam.thcs.m2_opening.target')!;
    expect(ot.position[1] - o.position[1]).toBeGreaterThan(1);                                              // chụp từ dưới lên
    const log = world.marker('spot', 'spot.thcs.field_log')!, fc = world.marker('camera', 'cam.thcs.m2_campfire_group')!;
    expect(Math.hypot(fc.position[0] - log.position[0], fc.position[2] - log.position[2])).toBeLessThan(0.01); // máy trên khúc gỗ
  });

  it('validate:world vẫn 0 lỗi, 0 nhắc; thiếu một .target → camera_no_target', () => {
    expect(validateWorld(THCS, WORLD_INDEXES.map_thcs, PRESETS)).toEqual([]);
    const e = clone(EXTRAS);
    e.markers = e.markers.filter((m) => m.id !== 'cam.thcs.m2_final_five.target');
    expect(codes(validateWorld(THCS, WORLD_INDEXES.map_thcs, PRESETS, e))).toEqual(['camera_no_target']);
  });
});

describe('applyExtras — thêm/tắt vật cản, trùng ID', () => {
  const base = (): WorldExtras => ({ map_id: 'map_thcs', markers: [], colliders: [], disableColliders: [] });

  it('thêm vật cản chặn đường; tắt vật cản theo tên ngắn hoặc tên đủ', async () => {
    const w = await load({ extras: { ...base(), colliders: [boxCollider('test_block', Z('yard'), 9, 9, 11, 11, 2)] } });
    expect(w.collision.blocked(10, 10, 0)).toBe(true);
    const w2 = await load({ extras: { ...base(), disableColliders: ['COLLIDER_wall_fence_west', 'wall_fence_north'] } });
    const ids = w2.collision.shapes.map((s) => s.id);
    expect(ids).not.toContain('COLLIDER_wall_fence_west');
    expect(ids).not.toContain('COLLIDER_wall_fence_north');
    expect(w2.problems).toEqual([]);
  });

  it('trùng ID marker với GLB / trùng ID nhau / trùng ID vật cản / tắt vật cản không có / ẩn node không có → báo', async () => {
    const w = await load({ extras: {
      ...base(),
      markers: [
        marker('interact', 'itr.thcs.blackboard', Z('classroom'), [0, 0.15, -27]),
        marker('interact', 'itr.thcs.moi', Z('yard'), [1, 0, 1]), marker('interact', 'itr.thcs.moi', Z('yard'), [2, 0, 2]),
      ],
      colliders: [boxCollider('COLLIDER_wall_fence_west', Z('yard'), 0, 0, 1, 1, 1)],
      disableColliders: ['khong_co_tuong_nay'],
      hideVisuals: [{ zone: Z('yard'), node: 'KHONG_CO_NODE' }],
    } });
    expect(codes(w.problems)).toEqual(['duplicate_id', 'duplicate_id', 'duplicate_id', 'extras_unknown_collider']);
    expect(codes(w.problems, 'warn')).toEqual(['extras_unknown_visual']);
    expect(w.marker('interact', 'itr.thcs.blackboard')!.position[2]).toBe(-26);            // không ghi đè marker GLB
    expect(w.marker('interact', 'itr.thcs.moi')!.position).toEqual([1, 0, 1]);
  });

  it('marker khai sai khu → nhắc', async () => {
    const w = await load({ extras: { ...base(), markers: [marker('spot', 'spot.thcs.lac', Z('base'), [0, 0, 5])] } });
    expect(codes(w.problems, 'warn')).toEqual(['extras_zone_mismatch']);
  });
});

describe('validate:world đọc cả extras', () => {
  const INDEX = WORLD_INDEXES.map_thcs;
  const bad = (edit: (e: WorldExtras) => void) => { const e = clone(EXTRAS); edit(e); return validateWorld(THCS, INDEX, PRESETS, e); };

  it('extras thật: 0 lỗi, 0 nhắc', () => {
    expect(validateWorld(THCS, INDEX, PRESETS)).toEqual([]);
  });

  it('trùng ID với GLB, trùng nhau, máy ảnh thiếu đích, khu lạ, loại marker không cho phép, vật cản/sàn sai kích thước', () => {
    expect(codes(bad((e) => { e.markers.push(marker('spawn', 'spawn.thcs.yard', Z('yard'), [0, 0, 0])); }))).toEqual(['duplicate_id']);
    expect(codes(bad((e) => { e.markers.push(clone(e.markers[0])); }))).toEqual(['duplicate_id']);
    expect(codes(bad((e) => { e.markers = e.markers.filter((m) => m.id !== 'cam.thcs.gutter.target'); }))).toEqual(['camera_no_target']);
    expect(codes(bad((e) => { e.markers.push(...cameraPair('cam.thcs.x', 'zone.thcs.moon', [0, 1, 0], [0, 0, 1])); }))).toEqual(['extras_bad_zone', 'extras_bad_zone']);
    expect(codes(bad((e) => { e.markers.push(marker('zone', 'zone.thcs.yard', Z('yard'), [0, 0, 0])); }))).toEqual(['extras_bad_kind']);
    expect(codes(bad((e) => { e.colliders.push(boxCollider('x', Z('yard'), 1, 1, 1, 2, 1)); }))).toEqual(['extras_bad_shape']);
    expect(codes(bad((e) => { e.colliders.push(clone(e.colliders[0])); }))).toEqual(['duplicate_id']);
    expect(codes(bad((e) => { e.colliders[0].gate_zone = 'zone.thcs.moon'; }))).toEqual(['gate_bad_zone']);
    expect(codes(bad((e) => { e.floors![0].x1 = e.floors![0].x0; }))).toEqual(['extras_bad_shape']);
  });

  it('nội dung trỏ tới marker extras được coi là hợp lệ; bỏ extras thì báo thiếu marker', () => {
    const p = clone(CONTENT);
    const d = p.days.find((x) => x.cameras.length)!;
    d.cameras[0].marker = 'cam.thcs.gutter';
    expect(validateWorldContent(p, { map_thcs: THCS }, WORLD_INDEXES)).toEqual([]);
    expect(codes(validateWorldContent(p, { map_thcs: THCS }, WORLD_INDEXES, {}))).toEqual(['missing_marker']);
  });
});

describe('bộ trang trí sân sau (dressing/sets/backyard.ts)', () => {
  it('gắn vào map_thcs: min.y = 0; cột tường là InstancedMesh; lối mở không có cột; nhà kho nằm trong vật cản của nó', async () => {
    const world = await load();
    const scene = new THREE.Scene();
    const d = await mountDressing({ scene, world, dayId: 'd.g07.02', decor: DEFAULT_DECOR, flag: () => undefined, addUpdate: () => undefined });
    expect(d.failed).toEqual([]);
    expect(d.mounted).toContain('backyard');
    const root = scene.getObjectByName('dressing:backyard')!;
    const box = new THREE.Box3().setFromObject(root);
    expect(Math.abs(box.min.y)).toBeLessThan(0.01);
    const spots = pillarSpots([...BACKYARD.eastFence, ...BACKYARD.perimeter]);
    const inst = root.getObjectByName('backyard_pillars') as THREE.InstancedMesh;
    expect(inst.isInstancedMesh).toBe(true);
    expect(inst.count).toBe(spots.length);
    expect(inst.count).toBeGreaterThanOrEqual(5);
    for (const [x, z] of spots) expect(x === 26 && z > -13.9 && z < -10.1, `${x},${z}`).toBe(false);
    d.dispose();

    const shed = makeShed();
    const sb = new THREE.Box3().setFromObject(shed);
    expect(Math.abs(sb.min.y)).toBeLessThan(0.01);
    expect(sb.max.y).toBeCloseTo(BACKYARD.shed.h, 2);
    shed.position.set(BACKYARD.shed.cx, 0, BACKYARD.shed.cz); shed.rotation.y = BACKYARD.shed.facing; shed.updateMatrixWorld(true);
    const wb = new THREE.Box3().setFromObject(shed);
    const col = world.collision.shapes.find((s) => s.id === 'backyard_shed')!;
    expect(wb.min.x).toBeGreaterThan(col.cx - col.hx - 0.4); expect(wb.max.x).toBeLessThan(col.cx + col.hx + 0.4);
    expect(wb.min.z).toBeGreaterThan(col.cz - col.hz - 0.4); expect(wb.max.z).toBeLessThan(col.cz + col.hz + 0.4);
  });

  it('không gắn vào mặt bằng tạm', async () => {
    const d = await mountDressing({ scene: new THREE.Scene(), world: World.placeholder(THCS), dayId: 'x', decor: DEFAULT_DECOR, flag: () => undefined, addUpdate: () => undefined });
    expect(d.mounted).not.toContain('backyard');
  });
});
