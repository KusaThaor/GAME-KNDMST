/**
 * N-04 — World Extras + điểm gắn đồ trang trí (dressing) + bầu không khí (atmosphere, bản khung).
 */
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { addDaylight } from '../../../src/render/stage';
import { createAtmosphere } from '../../../src/world/atmosphere';
import { collectSets, DRESSING_SETS, mountDressing, type DressingCtx, type DressingSet } from '../../../src/world/dressing';
import { DEFAULT_DECOR, LIGHTING_PRESETS } from '../../../src/world/variants';
import { World } from '../../../src/world/world';
import { THCS } from './helpers';

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
    expect(DRESSING_SETS.every((s) => typeof s.id === 'string' && s.id)).toBe(true);
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
