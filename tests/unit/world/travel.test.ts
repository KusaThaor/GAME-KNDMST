import { describe, expect, it } from 'vitest';
import { regionContains } from '../../../src/world/collision';
import { ZoneTracker, type TravelWorld } from '../../../src/world/travel';
import type { Marker, Portal, Region } from '../../../src/world/types';

const rect = (x0: number, z0: number, x1: number, z1: number): Region => ({ cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, rot: 0, y0: 0, y1: 2 });
const spawn = (id: string, zone: string, x: number, z: number): Marker => ({ id, kind: 'spawn', zone, position: [x, 0, z], facing: 0, props: {} });

/** Hai khu A (x<10) và B (x>100) nối bằng cặp portal; C là khu thứ ba không mở. */
function fake(open = ['A', 'B']): TravelWorld {
  const zones: [string, Region][] = [['A', rect(0, 0, 10, 10)], ['B', rect(100, 0, 110, 10)], ['C', rect(200, 0, 210, 10)]];
  const spawns = [spawn('spawn.a', 'A', 5, 5), spawn('spawn.b', 'B', 101, 5), spawn('spawn.c', 'C', 205, 5)];
  const portals: Portal[] = [
    { id: 'portal.a_to_b', zone: 'A', region: rect(9, 4, 10, 6), targetSpawn: 'spawn.b', activate: 'enter', label: null },
    { id: 'portal.b_to_a', zone: 'B', region: rect(100, 4, 102, 6), targetSpawn: 'spawn.a', activate: 'enter', label: null },     // điểm đến spawn.b nằm TRONG portal này
    { id: 'portal.b_door', zone: 'B', region: rect(108, 0, 110, 2), targetSpawn: 'spawn.a', activate: 'interact', label: 'Cửa' },
    { id: 'portal.a_to_c', zone: 'A', region: rect(0, 0, 1, 1), targetSpawn: 'spawn.c', activate: 'enter', label: null },
    { id: 'portal.broken', zone: 'A', region: rect(0, 9, 1, 10), targetSpawn: 'spawn.none', activate: 'enter', label: null },
  ];
  return {
    zoneAt: (x, z) => zones.find(([, r]) => regionContains(r, x, z))?.[0] ?? null,
    portalsAt: (x, z) => portals.filter((p) => regionContains(p.region, x, z)),
    marker: (kind, id) => (kind === 'spawn' ? spawns.find((s) => s.id === id) ?? null : null),
    isOpen: (zone) => open.includes(zone),
  };
}

describe('ZoneTracker: đổi khu và portal (S2)', () => {
  it('báo đổi khu đúng một lần; đứng ở khe giữa hai khu thì giữ khu cũ', () => {
    const t = new ZoneTracker(fake());
    expect(t.arrive(5, 5)).toEqual([{ type: 'zone', from: null, to: 'A' }]);
    expect(t.update(6, 5)).toEqual([]);
    expect(t.update(50, 5)).toEqual([]);          // ngoài mọi khối ranh
    expect(t.zone).toBe('A');
    expect(t.update(105, 8)).toEqual([{ type: 'zone', from: 'A', to: 'B' }]);
    expect(t.update(105, 8)).toEqual([]);
  });

  it('bước vào portal → được đưa tới điểm xuất hiện đích; đứng trong portal đích không bị bật ngược lại', () => {
    const t = new ZoneTracker(fake());
    t.arrive(5, 5);
    const ev = t.update(9.5, 5);
    expect(ev).toHaveLength(1);
    expect(ev[0]).toMatchObject({ type: 'portal', portal: { id: 'portal.a_to_b' }, to: { id: 'spawn.b' } });
    // nơi gọi dời nhân vật rồi báo arrive: đổi khu, và KHÔNG kích portal b_to_a dù đang đứng trong nó
    expect(t.arrive(101, 5)).toEqual([{ type: 'zone', from: 'A', to: 'B' }]);
    expect(t.update(101.2, 5)).toEqual([]);
    expect(t.update(105, 5)).toEqual([]);         // bước ra khỏi portal
    expect(t.update(101, 5)[0]).toMatchObject({ type: 'portal', to: { id: 'spawn.a' } });   // quay lại thì mới đi
  });

  it('portal kiểu "bấm để đi" không tự kích; interactPortal/use trả đích', () => {
    const t = new ZoneTracker(fake());
    t.arrive(105, 5);
    expect(t.update(109, 1)).toEqual([]);
    const p = t.interactPortal(109, 1);
    expect(p?.id).toBe('portal.b_door');
    expect(t.use(p!)?.id).toBe('spawn.a');
    expect(t.interactPortal(105, 5)).toBeNull();
  });

  it('portal dẫn tới khu không mở, hoặc trỏ tới điểm không tồn tại, bị bỏ qua', () => {
    const t = new ZoneTracker(fake());
    t.arrive(5, 5);
    expect(t.update(0.5, 0.5)).toEqual([]);
    expect(t.update(0.5, 9.5)).toEqual([]);
    const all = new ZoneTracker(fake(['A', 'B', 'C']));
    all.arrive(5, 5);
    expect(all.update(0.5, 0.5)[0]).toMatchObject({ type: 'portal', to: { id: 'spawn.c' } });
  });
});
