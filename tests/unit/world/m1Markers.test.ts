/**
 * R-D0 — marker Trang 1–4 Mốc 1 (MAP-1, MAP-2). Kiểm trên bản đồ thật: có sàn, không kẹt vật cản, đúng khu,
 * máy ảnh nhìn thẳng tới đích, đủ người trong khung, ảnh cầu vồng khác góc ảnh Trang 8.
 */
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { bindCamera } from '../../../src/world/dayBindings';
import { M1_MARKERS, EXTRAS } from '../../../src/world/maps/map_thcs.extras';
import type { MarkerKind } from '../../../src/world/types';
import { loadWorld, type World } from '../../../src/world/world';
import { readAsset } from '../../../scripts/world-cli';
import { THCS, Z } from './helpers';

const CONTRACT: Record<string, [MarkerKind, string]> = {
  'spot.thcs.class_list_1': ['spot', 'corridor'], 'spot.thcs.class_door': ['spot', 'corridor'],
  'itr.thcs.desk3': ['interact', 'classroom'], 'spot.thcs.desk3_1': ['spot', 'classroom'], 'spot.thcs.desk3_2': ['spot', 'classroom'], 'cam.thcs.desk3': ['camera', 'classroom'],
  'itr.thcs.shuttle_bush': ['interact', 'yard'], 'spot.thcs.shuttle_bush': ['spot', 'yard'],
  // BUG-T1-B — chỗ đứng dàn cảnh Trang 1
  'spot.thcs.notebook_drop': ['spot', 'yard'],
  ...Object.fromEntries(['', '_1', '_2'].map((n) => [`spot.thcs.shuttle_group${n}`, ['spot', 'yard'] as [MarkerKind, string]])),
  'spot.thcs.board_group': ['spot', 'classroom'], 'spot.thcs.board_group_1': ['spot', 'classroom'], 'spot.thcs.class_door_in': ['spot', 'classroom'],
  'spot.thcs.grocery_group': ['spot', 'gate'], 'spot.thcs.grocery_watch': ['spot', 'gate'],
  'spot.thcs.gutter_photo': ['spot', 'yard'], 'itr.thcs.gutter_end': ['interact', 'yard'], 'spot.thcs.gutter_end_ref': ['spot', 'yard'],
  'cam.thcs.phuong_group': ['camera', 'yard'],
  ...Object.fromEntries(['', '_1', '_2', '_3', '_4'].map((n) => [`spot.thcs.phuong_group${n}`, ['spot', 'yard'] as [MarkerKind, string]])),
  'itr.thcs.field_log_cam': ['interact', 'field'], 'cam.thcs.rainbow_log': ['camera', 'field'],
  ...Object.fromEntries(['', '_1', '_2', '_3', '_4'].map((n) => [`spot.thcs.rainbow_group${n}`, ['spot', 'field'] as [MarkerKind, string]])),
  'itr.thcs.base_photo_wall': ['interact', 'base'], 'cam.thcs.base_photo_wall': ['camera', 'base'],
};
const CAMS = Object.keys(CONTRACT).filter((id) => CONTRACT[id][0] === 'camera');

const view = (w: World, camId: string, fov?: number) => {
  const b = bindCamera({ id: 'x', marker: camId, fov }, w)!;
  const cam = new THREE.PerspectiveCamera(b.fov, 4 / 3, 0.1, 400);
  cam.position.set(...b.position); cam.lookAt(new THREE.Vector3(...b.look_at)); cam.updateMatrixWorld(true);
  return { b, cam, project: (p: [number, number, number]) => new THREE.Vector3(...p).project(cam) };
};
const inFrame = (v: THREE.Vector3, m = 0.9) => Math.abs(v.x) < m && Math.abs(v.y) < m && v.z < 1;

