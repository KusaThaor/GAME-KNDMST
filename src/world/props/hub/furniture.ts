/**
 * Đồ gỗ phòng 2026 (K2, E5): kệ sách, tủ áo, hộp giấy/hộp giày, ghế bàn học, cửa ra vào.
 * Quy chuẩn mục 2.0: gốc ở giữa đáy (min.y = 0), mét, Y lên, mặt trước +z; vật liệu toon(); vật lặp ≥ 5 → InstancedMesh.
 * Không chữ, không logo: gáy sách và mặt hộp là màu trơn.
 */
import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { box } from '../../school/props';
import { HUB_PROP_COLORS as K } from './palette';

const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T => { o.position.set(x, y, z); return o; };
/** RNG cố định (Park–Miller) — cùng seed thì cùng bố trí, test so được. */
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/**
 * Kệ sách đứng 0,9 × 1,8 × 0,32 m, 4 tầng. Sách là một InstancedMesh (màu theo từng cuốn, `instanceColor`).
 * Có cuốn đứng, cuốn nghiêng, chồng sách nằm và chỗ trống — cho cảm giác đang dùng.
 */
export function makeBookshelf(seed = 11): THREE.Group {
  const W = 0.9, H = 1.8, D = 0.32, T = 0.025;
  const g = new THREE.Group();
  g.add(at(box(T, H, D, K.white_wood), -W / 2 + T / 2, H / 2, 0));
  g.add(at(box(T, H, D, K.white_wood), W / 2 - T / 2, H / 2, 0));
  g.add(at(box(W, T, D, K.white_wood), 0, H - T / 2, 0));
  g.add(at(box(W - 2 * T, 0.06, D - 0.02, K.white_wood), 0, 0.03, 0.0));           // chân kệ
  g.add(at(box(W - 2 * T, H - 0.06, 0.01, K.white_wood), 0, 0.03 + (H - 0.06) / 2, -D / 2 + 0.005));   // lưng kệ
  const levels = [0.06, 0.48, 0.9, 1.32];                                            // mặt trên từng tầng
  for (const y of levels.slice(1)) g.add(at(box(W - 2 * T, T, D - 0.01, K.white_wood), 0, y - T / 2, 0));

  // sách: hình hộp đơn vị, co giãn theo từng cuốn
  const rnd = rng(seed);
  const mats: THREE.Matrix4[] = [], cols: THREE.Color[] = [];
  const q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const add = (x: number, y: number, z: number, w: number, h: number, d: number, rz = 0) => {
    e.set(0, 0, rz); q.setFromEuler(e); v.set(x, y, z); sc.set(w, h, d);
    mats.push(new THREE.Matrix4().compose(v, q, sc));
    cols.push(new THREE.Color(K.books[Math.floor(rnd() * K.books.length)]));
  };
  const inner = W / 2 - T;
  levels.forEach((y0, lv) => {
    const room = (levels[lv + 1] ?? H - T) - y0 - 0.03;                              // khoảng trống tới tầng trên
    let x = -inner + 0.02;
    const gapAt = -inner + 0.25 + rnd() * 0.3;                                       // mỗi tầng chừa một khoảng trống
    let gapDone = false, leaning = false;
    while (x < inner - 0.03) {
      if (!gapDone && x > gapAt) {
        gapDone = true;
        if (lv % 2 === 0) {                                                          // chồng sách nằm
          let yy = y0;
          for (let i = 0; i < 3; i++) { const hh = 0.03 + rnd() * 0.015; add(x + 0.11, yy + hh / 2, 0.01, 0.2 - i * 0.015, hh, 0.22 - i * 0.01); yy += hh; }
          x += 0.25; continue;
        }
        x += 0.1 + rnd() * 0.06; continue;                                           // chỗ trống
      }
      const w = 0.022 + rnd() * 0.03, h = Math.min(room, 0.2 + rnd() * 0.12), d = 0.17 + rnd() * 0.06;
      if (!leaning && gapDone && rnd() < 0.5) {                                      // một cuốn nghiêng tựa vào cuốn trước
        leaning = true; const rz = -0.28;
        add(x + Math.sin(-rz) * h / 2 + w / 2, y0 + Math.cos(rz) * h / 2, -0.02 + d / 2 - D / 2 + 0.03, w, h, d, rz);
        x += Math.sin(-rz) * h + w + 0.01; continue;
      }
      add(x + w / 2, y0 + h / 2, -D / 2 + 0.03 + d / 2, w, h, d);
      x += w + 0.002;
    }
  });
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#ffffff'), mats.length);
  mats.forEach((m, i) => { books.setMatrixAt(i, m); books.setColorAt(i, cols[i]); });
  books.instanceMatrix.needsUpdate = true; if (books.instanceColor) books.instanceColor.needsUpdate = true;
  books.castShadow = true; books.receiveShadow = true; books.name = 'bookshelf:books';
  books.computeBoundingBox(); books.computeBoundingSphere();
  g.add(books);
  return g;
}

