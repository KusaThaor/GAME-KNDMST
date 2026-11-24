import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { illegibleLine, safeCanvasTexture } from './texHelper';
import { mergeStatic } from '../../../render/merge';

/**
 * PX-11 · Vở bài tập học sinh (rơi trên sân / cầm tay).
 * Gốc min.y = 0, < 0.3m tắt castShadow, ngân sách ≤ 100 tam giác.
 */
export function makeNotebook(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'notebook';

  const w = 0.16;
  const d = 0.22;
  const totalH = 0.016;

  // Ruột giấy trắng
  const paperGeo = new THREE.BoxGeometry(w * 0.96, totalH * 0.75, d * 0.96);
  const paper = new THREE.Mesh(paperGeo, toon(PAL.trim));
  paper.position.set(0, totalH * 0.45, 0);
  paper.receiveShadow = true;
  root.add(paper);

  // Bìa vở màu xanh / đỏ gạch
  const coverMat = toon(PAL.frame);
  const topCoverGeo = new THREE.BoxGeometry(w, totalH * 0.15, d);
  const topCover = new THREE.Mesh(topCoverGeo, coverMat);
  topCover.position.set(0, totalH - (totalH * 0.15) / 2, 0);
  topCover.receiveShadow = true;
  root.add(topCover);

  const botCover = new THREE.Mesh(topCoverGeo, coverMat);
  botCover.position.set(0, (totalH * 0.15) / 2, 0);
  botCover.receiveShadow = true;
  root.add(botCover);

  // Gáy vở
  const spineGeo = new THREE.BoxGeometry(0.008, totalH, d);
  const spine = new THREE.Mesh(spineGeo, toon(PAL.frameDark));
  spine.position.set(-w / 2 + 0.004, totalH / 2, 0);
  root.add(spine);

  // Nhãn vở dán trên bìa
  const labelTex = safeCanvasTexture(256, 128, (g) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#2b4c38';
    g.lineWidth = 4;
    g.strokeRect(4, 4, 248, 120);
    g.fillStyle = '#1e3d2f';
    g.font = 'bold 20px Nunito, sans-serif';
    g.textAlign = 'center';
    g.fillText('VỞ BÀI TẬP', 128, 42);
    // Dòng tên/lớp viết tay mờ (kịch bản không ghi tên lớp)
    illegibleLine(g, 64, 84, 128, { color: '#1e3d2f', height: 10, seed: 3 });
  });
  const labelMat = new THREE.MeshToonMaterial({ map: labelTex });
  labelMat.userData.outlineParameters = { visible: false };
  const labelGeo = new THREE.PlaneGeometry(0.08, 0.045);
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.rotation.x = -Math.PI / 2;
  label.position.set(0.02, totalH + 0.001, 0.02);
  root.add(label);

  return mergeStatic(root);
}

/**
 * PX-11 · Mẩu giấy gấp tư mật lệnh số 01.
 * Gốc min.y = 0, ngân sách ≤ 50 tam giác.
 */
export function makeCipherPaper(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'cipherPaper';

  const w = 0.09;
  const d = 0.12;
  const h = 0.003;

  const tex = safeCanvasTexture(256, 256, (g) => {
    // Giấy kẻ ô ly học sinh
    g.fillStyle = '#fbf7ee';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#d0e1d4';
    g.lineWidth = 1;
    for (let i = 0; i < 256; i += 20) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
    }
    // Nét gấp đôi
    g.strokeStyle = '#c4bcae';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.stroke();
    g.beginPath(); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();

    // Mật lệnh của Đức vẽ
    g.strokeStyle = '#1d3557';
    g.lineWidth = 3;
    g.strokeRect(25, 25, 80, 80);
    g.beginPath(); g.moveTo(25, 25); g.lineTo(105, 105); g.stroke();

    // Nét bút bi đỏ sửa lỗi của Châu
    g.strokeStyle = '#d62828';
    g.lineWidth = 2.5;
    g.strokeRect(145, 30, 85, 35);
    // Kịch bản: "vài chỗ bị gạch bằng mực đỏ" — chỉ nét gạch, không thêm chữ
    g.beginPath(); g.moveTo(150, 40); g.lineTo(225, 58); g.stroke();
    g.beginPath(); g.moveTo(150, 58); g.lineTo(225, 40); g.stroke();
    g.beginPath(); g.moveTo(40, 170); g.lineTo(120, 176); g.stroke();
    g.beginPath(); g.moveTo(150, 180); g.lineTo(160, 192); g.lineTo(182, 166); g.stroke();
  });

  const mat = new THREE.MeshToonMaterial({ map: tex });
  mat.userData.outlineParameters = { visible: false };

  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, h / 2, 0);
  mesh.receiveShadow = true;
  root.add(mesh);

  return root;
}

