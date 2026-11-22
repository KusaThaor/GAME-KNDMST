/**
 * Bản đồ THẬT của game (6 file GLB xuất từ Blender trong public/assets/world/map_thcs/) chạy qua đúng mã của game:
 * loadWorld → va chạm → PlayerController → ZoneTracker → bindDay. Không cần trình duyệt.
 */
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { DEFAULT_MOVE, PlayerController } from '../../../src/actors/player/controller';
import { CameraManager } from '../../../src/actors/camera/cameraManager';
import { CAMERA_PRESETS } from '../../../src/config/camera';
import { CONTENT } from '../../../src/content/pack';
import { ART_STYLES } from '../../../src/render/style';
import { bindCamera, bindDay, bindStandZone } from '../../../src/world/dayBindings';
import { ZoneTracker } from '../../../src/world/travel';
import { loadWorld, World, WorldLoadError } from '../../../src/world/world';
import { readAsset } from '../../../scripts/world-cli';
import { THCS, Z, walk } from './helpers';

const SLUGS = ['classroom', 'corridor', 'yard', 'gate', 'field', 'base'];
const day = (id: string) => CONTENT.days.find((d) => d.id === id)!;
const MAP = CONTENT.maps.find((m) => m.id === 'map_thcs')!;
const load = (opts: Parameters<typeof loadWorld>[1] = {}) => loadWorld(THCS, { fetchAsset: readAsset, ...opts });
const at = (world: World, spawnId: string) => {
  const c = new PlayerController(world);
  const m = world.marker('spawn', spawnId)!;
  c.teleport(m.position[0], m.position[2], m.facing, m.position[1]);
  return c;
};

describe('nạp bản đồ map_thcs', () => {
  let world: World;
  beforeAll(async () => { world = await load(); });

  it('nạp đủ 6 khu, không lỗi, không nhắc', () => {
    expect(world.loadedZones.sort()).toEqual(SLUGS.map(Z).sort());
    expect(world.problems).toEqual([]);
    expect(world.isPlaceholder).toBe(false);
  });

  it('mỗi khu có điểm xuất hiện nằm đúng trong khu, trên sàn, không kẹt trong vật cản', () => {
    for (const s of SLUGS) {
      const m = world.spawnInZone(Z(s))!;
      expect(m, s).not.toBeNull();
      expect(m.id).toBe(`spawn.thcs.${s}`);
      expect(world.zoneAt(m.position[0], m.position[2]), s).toBe(Z(s));
      expect(world.ground(m.position[0], m.position[2], m.position[1]), s).toBeCloseTo(m.position[1], 3);
      expect(world.collision.blocked(m.position[0], m.position[2], m.position[1]), s).toBe(false);
    }
    expect(world.spawn('spawn.thcs.khong_co')?.id).toBe(THCS.default_spawn);        // ID lạ → điểm mặc định
  });

  it('mọi điểm tương tác và chỗ đứng đều tới được: có sàn, không nằm trong vật cản', () => {
    for (const m of world.allMarkers().filter((x) => x.kind === 'interact' || x.kind === 'spot')) {
      expect(world.ground(m.position[0], m.position[2], m.position[1]), m.id).not.toBeNull();
      expect(world.collision.blocked(m.position[0], m.position[2], m.position[1]), m.id).toBe(false);
    }
  });

  it('nội dung của mọi Ngày nối được với marker (không thiếu thứ gì)', () => {
    for (const d of CONTENT.days) {
      const b = bindDay(d, MAP, world);
      expect(b.problems, d.id).toEqual([]);
      expect(b.npcs).toHaveLength(d.npc_placements.length);
      expect(b.targets.map((t) => t.id)).toEqual(d.interactables.map((i) => i.id));
      for (const t of b.targets) expect(t.zone, t.id).toBe(d.interactables.find((i) => i.id === t.id)!.zone_id);
      for (const c of d.cameras) expect(bindCamera(c, world), c.id).not.toBeNull();
    }
    const photo = CONTENT.quests.flatMap((q) => q.steps).find((s) => s.kind === 'photo');
    const spot = photo?.kind === 'photo' ? bindStandZone(photo.stand_zone, world) : null;
    expect(spot).toMatchObject({ radius: 1.1 });
    expect(world.zoneAt(spot!.center[0], spot!.center[1])).toBe(Z('yard'));
  });

  it('gộp mesh theo vật liệu: số mesh vẽ ra ít hơn nhiều so với số object trong Blender', () => {
    let meshes = 0;
    world.root.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes++; });
    expect(meshes).toBeGreaterThan(20);
    expect(meshes).toBeLessThan(140);
  });

  it('đứng trong hành lang/lớp học thì tầng trên và mái được ẩn; ra sân thì hiện lại', () => {
    const hidden = () => world.root.children.filter((c) => c.name.endsWith(':hide') && !c.visible).length;
    world.setViewerZone(Z('yard'));
    expect(hidden()).toBe(0);
    world.setViewerZone(Z('corridor'));
    expect(hidden()).toBeGreaterThan(0);
    world.setViewerZone(Z('classroom'));
    expect(hidden()).toBeGreaterThan(0);
    world.setViewerZone(null);
    expect(hidden()).toBe(0);
  });
});

