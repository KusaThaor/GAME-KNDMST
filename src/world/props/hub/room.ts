/**
 * Đồ procedural của phòng 2026 do N-08 dựng (PX-50) — chuyển nguyên hình từ hubScene.ts sang đây khi ghép vào khung
 * phòng đi lại của feat/hub-2026 [K2]. Mỗi hàm trả nhóm có đáy đúng y = 0, mét, Y lên, mặt trước +z.
 * Đèn bàn là vật tự sáng (emissive), KHÔNG kèm nguồn sáng: thêm PointLight làm Three.js biên dịch lại mọi shader toon
 * dùng chung với cảnh Trang → khựng ~1 giây lúc chuyển cảnh.
 */
import * as THREE from 'three';
import { flat, toon } from '../../../render/materials';
import { PAL, box } from '../../school/props';
import { makeRuleBook } from '../m1/ruleBook';

export const lift = <T extends THREE.Object3D>(o: T, y: number): T => { o.position.y += y; return o; };

// ---------------------------------------------------------------------------
// Đồ procedural của phòng 2026 — mỗi hàm trả nhóm có đáy nằm đúng y = 0.
// ---------------------------------------------------------------------------

/** Đèn bàn: đế tròn, thân mảnh, chụp đèn vàng ấm phát sáng. Cao ≈ 0,43 m. Chụp đèn tên `lamp:shade`, bóng `lamp:bulb` (cảnh chỉnh độ sáng). */
export function makeDeskLamp(): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.025, 20), toon(PAL.trunkDark));
  base.position.y = 0.0125;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), toon(PAL.trunk));
  stem.position.y = 0.025 + 0.15;
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.12, 0.15, 20, 1, true),
    toon(PAL.wallYellow, { emissive: '#7a5a22', side: THREE.DoubleSide }),
  );
  shade.position.y = 0.025 + 0.3 + 0.03;
  shade.name = 'lamp:shade';
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), flat('#fff1c8'));
  bulb.name = 'lamp:bulb';
  bulb.position.y = 0.025 + 0.3 - 0.02;
  g.add(base, stem, shade, bulb);
  return g;
}

/** Khung ảnh treo tường (mặt trước +z, gắn vào tường tại z = 0): viền gỗ, nền giấy, ảnh, lớp kính mỏng. */
export function makeWallFrame(w: number, h: number, art: string): THREE.Group {
  const g = new THREE.Group();
  const outer = box(w, h, 0.03, PAL.trunk, 0.008); outer.position.set(0, h / 2, 0.015);
  const mat = box(w - 0.07, h - 0.07, 0.032, PAL.trim); mat.position.set(0, h / 2, 0.016);
  const pic = box(w - 0.15, h - 0.15, 0.034, art); pic.position.set(0, h / 2, 0.017);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.07, h - 0.07, 0.004), toon('#ffffff', { transparent: true, opacity: 0.16, outline: false }));
  glass.position.set(0, h / 2, 0.034);
  g.add(outer, mat, pic, glass);
  return g;
}

/** Khung kính đứng trên bàn: hai lớp kính, tấm ảnh kẹp giữa, đế gỗ nhỏ. */
export function makeGlassFrame(w = 0.2, h = 0.15): THREE.Group {
  const g = new THREE.Group();
  const baseH = 0.015;
  const base = box(w + 0.02, baseH, 0.06, PAL.trunk, 0.004); base.position.y = baseH / 2;
  const photo = box(w - 0.03, h - 0.03, 0.004, '#9db7c9'); photo.position.y = baseH + h / 2;
  const glassMat = toon('#e8f2f5', { transparent: true, opacity: 0.22, outline: false });
  const front = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.003), glassMat); front.position.set(0, baseH + h / 2, 0.005);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.003), glassMat); back.position.set(0, baseH + h / 2, -0.005);
  g.add(base, photo, front, back);
  return g;
}

/** Thảm bầu dục ba lớp (cao 2–3 cm). Gốc ở tâm, đáy y = 0. */
export function makeRug(rx = 1.5, rz = 1.0, colors: readonly [string, string, string] = [PAL.roof, PAL.wallCream, PAL.roofDark]): THREE.Group {
  const g = new THREE.Group();
  const layer = (k: number, h: number, color: string) => {
    const geo = new THREE.CylinderGeometry(k, k, h, 40); geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, toon(color, { outline: false })); m.scale.set(rx, 1, rz);
    return m;
  };
  g.add(layer(1, 0.02, colors[0]), layer(0.82, 0.024, colors[1]), layer(0.66, 0.028, colors[2]));
  return g;
}

/** Một tấm rèm xếp nếp (InstancedMesh các dải đứng), treo từ y = h xuống y = 0. */
export function makeCurtain(w: number, h: number, folds = 6, color: string = PAL.wallYellow): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry((w / folds) * 0.94, h, 0.04); geo.translate(0, h / 2, 0);
  const mesh = new THREE.InstancedMesh(geo, toon(color), folds);
  const m = new THREE.Matrix4();
  for (let i = 0; i < folds; i++) { m.makeTranslation((i - (folds - 1) / 2) * (w / folds), 0, i % 2 ? 0.035 : 0); mesh.setMatrixAt(i, m); }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

export interface NightWindow {
  /** Khung, bệ cửa, thanh ngang — tĩnh, đưa vào `mergeStatic`. */
  frame: THREE.Group;
  /** Ô kính: đổi màu theo preset. Không viền. */
  pane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  /** Trăng + sao (InstancedMesh) — chỉ hiện khi cửa sổ là ban đêm. */
  sky: THREE.Group;
}

/** Cửa sổ nhìn ra đêm. Cả ba phần dùng chung một gốc (giữa đáy bệ cửa, y = 0); ô kính rộng `w`, cao `h`. */
export function makeNightWindow(w = 1.5, h = 1.1): NightWindow {
  const sill = 0.08;
  const frame = new THREE.Group();
  const bar = (bw: number, bh: number, x: number, y: number) => { const b = box(bw, bh, 0.1, PAL.trim); b.position.set(x, y, 0); frame.add(b); };
  bar(w + 0.16, sill, 0, sill / 2);                       // bệ cửa
  bar(w + 0.16, 0.08, 0, sill + h + 0.04);                // thanh trên
  bar(0.06, h, -(w / 2 + 0.03), sill + h / 2);            // thanh bên
  bar(0.06, h, w / 2 + 0.03, sill + h / 2);
  bar(0.03, h, 0, sill + h / 2);                          // song đứng giữa

  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#1f2a48' }));
  pane.material.userData.outlineParameters = { visible: false };
  pane.position.set(0, sill + h / 2, 0.005);

  const sky = new THREE.Group();
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), flat('#fff6d8'));
  moon.position.set(w * 0.28, sill + h * 0.72, 0.008);
  const N = 14;
  const stars = new THREE.InstancedMesh(new THREE.CircleGeometry(0.014, 5), flat('#fff4c8'), N);
  const mtx = new THREE.Matrix4();
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) { mtx.makeTranslation((rnd() - 0.5) * (w - 0.2), sill + 0.1 + rnd() * (h - 0.25), 0.008); stars.setMatrixAt(i, mtx); }
  stars.instanceMatrix.needsUpdate = true;
  sky.add(moon, stars);
  return { frame, pane, sky };
}

/** Cuốn sổ luật Căn cứ: đứng, gáy quay ra +z, bìa xanh đậm, có dải tiêu đề. Cao 0,30 m (tái dùng `props/m1/ruleBook`). */
export function makeRulebook(): THREE.Group {
  return makeRuleBook({ variant: 'standing', textured: false });
}
