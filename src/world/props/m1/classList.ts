import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { illegibleLine, safeCanvasTexture } from './texHelper';
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

  // Mặt giấy dán danh sách lớp.
  // Không in năm, tên lớp, họ tên đầy đủ hay tên người chơi: kịch bản Trang 1 chỉ nói
  // "bảng phân lớp dán ở hành lang". Chỉ dùng tên gọi đã có (Đức, Châu); mọi dòng khác
  // là nét chữ mờ không đọc được (illegibleLine).
  const tex = safeCanvasTexture(512, 256, (g) => {
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
    g.fillText('DANH SÁCH PHÂN LỚP', 256, 40);

    // Kẻ vạch ngăn đôi
    g.strokeStyle = '#a49f8e';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(256, 60);
    g.lineTo(256, 235);
    g.stroke();

    // Đầu cột: nét đậm không đọc được (không ghi tên lớp)
    illegibleLine(g, 80, 82, 100, { color: '#2f3e46', height: 12, lineWidth: 3, seed: 11 });
    illegibleLine(g, 330, 82, 100, { color: '#b5533c', height: 12, lineWidth: 3, seed: 12 });

    // Cột trái: toàn dòng mờ
    for (let i = 0; i < 5; i++) {
      illegibleLine(g, 40, 112 + i * 26, 150 - (i % 3) * 22, { seed: 20 + i });
    }

    // Cột phải (lớp của Đức & Châu): hai tên gọi đã có xen giữa các dòng mờ
    g.textAlign = 'left';
    g.fillStyle = '#4f5d65';
    g.font = '15px Nunito, sans-serif';
    illegibleLine(g, 290, 112, 140, { seed: 31 });
    g.fillText('Châu', 290, 143);
    illegibleLine(g, 290, 164, 120, { seed: 32 });
    g.fillText('Đức', 290, 195);
    illegibleLine(g, 290, 216, 150, { seed: 33 });
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
