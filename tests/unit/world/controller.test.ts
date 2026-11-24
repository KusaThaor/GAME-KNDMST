import { describe, expect, it } from 'vitest';
import { DEFAULT_MOVE, PlayerController, type Navigation } from '../../../src/actors/player/controller';
import { CollisionWorld } from '../../../src/world/collision';
import type { ColliderShape } from '../../../src/world/types';
import { walk } from './helpers';

const box = (cx: number, cz: number, hx: number, hz: number, o: Partial<ColliderShape> = {}): ColliderShape =>
  ({ id: 'c', zone: 'z', type: 'box', cx, cz, hx, hz, rot: 0, y0: 0, y1: 2.4, r: 0, blocksCamera: true, ...o });

/** Sàn phẳng 40 × 40 m, có một bậc cao 0,15 m ở z < -10 và một bục cao 1 m ở x > 15. */
function nav(shapes: ColliderShape[] = []): Navigation {
  const col = new CollisionWorld(shapes);
  return {
    resolve: (x, z, y, body) => col.resolve(x, z, y, body),
    ground: (x, z) => (Math.abs(x) > 20 || Math.abs(z) > 20 ? null : x > 15 ? 1 : z < -10 ? 0.15 : 0),
  };
}
const YAW_NORTH = 0;     // camera đứng phía +z, "tới" là đi về -z

describe('điều khiển nhân vật (S2)', () => {
  it('đi đúng tốc độ đi bộ/chạy, theo hướng camera', () => {
    const c = new PlayerController(nav());
    c.teleport(0, 0, 0);
    for (let i = 0; i < 60; i++) c.update(1 / 60, { forward: 1, strafe: 0, run: false }, YAW_NORTH);
    expect(c.z).toBeCloseTo(-DEFAULT_MOVE.walk, 2);
    expect(c.x).toBeCloseTo(0, 5);
    expect(c.state).toBe('walk');
    for (let i = 0; i < 60; i++) c.update(1 / 60, { forward: 0, strafe: 1, run: true }, YAW_NORTH);
    expect(c.x).toBeCloseTo(DEFAULT_MOVE.run, 2);
    expect(c.state).toBe('run');
    c.update(1 / 60, { forward: 0, strafe: 0, run: false }, YAW_NORTH);
    expect(c.state).toBe('idle');
    expect(c.speed).toBe(0);
  });

  it('đi chéo không nhanh hơn đi thẳng', () => {
    const c = new PlayerController(nav());
    c.teleport(0, 0, 0);
    for (let i = 0; i < 60; i++) c.update(1 / 60, { forward: 1, strafe: 1, run: false }, YAW_NORTH);
    expect(Math.hypot(c.x, c.z)).toBeCloseTo(DEFAULT_MOVE.walk, 2);
  });

  it('điều khiển bị khóa (intent = null) thì đứng yên', () => {
    const c = new PlayerController(nav());
    c.teleport(1, 2, 0);
    for (let i = 0; i < 30; i++) c.update(1 / 30, null, YAW_NORTH);
    expect([c.x, c.z, c.state]).toEqual([1, 2, 'idle']);
  });

  it('độc lập tốc độ khung hình: 60 fps và 5 fps tới cùng một chỗ', () => {
    const run = (dt: number) => {
      const c = new PlayerController(nav([box(3, -6, 1, 1)]));
      c.teleport(0, 0, 0);
      for (let t = 0; t < 3 - 1e-9; t += dt) c.update(dt, { forward: 1, strafe: 0.4, run: true }, 0.3);
      return c;
    };
    const a = run(1 / 60), b = run(1 / 5);
    expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeLessThan(0.15);
  });

  it('không xuyên tường mỏng kể cả khi khung hình rất giật', () => {
    const c = new PlayerController(nav([box(0, -5, 10, 0.05)]));
    c.teleport(0, 0, 0);
    for (let i = 0; i < 20; i++) c.update(0.5, { forward: 1, strafe: 0, run: true }, YAW_NORTH);   // mỗi khung đi 2,75 m
    expect(c.z).toBeGreaterThan(-5 + 0.05);
    expect(c.z).toBeLessThan(-4.5);
  });

  it('trượt dọc tường thay vì đứng khựng', () => {
    const c = new PlayerController(nav([box(0, -3, 10, 0.2)]));
    c.teleport(0, -2, 0);
    for (let i = 0; i < 60; i++) c.update(1 / 60, { forward: 1, strafe: 1, run: false }, YAW_NORTH);
    expect(c.x).toBeGreaterThan(1.5);
    expect(c.z).toBeGreaterThan(-3 + 0.2);
  });

  it('không bước ra ngoài sàn; bậc thấp thì bước lên, bục cao thì không', () => {
    const c = new PlayerController(nav());
    c.teleport(0, 0, 0);
    expect(walk(c, [0, 30])).toBe(false);
    expect(c.z).toBeLessThanOrEqual(20);
    expect(walk(c, [0, -14])).toBe(true);
    for (let i = 0; i < 30; i++) c.update(1 / 60, null, 0);
    expect(c.y).toBeCloseTo(0.15, 3);
    expect(walk(c, [18, -14], { maxSeconds: 15 })).toBe(false);
    expect(c.x).toBeLessThanOrEqual(15);
  });

  it('teleport bám sàn và đặt lại trạng thái', () => {
    const c = new PlayerController(nav());
    c.teleport(0, -15, 1.2);
    expect([c.y, c.facing, c.state]).toEqual([0.15, 1.2, 'idle']);
  });

  it('quay mặt dần về hướng đi', () => {
    const c = new PlayerController(nav());
    c.teleport(0, 0, 0);       // đang nhìn về +z
    c.update(1 / 60, { forward: 1, strafe: 0, run: false }, YAW_NORTH);
    expect(Math.abs(c.facing)).toBeGreaterThan(0.1);
    for (let i = 0; i < 90; i++) c.update(1 / 60, { forward: 1, strafe: 0, run: false }, YAW_NORTH);
    expect(Math.abs(Math.abs(c.facing) - Math.PI)).toBeLessThan(0.02);
  });
});
