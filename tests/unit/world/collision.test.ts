import { describe, expect, it } from 'vitest';
import { CollisionWorld, DEFAULT_BODY, regionContains } from '../../../src/world/collision';
import type { ColliderShape } from '../../../src/world/types';

const box = (id: string, cx: number, cz: number, hx: number, hz: number, o: Partial<ColliderShape> = {}): ColliderShape =>
  ({ id, zone: 'z', type: 'box', cx, cz, hx, hz, rot: 0, y0: 0, y1: 2.4, r: 0, blocksCamera: true, ...o });
const R = DEFAULT_BODY.radius;

describe('va chạm (S2)', () => {
  it('hộp thẳng trục: đẩy hình tròn ra đúng mép gần nhất, không đụng thì giữ nguyên', () => {
    const w = new CollisionWorld([box('wall', 0, 0, 2, 0.25)]);
    expect(w.resolve(5, 5, 0)).toEqual({ x: 5, z: 5, hit: false });
    const r = w.resolve(0.5, 0.4, 0);
    expect(r.hit).toBe(true);
    expect(r.x).toBeCloseTo(0.5, 5);
    expect(r.z).toBeCloseTo(0.25 + R, 5);
    expect(w.blocked(0.5, 0.4, 0)).toBe(true);
    expect(w.blocked(r.x, r.z, 0)).toBe(false);
  });

  it('tâm lọt vào trong hộp vẫn được đẩy ra ngoài', () => {
    const w = new CollisionWorld([box('wall', 0, 0, 2, 0.25)]);
    const r = w.resolve(0.3, 0.05, 0);
    expect(Math.abs(r.z)).toBeGreaterThanOrEqual(0.25 + R - 1e-6);
    expect(w.blocked(r.x, r.z, 0)).toBe(false);
  });

  it('hộp xoay quanh trục đứng: tính trong hệ trục riêng của hộp', () => {
    const rot = Math.PI / 4;
    const w = new CollisionWorld([box('diag', 0, 0, 3, 0.2, { rot })]);
    // điểm nằm dọc theo trục dài của hộp (đã xoay) thì bị chặn, điểm vuông góc cách xa thì không
    const along = [Math.cos(rot) * 2, -Math.sin(rot) * 2] as const;
    const across = [Math.sin(rot) * 1.5, Math.cos(rot) * 1.5] as const;
    expect(w.blocked(along[0], along[1], 0)).toBe(true);
    expect(w.blocked(across[0], across[1], 0)).toBe(false);
    expect(regionContains({ cx: 0, cz: 0, hx: 3, hz: 0.2, rot, y0: 0, y1: 1 }, along[0], along[1])).toBe(true);
    const r = w.resolve(along[0] + 0.1, along[1] + 0.1, 0);
    expect(w.blocked(r.x, r.z, 0)).toBe(false);
  });

  it('hình trụ: giữ khoảng cách bán kính + bán kính người', () => {
    const w = new CollisionWorld([box('tree', 10, 10, 0.4, 0.4, { type: 'circle', r: 0.4 })]);
    const r = w.resolve(10.3, 10, 0);
    expect(Math.hypot(r.x - 10, r.z - 10)).toBeCloseTo(0.4 + R, 5);
    expect(w.resolve(10 + 0.4 + R + 0.01, 10, 0).hit).toBe(false);
  });

  it('vật thấp hơn bậc thì bước qua; vật ở trên đầu thì chui qua', () => {
    const w = new CollisionWorld([box('curb', 0, 0, 1, 1, { y1: 0.2 }), box('beam', 5, 0, 1, 1, { y0: 2.2, y1: 2.6 })]);
    expect(w.resolve(0, 0, 0).hit).toBe(false);
    expect(w.resolve(5, 0, 0).hit).toBe(false);
    // đứng trên bậc cao 0,15 thì bàn cao 0,7 đặt trên bậc vẫn chặn
    const w2 = new CollisionWorld([box('desk', 0, 0, 0.5, 0.6, { y0: 0.15, y1: 0.85 })]);
    expect(w2.resolve(0.1, 0, 0.15).hit).toBe(true);
  });

  it('góc tường: không lọt qua khe giữa hai hộp', () => {
    const w = new CollisionWorld([box('a', 0, 0, 2, 0.2), box('b', 2, 2, 0.2, 2)]);
    const r = w.resolve(1.7, 0.3, 0);
    expect(w.blocked(r.x, r.z, 0)).toBe(false);
    expect(r.x).toBeLessThan(1.8 - R + 1e-6);
    expect(r.z).toBeGreaterThan(0.2 + R - 1e-6);
  });

  it('camera: đoạn thẳng chạm tường ở đúng tỉ lệ; vật không chắn camera thì bỏ qua', () => {
    const w = new CollisionWorld([box('wall', 0, -3, 5, 0.25), box('fence', 0, 3, 5, 0.1, { blocksCamera: false })]);
    const t = w.segmentHit([0, 1, 0], [0, 3, -6], 0);
    expect(t).not.toBeNull();
    expect(t!).toBeCloseTo((3 - 0.25) / 6, 3);
    expect(w.segmentHit([0, 1, 0], [0, 3, 6], 0)).toBeNull();
    expect(w.segmentHit([0, 1, 0], [0, 3, 6], 0, false)).not.toBeNull();
    // bay qua trên đầu tường thì không chạm
    expect(w.segmentHit([0, 3, 0], [0, 4, -6], 0)).toBeNull();
  });

  it('lưới chia ô: vật ở xa không bị xét, vật to phủ nhiều ô vẫn chặn ở mọi chỗ', () => {
    const shapes = [box('long', 0, 0, 40, 0.25)];
    for (let i = 0; i < 200; i++) shapes.push(box(`far${i}`, 500 + i * 3, 500, 1, 1));
    const w = new CollisionWorld(shapes);
    for (const x of [-39, -17, 0, 23, 39]) expect(w.blocked(x, 0.1, 0)).toBe(true);
    expect(w.blocked(-45, 0.1, 0)).toBe(false);
  });
});