describe('R-D0 — marker Mốc 1 (Trang 1–4)', () => {
  let world: World;
  beforeAll(async () => { world = await loadWorld(THCS, { fetchAsset: readAsset }); });

  it('đúng bộ mã hợp đồng, mỗi máy ảnh có .target; đều nằm trong EXTRAS; không trùng mã GLB', () => {
    expect(M1_MARKERS.filter((m) => m.kind !== 'target').map((m) => m.id).sort()).toEqual(Object.keys(CONTRACT).sort());
    expect(M1_MARKERS.filter((m) => m.kind === 'target').map((m) => m.id).sort()).toEqual(CAMS.map((c) => `${c}.target`).sort());
    for (const m of M1_MARKERS) expect(EXTRAS.markers, m.id).toContain(m);
    expect(world.problems).toEqual([]);
  });

  it('nạp được trên bản đồ thật, đúng loại, đúng khu; chỗ đứng có sàn và không kẹt vật cản', () => {
    for (const [id, [kind, zone]] of Object.entries(CONTRACT)) {
      const m = world.marker(kind, id);
      expect(m, id).not.toBeNull();
      expect(m!.zone, id).toBe(Z(zone));
      expect(world.zoneAt(m!.position[0], m!.position[2]), id).toBe(Z(zone));
      if (kind === 'spot' || kind === 'interact') {
        const g = world.ground(m!.position[0], m!.position[2], m!.position[1]);
        expect(g, id).not.toBeNull();
        expect(g!, id).toBeCloseTo(m!.position[1], 2);
        expect(world.collision.blocked(m!.position[0], m!.position[2], g!), id).toBe(false);
      }
    }
  });

  it('máy ảnh nhìn thẳng tới đích, không bị vật cản che', () => {
    for (const id of CAMS) {
      const { b } = view(world, id);
      expect(world.segmentHit(b.position, b.look_at, 0.05), id).toBeNull();
    }
  });

  it('ảnh 1 Trang 4 (gốc phượng): máy trên ghế đá cạnh itr.thcs.stone_bench; đủ 5 người (đầu 1,4 m + chân) trong khung', () => {
    const cam = world.marker('camera', 'cam.thcs.phuong_group')!, bench = world.marker('interact', 'itr.thcs.stone_bench')!;
    expect(Math.hypot(cam.position[0] - bench.position[0], cam.position[2] - bench.position[2])).toBeLessThan(0.6);
    const { project } = view(world, 'cam.thcs.phuong_group');
    for (const n of ['', '_1', '_2', '_3', '_4']) {
      const p = world.marker('spot', `spot.thcs.phuong_group${n}`)!.position;
      expect(inFrame(project([p[0], 1.42, p[2]])), n).toBe(true);
      expect(inFrame(project([p[0], 0.05, p[2]])), n).toBe(true);
      // dưới/mép tán phượng: cách thân cây (−12; −6) < 4 m
      expect(Math.hypot(p[0] + 12, p[2] + 6), n).toBeLessThan(4);
    }
  });

  it('ảnh 2 Trang 4 (cầu vồng): máy trên khúc gỗ; nhóm trong khung; cầu vồng (luôn ở phía bắc máy, sky.ts) lọt khung; khác góc ảnh Trang 8', () => {
    const { b, project } = view(world, 'cam.thcs.rainbow_log', 44);   // R-D4 khai fov 44 cho máy này
    for (const n of ['', '_1', '_2', '_3', '_4']) {
      const p = world.marker('spot', `spot.thcs.rainbow_group${n}`)!.position;
      expect(inFrame(project([p[0], 1.42, p[2]])), n).toBe(true);
      expect(inFrame(project([p[0], 0.05, p[2]])), n).toBe(true);
    }
    // đỉnh và tâm vòm cầu vồng: rainbowArc() đặt tại máy + (0, −4, −89), bán kính 49–53
    const c = b.position;
    expect(inFrame(project([c[0], c[1] - 4 + 51, c[2] - 89]), 1)).toBe(true);                    // đỉnh vòm (sát mép trên)
    for (const sx of [-1, 1]) expect(inFrame(project([c[0] + sx * 25.5, c[1] - 4 + 44.2, c[2] - 89])), `vai ${sx}`).toBe(true);
    // khác Trang 8: hướng nhìn lệch ≥ 8° hoặc ngửa ≥ 6° so với cam.thcs.m2_campfire_group
    const t8 = view(world, 'cam.thcs.m2_campfire_group').b;
    const yaw = (v: { position: number[]; look_at: number[] }) => Math.atan2(v.look_at[0] - v.position[0], -(v.look_at[2] - v.position[2]));
    const pitch = (v: { position: number[]; look_at: number[] }) => Math.atan2(v.look_at[1] - v.position[1], Math.hypot(v.look_at[0] - v.position[0], v.look_at[2] - v.position[2]));
    const dYaw = Math.abs(yaw(b) - yaw(t8)) * 180 / Math.PI, dPitch = Math.abs(pitch(b) - pitch(t8)) * 180 / Math.PI;
    expect(dYaw >= 8 || dPitch >= 6).toBe(true);
  });

  it('bàn 3 người Trang 1: máy ĐẨY-MÁY thấy mặt bàn; tường dán ảnh Căn cứ nằm giữa khung', () => {
    expect(inFrame(view(world, 'cam.thcs.desk3').project([-6.05, 0.86, -28.4]), 0.5)).toBe(true);
    expect(inFrame(view(world, 'cam.thcs.base_photo_wall').project([47.6, 1.4, -32.9]), 0.3)).toBe(true);
  });
});