describe('đi lại trong bản đồ (điều khiển + va chạm thật)', () => {
  let world: World;
  beforeAll(async () => { world = await load(); });

  it('đi bộ một vòng qua cả 6 khu theo đúng các kết nối khai trong manifest, không cần dịch chuyển', () => {
    const c = at(world, 'spawn.thcs.yard');
    const tracker = new ZoneTracker(world);
    tracker.arrive(c.x, c.z);
    const visited = [tracker.zone!];
    const crossings: string[] = [];
    const onStep = () => {
      for (const e of tracker.update(c.x, c.z)) if (e.type === 'zone') { visited.push(e.to); crossings.push(`${e.from}>${e.to}`); }
    };
    const route: [number, number][] = [
      [-1.4, -15], [-1.4, -20.5], [-1.0, -20.6], [-1.0, -24.5],       // sân → hành lang → cửa lớp → trong lớp
      [-1.0, -20.6], [-1.4, -15], [-4, -10], [-4, 2], [0, 14], [0, 22], // quay ra sân → vòng qua cột cờ → qua cổng → ngõ quà vặt
      [0, 14], [18, -12], [30, -12], [45.5, -18], [45.5, -25],         // về sân → lối mới ở tường đông (BG-1, N-04) → sân sau (bãi đất) → căn cứ
    ];
    for (const p of route) expect(walk(c, p, { run: true, onStep }), `tới ${p}`).toBe(true);
    expect(visited).toEqual(['yard', 'corridor', 'classroom', 'corridor', 'yard', 'gate', 'yard', 'field', 'base'].map(Z));
    const allowed = new Set(THCS.zones.flatMap((z) => z.connections.map((to) => `${z.id}>${to}`)));
    for (const x of crossings) expect(allowed.has(x), `đi ${x} nhưng manifest không khai kết nối này`).toBe(true);
    // mọi kết nối trong manifest đều đã đi qua ít nhất một chiều
    for (const z of THCS.zones) for (const to of z.connections) expect(crossings.includes(`${z.id}>${to}`) || crossings.includes(`${to}>${z.id}`), `${z.id}–${to}`).toBe(true);
  });

  it('lên bậc hành lang (0,15 m) rồi xuống lại sân', () => {
    const c = at(world, 'spawn.thcs.yard');
    walk(c, [-1.4, -15], { run: true }); walk(c, [-1.4, -20.5]);
    for (let i = 0; i < 30; i++) c.update(1 / 60, null, 0);
    expect(c.y).toBeCloseTo(0.15, 3);
    walk(c, [-1.4, -15]);
    for (let i = 0; i < 30; i++) c.update(1 / 60, null, 0);
    expect(c.y).toBeCloseTo(0, 3);
  });

  it('tường rào, dãy nhà, bụi rậm chặn người chơi; không ra khỏi bản đồ', () => {
    const tries: [string, [number, number], (c: PlayerController) => boolean][] = [
      ['spawn.thcs.yard', [-60, 0], (c) => c.x > -34],              // tường rào phía tây
      ['spawn.thcs.yard', [10, 40], (c) => c.z < 18],                // tường rào phía nam (ngoài cổng)
      ['spawn.thcs.corridor', [-12, -28], (c) => c.z > -22],         // lớp "đang học" đóng cửa
      ['spawn.thcs.gate', [0, 60], (c) => c.z < 30],                 // dãy nhà cuối ngõ
      ['spawn.thcs.field', [70, 0], (c) => c.x < 52],                // bụi rậm phía đông bãi đất
      ['spawn.thcs.base', [45.5, -60], (c) => c.z > -36],            // bụi rậm sau căn cứ
    ];
    for (const [spawn, to, inside] of tries) {
      const c = at(world, spawn);
      expect(walk(c, to, { run: true, maxSeconds: 25 }), `${spawn} → ${to}`).toBe(false);
      expect(inside(c), `${spawn} → ${to}: dừng ở (${c.x.toFixed(2)}, ${c.z.toFixed(2)})`).toBe(true);
      expect(world.ground(c.x, c.z, c.y)).not.toBeNull();
      expect(world.collision.blocked(c.x, c.z, c.y)).toBe(false);
    }
  });

  it('bàn học trong lớp chặn đường; đi vòng theo lối giữa thì tới bảng', () => {
    const c = at(world, 'spawn.thcs.classroom');
    const desk = world.collision.shapes.find((s) => s.id.startsWith('COLLIDER_desk_r4c2'))!;
    expect(desk).toBeDefined();
    expect(walk(c, [desk.cx, desk.cz], { maxSeconds: 8 })).toBe(false);
    const board = world.marker('interact', 'itr.thcs.blackboard')!;
    const c2 = at(world, 'spawn.thcs.classroom');
    expect(walk(c2, [board.position[0], board.position[2]])).toBe(true);
  });

  it('độc lập tốc độ khung hình trên bản đồ thật: 60 fps và 4 fps đi cùng quãng đường, cùng không xuyên tường', () => {
    const go = (dt: number) => {
      const c = at(world, 'spawn.thcs.yard');
      for (let t = 0; t < 6 - 1e-9; t += dt) c.update(dt, { forward: 1, strafe: 0, run: true }, Math.PI / 2 + 0.3);
      return c;
    };
    const a = go(1 / 60), b = go(1 / 4);
    expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeLessThan(0.4);
    expect(world.collision.blocked(b.x, b.z, b.y)).toBe(false);
  });

  it('camera thứ ba bị tường lớp che thì tự kéo gần', () => {
    const c = at(world, 'spawn.thcs.classroom');
    c.teleport(0.3, -23.2, 0);                     // đứng sát tường trước của lớp (không phải chỗ cửa)
    const cam = new CameraManager(CAMERA_PRESETS.follow_indoor, world);
    cam.snapBehind(Math.PI / 2, c);               // nhìn về phía bảng (đông) → camera lùi về tây, trong lớp còn rộng
    const free = cam.current;
    expect(free).toBeCloseTo(CAMERA_PRESETS.follow_indoor.distance, 3);
    cam.snapBehind(Math.PI, c);                    // nhìn về bắc → camera lùi về nam, lẽ ra xuyên tường ra hành lang
    expect(cam.current).toBeLessThan(free);
    expect(cam.current).toBeLessThan(CAMERA_PRESETS.follow_indoor.distance - 0.5);
    const p = cam.camera.position;
    expect(world.zoneAt(p.x, p.z)).toBe(Z('classroom'));
  });
});