/** Tủ áo hai cánh 1,0 × 1,9 × 0,55 m: thân, chân đế, hai cánh nhô nhẹ, hai tay nắm. */
export function makeWardrobe(): THREE.Group {
  const W = 1.0, H = 1.9, D = 0.55;
  const g = new THREE.Group();
  g.add(at(box(W - 0.04, 0.08, D - 0.04, K.handle), 0, 0.04, 0));                    // chân đế lùi vào
  g.add(at(box(W, H - 0.08, D - 0.02, K.white_wood), 0, 0.08 + (H - 0.08) / 2, -0.01));
  for (const sx of [-1, 1]) {
    g.add(at(box(W / 2 - 0.015, H - 0.14, 0.02, K.white_wood), sx * (W / 4 + 0.0025), 0.11 + (H - 0.14) / 2, D / 2 - 0.01));
    g.add(at(box(0.02, 0.22, 0.03, K.handle), sx * 0.05, 1.05, D / 2 + 0.01));
  }
  return g;
}

/** Hộp giấy + hộp giày xếp chồng (đặt trên nóc tủ). Mặt hộp trơn, không chữ. */
export function makeStorageBoxes(): THREE.Group {
  const g = new THREE.Group();
  g.add(at(box(0.5, 0.26, 0.38, K.kraft), -0.12, 0.13, 0));                           // thùng giấy
  g.add(at(box(0.36, 0.13, 0.22, K.shoebox), 0.24, 0.065, 0.04));                    // hộp giày
  const lid = at(box(0.37, 0.03, 0.23, K.shoebox), 0.24, 0.13 + 0.015, 0.04); g.add(lid);
  const small = at(box(0.26, 0.12, 0.2, K.shoebox), -0.1, 0.26 + 0.06, 0.02); small.rotation.y = 0.2; g.add(small);
  return g;
}

/** Ghế bàn học: mặt ghế đệm, bốn chân, tựa lưng hai thanh. Mặt trước (chỗ ngồi hướng ra) +z, tựa ở −z. */
export function makeDeskChair(): THREE.Group {
  const S = 0.42, SY = 0.45;
  const g = new THREE.Group();
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) g.add(at(box(0.035, SY - 0.03, 0.035, K.wood), x * (S / 2 - 0.03), (SY - 0.03) / 2, z * (S / 2 - 0.03)));
  g.add(at(box(S, 0.03, S, K.wood), 0, SY - 0.015, 0));
  g.add(at(box(S - 0.04, 0.04, S - 0.04, K.cushion, 0.015), 0, SY + 0.02, 0.0));
  for (const x of [-1, 1]) g.add(at(box(0.035, 0.42, 0.035, K.wood), x * (S / 2 - 0.03), SY + 0.21, -S / 2 + 0.03));
  g.add(at(box(S - 0.02, 0.14, 0.025, K.wood), 0, SY + 0.34, -S / 2 + 0.03));
  return g;
}

/** Cửa ra vào (đóng) 0,9 × 2,05 m kèm khuôn cửa; gắn sát tường, mặt trước +z. */
export function makeDoor(): THREE.Group {
  const W = 0.9, H = 2.05;
  const g = new THREE.Group();
  g.add(at(box(0.07, H + 0.05, 0.04, K.white_wood), -W / 2 - 0.035, (H + 0.05) / 2, 0.02));   // khuôn trái
  g.add(at(box(0.07, H + 0.05, 0.04, K.white_wood), W / 2 + 0.035, (H + 0.05) / 2, 0.02));    // khuôn phải
  g.add(at(box(W + 0.14, 0.07, 0.04, K.white_wood), 0, H + 0.035, 0.02));                      // khuôn trên
  g.add(at(box(W, H, 0.035, K.wood), 0, H / 2, 0.0175));
  for (const y of [0.55, 1.45]) g.add(at(box(W - 0.24, 0.6, 0.01, K.white_wood), 0, y, 0.04));  // hai ô cửa
  g.add(at(box(0.12, 0.025, 0.05, K.handle), W / 2 - 0.12, 1.0, 0.06));                       // tay nắm
  return g;
}
