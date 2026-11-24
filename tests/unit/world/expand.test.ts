/**
 * "Thêm khu thứ 7 chỉ bằng cấu hình + asset" — đúng quy trình trong docs/HOW_TO_EXPAND_WORLD.md:
 *  - file khu mới do tools/blender/world/new_zone.py tạo và export_world.py xuất (bản lưu ở tests/unit/fixtures/world/zone_annex.glb,
 *    sinh lại bằng: python tools/blender/world/tests/test_pipeline.py --write-fixture);
 *  - manifest thêm 1 mục + 1 dòng kết nối.
 * KHÔNG sửa file nào trong src/. Test này đỏ nếu ai đó viết cứng "6 khu" ở đâu đó trong hệ thống.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { PlayerController } from '../../../src/actors/player/controller';
import { CAMERA_PRESETS } from '../../../src/config/camera';
import { CONTENT } from '../../../src/content/pack';
import type { ContentPack } from '../../../src/content/types';
import { bindDay } from '../../../src/world/dayBindings';
import { ZoneTracker, type TravelEvent } from '../../../src/world/travel';
import { validateWorld, validateWorldContent } from '../../../src/world/validate';
import { buildWorldIndex, loadWorld, type World } from '../../../src/world/world';
import { checkMarkerPlaces } from '../../../scripts/world-cli';
import { Z, manifestWithAnnex, readWithFixtures, walk } from './helpers';

const M7 = manifestWithAnnex();
const ALL7 = M7.zones.map((z) => z.id);

describe('thêm khu thứ 7 bằng cấu hình + asset', () => {
  let world: World;
  beforeAll(async () => { world = await loadWorld(M7, { fetchAsset: readWithFixtures }); });

  it('manifest 7 khu hợp lệ; index sinh ra có khu mới với đủ marker và portal', async () => {
    const { index, problems } = await buildWorldIndex(M7, readWithFixtures);
    expect(problems).toEqual([]);
    expect(validateWorld(M7, index, Object.keys(CAMERA_PRESETS)).filter((p) => p.level === 'error')).toEqual([]);
    expect(await checkMarkerPlaces(M7, readWithFixtures)).toEqual([]);
    const zi = index.zones[Z('annex')];
    expect(zi.markers.map((m) => m.id).sort()).toEqual(['itr.thcs.annex_sign', 'portal.thcs.annex_entry', 'portal.thcs.annex_exit', 'spawn.thcs.annex', 'zone.thcs.annex']);
    expect(zi.portals).toEqual(expect.arrayContaining([{ id: 'portal.thcs.annex_exit', target_spawn: 'spawn.thcs.field' }, { id: 'portal.thcs.annex_entry', target_spawn: 'spawn.thcs.annex' }]));
    // nội dung cũ không cần sửa gì: chỉ được nhắc là chưa đặt tên khu mới
    const content = validateWorldContent(CONTENT, { map_thcs: M7 }, { map_thcs: index });
    expect(content.filter((p) => p.level === 'error').map((p) => p.code)).toEqual(['zone_missing_in_content']);
  });

  it('game nạp 7 khu; 6 khu cũ và nội dung cũ không đổi', () => {
    expect(world.loadedZones).toHaveLength(7);
    expect(world.problems).toEqual([]);
    for (const d of CONTENT.days) expect(bindDay(d, CONTENT.maps[0], world).problems, d.id).toEqual([]);
    const m = world.marker('spawn', 'spawn.thcs.annex')!;
    expect(world.zoneAt(m.position[0], m.position[2])).toBe(Z('annex'));
    expect(world.spawnInZone(Z('annex'))?.id).toBe('spawn.thcs.annex');
  });

  it('đi từ bãi đất vào portal → sang khu mới → bấm portal ra → về bãi đất; không kẹt, không bật qua lại', () => {
    const c = new PlayerController(world);
    const tracker = new ZoneTracker(world);
    const place = (m: { position: [number, number, number]; facing: number }): TravelEvent[] => { c.teleport(m.position[0], m.position[2], m.facing, m.position[1]); return tracker.arrive(c.x, c.z); };
    place(world.marker('spawn', 'spawn.thcs.field')!);
    expect(tracker.zone).toBe(Z('field'));
    const log: string[] = [];
    const onStep = () => {
      for (const e of tracker.update(c.x, c.z)) {
        if (e.type === 'portal') { log.push(`portal:${e.portal.id}`); for (const z of place(e.to)) if (z.type === 'zone') log.push(`zone:${z.to}`); return false; }
        log.push(`zone:${e.to}`);
      }
    };
    walk(c, [49.5, 0], { run: true, onStep });
    expect(log).toEqual(['portal:portal.thcs.annex_entry', `zone:${Z('annex')}`]);
    expect(world.zoneAt(c.x, c.z)).toBe(Z('annex'));
    expect(world.collision.blocked(c.x, c.z, c.y)).toBe(false);
    // dạo trong khu mới: tới biển báo được, bờ quanh khu chặn lại
    const sign = world.marker('interact', 'itr.thcs.annex_sign')!;
    expect(walk(c, [sign.position[0], sign.position[2]], { onStep })).toBe(true);
    expect(walk(c, [90, 0], { maxSeconds: 10, onStep })).toBe(false);
    expect(c.x).toBeLessThan(72);
    // portal ra kiểu "bấm để đi": đứng vào không tự đi, bấm mới đi
    expect(walk(c, [66, 5.5], { onStep })).toBe(true);
    expect(log).toHaveLength(2);
    const exit = tracker.interactPortal(c.x, c.z);
    expect(exit).toMatchObject({ id: 'portal.thcs.annex_exit', label: 'Ra ngoài' });
    expect(place(tracker.use(exit!)!)).toEqual([{ type: 'zone', from: Z('annex'), to: Z('field') }]);
    expect(Math.hypot(c.x - 33, c.z - 15)).toBeLessThan(0.01);
  });

  it('Ngày không mở khu mới thì portal vào khu đó không hoạt động', async () => {
    const w = await loadWorld(M7, { fetchAsset: readWithFixtures, openZones: ALL7.filter((z) => z !== Z('annex')) });
    const c = new PlayerController(w);
    const t = new ZoneTracker(w);
    const m = w.marker('spawn', 'spawn.thcs.field')!;
    c.teleport(m.position[0], m.position[2]); t.arrive(c.x, c.z);
    const events: TravelEvent[] = [];
    expect(walk(c, [49.5, 0], { run: true, onStep: () => { events.push(...t.update(c.x, c.z)); } })).toBe(true);
    expect(events).toEqual([]);
  });

  it('gắn tương tác vào khu mới chỉ bằng nội dung (ID), không cần tọa độ', () => {
    const pack: ContentPack = JSON.parse(JSON.stringify(CONTENT));
    const day = pack.days.find((d) => d.id === 'd.g07.03')!;
    day.open_zones = ALL7;
    day.interactables.push({ id: 'itr.thcs.annex_sign', label: '[PLACEHOLDER] Biển báo', zone_id: Z('annex'), kind: 'marker' });
    const b = bindDay(day, pack.maps[0], world);
    expect(b.problems).toEqual([]);
    expect(b.targets.find((t) => t.id === 'itr.thcs.annex_sign')).toMatchObject({ zone: Z('annex'), radius: 1.5 });
  });
});