/**
 * PX-11 · Bút bi đỏ.
 * Gốc min.y = 0, ngân sách ≤ 50 tam giác.
 */
export function makeRedPen(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'redPen';

  const len = 0.14;
  const radius = 0.0045;

  // Thân bút nhựa trắng trong
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, len * 0.7, 4);
  const body = new THREE.Mesh(bodyGeo, toon('#f0efea'));
  body.rotation.z = Math.PI / 2;
  body.position.set(0, radius, 0);
  root.add(body);

  // Nắp bút và đai cài màu đỏ
  const capGeo = new THREE.CylinderGeometry(radius * 1.1, radius * 1.1, len * 0.32, 4);
  const cap = new THREE.Mesh(capGeo, toon('#d62828'));
  cap.rotation.z = Math.PI / 2;
  cap.position.set(len * 0.34, radius, 0);
  root.add(cap);

  // Đầu ngòi bút
  const tipGeo = new THREE.ConeGeometry(radius, 0.015, 4);
  const tip = new THREE.Mesh(tipGeo, toon('#9d0208'));
  tip.rotation.z = Math.PI / 2;
  tip.position.set(-len * 0.35 - 0.0075, radius, 0);
  root.add(tip);

  const merged = mergeStatic(root);
  const b = new THREE.Box3().setFromObject(merged);
  merged.position.y = -b.min.y;
  return merged;
}

/**
 * PX-15 · Máy ảnh compact du lịch (cầm tay / đặt trên ghế đá).
 * Kích thước ~ 0.10 × 0.06 × 0.035m, gốc min.y = 0, ngân sách ≤ 300 tam giác.
 */
export function makeCompactCamera(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'compactCamera';

  const bodyW = 0.10;
  const bodyH = 0.06;
  const bodyD = 0.028;

  // Thân máy chữ nhật
  const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
  const bodyMat = toon('#344e41'); // xanh rêu kim loại hoài niệm
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, bodyH / 2, 0);
  body.receiveShadow = true;
  root.add(body);

  // Vành ống kính tròn nhô ra phía trước (+z)
  const lensRadius = 0.019;
  const lensDepth = 0.012;
  const lensGeo = new THREE.CylinderGeometry(lensRadius, lensRadius, lensDepth, 12);
  const lensMat = toon('#1a1a1a');
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(bodyW * 0.15, bodyH * 0.5, bodyD / 2 + lensDepth / 2);
  root.add(lens);

  // Mặt kính ống kính phía trước
  const glassGeo = new THREE.CircleGeometry(lensRadius * 0.75, 12);
  const glassMat = toon('#457b9d', { outline: false });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(bodyW * 0.15, bodyH * 0.5, bodyD / 2 + lensDepth + 0.001);
  root.add(glass);

  // Đèn flash góc trước (+z)
  const flashGeo = new THREE.BoxGeometry(0.016, 0.009, 0.003);
  const flash = new THREE.Mesh(flashGeo, toon('#fefae0', { outline: false }));
  flash.position.set(-bodyW * 0.28, bodyH * 0.75, bodyD / 2 + 0.001);
  root.add(flash);

  // Nút bấm chụp phía trên (+y)
  const btnGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.005, 8);
  const btn = new THREE.Mesh(btnGeo, toon('#ced4da'));
  btn.position.set(-bodyW * 0.28, bodyH + 0.0025, 0);
  root.add(btn);

  // Màn hình LCD phía sau (-z)
  const screenGeo = new THREE.PlaneGeometry(bodyW * 0.65, bodyH * 0.65);
  const screenMat = toon('#1d2d44', { outline: false });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.rotation.y = Math.PI;
  screen.position.set(-bodyW * 0.08, bodyH * 0.5, -bodyD / 2 - 0.001);
  root.add(screen);

  return mergeStatic(root);
}
