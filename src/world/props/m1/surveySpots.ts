import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { mergeStatic } from '../../../render/merge';
import { enableShadows, groundAtZero } from '../common/helpers';

/**
 * Điểm 1: Mái che phụ / tấm bạt rách nghiêng tựa cọc gỗ mục.
 * Tọa độ marker: itr.thcs.base_survey_roof [45.3, 0, -32.2].
 * Gốc min.y = 0, ngân sách ≤ 200 tam giác.
 */
export function makeSurveyRoof(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'surveyRoof';

  const postMat = toon(PAL.trunkDark);
  const postH = 1.6;

  // 2 cọc gỗ nghiêng
  for (const sx of [-0.55, 0.55]) {
    const postGeo = new THREE.CylinderGeometry(0.04, 0.045, postH, 8);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(sx, postH / 2, 0);
    post.rotation.z = -sx * 0.1;
    root.add(post);
  }

  // Tấm tôn / bạt che gác nghiêng
  const roofW = 1.4;
  const roofL = 1.3;
  const roofGeo = new THREE.BoxGeometry(roofW, 0.02, roofL);
  const roofMat = toon(PAL.roofDark);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, postH * 0.65, roofL * 0.35);
  roof.rotation.x = -0.55;
  root.add(roof);

  return groundAtZero(enableShadows(mergeStatic(root)));
}

/**
 * Điểm 2: Gốc cây mục to làm chỗ ngồi tự nhiên.
 * Tọa độ marker: itr.thcs.base_survey_stump [41, 0, -25].
 * Gốc min.y = 0, ngân sách ≤ 200 tam giác.
 */
export function makeSurveyStump(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'surveyStump';

  const stumpR = 0.32;
  const stumpH = 0.42;

  // Thân gốc cây đốn ngang
  const stumpGeo = new THREE.CylinderGeometry(stumpR * 0.9, stumpR, stumpH, 10);
  const stumpMat = toon(PAL.trunk);
  const stump = new THREE.Mesh(stumpGeo, stumpMat);
  stump.position.set(0, stumpH / 2, 0);
  root.add(stump);

  // Mặt cắt gốc cây phía trên
  const topGeo = new THREE.CircleGeometry(stumpR * 0.88, 10);
  const topMat = toon('#d4a373');
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.rotation.x = -Math.PI / 2;
  topMesh.position.set(0, stumpH + 0.001, 0);
  root.add(topMesh);

  // 3 rễ cây bò ra mặt đất
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 0.3;
    const rootGeo = new THREE.ConeGeometry(0.08, 0.38, 6);
    const rootMesh = new THREE.Mesh(rootGeo, stumpMat);
    rootMesh.rotation.z = Math.PI / 2;
    rootMesh.rotation.y = angle;
    rootMesh.position.set(Math.cos(angle) * (stumpR + 0.12), 0.04, Math.sin(angle) * (stumpR + 0.12));
    root.add(rootMesh);
  }

  return groundAtZero(enableShadows(mergeStatic(root)));
}

/**
 * Điểm 3: Đống thùng carton cũ xếp chồng.
 * Tọa độ marker: itr.thcs.base_survey_boxes [49.5, 0, -26].
 * Gốc min.y = 0, ngân sách ≤ 200 tam giác.
 */
export function makeSurveyBoxes(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'surveyBoxes';

  const boxMat = toon('#c49a58');
  const tapeMat = toon('#faedcd');

  // Thùng to dưới đáy
  const b1Geo = new THREE.BoxGeometry(0.55, 0.42, 0.48);
  const b1 = new THREE.Mesh(b1Geo, boxMat);
  b1.position.set(0, 0.21, 0);
  root.add(b1);

  // Thùng nhỏ trên thùng to
  const b2Geo = new THREE.BoxGeometry(0.38, 0.32, 0.36);
  const b2 = new THREE.Mesh(b2Geo, boxMat);
  b2.position.set(0.05, 0.42 + 0.16, -0.02);
  b2.rotation.y = 0.25;
  root.add(b2);

  // Thùng bên cạnh tựa vào
  const b3Geo = new THREE.BoxGeometry(0.35, 0.38, 0.40);
  const b3 = new THREE.Mesh(b3Geo, boxMat);
  b3.position.set(0.42, 0.19, 0.08);
  b3.rotation.y = -0.15;
  root.add(b3);

  // Dải băng dính dán nắp thùng
  const tapeGeo = new THREE.BoxGeometry(0.56, 0.005, 0.06);
  const tape = new THREE.Mesh(tapeGeo, tapeMat);
  tape.position.set(0, 0.423, 0);
  root.add(tape);

  return groundAtZero(enableShadows(mergeStatic(root)));
}

/**
 * PX-33 · Cụm 3 điểm khảo sát Căn cứ Bí mật.
 * Gốc min.y = 0, ngân sách ≤ 800 tam giác.
 */
export function makeSurveySpots(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'surveySpots';

  // Gom cả 3 điểm vào 1 cụm theo khoảng cách tương đối
  const roof = makeSurveyRoof();
  roof.position.set(-2.0, 0, 1.2);
  root.add(roof);

  const stump = makeSurveyStump();
  stump.position.set(0, 0, -1.0);
  root.add(stump);

  const boxes = makeSurveyBoxes();
  boxes.position.set(2.2, 0, 0.5);
  root.add(boxes);

  return groundAtZero(root);
}
