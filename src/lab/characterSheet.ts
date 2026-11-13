import * as THREE from 'three';
import { createStage, addDaylight } from '../render/stage';
import { toon } from '../render/materials';
import { buildCharacter, type CharacterRig } from '../actors/character/build';
import { CharacterAnimator, type Motion } from '../actors/character/animate';
import { CHARACTERS, FRIENDS, PLAYER_LOOKS, type Grade } from '../actors/character/presets';
import { exposeLab } from './labHooks';

/**
 * Bảng nhân vật cho spike S1: 4 bạn + 2 ngoại hình Player, lớp 6 hoặc lớp 9.
 * ?lab=sheet&grade=6|9&view=front|back|side&motion=idle|walk|mix
 */
export function runCharacterSheet(container: HTMLElement, params: URLSearchParams) {
  const grade = (Number(params.get('grade')) === 9 ? 9 : 6) as Grade;
  const view = params.get('view') ?? 'front';
  const motionParam = params.get('motion') ?? 'idle';
  const stage = createStage(container, { preserve: true, fov: 26 });
  const { scene, camera } = stage;
  scene.background = new THREE.Color('#f1e6d1');
  scene.fog = new THREE.Fog('#f1e6d1', 12, 30);
  addDaylight(scene, { sun: new THREE.Vector3(-4, 9, 8), shadowSize: 6 });

  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 48), toon('#efe2c9', { outline: false }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const ids = [...FRIENDS, ...PLAYER_LOOKS];
  const mix: Motion[] = ['cheer', 'idle', 'talk', 'pose_wave', 'pose_peace', 'pose_tada'];
  const spacing = 1.08;
  const yaw = view === 'back' ? Math.PI + 0.3 : view === 'side' ? Math.PI / 2 : 0.3;
  const actors: { rig: CharacterRig; anim: CharacterAnimator }[] = ids.map((id, i) => {
    const rig = buildCharacter(id, grade);
    rig.root.position.set((i - (ids.length - 1) / 2) * spacing, 0, 0);
    rig.root.rotation.y = yaw;
    scene.add(rig.root);
    const anim = new CharacterAnimator(rig, i);
    const m: Motion = motionParam === 'mix' ? mix[i] : (motionParam as Motion);
    anim.setMotion(m);
    if (m !== 'walk' && m !== 'run') anim.speed = 0;
    return { rig, anim };
  });

  const tall = grade === 9 ? 1.95 : 1.7;
  camera.position.set(0, tall * 0.7, 7.6);
  camera.lookAt(0, tall * 0.38, 0);

  // nhãn tên dưới chân (HTML, để chữ tiếng Việt sắc nét)
  const labels = actors.map(({ rig }) => {
    const el = document.createElement('div');
    el.className = 'sheet-label';
    const def = rig.def;
    const isPlayer = def.id.startsWith('player');
    el.innerHTML = isPlayer
      ? `<b style="color:${def.uiColor}">Player · ngoại hình ${def.id === 'player1' ? 1 : 2}</b><span>${def.id === 'player1' ? 'tóc ngắn' : 'tóc dài buộc'}</span>`
      : `<b style="color:${def.uiColor}">${def.name}</b><span>“${def.nickname}”</span>`;
    container.appendChild(el);
    return el;
  });
  const title = document.createElement('div');
  title.className = 'sheet-title';
  title.innerHTML = `<b>Bảng nhân vật — ${grade === 6 ? 'Lớp 6 · năm học 2012–2013' : 'Lớp 9 · năm học 2015–2016'}</b>
    <span>Spike S1 · dựng bằng code · góc ${view === 'back' ? 'sau' : view === 'side' ? 'nghiêng' : 'trước'} · build ${__BUILD_VERSION__}</span>`;
  container.appendChild(title);

  const placeLabels = () => {
    const v = new THREE.Vector3();
    actors.forEach(({ rig }, i) => {
      v.set(rig.root.position.x, -0.12, 0.4).project(camera);
      const el = labels[i];
      el.style.left = `${((v.x + 1) / 2) * container.clientWidth}px`;
      el.style.top = `${((1 - v.y) / 2) * container.clientHeight}px`;
    });
  };

  let t0 = 0;
  const setTime = (t: number) => { actors.forEach(({ anim }, i) => anim.pose(t + i * 0.13)); placeLabels(); stage.render(); };
  if (params.has('t')) {
    t0 = Number(params.get('t'));
    setTime(t0);
  } else {
    stage.start((dt) => { actors.forEach(({ anim }) => anim.update(dt)); placeLabels(); });
  }
  exposeLab(stage, { setTime });
}

void CHARACTERS;
