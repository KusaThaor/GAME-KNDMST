import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { safeCanvasTexture } from './texHelper';
import { mergeStatic } from '../../../render/merge';

/**
 * PX-31 · Cuốn sổ bìa xanh ghi 5 điều luật Căn cứ Bí mật.
 * Gốc min.y = 0, ngân sách ≤ 150 tam giác.
 */
export function makeRuleBook(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'ruleBook';

  const w = 0.22;
  const d = 0.16;
  const totalH = 0.022;

  // Ruột giấy trắng kem
  const paperGeo = new THREE.BoxGeometry(w * 0.95, totalH * 0.78, d * 0.96);
  const paper = new THREE.Mesh(paperGeo, toon(PAL.trim));
  paper.position.set(0, totalH * 0.46, 0);
  paper.receiveShadow = true;
  root.add(paper);

  // Bìa cứng màu xanh dương sẫm
  const coverMat = toon('#0077b6');
  const coverH = totalH * 0.14;
  const coverGeo = new THREE.BoxGeometry(w, coverH, d);

  // Bìa dưới
  const botCover = new THREE.Mesh(coverGeo, coverMat);
  botCover.position.set(0, coverH / 2, 0);
  botCover.receiveShadow = true;
  root.add(botCover);

  // Bìa trên
  const topCover = new THREE.Mesh(coverGeo, coverMat);
  topCover.position.set(0, totalH - coverH / 2, 0);
  topCover.receiveShadow = true;
  root.add(topCover);

  // Gáy sổ bọc băng vải đen/sẫm
  const spineGeo = new THREE.BoxGeometry(0.012, totalH, d);
  const spine = new THREE.Mesh(spineGeo, toon('#03045e'));
  spine.position.set(-w / 2 + 0.006, totalH / 2, 0);
  root.add(spine);

  // Chữ viết tay "LUẬT" trên bìa
  const tex = safeCanvasTexture(256, 256, (g) => {
    g.fillStyle = '#0077b6';
    g.fillRect(0, 0, 256, 256);

    // Khung viền chỉ vàng
    g.strokeStyle = '#ffd166';
    g.lineWidth = 4;
    g.strokeRect(10, 10, 236, 236);

    // Chữ LUẬT viết tay to
    g.fillStyle = '#ffffff';
    g.font = '900 46px Nunito, sans-serif';
    g.textAlign = 'center';
    g.fillText('LUẬT', 128, 110);

    g.font = 'bold 18px Nunito, sans-serif';
    g.fillStyle = '#ffd166';
    g.fillText('CĂN CỨ BÍ MẬT', 128, 160);
    g.font = '14px Nunito, sans-serif';
    g.fillText('(5 Điều Quy Định)', 128, 190);
  });

  const titleMat = new THREE.MeshToonMaterial({ map: tex });
  titleMat.userData.outlineParameters = { visible: false };

  const titleGeo = new THREE.PlaneGeometry(w * 0.88, d * 0.88);
  const titleMesh = new THREE.Mesh(titleGeo, titleMat);
  titleMesh.rotation.x = -Math.PI / 2;
  titleMesh.position.set(0.005, totalH + 0.001, 0);
  root.add(titleMesh);

  return mergeStatic(root);
}
