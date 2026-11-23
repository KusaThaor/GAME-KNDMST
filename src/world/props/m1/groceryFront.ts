import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { safeCanvasTexture } from './texHelper';
import { mergeStatic } from '../../../render/merge';

/**
 * Tạo một chiếc ghế đẩu nhựa Việt Nam (mặt vuông bo góc, 4 chân choãi).
 * Kích thước: 0.26 × 0.26m, cao 0.24m.
 */
function makePlasticStool(color: string): THREE.Group {
  const g = new THREE.Group();
  const topH = 0.02;
  const w = 0.26;
  const legH = 0.22;
  const stoolMat = toon(color);

  // Mặt ghế
  const topGeo = new THREE.BoxGeometry(w, topH, w);
  const top = new THREE.Mesh(topGeo, stoolMat);
  top.position.set(0, legH + topH / 2, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  g.add(top);

  // 4 chân ghế
  const legW = 0.024;
  const legPositions: [number, number, number, number][] = [
    [-w * 0.38, -w * 0.38, 0.06, 0.06],
    [w * 0.38, -w * 0.38, 0.06, -0.06],
    [-w * 0.38, w * 0.38, -0.06, 0.06],
    [w * 0.38, w * 0.38, -0.06, -0.06],
  ];

  for (const [lx, lz, rx, rz] of legPositions) {
    const legGeo = new THREE.BoxGeometry(legW, legH, legW);
    const leg = new THREE.Mesh(legGeo, stoolMat);
    leg.position.set(lx, legH / 2, lz);
    leg.rotation.set(rx, 0, rz);
    leg.castShadow = true;
    leg.receiveShadow = true;
    g.add(leg);
  }

  return g;
}

/**
 * Gói mì tôm Miliket / Hảo Hảo giấy kraft.
 */
function makeNoodlePack(opened = false): THREE.Group {
  const g = new THREE.Group();
  const w = 0.12;
  const h = 0.035;
  const d = 0.09;

  const tex = safeCanvasTexture(128, 128, (ctx) => {
    ctx.fillStyle = '#f3c68f'; // màu giấy kraft mì tôm xưa
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#b22222';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 120, 120);

    ctx.fillStyle = '#b22222';
    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MÌ TÔM', 64, 45);

    // Hình 2 con tôm đỏ
    ctx.beginPath();
    ctx.arc(48, 75, 12, 0, Math.PI);
    ctx.arc(80, 75, 12, 0, Math.PI);
    ctx.fill();
  });

  const mat = new THREE.MeshToonMaterial({ map: tex });
  mat.userData.outlineParameters = { visible: false };

  const geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(0, h / 2, 0);
  m.receiveShadow = true;
  g.add(m);

  if (opened) {
    // Vụn mì rơi nhẹ
    const crumbMat = toon('#eed7a1');
    for (let i = 0; i < 4; i++) {
      const crumbGeo = new THREE.BoxGeometry(0.01, 0.008, 0.01);
      const crumb = new THREE.Mesh(crumbGeo, crumbMat);
      crumb.position.set(w * 0.4 + i * 0.015, 0.004, (i % 2) * 0.02 - 0.01);
      g.add(crumb);
    }
  }

  return g;
}

/**
 * PX-14 · Khu vực trước tiệm tạp hóa cổng trường:
 * Bậc thềm bê tông, 3 ghế nhựa (2 trên thềm, 1 dưới đất), kệ mì tôm và các gói mì.
 * Gốc min.y = 0, ngân sách ≤ 1.200 tam giác.
 */
export function makeGroceryFront(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'groceryFront';

  // 1. Bậc thềm xi măng
  const stepW = 2.4;
  const stepH = 0.16;
  const stepD = 0.9;
  const stepGeo = new THREE.BoxGeometry(stepW, stepH, stepD);
  const step = new THREE.Mesh(stepGeo, toon(PAL.concrete));
  step.position.set(0, stepH / 2, 0);
  step.receiveShadow = true;
  root.add(step);

  // 2. Kệ trưng bày mì tôm bằng gỗ
  const shelfW = 0.85;
  const shelfH = 0.7;
  const shelfD = 0.28;
  const shelfMat = toon(PAL.trunkDark);

  const shelfBack = new THREE.Mesh(new THREE.BoxGeometry(shelfW, shelfH, 0.02), shelfMat);
  shelfBack.position.set(-stepW * 0.28, stepH + shelfH / 2, -stepD * 0.35);
  shelfBack.castShadow = true;
  root.add(shelfBack);

  for (const sy of [0.02, shelfH * 0.45, shelfH * 0.9]) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(shelfW, 0.02, shelfD), shelfMat);
    board.position.set(-stepW * 0.28, stepH + sy, -stepD * 0.35 + shelfD / 2);
    board.castShadow = true;
    root.add(board);

    // Gói mì xếp trên các ngăn
    for (let k = -2; k <= 2; k++) {
      const pack = makeNoodlePack(false);
      pack.position.set(-stepW * 0.28 + k * 0.15, stepH + sy + 0.01, -stepD * 0.35 + shelfD * 0.5);
      root.add(pack);
    }
  }

  // 3. 3 chiếc ghế nhựa (đỏ, xanh, đỏ)
  // Ghế 1 (đỏ): trên bậc thềm bên phải
  const stool1 = makePlasticStool('#d90429');
  stool1.position.set(0.4, stepH, 0.1);
  stool1.rotation.y = 0.2;
  root.add(stool1);

  // Gói mì bóp ăn dở trên ghế 1
  const openedPack = makeNoodlePack(true);
  openedPack.position.set(0.4, stepH + 0.25, 0.1);
  openedPack.rotation.y = -0.3;
  root.add(openedPack);

  // Ghế 2 (xanh dương): trên bậc thềm giữa
  const stool2 = makePlasticStool('#1d3557');
  stool2.position.set(-0.15, stepH, 0.15);
  stool2.rotation.y = -0.15;
  root.add(stool2);

  // Ghế 3 (đỏ): dưới mặt đất trước bậc thềm (y = 0)
  const stool3 = makePlasticStool('#d90429');
  stool3.position.set(0.15, 0, stepD * 0.65);
  stool3.rotation.y = 0.35;
  root.add(stool3);

  // Ly nhựa trà đá đặt cạnh ghế 3
  const cupGeo = new THREE.CylinderGeometry(0.03, 0.022, 0.08, 8);
  const cup = new THREE.Mesh(cupGeo, toon('#edf2f4', { transparent: true, opacity: 0.7 }));
  cup.position.set(0.4, 0.04, stepD * 0.65);
  root.add(cup);

  return mergeStatic(root);
}
