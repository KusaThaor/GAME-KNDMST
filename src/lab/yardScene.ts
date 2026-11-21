import * as THREE from 'three';
import { createStage, addDaylight } from '../render/stage';
import { buildYardCorner } from '../world/school/yardCorner';
import { buildCharacter } from '../actors/character/build';
import { CharacterAnimator, type Motion } from '../actors/character/animate';
import type { CharacterId, Grade } from '../actors/character/presets';
import { mountHud } from '../ui/Hud';
import { exposeLab } from './labHooks';
import { createFx, type SunMotes } from '../render/fx';
import { cameraGlide } from '../ui/motion';
import { loadProp } from '../render/assets';

/**
 * Cảnh thử: nhóm năm đứa dưới gốc phượng, sáng tháng 9/2012 (Ch1). Camera thứ ba sau lưng Player.
 * ?lab=yard&view=third|wide&grade=6|9&hud=1&t=1.5
 * Thử nghiệm S2: &fx=dust (bụi nắng, three.quarks) · &intro=1 (camera lướt vào, GSAP) · &tweak=1 (bảng chỉnh, Tweakpane)
 *   &asset=desk (bàn học dựng bằng Blender → GLB, kiểm tra quy trình asset)
 */
export function runYardScene(container: HTMLElement, params: URLSearchParams) {
  const grade = (Number(params.get('grade')) === 9 ? 9 : 6) as Grade;
  const view = params.get('view') ?? 'third';
  const stage = createStage(container, { preserve: true, fov: view === 'wide' ? 42 : 50 });
  const { scene, camera } = stage;
  scene.fog = new THREE.Fog('#e6eef0', 45, 140);
  const { hemi, sun } = addDaylight(scene, { sun: new THREE.Vector3(-14, 22, 12), shadowSize: 22 });
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

  // Camera: tuỳ chọn góc nhìn phục vụ kiểm tra và chụp ảnh map chuẩn ảnh ref
  const widePos = new THREE.Vector3(13, 13, 22), wideLook = new THREE.Vector3(-1.5, 1.5, -3);
  if (view === 'wide') {
    camera.position.copy(widePos);
    camera.lookAt(wideLook);
  } else if (view === 'diorama' || view === 'ref') {
    // Góc nhìn chính diện từ trên cao chuẩn xác như bức ảnh reference
    camera.position.set(0, 48, 52);
    camera.lookAt(new THREE.Vector3(0, 0, -1.5));
  } else if (view === 'aerial' || view === 'overview') {
    camera.position.set(0, 68, 52);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  } else if (view === 'iso') {
    // Góc nhìn isometric 3/4 từ phía trước bên phải
    camera.position.set(32, 38, 44);
    camera.lookAt(new THREE.Vector3(-4, 0, -2));
  } else if (view === 'street') {
    // Đứng tại ngã ba nhìn thẳng trục đường chính lên cổng trường
    camera.position.set(0, 3.5, 17);
    camera.lookAt(new THREE.Vector3(0, 2.2, -14));
  } else if (view === 'taphoa') {
    // Cận cảnh tiệm Tạp Hóa (kệ hàng, TV, ghế đỏ, mái hiên)
    camera.position.set(-11.0, 1.9, 11.0);
    camera.lookAt(new THREE.Vector3(-11.0, 1.7, 3.5));
  } else if (view === 'net') {
    // Cận cảnh Quán Net (dàn máy tính, màn hình vi tính, bảng hiệu)
    camera.position.set(11.0, 1.9, 11.0);
    camera.lookAt(new THREE.Vector3(11.0, 1.7, 3.5));
  } else if (view === 'gazebo') {
    // Cận cảnh chòi gỗ góc sân trường bên trái
    camera.position.set(-16.0, 5.5, -18.0);
    camera.lookAt(new THREE.Vector3(-24.5, 1.5, -25.5));
  } else {
    const fwd = new THREE.Vector3(Math.sin(player.face), 0, Math.cos(player.face));
    const pp = playerRig.root.position;
    const thirdPos = pp.clone().addScaledVector(fwd, -5.5).add(new THREE.Vector3(0, 3.6, 0));
    const thirdLook = pp.clone().addScaledVector(fwd, 2.6).add(new THREE.Vector3(0, 0.9, 0));
    camera.position.copy(thirdPos);
    camera.lookAt(thirdLook);
    // Thử nghiệm: mở cảnh bằng cú lướt từ toàn cảnh về sau lưng Player
    if (params.get('intro') === '1' && !params.has('t')) {
      cameraGlide(camera, thirdPos, thirdLook, { from: widePos, fromLook: wideLook, duration: 2.2 });
    }
  }

  // Thử nghiệm: bụi nắng quanh gốc phượng (Ch1 tháng 9 → không dùng hoa phượng rơi)
  const fx = params.get('fx') === 'dust' ? createFx(scene) : null;
  let motes: SunMotes | undefined;
  if (fx) motes = fx.addSunMotes({ center: new THREE.Vector3(p.x + 1.5, 0, p.z + 2.5), width: 12, depth: 9, height: 3 });

  // Thử nghiệm quy trình Blender → GLB: đặt bàn học mẫu cạnh nhóm bạn
  const assetReady = params.get('asset') === 'desk'
    ? loadProp(`${import.meta.env.BASE_URL}assets/props/prp_desk_2seat.glb`).then((desk) => {
      desk.position.set(p.x + 4.6, 0, p.z + 3.2);
      desk.rotation.y = -0.5;
      scene.add(desk);
      stage.render();
    })
    : Promise.resolve();

  if (params.get('tweak') === '1') {
    void import('./tweaks').then(({ mountTweaks }) => mountTweaks({ stage, hemi, sun, motes }));
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

  const setTime = (t: number) => { actors.forEach((a, i) => a.pose(t + i * 0.21)); yard.update(t); fx?.update(1 / 60); stage.render(); };
  if (params.has('t')) setTime(Number(params.get('t')));
  else stage.start((dt, t) => { actors.forEach((a) => a.update(dt)); yard.update(t); fx?.update(dt); });
  exposeLab(stage, { setTime }, assetReady);
}
