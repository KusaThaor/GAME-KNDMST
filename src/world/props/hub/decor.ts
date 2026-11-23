/**
 * Đồ nhỏ phòng 2026 (K2, E5): chậu cây, đèn trần, bảng ghim giấy note trống, móc treo balo.
 * Quy chuẩn mục 2.0: gốc ở giữa đáy (min.y = 0), mét, Y lên, mặt trước +z; toon(); vật lặp ≥ 5 → InstancedMesh.
 * Đèn trần là vật tự sáng (emissive), KHÔNG phải nguồn sáng (thêm loại đèn → biên dịch lại shader, khựng khi chuyển cảnh).
 * Không chữ đọc được: giấy note là ô màu trơn.
 */
import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { box } from '../../school/props';
import { HUB_PROP_COLORS as K } from './palette';

const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T => { o.position.set(x, y, z); return o; };
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/** InstancedMesh từ danh sách ma trận (+ màu tuỳ chọn). */
function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, mats: THREE.Matrix4[], cols?: readonly string[]): THREE.InstancedMesh {
  const m = new THREE.InstancedMesh(geo, mat, mats.length);
  mats.forEach((x, i) => { m.setMatrixAt(i, x); if (cols) m.setColorAt(i, new THREE.Color(cols[i % cols.length])); });
  m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  m.castShadow = true; m.receiveShadow = true;
  m.computeBoundingBox(); m.computeBoundingSphere();
  return m;
}

/** Chậu cây lá to cao ≈ 1,0 m: chậu đất nung, đất, thân, 9 lá (InstancedMesh). */
export function makePottedPlant(seed = 5): THREE.Group {
  const g = new THREE.Group();
  const potH = 0.32;
  const potGeo = new THREE.CylinderGeometry(0.17, 0.13, potH, 16); potGeo.translate(0, potH / 2, 0);
  g.add(new THREE.Mesh(potGeo, toon(K.pot)));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.03, 16), toon(K.pot)), 0, potH - 0.015, 0));   // vành chậu
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.155, 16), toon(K.handle));
  soil.rotation.x = -Math.PI / 2; soil.position.y = potH - 0.02; g.add(soil);
  const stem = new THREE.CylinderGeometry(0.012, 0.016, 0.5, 6); stem.translate(0, 0.25, 0);
  g.add(at(new THREE.Mesh(stem, toon(K.wood)), 0, potH - 0.02, 0));
  const rnd = rng(seed), mats: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * Math.PI * 2 + rnd() * 0.4, tilt = 0.5 + rnd() * 0.5, r = 0.1 + rnd() * 0.08;
    const y = potH + 0.2 + rnd() * 0.42;
    e.set(tilt * Math.cos(ang), ang, tilt * Math.sin(ang) * 0.6); q.setFromEuler(e);
    mats.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r), q, new THREE.Vector3(0.09, 0.025, 0.2)));
  }
  const leaves = instanced(new THREE.SphereGeometry(1, 8, 5), toon(K.leaf), mats);
  leaves.name = 'plant:leaves';
  g.add(leaves);
  // lá thấp nhất có thể chúi xuống dưới miệng chậu nhưng không xuống tới sàn: đáy vẫn là đáy chậu
  return g;
}

/** Đèn trần ốp sát: đế tròn + chụp mờ tự sáng. Cao 0,12 m; gốc ở đáy chụp, đặt tại y = trần − 0,12. Chụp tên `ceiling:diffuser`. */
export function makeCeilingLamp(): THREE.Group {
  const g = new THREE.Group();
  const dome = new THREE.SphereGeometry(0.26, 20, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);   // nửa cầu úp xuống
  dome.scale(1, 0.35, 1); dome.translate(0, 0.091, 0);
  const diffuser = new THREE.Mesh(dome, toon(K.lamp_diffuser, { emissive: K.lamp_glow }));
  diffuser.name = 'ceiling:diffuser';
  g.add(diffuser);
  g.add(at(box(0.6, 0.03, 0.6, K.white_wood, 0.01), 0, 0.105, 0));                  // đế ốp trần (đỉnh = 0,12)
  return g;
}

/** Bảng ghim 0,9 × 0,6 m: khung gỗ, mặt bần, 7 giấy note trống (InstancedMesh) + 7 đinh ghim (InstancedMesh). */
export function makePinboard(seed = 3): THREE.Group {
  const W = 0.9, H = 0.6;
  const g = new THREE.Group();
  g.add(at(box(W, H, 0.02, K.wood), 0, H / 2, 0.01));
  g.add(at(box(W - 0.06, H - 0.06, 0.022, K.cork), 0, H / 2, 0.012));
  const rnd = rng(seed), notes: THREE.Matrix4[] = [], pins: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  const spots: [number, number][] = [[-0.3, 0.42], [-0.08, 0.44], [0.17, 0.4], [0.33, 0.2], [-0.32, 0.17], [-0.1, 0.18], [0.12, 0.16]];
  for (const [x, y] of spots) {
    const s = 0.1 + rnd() * 0.05;
    e.set(0, 0, (rnd() - 0.5) * 0.3); q.setFromEuler(e);
    notes.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, 0.025), q, new THREE.Vector3(s, s * (0.9 + rnd() * 0.3), 0.002)));
    pins.push(new THREE.Matrix4().makeTranslation(x, y + s * 0.4, 0.03));
  }
  const n = instanced(new THREE.BoxGeometry(1, 1, 1), toon('#ffffff', { outline: false }), notes, K.notes);
  n.name = 'pinboard:notes'; g.add(n);
  const p = instanced(new THREE.SphereGeometry(0.009, 6, 4), toon(K.pin, { outline: false }), pins);
  p.name = 'pinboard:pins'; g.add(p);
  return g;
}

/** Móc treo trên tường + balo đang treo. Gốc ở đáy balo; thanh móc ở trên cùng (cao ≈ 0,5 m), sát tường (z = 0). */
export function makeBagHook(): THREE.Group {
  const g = new THREE.Group();
  g.add(at(box(0.5, 0.06, 0.02, K.wood), 0, 0.47, 0.01));                             // thanh gỗ
  for (const x of [-0.17, 0, 0.17]) g.add(at(box(0.02, 0.02, 0.07, K.handle), x, 0.46, 0.045));   // ba chốt móc
  g.add(at(box(0.3, 0.38, 0.14, K.bag, 0.04), 0, 0.19, 0.1));                         // thân balo
  g.add(at(box(0.22, 0.15, 0.05, K.cushion, 0.02), 0, 0.12, 0.185));                 // túi trước
  for (const x of [-0.08, 0.08]) g.add(at(box(0.035, 0.1, 0.02, K.handle), x, 0.41, 0.06));     // quai treo vào chốt
  return g;
}
