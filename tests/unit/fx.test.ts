import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createFx } from '../../src/render/fx';

import { EventBus } from '../../src/core/eventBus';
import { day } from '../../src/content/days/d_g07_03';
import { createAtmosphere } from '../../src/world/atmosphere';
import { skyDome, starField, rainbowArc } from '../../src/world/sky';
import { codeRigAdapter, checkAvatarHeight } from '../../src/actors/player/rigAdapter';

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

it('mưa bám camera, rơi xuống và giữ dưới 1.500 giọt khi rate quá cao', () => {
  const scene = new THREE.Scene(), fx = createFx(scene);
  const rain = fx.addRain({ rate: 10000, area: 16 });
  rain.root.position.set(80, 3, 25);
  const system = rain.systems[0];
  for (let i = 0; i < 100; i++) {
    fx.update(0.1);
    expect(system.particleNum).toBeLessThanOrEqual(1500);
  }
  expect(system.particleNum).toBeGreaterThan(1000);
  expect(system.worldSpace).toBe(false);
  expect(system.particles[0].velocity.y).toBeLessThan(0);
  expect(Math.abs(system.particles[0].position.z)).toBeLessThanOrEqual(8);
  rain.setActive(false);
  fx.update(1);
  expect(system.particleNum).toBe(0);
  fx.dispose();
  expect(scene.children).toHaveLength(0);
});

it('lửa trại có ngọn lửa, tàn lửa, ánh sáng dao động và dọn cả batch', () => {
  const scene = new THREE.Scene(), fx = createFx(scene);
  const fire = fx.addCampfire(new THREE.Vector3(4, 0, 2));
  for (let i = 0; i < 30; i++) fx.update(1 / 30);
  expect(fire.systems.map(s => s.particleNum > 0)).toEqual([true, true]);
  const lamp = fire.root.getObjectByProperty('type', 'PointLight') as THREE.PointLight;
  const old = lamp.intensity;
  fx.update(0.1);
  expect(lamp.intensity).not.toBe(old);
  for (const mesh of fx.batch.batches) expect((mesh.material as THREE.Material).userData.outlineParameters.visible).toBe(false);
  fx.dispose();
  expect(fx.batch.children).toHaveLength(0);
  expect(scene.children).toHaveLength(0);
});

it('Trang 4 chuyển mưa sang cầu vồng theo step_activated; rời cảnh hủy đăng ký', () => {
  const scene = new THREE.Scene(), fx = createFx(scene), bus = new EventBus(), camera = new THREE.PerspectiveCamera();
  const sky = skyDome();
  scene.add(sky); scene.fog = new THREE.Fog(0xffffff);
  const atm = createAtmosphere(scene, { sun: new THREE.DirectionalLight(), hemi: new THREE.HemisphereLight(),
    fx, camera, bus, sky, day, stepId: 'q_m1_main_05.s06' }, 'late_afternoon');
  camera.position.set(30, 2, -5); atm.update(1 / 60);
  const rain = scene.getObjectByName('rain')!;
  expect(rain.position.toArray()).toEqual(camera.position.toArray());
  const activate = (step_id: string) => bus.emit('step_activated', { step_id, quest_id: 'q_m1_main_05', kind: 'cutscene', is_replay: false, resumed: false });
  const before = sky.material.uniforms.zenith.value.clone();
  activate('q_m1_main_05.s07');
  atm.update(0.7);
  expect(sky.material.uniforms.zenith.value.equals(before)).toBe(false);
  expect(rain.visible).toBe(false);
  expect(scene.getObjectByName('rainbow')?.visible).toBe(true);
  atm.set('night_campfire');
  expect(scene.getObjectByName('rainbow')?.visible).toBe(false);
  expect(scene.getObjectByName('stars')?.visible).toBe(true);
  atm.dispose(); fx.dispose();
  activate('q_m1_main_05.s06');
  expect(atm.preset).toBe('night_campfire');
  expect(scene.children).toHaveLength(1);
  expect(scene.children[0]).toBe(sky);
});

it('trời và hạt sao không viền/sương, số sao trong ngân sách; avatar lớp 9 đạt chiều cao', () => {
  const stars = starField(), arc = rainbowArc();
  expect(stars.geometry.attributes.position.count).toBeLessThanOrEqual(400);
  for (const obj of [skyDome(), stars, arc]) {
    expect(obj.material.userData.outlineParameters.visible).toBe(false);
    expect(obj.material.fog).toBe(false);
    obj.geometry.dispose(); obj.material.dispose();
  }
  const avatar = codeRigAdapter.create({ id: 'duc', grade: 9, scarf: false, seed: 4 });
  expect(checkAvatarHeight(avatar, 9).ok).toBe(true);
});
