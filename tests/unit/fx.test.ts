import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createFx } from '../../src/render/fx';

describe('lớp hiệu ứng hạt (three.quarks)', () => {
  it('bụi nắng sinh hạt, cập nhật được và dọn sạch', () => {
    const scene = new THREE.Scene();
    const fx = createFx(scene);
    const motes = fx.addSunMotes({ rate: 20 });
    for (let i = 0; i < 90; i++) fx.update(1 / 30);
    expect(motes.system.particleNum).toBeGreaterThan(0);
    // hạt không được nhận viền nét vẽ (OutlineEffect)
    expect((motes.system.material as THREE.Material).userData.outlineParameters?.visible).toBe(false);
    motes.setRate(0);
    fx.dispose();
    expect(scene.children.includes(fx.batch)).toBe(false);
  });
});
