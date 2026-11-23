import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { safeCanvasTexture } from './texHelper';
import { mergeStatic } from '../../../render/merge';

/**
 * PX-30 · Biển tên "CĂN CỨ BÍ MẬT" treo trên vách gỗ/tôn Căn cứ.
 * Gốc min.y = 0, ngân sách ≤ 150 tam giác.
 */
export function makeBaseSign(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'baseSign';

  const w = 0.72;
  const h = 0.34;
  const t = 0.024;

  // Tấm ván gỗ mộc (đáy tại y = 0, đỉnh tại y = h)
  const boardGeo = new THREE.BoxGeometry(w, h, t);
  const boardMat = toon(PAL.trunk);
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, h / 2, 0);
  board.castShadow = true;
  board.receiveShadow = true;
  root.add(board);

  // Mặt chữ vẽ tay "CĂN CỨ BÍ MẬT"
  const signTex = safeCanvasTexture(512, 256, (g) => {
    // Vân gỗ
    g.fillStyle = '#eed7a1';
    g.fillRect(0, 0, 512, 256);

    g.fillStyle = 'rgba(180, 140, 90, 0.25)';
    for (let i = 0; i < 256; i += 8) {
      g.fillRect(0, i, 512, 3);
    }

    // Viền khung gỗ sẫm
    g.strokeStyle = '#6b4f3b';
    g.lineWidth = 8;
    g.strokeRect(6, 6, 500, 244);

    // Chữ "CĂN CỨ BÍ MẬT" viết nguệch ngoạc (kịch bản Trang 3), hai dòng bút lông:
    // mỗi chữ cái lệch cao thấp, nghiêng một chút, cỡ không đều, vài chỗ sơn chảy.
    // Chỉ đúng dòng chữ này, không thêm gì. Không vẽ tên người chơi: DressingCtx
    // không có tên, và kịch bản không ghi chữ ký.
    // Độ đậm 800: game chỉ nạp Nunito 400/700/800 (main.ts) — 900 làm dấu rơi sang phông khác.
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    g.fillStyle = '#1b263b';
    g.strokeStyle = '#1b263b';
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    const lines: [string, number][] = [['CĂN CỨ', 112], ['BÍ MẬT', 214]];
    for (const [line, baseY] of lines) {
      const chars = Array.from(line.normalize('NFC'));
      const step = 62;
      const x0 = 256 - ((chars.length - 1) * step) / 2;
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (ch === ' ') continue;
        const size = 70 + Math.round(rnd() * 16);
        const x = x0 + i * step + (rnd() - 0.5) * 8;
        const y = baseY + (rnd() - 0.5) * 12;
        g.save();
        g.translate(x, y);
        g.rotate((rnd() - 0.5) * 0.3);
        g.font = `800 ${size}px Nunito, sans-serif`;
        g.fillText(ch, 0, 0);
        g.restore();
        // Sơn chảy dưới chân một số chữ
        if (rnd() < 0.4) {
          const dx = x + (rnd() - 0.5) * size * 0.4;
          g.lineWidth = 3 + rnd() * 2;
          g.beginPath();
          g.moveTo(dx, y - 2);
          g.lineTo(dx + 1, y + 8 + rnd() * 16);
          g.stroke();
        }
      }
    }
  });

  const faceMat = new THREE.MeshToonMaterial({ map: signTex });
  faceMat.userData.outlineParameters = { visible: false };

  const faceGeo = new THREE.PlaneGeometry(w * 0.95, h * 0.9);
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, h / 2, t / 2 + 0.001);
  face.receiveShadow = true;
  root.add(face);

  // Dây thừng treo phía trên
  const ropeMat = toon('#a68a68');
  const ropeLGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.26, 6);
  const ropeL = new THREE.Mesh(ropeLGeo, ropeMat);
  ropeL.position.set(-w * 0.2, h + 0.09, 0);
  ropeL.rotation.z = -0.55;
  root.add(ropeL);

  const ropeR = new THREE.Mesh(ropeLGeo, ropeMat);
  ropeR.position.set(w * 0.2, h + 0.09, 0);
  ropeR.rotation.z = 0.55;
  root.add(ropeR);

  // Đinh treo trên đỉnh chụm
  const nailGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6);
  const nail = new THREE.Mesh(nailGeo, toon('#2b2d42'));
  nail.rotation.x = Math.PI / 2;
  nail.position.set(0, h + 0.18, 0);
  root.add(nail);

  return mergeStatic(root);
}
