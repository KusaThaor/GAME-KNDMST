import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { mergeStatic } from '../../../render/merge';

/**
 * PX-12 · Quả cầu đá kiểng học sinh Việt Nam.
 * Gốc min.y = 0, ngân sách ≤ 100 tam giác.
 */
export function makeFootbag(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'footbag';

  // Đế cao su tròn đệm nhiều lớp
  const baseH = 0.016;
  const baseR = 0.022;
  const baseGeo = new THREE.CylinderGeometry(baseR, baseR, baseH, 8);
  const base = new THREE.Mesh(baseGeo, toon('#2b2d42'));
  base.position.set(0, baseH / 2, 0);
  base.receiveShadow = true;
  root.add(base);

  // Ống cắm lông nhựa
  const stemH = 0.035;
  const stemR = 0.005;
  const stemGeo = new THREE.CylinderGeometry(stemR, stemR, stemH, 6);
  const stem = new THREE.Mesh(stemGeo, toon('#edf2f4'));
  stem.position.set(0, baseH + stemH / 2, 0);
  root.add(stem);

  // 4 cánh lông gà / nhựa xòe 4 hướng
  const featherH = 0.09;
  const featherR = 0.014;
  const colors = ['#e63946', '#ffb703', '#52b788', '#9d4edd'];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const fGeo = new THREE.ConeGeometry(featherR, featherH, 4);
    const feather = new THREE.Mesh(fGeo, toon(colors[i]));
    feather.position.set(Math.cos(angle) * 0.008, baseH + stemH + featherH * 0.42, Math.sin(angle) * 0.008);
    feather.rotation.z = Math.cos(angle) * 0.18;
    feather.rotation.x = -Math.sin(angle) * 0.18;
    root.add(feather);
  }

  return root;
}

/**
 * PX-12 · Bụi cây cảnh thấp mép sân gần vòng đá cầu.
 * Gốc min.y = 0, ngân sách ≤ 200 tam giác.
 */
export function makeShuttlecockBush(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'shuttlecockBush';

  const greens = [PAL.leaf, PAL.leaf2, PAL.leaf3];
  const blobs: [number, number, number, number, number][] = [
    [0, 0.28, 0, 0.42, 0],
    [-0.22, 0.22, 0.1, 0.32, 1],
    [0.24, 0.24, -0.08, 0.35, 2],
    [0.08, 0.18, 0.22, 0.28, 0],
  ];

  for (const [x, y, z, r, ci] of blobs) {
    const geo = new THREE.IcosahedronGeometry(r, 0);
    const m = new THREE.Mesh(geo, toon(greens[ci]));
    m.scale.set(1.15, 0.72, 1.05);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    root.add(m);
  }

  // Đảm bảo đáy chạm đất y = 0
  const box = new THREE.Box3().setFromObject(root);
  for (const child of root.children) {
    child.position.y -= box.min.y;
  }

  return root;
}

/**
 * PX-12 · Cụm quả cầu rơi cạnh bụi cây sân trường.
 * Gốc min.y = 0, ngân sách ≤ 400 tam giác.
 */
export function makeFootbagSpot(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'footbagSpot';

  const bush = makeShuttlecockBush();
  root.add(bush);

  const ball = makeFootbag();
  ball.position.set(0.38, 0, 0.25);
  ball.rotation.z = 0.25;
  root.add(ball);

  const merged = mergeStatic(root);
  const box = new THREE.Box3().setFromObject(merged);
  merged.position.y = -box.min.y;
  return merged;
}
