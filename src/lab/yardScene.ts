import * as THREE from 'three';
import { createStage, addDaylight } from '../render/stage';
import { buildYardCorner } from '../world/school/yardCorner';
import { buildCharacter } from '../actors/character/build';
import { CharacterAnimator, type Motion } from '../actors/character/animate';
import type { CharacterId, Grade } from '../actors/character/presets';
import { mountHud } from '../ui/Hud';
import { exposeLab } from './labHooks';

/**
 * Cảnh thử: nhóm năm đứa dưới gốc phượng, sáng tháng 9/2012 (Ch1). Camera thứ ba sau lưng Player.
 * ?lab=yard&view=third|wide&grade=6|9&hud=1&t=1.5
 */
export function runYardScene(container: HTMLElement, params: URLSearchParams) {
  const grade = (Number(params.get('grade')) === 9 ? 9 : 6) as Grade;
  const view = params.get('view') ?? 'third';
  const stage = createStage(container, { preserve: true, fov: view === 'wide' ? 42 : 50 });
  const { scene, camera } = stage;
  scene.fog = new THREE.Fog('#e6eef0', 45, 140);
  const { sun } = addDaylight(scene, { sun: new THREE.Vector3(-14, 22, 12), shadowSize: 22 });
  sun.target.position.set(-2, 0, -2);

  const yard = buildYardCorner();
  scene.add(yard.root);

  const p = yard.anchors.phuong;
  const cast: { id: CharacterId; pos: [number, number]; face: number; motion: Motion }[] = [
    { id: 'duc', pos: [p.x - 0.4, p.z + 2.2], face: 0.5, motion: 'cheer' },
    { id: 'quan', pos: [p.x + 1.3, p.z + 2.5], face: 0.1, motion: 'idle' },
    { id: 'chau', pos: [p.x - 1.7, p.z + 1.9], face: 0.75, motion: 'talk' },
    { id: 'ha', pos: [p.x + 2.2, p.z + 1.5], face: -0.3, motion: 'pose_wave' },
  ];
  const playerId: CharacterId = params.get('player') === '2' ? 'player2' : 'player1';
  const player = { id: playerId, pos: [p.x + 3.4, p.z + 6.3] as [number, number], face: Math.PI + 0.55, motion: 'walk' as Motion };

  const actors = [...cast, player].map((c, i) => {
    const rig = buildCharacter(c.id, grade);
    rig.root.position.set(c.pos[0], 0, c.pos[1]);
    rig.root.rotation.y = c.face;
    scene.add(rig.root);
    const anim = new CharacterAnimator(rig, i);
    anim.setMotion(c.motion);
    if (c.motion !== 'walk') anim.speed = 0;
    return anim;
  });
  const playerRig = actors[actors.length - 1].rig;

  // Camera thứ ba: sau lưng Player 5,5 m, nhìn chéo xuống ~28° (GDD 3)
  if (view === 'wide') {
    camera.position.set(13, 13, 22);
    camera.lookAt(-1.5, 1.5, -3);
  } else {
    const fwd = new THREE.Vector3(Math.sin(player.face), 0, Math.cos(player.face));
    const pp = playerRig.root.position;
    camera.position.copy(pp).addScaledVector(fwd, -5.5).add(new THREE.Vector3(0, 3.6, 0));
    camera.lookAt(pp.clone().addScaledVector(fwd, 2.6).add(new THREE.Vector3(0, 0.9, 0)));
  }

  if (params.get('hud') !== '0') {
    const hudEl = document.createElement('div');
    container.appendChild(hudEl);
    mountHud(hudEl).set({
      objective: 'Gom đủ năm đứa dưới gốc phượng',
      zone: 'Sân trường',
      prompt: params.get('dialogue') === '1' ? undefined : { key: 'E', text: 'Nói chuyện với Hạ' },
      dialogue: params.get('dialogue') !== '1' ? undefined : {
        who: 'Hạ', color: '#e0608f',
        text: 'Lâm ơi, lại đây nè! Đứng dưới gốc phượng cho mát, tụi tớ chờ cậu nãy giờ á.',
      },
    });
  }

  const setTime = (t: number) => { actors.forEach((a, i) => a.pose(t + i * 0.21)); yard.update(t); stage.render(); };
  if (params.has('t')) setTime(Number(params.get('t')));
  else stage.start((dt, t) => { actors.forEach((a) => a.update(dt)); yard.update(t); });
  exposeLab(stage, { setTime });
}