describe('khu mở theo từng Ngày (open_zones)', () => {
  it('Ngày chỉ mở sân + hành lang + lớp: cổng khóa, không ra ngõ được; lớp vào được', async () => {
    const world = await load({ openZones: day('d.g06.01').open_zones });
    expect(world.isOpen(Z('gate'))).toBe(false);
    const c = at(world, 'spawn.thcs.yard');
    expect(walk(c, [0, 22], { run: true, maxSeconds: 15 })).toBe(false);
    expect(c.z).toBeLessThan(18);
    const c2 = at(world, 'spawn.thcs.corridor');
    expect(walk(c2, [-1.0, -20.6])).toBe(true);
    expect(walk(c2, [-1.0, -24.5])).toBe(true);
    expect(world.zoneAt(c2.x, c2.z)).toBe(Z('classroom'));
  });

  it('lớp không mở: cửa lớp đóng', async () => {
    const world = await load({ openZones: [Z('yard'), Z('corridor')] });
    const c = at(world, 'spawn.thcs.corridor');
    walk(c, [-1.0, -20.6]);
    expect(walk(c, [-1.0, -24.5], { maxSeconds: 8 })).toBe(false);
    expect(c.z).toBeGreaterThan(-22);
  });

  it('bãi đất và căn cứ không mở: dây chắn và bụi rậm bít lối', async () => {
    const world = await load({ openZones: [Z('yard'), Z('gate')] });
    const c = at(world, 'spawn.thcs.gate');
    walk(c, [33, 22], { run: true });
    expect(walk(c, [33, 14], { maxSeconds: 10 })).toBe(false);
    expect(c.z).toBeGreaterThan(18);
    const w2 = await load({ openZones: [Z('yard'), Z('gate'), Z('field')] });
    const c2 = at(w2, 'spawn.thcs.field');
    walk(c2, [45.5, -18], { run: true });
    expect(walk(c2, [45.5, -25], { maxSeconds: 10 })).toBe(false);
    expect(c2.z).toBeGreaterThan(-22);
  });
});

