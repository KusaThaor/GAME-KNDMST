import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { canvasTexture } from '../../../render/canvasTex';
import { mergeStatic } from '../../../render/merge';

export interface ClassListOpts {
  width?: number;
  height?: number;
  postHeight?: number;
}

/**
 * PX-10 · Bảng phân lớp (hành lang lớp 6).
 * Gốc min.y = 0, mặt trước +z, ngân sách ≤ 200 tam giác.
 */
export function makeClassList(opts: ClassListOpts = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'classList';

  const w = opts.width ?? 1.4;
  const h = opts.height ?? 0.85;
  const postH = opts.postHeight ?? 1.5;
  const postW = 0.06;

  // 2 chân trụ đứng từ đất lên
  const postMat = toon(PAL.trunkDark);
  for (const sx of [-w * 0.42, w * 0.42]) {
    const postGeo = new THREE.BoxGeometry(postW, postH, postW);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(sx, postH / 2, 0);
    post.castShadow = true;
    post.receiveShadow = true;
    root.add(post);
  }

  // Khung bảng gỗ
  const boardCenterY = postH - h / 2 + 0.1;
  const frameGeo = new THREE.BoxGeometry(w, h, 0.04);
  const frame = new THREE.Mesh(frameGeo, toon(PAL.frameDark));
  frame.position.set(0, boardCenterY, 0.025);
  frame.castShadow = true;
  frame.receiveShadow = true;
  root.add(frame);

  // Mặt giấy dán danh sách lớp
  const tex = canvasTexture(512, 256, (g) => {
    // Nền bảng
    g.fillStyle = '#f8f4ea';
    g.fillRect(0, 0, 512, 256);

    // Đường viền
    g.strokeStyle = '#2b4c38';
    g.lineWidth = 6;
    g.strokeRect(8, 8, 496, 240);

    // Tiêu đề
    g.fillStyle = '#1e3d2f';
    g.font = 'bold 22px Nunito, sans-serif';
    g.textAlign = 'center';
    g.fillText('DANH SÁCH PHÂN LỚP KHỐI 6 (2014)', 256, 40);

    // Kẻ vạch ngăn đôi
    g.strokeStyle = '#a49f8e';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(256, 60);
    g.lineTo(256, 235);
    g.stroke();

    // Cột 6A1
    g.fillStyle = '#2f3e46';
    g.font = 'bold 18px Nunito, sans-serif';
    g.fillText('LỚP 6A1 (Phòng 1)', 130, 80);
    g.font = '14px Nunito, sans-serif';
    g.textAlign = 'left';
    g.fillStyle = '#4f5d65';
    g.fillText('• Nguyễn Văn An', 40, 115);
    g.fillText('• Trần Thị Bình', 40, 145);
    g.fillText('• Lê Hoàng Cúc', 40, 175);
    g.fillText('• …', 40, 205);

    // Cột 6A2 (Lớp của Đức & Player)
    g.textAlign = 'center';
    g.fillStyle = '#b5533c'; // nhấn đỏ gạch
    g.font = 'bold 18px Nunito, sans-serif';
    g.fillText('LỚP 6A2 (Phòng 2)', 380, 80);
    g.font = '14px Nunito, sans-serif';
    g.textAlign = 'left';
    g.fillStyle = '#4f5d65';
    g.fillText('• Châu Gia Tuệ (Lớp trưởng)', 290, 115);
    g.fillText('• Huỳnh Minh Đức', 290, 145);
    g.fillText('• {player_name}', 290, 175);
    g.fillText('• …', 290, 205);
  });

  const paperMat = new THREE.MeshToonMaterial({ map: tex });
  paperMat.userData.outlineParameters = { visible: false };

  const paperGeo = new THREE.PlaneGeometry(w * 0.94, h * 0.9);
  const paper = new THREE.Mesh(paperGeo, paperMat);
  paper.position.set(0, boardCenterY, 0.046);
  paper.receiveShadow = true;
  root.add(paper);

  return mergeStatic(root);
}
