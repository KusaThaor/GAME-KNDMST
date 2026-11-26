import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { safeCanvasTexture } from './texHelper';
import { mergeStatic } from '../../../render/merge';
import { enableShadows, groundAtZero } from '../common/helpers';

export interface RuleBookOpts {
  /** `'flat'` (mặc định, đặt nằm ở Căn cứ Mốc 1) hoặc `'standing'` (đặt đứng trên kệ Hub 2026). */
  variant?: 'flat' | 'standing';
  /** Có vẽ chữ `"LUẬT"` bằng canvas texture lên bìa không (mặc định `true` với `'flat'`, `false` với `'standing'`). */
  textured?: boolean;
}

/**
 * PX-31 · Cuốn sổ bìa xanh ghi 5 điều luật Căn cứ Bí mật.
 * Dùng chung cho cả Căn cứ Mốc 1 (`variant: 'flat'`) và phòng Hub 2026 (`variant: 'standing'` / hộp kỷ vật).
 * Gốc min.y = 0, ngân sách ≤ 150 tam giác.
 */
export function makeRuleBook(opts: RuleBookOpts = {}): THREE.Group {
  const variant = opts.variant ?? 'flat';
  const root = new THREE.Group();
  root.name = 'ruleBook';

  if (variant === 'standing') {
    const H = 0.3, T = 0.06, D = 0.2;
    const part = (bw: number, bh: number, bd: number, color: string, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), toon(color));
      m.position.set(x, y, z);
      root.add(m);
    };
    part(T - 0.012, H - 0.01, D - 0.012, PAL.trim, 0, H / 2, 0);                 // ruột sách
    part(0.008, H, D, PAL.frameDark, -(T / 2 - 0.004), H / 2, 0);                // bìa sau
    part(0.008, H, D, PAL.frameDark, T / 2 - 0.004, H / 2, 0);                   // bìa trước
    part(T, H, 0.01, PAL.frame, 0, H / 2, D / 2 - 0.005);                        // gáy quay ra +z
    part(T + 0.004, 0.05, 0.012, PAL.wallYellow, 0, H * 0.72, D / 2 - 0.004);    // dải tiêu đề
    return groundAtZero(enableShadows(root));
  }

  const w = 0.22;
  const d = 0.16;
  const totalH = 0.022;

  // Ruột giấy trắng kem
  const paperGeo = new THREE.BoxGeometry(w * 0.95, totalH * 0.78, d * 0.96);
  const paper = new THREE.Mesh(paperGeo, toon(PAL.trim));
  paper.position.set(0, totalH * 0.46, 0);
  root.add(paper);

  // Bìa cứng màu xanh dương sẫm
  const coverMat = toon('#0077b6');
  const coverH = totalH * 0.14;
  const coverGeo = new THREE.BoxGeometry(w, coverH, d);

  // Bìa dưới
  const botCover = new THREE.Mesh(coverGeo, coverMat);
  botCover.position.set(0, coverH / 2, 0);
  root.add(botCover);

  // Bìa trên
  const topCover = new THREE.Mesh(coverGeo, coverMat);
  topCover.position.set(0, totalH - coverH / 2, 0);
  root.add(topCover);

  // Gáy sổ bọc băng vải đen/sẫm
  const spineGeo = new THREE.BoxGeometry(0.012, totalH, d);
  const spine = new THREE.Mesh(spineGeo, toon('#03045e'));
  spine.position.set(-w / 2 + 0.006, totalH / 2, 0);
  root.add(spine);

  // Chữ viết tay "LUẬT" trên bìa (bỏ qua khi dùng làm bản thu nhỏ không texture ở Hub)
  if (opts.textured ?? true) {
    const tex = safeCanvasTexture(256, 256, (g) => {
      g.fillStyle = '#0077b6';
      g.fillRect(0, 0, 256, 256);

      // Khung viền chỉ vàng
      g.strokeStyle = '#ffd166';
      g.lineWidth = 4;
      g.strokeRect(10, 10, 236, 236);

      // Chữ LUẬT viết tay to
      g.fillStyle = '#ffffff';
      g.font = '800 46px Nunito, sans-serif';
      g.textAlign = 'center';
      g.fillText('LUẬT', 128, 110);
      // Kịch bản Trang 3: sổ bìa xanh chỉ ghi "LUẬT" — không thêm chữ khác.
    });

    const titleMat = new THREE.MeshToonMaterial({ map: tex });
    titleMat.userData.outlineParameters = { visible: false };

    const titleGeo = new THREE.PlaneGeometry(w * 0.88, d * 0.88);
    const titleMesh = new THREE.Mesh(titleGeo, titleMat);
    titleMesh.rotation.x = -Math.PI / 2;
    titleMesh.position.set(0.005, totalH + 0.001, 0);
    root.add(titleMesh);
  }

  return groundAtZero(enableShadows(mergeStatic(root), { cast: false }));
}