describe('biến thể và phong cách', () => {
  const names = (w: World) => { const out: string[] = []; w.root.traverse((o) => { if (o.name) out.push(o.name); }); return out; };

  it('bộ trang trí theo năm học: lớp 7 có hoa phượng + vũng nước, lớp 6 thì không', async () => {
    const g06 = names(await load({ decorSet: 'g06', merge: false }));
    const g07 = names(await load({ decorSet: 'g07', merge: false }));
    for (const n of ['DECOR_phuong_bloom', 'DECOR_puddles', 'DECOR_gutter_water']) {
      expect(g06, n).not.toContain(n);
      expect(g07, n).toContain(n);
    }
    expect(g06).toContain('TREE_phuong');
  });

  it('đổi phong cách hình ảnh chỉ đổi vật liệu: va chạm, marker, sàn y nguyên', async () => {
    const a = await load({ style: ART_STYLES.toon_outline }), b = await load({ style: ART_STYLES.soft_pbr });
    const kinds = (w: World) => { const s = new Set<string>(); w.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) s.add((m.material as THREE.Material).type); }); return [...s]; };
    expect(kinds(a)).toEqual(['MeshToonMaterial']);
    expect(kinds(b)).toEqual(['MeshStandardMaterial']);
    expect(b.collision.shapes).toEqual(a.collision.shapes);
    expect(b.allMarkers()).toEqual(a.allMarkers());
    expect(b.ground(3, 11)).toBe(a.ground(3, 11));
  });

  it('bảng màu của phong cách đổi màu theo TÊN vật liệu Blender', async () => {
    const style = { ...ART_STYLES.soft_pbr, id: 'test', palette: { wall_main: '#00ff00' } };
    const w = await load({ style, merge: false });
    const colors = new Set<string>();
    w.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && o.name.startsWith('WALL_fence')) for (const mat of [m.material].flat()) colors.add((mat as THREE.MeshStandardMaterial).color.getHexString()); });
    expect([...colors]).toContain('00ff00');
  });
});

