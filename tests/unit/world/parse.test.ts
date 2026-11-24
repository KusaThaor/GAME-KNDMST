import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { kindOf, parseZone, regionOfMesh } from '../../../src/world/parse';

const ALL = { openZones: 'all' as const, decorSet: null };
const cube = (w = 1, h = 1, d = 1) => new THREE.BoxGeometry(w, h, d);

/** Dựng một "file khu" giả giống thứ GLTFLoader trả về: object có tên + userData (custom property từ Blender). */
function sceneOf(build: (add: (name: string, data: Record<string, unknown>, geo?: THREE.BufferGeometry) => THREE.Object3D) => void): THREE.Group {
  const scene = new THREE.Group();
  build((name, data, geo) => {
    const o = geo ? new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ name: 'wall_main', color: '#ff0000' })) : new THREE.Object3D();
    o.name = name; Object.assign(o.userData, data);
    scene.add(o);
    return o;
  });
  return scene;
}

describe('đọc một khu xuất từ Blender (parseZone)', () => {
  it('loại lấy từ htx_kind; thiếu thì theo tiền tố tên; còn lại là phần để nhìn', () => {
    const o = new THREE.Object3D();
    o.name = 'COLLIDER_wall'; expect(kindOf(o)).toBe('collider');
    o.name = 'collider_wall'; expect(kindOf(o)).toBe('collider');
    o.name = 'SPAWN_default'; expect(kindOf(o)).toBe('spawn');
    o.name = 'Tree.001'; expect(kindOf(o)).toBe('visual');
    o.userData.htx_kind = 'spot'; expect(kindOf(o)).toBe('spot');
  });

  it('tách phần để nhìn, vật cản, sàn, marker; ID lấy từ htx_id chứ không phải tên object', () => {
    const z = parseZone('zone.t.a', sceneOf((add) => {
      add('Wall', {}, cube(4, 3, 0.2)).position.set(0, 1.5, -2);
      add('COLLIDER_wall', {}, cube(4, 3, 0.2)).position.set(0, 1.5, -2);
      add('Whatever', { htx_kind: 'floor' }, new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2));
      add('ZONE_a', { htx_id: 'zone.t.a' }, cube(10, 4, 10));
      add('SPAWN_x001', { htx_kind: 'spawn', htx_id: 'spawn.t.a' }).position.set(1, 0, 2);
      add('ITR_bench001', { htx_id: 'itr.t.bench', htx_radius: 2.5, htx_note: 'ghi chú' }).position.set(-1, 0, 0);
    }), ALL);
    expect(z.problems).toEqual([]);
    expect(z.stats.visuals).toBe(1);
    expect(z.colliders).toHaveLength(1);
    expect(z.colliders[0]).toMatchObject({ type: 'box', cx: 0, cz: -2, hx: 2, y0: 0, y1: 3, blocksCamera: true });
    expect(z.colliders[0].hz).toBeCloseTo(0.1, 6);
    expect(z.floors).toHaveLength(1);
    expect(z.markers.map((m) => `${m.kind}:${m.id}`).sort()).toEqual(['interact:itr.t.bench', 'spawn:spawn.t.a', 'zone:zone.t.a']);
    const itr = z.markers.find((m) => m.kind === 'interact')!;
    expect(itr).toMatchObject({ position: [-1, 0, 0], radius: 2.5, props: { radius: 2.5, note: 'ghi chú' } });
    expect(z.zoneRegions).toEqual([expect.objectContaining({ zone: 'zone.t.a', hx: 5, hz: 5 })]);
    // vật cản, sàn ẩn và marker không còn trong phần để nhìn
    const names: string[] = [];
    z.visuals.traverse((o) => { if (o.name) names.push(o.name); });
    expect(names).toContain('Wall');
    expect(names.some((n) => /^(COLLIDER|SPAWN|ITR|ZONE)_/.test(n) || n === 'Whatever')).toBe(false);
  });

  it('hướng của marker: trục -Z của object (trục Y xanh lá trong Blender) là hướng nhìn', () => {
    const z = parseZone('zone.t.a', sceneOf((add) => {
      add('FLOOR_a', {}, new THREE.PlaneGeometry(4, 4).rotateX(-Math.PI / 2));
      add('ZONE_a', { htx_id: 'zone.t.a' }, cube(4, 4, 4));
      add('SPAWN_n', { htx_id: 'spawn.n' });                                   // không xoay: nhìn về -z
      add('SPAWN_s', { htx_id: 'spawn.s' }).rotation.y = Math.PI;               // quay nửa vòng: nhìn về +z
      add('SPAWN_e', { htx_id: 'spawn.e' }).rotation.y = -Math.PI / 2;          // nhìn về +x
    }), ALL);
    const f = (id: string) => z.markers.find((m) => m.id === id)!.facing;
    expect(Math.abs(f('spawn.n'))).toBeCloseTo(Math.PI, 5);
    expect(f('spawn.s')).toBeCloseTo(0, 5);
    expect(f('spawn.e')).toBeCloseTo(Math.PI / 2, 5);
  });

  it('vật cản xoay quanh trục đứng giữ đúng góc; hình trụ; vật không chắn camera', () => {
    const z = parseZone('zone.t.a', sceneOf((add) => {
      add('COLLIDER_diag', {}, cube(6, 2, 0.4)).rotation.y = Math.PI / 6;
      const c = add('COLLIDER_tree', { htx_shape: 'cylinder', htx_camera: 0 }, cube(0.8, 2, 0.8)); c.position.set(5, 1, 5);
      add('COLLIDER_scaled', {}, cube(1, 1, 1)).scale.set(4, 2, 0.5);
    }), ALL);
    const by = Object.fromEntries(z.colliders.map((c) => [c.id, c]));
    expect(by.COLLIDER_diag).toMatchObject({ type: 'box', hx: 3 });
    expect(by.COLLIDER_diag.hz).toBeCloseTo(0.2, 6);
    expect(by.COLLIDER_diag.rot).toBeCloseTo(Math.PI / 6, 5);
    expect(by.COLLIDER_tree).toMatchObject({ type: 'circle', cx: 5, cz: 5, blocksCamera: false });
    expect(by.COLLIDER_tree.r).toBeCloseTo(0.4, 5);
    expect(by.COLLIDER_scaled).toMatchObject({ hx: 2, hz: 0.25, y0: -1, y1: 1 });
  });

  it('vật cản bị nghiêng: nhắc và dùng hộp bao thẳng trục', () => {
    const m = new THREE.Mesh(cube(2, 2, 2));
    m.rotation.x = 0.5; m.updateMatrixWorld(true);
    expect(regionOfMesh(m).exact).toBe(false);
    const z = parseZone('zone.t.a', sceneOf((add) => { add('COLLIDER_tilt', {}, cube(2, 2, 2)).rotation.x = 0.5; }), ALL);
    expect(z.problems.map((p) => `${p.level}:${p.code}`)).toEqual(['warn:collider_tilted']);
    expect(z.colliders).toHaveLength(1);
  });

  it('báo lỗi: marker thiếu htx_id, ID trùng, portal thiếu đích, vùng không phải mesh', () => {
    const z = parseZone('zone.t.a', sceneOf((add) => {
      add('SPAWN_noid', {});
      add('ITR_a', { htx_id: 'itr.t.same' });
      add('ITR_b', { htx_id: 'itr.t.same' });
      add('PORTAL_x', { htx_id: 'portal.t.x' }, cube());
      add('PORTAL_y', { htx_id: 'portal.t.y', htx_target_spawn: 'spawn.t.b' });
      add('ZONE_other', { htx_id: 'zone.t.other' }, cube());
    }), ALL);
    const codes = z.problems.map((p) => `${p.level}:${p.code}`).sort();
    expect(codes).toEqual(['error:duplicate_id', 'error:marker_no_id', 'error:portal_no_target', 'error:volume_not_mesh', 'warn:zone_id_mismatch']);
    expect(z.portals).toEqual([]);
  });

  it('portal: đọc đích, kiểu kích hoạt, nhãn', () => {
    const z = parseZone('zone.t.a', sceneOf((add) => {
      add('PORTAL_door', { htx_id: 'portal.t.door', htx_target_spawn: 'spawn.t.b', htx_activate: 'interact', htx_label: 'Vào nhà' }, cube(2, 2, 1)).position.set(3, 1, 4);
      add('PORTAL_walk', { htx_id: 'portal.t.walk', htx_target_spawn: 'spawn.t.c' }, cube());
    }), ALL);
    expect(z.portals).toEqual([
      expect.objectContaining({ id: 'portal.t.door', targetSpawn: 'spawn.t.b', activate: 'interact', label: 'Vào nhà', region: expect.objectContaining({ cx: 3, cz: 4, hx: 1, hz: 0.5 }) }),
      expect.objectContaining({ id: 'portal.t.walk', targetSpawn: 'spawn.t.c', activate: 'enter', label: null }),
    ]);
  });

  it('khu mở/đóng: vật chắn (htx_gate_zone) chỉ còn khi khu đóng; cánh cửa mở (htx_open_zone) chỉ còn khi khu mở', () => {
    const make = () => sceneOf((add) => {
      add('GATE_closed', { htx_gate_zone: 'zone.t.b' }, cube());
      add('COLLIDER_gate', { htx_gate_zone: 'zone.t.b' }, cube());
      add('DOOR_open', { htx_open_zone: 'zone.t.b' }, cube());
      add('COLLIDER_leaf', { htx_open_zone: 'zone.t.b' }, cube());
    });
    const open = parseZone('zone.t.a', make(), { openZones: new Set(['zone.t.a', 'zone.t.b']), decorSet: null });
    expect([open.stats.visuals, open.colliders.map((c) => c.id)]).toEqual([1, ['COLLIDER_leaf']]);
    const closed = parseZone('zone.t.a', make(), { openZones: new Set(['zone.t.a']), decorSet: null });
    expect([closed.stats.visuals, closed.colliders.map((c) => c.id)]).toEqual([1, ['COLLIDER_gate']]);
    expect(closed.stats.gateZones).toEqual(['zone.t.b']);
    const all = parseZone('zone.t.a', make(), ALL);
    expect(all.colliders.map((c) => c.id)).toEqual(['COLLIDER_leaf']);
    const index = parseZone('zone.t.a', make(), { openZones: 'index', decorSet: '*' });
    expect(index.colliders).toHaveLength(2);
  });

  it('bộ trang trí theo năm học: vật có htx_decor chỉ hiện ở đúng bộ', () => {
    const make = () => sceneOf((add) => { add('Tree', {}, cube()); add('DECOR_bloom', { htx_decor: 'g07, g08' }, cube()); });
    expect(parseZone('z', make(), { openZones: 'all', decorSet: 'g06' }).stats.visuals).toBe(1);
    expect(parseZone('z', make(), { openZones: 'all', decorSet: 'g08' }).stats.visuals).toBe(2);
    expect(parseZone('z', make(), { openZones: 'all', decorSet: null }).stats.visuals).toBe(1);
    expect(parseZone('z', make(), { openZones: 'all', decorSet: '*' }).stats.visuals).toBe(2);
  });

  it('dời cả khu bằng offset của manifest: vật cản, marker, sàn đều dời theo', () => {
    const z = parseZone('zone.t.a', sceneOf((add) => {
      add('FLOOR_a', {}, new THREE.PlaneGeometry(4, 4).rotateX(-Math.PI / 2));
      add('COLLIDER_box', {}, cube());
      add('SPAWN_a', { htx_id: 'spawn.t.a' }).position.set(1, 0, 1);
    }), ALL, [100, 0, -50]);
    expect(z.colliders[0]).toMatchObject({ cx: 100, cz: -50 });
    expect(z.markers[0].position).toEqual([101, 0, -49]);
    expect(new THREE.Box3().setFromObject(z.floors[0]).getCenter(new THREE.Vector3()).toArray()).toEqual([100, 0, -50]);
  });
});
