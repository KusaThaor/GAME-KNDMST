import * as THREE from 'three';
import { createStage, addDaylight } from '../render/stage';
import { exposeLab } from './labHooks';
import {
  loadClassroomChalkboard,
  loadSchoolyardFlamboyantTree,
  loadSchoolyardTropicalTree
} from '../world/school/propsGlb';
import { box, bench, planterRing, PAL } from '../world/school/props';
import { buildCharacter } from '../actors/character/build';
import { CharacterAnimator } from '../actors/character/animate';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Scene kiểm tra và nghiệm thu Asset 3D: Cây xanh sân trường & Bảng viết phấn lớp học
 * Phong cách Cozy Stylized 3D / Pixar-style khớp 100% Concept Art (master_schoolyard.png & in_class.png)
 * ?lab=assets&view=wide|chalkboard|trees&t=1.0
 */
export async function runAssetsPreviewScene(container: HTMLElement, params: URLSearchParams) {
  const view = params.get('view') ?? 'wide';
  const stage = createStage(container, { preserve: true, fov: view === 'wide' ? 42 : 46 });
  const { scene, camera } = stage;

  scene.fog = new THREE.Fog('#e7eff2', 40, 140);

  // Ánh sáng ban ngày vàng ấm rực rỡ học đường miền Nam
  const { sun } = addDaylight(scene, { sun: new THREE.Vector3(-14, 22, 16), shadowSize: 24 });
  sun.target.position.set(0, 0, 0);

  // 1. Mặt sàn triển lãm: Lớp học & Sân trường
  const floorGroup = new THREE.Group();
  floorGroup.name = 'Preview_Floors';

  // Nền lớp học
  const classFloor = box(7.5, 0.2, 7.0, '#e8e2d5');
  classFloor.position.set(-5.0, -0.1, 0);
  classFloor.receiveShadow = true;
  floorGroup.add(classFloor);

  // Tường lớp học vàng kem
  const classWall = box(7.5, 4.0, 0.25, PAL.wallCream);
  classWall.position.set(-5.0, 2.0, -3.4);
  classWall.castShadow = true;
  classWall.receiveShadow = true;
  floorGroup.add(classWall);

  // Chân tường
  const wallBase = box(7.5, 0.25, 0.28, PAL.wallYellow);
  wallBase.position.set(-5.0, 0.125, -3.38);
  floorGroup.add(wallBase);

  // Bục giảng gỗ lớp học
  const podium = box(3.2, 0.16, 1.4, '#ba7b3b', 0.02);
  podium.position.set(-5.0, 0.08, -2.5);
  podium.castShadow = true;
  podium.receiveShadow = true;
  floorGroup.add(podium);

  // Nền sân trường (xi măng rộng rãi)
  const yardGround = box(18.0, 0.2, 16.0, '#cfc8ba');
  yardGround.position.set(7.5, -0.1, 0);
  yardGround.receiveShadow = true;
  floorGroup.add(yardGround);

  scene.add(floorGroup);

  // 2. Nạp Bảng viết phấn xanh lớp học (classroom_chalkboard.glb)
  try {
    const chalkboard = await loadClassroomChalkboard({
      position: new THREE.Vector3(-5.0, 1.25, -3.085),
    });
    scene.add(chalkboard);
  } catch (err) {
    console.error('Lỗi nạp chalkboard GLB:', err);
  }

  // Nạp Bàn ghế học sinh THCS đối chiếu tỉ lệ trong lớp
  try {
    const loader = new GLTFLoader();
    loader.load('/assets/props/school_desk.glb', (gltf) => {
      const desk = gltf.scene;
      desk.position.set(-5.0, 0, -0.9);
      desk.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
      scene.add(desk);
    });
  } catch (err) {
    console.warn('Không tìm thấy school_desk.glb:', err);
  }

  // 3. Nạp 2 Cây xanh sân trường chuẩn Concept Art master_schoolyard.png
  // Cây 1: Cây phượng vĩ nở hoa vòm ô rợp mát
  try {
    const phuongTree = await loadSchoolyardFlamboyantTree({
      position: new THREE.Vector3(4.5, 0, -2.0),
      rotationY: 0.2,
      scale: 1.05
    });
    scene.add(phuongTree);
    const ring1 = planterRing(1.6, 0.45);
    ring1.position.set(4.5, 0, -2.0);
    scene.add(ring1);
  } catch (err) {
    console.error('Lỗi nạp cây phượng vĩ:', err);
  }

  // Cây 2: Cây bàng phân tầng đặc trưng
  try {
    const bangTree = await loadSchoolyardTropicalTree({
      position: new THREE.Vector3(11.5, 0, 1.5),
      rotationY: -0.5,
      scale: 1.05
    });
    scene.add(bangTree);
    const ring2 = planterRing(1.3, 0.40);
    ring2.position.set(11.5, 0, 1.5);
    scene.add(ring2);
  } catch (err) {
    console.error('Lỗi nạp cây bàng:', err);
  }

  // Ghế đá granito sân trường dưới tán cây phượng
  const schoolBench = bench();
  schoolBench.position.set(6.8, 0, -0.8);
  schoolBench.rotation.y = -0.4;
  scene.add(schoolBench);

  // 4. Nhân vật học sinh làm thước đo tỉ lệ
  const studentRig = buildCharacter('duc', 6);
  studentRig.root.position.set(-3.5, 0, -1.8);
  studentRig.root.rotation.y = 0.4;
  scene.add(studentRig.root);
  const studentAnim = new CharacterAnimator(studentRig, 0);
  studentAnim.setMotion('talk');

  const studentYardRig = buildCharacter('ha', 6);
  studentYardRig.root.position.set(5.5, 0, 0.6);
  studentYardRig.root.rotation.y = -1.1;
  scene.add(studentYardRig.root);
  const studentYardAnim = new CharacterAnimator(studentYardRig, 1);
  studentYardAnim.setMotion('pose_wave');

  // 5. Thiết lập Camera tùy theo góc nhìn
  if (view === 'chalkboard') {
    camera.position.set(-5.0, 1.95, 2.0);
    camera.lookAt(-5.0, 1.75, -3.2);
  } else if (view === 'trees') {
    camera.position.set(5.5, 4.2, 11.5);
    camera.lookAt(8.0, 3.0, -0.5);
  } else {
    // Góc toàn cảnh rộng
    camera.position.set(2.5, 7.5, 16.5);
    camera.lookAt(3.0, 2.2, -1.0);
  }

  const setTime = (t: number) => {
    studentAnim.pose(t);
    studentYardAnim.pose(t + 0.3);
    stage.render();
  };

  if (params.has('t')) {
    setTime(Number(params.get('t')));
  } else {
    stage.start((dt) => {
      studentAnim.update(dt);
      studentYardAnim.update(dt);
    });
  }

  exposeLab(stage, { setTime });
}