describe('khi file bản đồ hỏng hoặc thiếu', () => {
  it('một khu không tải được: các khu khác vẫn chạy, lỗi được ghi lại, thứ thiếu được đặt tạm quanh điểm xuất hiện', async () => {
    const world = await loadWorld(THCS, { fetchAsset: (url) => (url.includes('zone_gate') ? Promise.reject(new Error('HTTP 404')) : readAsset(url)) });
    expect(world.loadedZones).toHaveLength(5);
    expect(world.problems.map((p) => `${p.code}:${p.zone}`)).toEqual([`asset_load_failed:${Z('gate')}`]);
    const b = bindDay(day('d.g07.03'), MAP, world);
    expect(b.problems.map((p) => `${p.code}:${p.ref}`)).toEqual(['missing_marker:itr.thcs.snack_cart']);
    const cart = b.targets.find((t) => t.id === 'itr.thcs.snack_cart')!;
    expect(Math.hypot(cart.x - b.spawn.x, cart.z - b.spawn.z)).toBeLessThan(4);          // vẫn làm được quest
    expect(b.targets).toHaveLength(day('d.g07.03').interactables.length);
  });

  it('không tải được khu nào: loadWorld báo lỗi rõ; mặt bằng tạm vẫn cho nhân vật đứng và đi', async () => {
    await expect(loadWorld(THCS, { fetchAsset: () => Promise.reject(new Error('HTTP 404')) })).rejects.toBeInstanceOf(WorldLoadError);
    const err = await loadWorld(THCS, { fetchAsset: () => Promise.reject(new Error('HTTP 404')) }).catch((e: WorldLoadError) => e);
    expect((err as WorldLoadError).problems).toHaveLength(6);
    const w = World.placeholder(THCS, (err as WorldLoadError).problems);
    expect(w.isPlaceholder).toBe(true);
    const b = bindDay(day('d.g07.03'), MAP, w);
    expect(b.npcs).toHaveLength(4);
    expect(b.targets).toHaveLength(day('d.g07.03').interactables.length);
    const c = new PlayerController(w);
    c.teleport(b.spawn.x, b.spawn.z, 0, 0);
    expect(walk(c, [b.targets[0].x, b.targets[0].z])).toBe(true);
    expect(walk(c, [500, 0], { run: true, maxSeconds: 20 })).toBe(false);                 // không rơi khỏi mặt bằng tạm
  });

  it('file không phải GLB: báo lỗi của đúng khu đó', async () => {
    const world = await loadWorld(THCS, { fetchAsset: async (url) => (url.includes('zone_base') ? new TextEncoder().encode('không phải glb').buffer as ArrayBuffer : readAsset(url)) });
    expect(world.problems.map((p) => `${p.code}:${p.zone}`)).toEqual([`asset_load_failed:${Z('base')}`]);
  });
});

describe('giải phóng tài nguyên khi rời Ngày', () => {
  it('dispose() giải phóng mọi geometry của bản đồ và sàn; nạp lại nhiều lần không dồn', async () => {
    let live = 0;
    const track = (w: World) => {
      const seen = new Set<THREE.BufferGeometry>();
      const hook = (g: THREE.BufferGeometry) => { if (seen.has(g)) return; seen.add(g); live++; g.addEventListener('dispose', () => { live--; }); };
      w.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) hook(m.geometry); });
      return seen.size;
    };
    for (let i = 0; i < 4; i++) {
      const w = await load({ decorSet: 'g07' });
      expect(track(w)).toBeGreaterThan(20);
      w.dispose();
      expect(live, `vòng ${i}`).toBe(0);
      expect(w.root.children).toHaveLength(0);
      expect(w.ground(3, 11)).toBeNull();
    }
  });
  it('tốc độ đi bộ/chạy của bộ điều khiển khớp GDD v0.3 §3', () => {
    expect([DEFAULT_MOVE.walk, DEFAULT_MOVE.run]).toEqual([3.2, 5.5]);
  });
});
