/**
 * Scene Hub 2026: phòng trọ đi lại được bằng góc nhìn thứ nhất (chủ dự án chốt 22/11). Số liệu ở config/hubRoom.ts.
 * - WASD/mũi tên đi theo hướng đang nhìn, Shift chạy; va chạm với tường và đồ đạc (hình chữ nhật).
 * - Nhìn: rê chuột về phía nào thì nhìn về phía đó, chỉ trong giới hạn (không quay vòng). Cảm ứng: kéo màn hình.
 * - Lại gần một vật đang ở trong góc nhìn → `nearest()` (game hiện gợi ý E / bấm chuột).
 * - Mở Hộp Kỷ Vật: camera lướt vào cận cảnh miệng hộp; các món trong hộp bấm được qua `pick()`.
 * Đồ trong phòng dựng procedural (D3, PX-50; hàm dựng ở world/props/hub): đồ tĩnh gộp bằng `mergeStatic()`, vật lặp dùng
 * `InstancedMesh`. Tông phòng (preset theo số Ngày đã xong) lấy từ config/hub.ts; bố trí + va chạm ở config/hubRoom.ts.
 * Đèn bàn là vật tự sáng (emissive), không phải nguồn sáng — xem ghi chú ở bộ đèn bên dưới. [K2: ghép N-08 vào khung hub-2026]
 */
import * as THREE from 'three';
import type { HubConfig } from '../../config/hub';
import { HUB_ROOM } from '../../config/hubRoom';
import type { Artifact, HubContent } from '../../content/types';
import { toon } from '../../render/materials';
import { mergeStatic } from '../../render/merge';
import { PAL, box } from '../../world/school/props';
import { buildHubDecor } from '../../world/props/hub';
import { lift, makeCurtain, makeDeskLamp, makeGlassFrame, makeNightWindow, makeRug, makeRulebook, makeWallFrame } from '../../world/props/hub/room';
import { disposeScene } from '../view';

export interface HubMove { forward: number; strafe: number; run: boolean }
/** Điều khiển một khung hình. Trường nào null = khung này không có (đang có thoại/bảng, hoặc thiết bị không có). */
export interface HubControl {
  move: HubMove | null;
  /** Vị trí con trỏ chuột (NDC, -1..1): nhìn về phía con trỏ. */
  cursor: { x: number; y: number } | null;
  /** Kéo trên màn hình cảm ứng (px, cộng dồn từ khung trước). */
  drag: { dx: number; dy: number } | null;
}
/** Một món trong Hộp Kỷ Vật. `glow` = món kế tiếp (bấm được để về quá khứ); `dim` = chưa tới lượt. */
export interface BoxItemView { id: string; kind: 'artifact' | 'decor'; shape: string; state: 'glow' | 'normal' | 'dim' }
export interface HubPlayer { x: number; z: number; yaw: number; pitch: number }

export interface HubScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update(dt: number, t: number, ctl?: HubControl): void;
  /** Vật dưới con trỏ (NDC). Hộp đang mở → món trong hộp; ngược lại → đồ trong phòng. */
  pick(ndcX: number, ndcY: number): string | null;
  setHover(id: string | null): void;
  /** Tâm của một vật / một món trong hộp trên màn hình (NDC) — cho bot/test bấm chuột thật. */
  screenPoint(id: string): { x: number; y: number } | null;
  /** Đồ trong phòng gần nhất mà người chơi với tới và đang nhìn về phía nó. null khi hộp đang mở. */
  nearest(): string | null;
  /** Người chơi đứng đủ gần vật này để tương tác. */
  reachable(id: string): boolean;
  readonly player: HubPlayer;
  /** Đặt người chơi tới (x, z), có va chạm; `yaw` = hướng nhìn (0 = về phía cửa sổ). */
  teleport(x: number, z: number, yaw?: number): void;
  setLighting(presetName: string): void;
  /** Kỷ vật đã lên kệ (phòng có thêm một món sau mỗi Trang). */
  setShelf(artifacts: Artifact[]): void;
  /** Mở/đóng Hộp Kỷ Vật: nắp mở và camera lướt vào cận cảnh / lướt về góc nhìn thứ nhất. */
  setBoxOpen(open: boolean): void;
  readonly boxOpen: boolean;
  /** 0 = góc nhìn thứ nhất, 1 = camera đã lướt xong vào cận cảnh hộp. */
  readonly boxBlend: number;
  setBoxItems(items: BoxItemView[]): void;
  dispose(): void;
}

const D2R = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
interface Rect { x0: number; x1: number; z0: number; z1: number }

function artifactMesh(shape: string | undefined): THREE.Object3D {
  switch (shape) {
    case 'paper': { const g = new THREE.Group(); const m = box(0.15, 0.012, 0.2, '#f4ecd2'); m.rotation.y = 0.4; const ink = box(0.08, 0.013, 0.02, '#c0392b'); ink.position.set(0.01, 0.001, 0.03); ink.rotation.y = 0.4; g.add(m, ink); return g; }
    case 'photo': { const g = new THREE.Group(); g.add(box(0.2, 0.01, 0.15, '#f8f4ea')); const p = box(0.16, 0.011, 0.11, '#c9b37a'); p.position.y = 0.001; g.add(p); g.rotation.y = -0.2; return g; }
    case 'boat': { const g = new THREE.Group(); const hull = box(0.2, 0.04, 0.07, '#e9e1c6'); const sail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 3), toon('#f1e9d0')); sail.position.y = 0.07; g.add(hull, sail); g.rotation.y = 0.5; return g; }
    case 'sign': { const g = new THREE.Group(); g.add(box(0.22, 0.02, 0.1, '#b98a5a')); const book = box(0.11, 0.025, 0.15, '#3f6fa0'); book.position.set(0.02, 0.022, 0.02); book.rotation.y = -0.3; g.add(book); return g; }
    case 'box': {                                         // hộp phấn giấy đã móp (N-08): thân + nắp lệch
      const g = new THREE.Group();
      g.add(lift(box(0.16, 0.065, 0.1, PAL.trim, 0.01), 0.0325));
      const lid = lift(box(0.165, 0.02, 0.105, PAL.wallYellow, 0.006), 0.075); lid.rotation.z = 0.06; g.add(lid);
      g.rotation.y = 0.25; return g;
    }
    default: return box(0.14, 0.1, 0.14, '#c9a56b', 0.02);
  }
}
function decorMesh(shape: string): THREE.Object3D {
  const g = new THREE.Group();
  switch (shape) {
    case 'notebooks': { const a = box(0.3, 0.022, 0.22, '#5a7fb5'); const b = box(0.29, 0.022, 0.21, '#6f9b6a'); b.position.set(0.02, 0.022, -0.01); b.rotation.y = 0.12; g.add(a, b); break; }
    case 'scarf': { const a = box(0.3, 0.014, 0.08, '#c8302c'); a.rotation.y = 0.35; const b = box(0.24, 0.015, 0.07, '#b8282a'); b.rotation.y = -0.35; b.position.set(0.02, 0.008, 0.03); g.add(a, b); break; }
    case 'class_photo': { g.add(box(0.19, 0.008, 0.13, '#d8d0bd')); const p = box(0.16, 0.009, 0.09, '#a8adb0'); p.position.y = 0.001; g.add(p); g.rotation.y = 0.15; break; }
    case 'pencil_case': g.add(box(0.2, 0.04, 0.065, '#5b7fa6', 0.01)); g.rotation.y = -0.2; break;
    case 'eraser': g.add(box(0.06, 0.025, 0.035, '#e99ab0', 0.006)); g.rotation.y = 0.6; break;
    case 'ruler': g.add(box(0.26, 0.006, 0.035, '#e8e2c8')); g.rotation.y = -0.5; break;
    default: g.add(box(0.1, 0.05, 0.1, '#bba88a'));
  }
  return g;
}

/** Chỗ đặt từng món trong lòng hộp (toạ độ trong hộp, mét). Lớp dưới: vở, khăn; lớp trên: lưới 4 × 2. */
const DECOR_SLOT: Record<string, [number, number, number]> = {
  'deco.notebooks': [-0.22, 0.045, 0.02], 'deco.scarf': [0.22, 0.04, 0.0],
  'deco.pencil_case': [-0.12, 0.1, -0.15], 'deco.eraser': [0.36, 0.1, -0.15], 'deco.class_photo': [-0.36, 0.09, 0.15], 'deco.ruler': [0.12, 0.09, 0.15],
};
/** Kỷ vật theo thứ tự Trang: Trang 1 ở góc trước-trái (gần người chơi nhất khi cúi nhìn). */
const ART_SLOT: [number, number, number][] = [[-0.36, 0.1, -0.15], [0.12, 0.1, -0.15], [0.36, 0.1, 0.15], [-0.12, 0.1, 0.15]];

export function buildHubScene(hub: HubContent, config: HubConfig): HubScene {
  const R = HUB_ROOM, L = R.layout;
  const W = R.size.w / 2, Dz = R.size.d / 2, H = R.size.h;
  const scene = new THREE.Scene();
  const ambient = new THREE.HemisphereLight('#ffffff', '#9c968e', 1);
  const key = new THREE.DirectionalLight('#ffffff', 1.2);
  key.position.set(-0.8, 4.2, 2.2); key.castShadow = true;                  // cao, giữa phòng, sau lưng người chơi: bóng tủ áo không phủ góc bàn học
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;          // hết vệt sọc (shadow acne) trên cửa, rèm, mặt tủ
  const sc = key.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 0.5; sc.far = 20;
  // Chỉ dùng đúng bộ đèn như cảnh Trang (bán cầu + một đèn hướng): vật liệu toon dùng chung giữa hai cảnh, thêm loại đèn
  // khác (vd. PointLight) làm Three.js phải biên dịch lại mọi shader lúc chuyển cảnh → khựng gần 1 giây khi vào Trang.
  scene.add(ambient, key);

  // Kính trong suốt không đổ bóng.
  const shadowed = (m: THREE.Object3D) => m.traverse((c) => {
    const mesh = c as THREE.Mesh;
    if (mesh.isMesh) { mesh.castShadow = !(mesh.material as THREE.Material).transparent; mesh.receiveShadow = true; }
  });
  const room = new THREE.Group(); scene.add(room);
  /** Vật tương tác / vật động: đặt thẳng vào `room` để còn bắt chuột và phóng to khi rê. */
  const put = (m: THREE.Object3D, x: number, y: number, z: number) => { m.position.set(x, y, z); room.add(m); shadowed(m); return m; };
  /** Đồ tĩnh: gom vào `decor`, cuối hàm gộp một lần bằng `mergeStatic` (ít lượt vẽ). */
  const decor = new THREE.Group();
  const fix = (m: THREE.Object3D, x: number, y: number, z: number, rotY = 0, rotZ = 0) => { m.position.set(x, y, z); m.rotation.y = rotY; m.rotation.z = rotZ; decor.add(m); shadowed(m); return m; };
  const C = R.colors;
  // Vỏ phòng chỉ NHẬN bóng: nếu trần/tường đổ bóng thì đèn hướng (đặt trên cao) bị trần che hết → cả phòng nằm trong bóng,
  // chỉ còn đèn bán cầu → tối và ngả màu (một nguyên nhân của ám vàng trước K2).
  const shell = (m: THREE.Mesh, x: number, y: number, z: number) => { fix(m, x, y, z); m.castShadow = false; return m; };
  shell(box(R.size.w, 0.1, R.size.d, C.floor), 0, -0.05, 0);                        // sàn
  shell(box(R.size.w, 0.08, R.size.d, C.ceiling), 0, H + 0.04, 0);                  // trần
  shell(box(R.size.w, H, 0.12, C.wall), 0, H / 2, -Dz - 0.06);                     // tường có cửa sổ
  shell(box(R.size.w, H, 0.12, C.wall), 0, H / 2, Dz + 0.06);                      // tường sau lưng
  shell(box(0.12, H, R.size.d, C.wall_side), -W - 0.06, H / 2, 0);                 // tường trái
  shell(box(0.12, H, R.size.d, C.wall_side), W + 0.06, H / 2, 0);                  // tường phải
  // cửa sổ (N-08): khung tĩnh gộp; ô kính + trăng sao đổi theo preset
  const WX = L.window.x, WIN_Y = 1.65 - 0.08 - 1.1 / 2, WZ = -Dz + 0.05;
  const win = makeNightWindow(1.5, 1.1);
  fix(win.frame, WX, WIN_Y, WZ);
  win.pane.position.add(new THREE.Vector3(WX, WIN_Y, WZ)); room.add(win.pane);
  win.sky.position.set(WX, WIN_Y, WZ); room.add(win.sky);
  fix(box(2.5, 0.03, 0.03, PAL.trunkDark), WX, 2.38, -Dz + 0.12);                 // thanh treo rèm
  for (const dx of [-1.05, 1.05]) { const c = makeCurtain(0.4, 1.44, 6, C.curtain); c.position.set(WX + dx, 0.92, -Dz + 0.11); room.add(c); }
  // khung ảnh tường (N-08) — góc trái tường cửa sổ, trên Hộp Kỷ Vật
  fix(makeWallFrame(0.46, 0.34, '#9db7c9'), -2.65, 1.58, -Dz, 0, 0.02);
  fix(makeWallFrame(0.3, 0.4, '#e2d3bd'), -2.03, 1.83, -Dz, 0, -0.03);
  fix(makeWallFrame(0.36, 0.26, PAL.leaf2), -2.13, 1.38, -Dz, 0, 0.015);
  fix(makeRug(1.4, 0.95, C.rug), L.rug.x, 0, L.rug.z);                               // thảm giữa phòng
  // giường sát tường phải, đầu giường phía sau lưng
  fix(box(1.5, 0.42, 2.2, C.bed, 0.06), L.bed.x, 0.21, L.bed.z);
  fix(box(0.6, 0.12, 0.4, C.pillow, 0.05), L.bed.x, 0.48, L.bed.z + 0.8);
  // bàn học dưới kệ
  fix(box(1.9, 0.08, 0.8, C.desk), L.desk.x, 0.78, L.desk.z);
  for (const [dx, dz] of [[-0.85, -0.3], [0.85, -0.3], [-0.85, 0.3], [0.85, 0.3]]) fix(box(0.08, 0.76, 0.08, C.desk_leg), L.desk.x + dx, 0.38, L.desk.z + dz);
  fix(makeGlassFrame(0.2, 0.15), L.desk.x + 0.1, 0.82, L.desk.z - 0.25, 0.15);      // khung kính trên bàn (N-08)
  // đèn bàn: vật tự sáng (emissive), KHÔNG phải nguồn sáng. Độ sáng = preset.lamp (setLighting).
  const lamp = put(makeDeskLamp(), L.desk.x + 0.7, 0.82, L.desk.z - 0.2);
  const lampShade = lamp.getObjectByName('lamp:shade') as THREE.Mesh, lampBulb = lamp.getObjectByName('lamp:bulb') as THREE.Mesh;
  lampShade.material = (lampShade.material as THREE.MeshToonMaterial).clone();
  lampBulb.material = (lampBulb.material as THREE.MeshBasicMaterial).clone();
  const shadeMat = lampShade.material as THREE.MeshToonMaterial, bulbMat = lampBulb.material as THREE.MeshBasicMaterial;
  const BULB_OFF = new THREE.Color('#bdb6a8'), BULB_ON = new THREE.Color('#fff1c8');
  // vầng sáng đèn hắt trên mặt bàn: đĩa phẳng trong suốt (không phải nguồn sáng), độ đậm theo preset.lamp
  const glowMat = new THREE.MeshBasicMaterial({ color: '#ffe2b0', transparent: true, opacity: 0, depthWrite: false });
  glowMat.userData.outlineParameters = { visible: false };
  const lampGlow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), glowMat);
  lampGlow.name = 'lamp:glow'; lampGlow.rotation.x = -Math.PI / 2;
  lampGlow.position.set(L.desk.x + 0.55, 0.823, L.desk.z - 0.05); lampGlow.scale.set(1, 0.85, 1); lampGlow.renderOrder = 1;
  room.add(lampGlow);
  // đồ trang trí K2 (kệ sách, tủ áo, ghế, cửa, cây, đèn trần, bảng ghim, móc balo) — gộp riêng một nhóm
  room.add(mergeStatic(buildHubDecor(R.decor)));

  // ---- vật tương tác trong phòng (id khớp content/hub.ts) ----
  const items = new Map<string, THREE.Object3D>();
  const spots = new Map<string, { x: number; z: number }>();
  // Hộp Kỷ Vật: thùng carton rỗng ruột, nắp bản lề ở cạnh sau; đặt hơi xoay ra giữa phòng
  const BW = 1.0, BD = 0.7, BH = 0.42, T = 0.03;
  const boxGroup = new THREE.Group();
  const cardboard = '#b08355';
  const bottom = box(BW, T, BD, cardboard); bottom.position.y = T / 2;
  const front = box(BW, BH, T, cardboard); front.position.set(0, BH / 2, BD / 2 - T / 2);
  const back = box(BW, BH, T, cardboard); back.position.set(0, BH / 2, -BD / 2 + T / 2);
  const left = box(T, BH, BD, cardboard); left.position.set(-BW / 2 + T / 2, BH / 2, 0);
  const right = box(T, BH, BD, cardboard); right.position.set(BW / 2 - T / 2, BH / 2, 0);
  const tape = box(0.5, 0.06, 0.005, '#e2c25a'); tape.position.set(0, BH - 0.06, BD / 2 + 0.002);
  boxGroup.add(bottom, front, back, left, right, tape);
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, BH, -BD / 2);
  const lid = box(BW + 0.04, 0.025, BD + 0.04, '#c4955f'); lid.position.set(0, 0.0125, (BD + 0.04) / 2 - 0.02);
  lidPivot.add(lid); boxGroup.add(lidPivot);
  const contents = new THREE.Group(); boxGroup.add(contents);
  boxGroup.rotation.y = 0.35;
  items.set('itr.hub.memory_box', put(boxGroup, L.memory_box.x, 0, L.memory_box.z));
  spots.set('itr.hub.memory_box', L.memory_box);
  items.set('itr.hub.album', put(box(0.5, 0.07, 0.38, '#8b3a3a', 0.02), L.album.x, 0.86, L.album.z)); spots.set('itr.hub.album', L.album);
  items.set('itr.hub.phone', put(box(0.16, 0.025, 0.3, '#2c2f36', 0.01), L.phone.x, 0.835, L.phone.z)); spots.set('itr.hub.phone', L.phone);
  const shelf = new THREE.Group();
  shelf.add(box(1.8, 0.05, 0.3, C.shelf));
  const plank2 = box(1.8, 0.05, 0.3, C.shelf); plank2.position.y = 0.55; shelf.add(plank2);
  items.set('itr.hub.shelf', put(shelf, L.shelf.x, 1.45, -Dz + 0.16)); spots.set('itr.hub.shelf', L.shelf);
  shelf.traverse((c) => { c.castShadow = false; });                                  // ván treo mỏng: bóng của nó phủ tối cả mảng tường sau bàn
  // Sổ luật Căn cứ (N-08, Kết demo Bước 1): đứng ở đầu phải tấm ván dưới, hơi xoay và nhô ra phía trước.
  const rulebook = put(makeRulebook(), L.rulebook.x, 1.45 + 0.025, -Dz + 0.18);
  rulebook.rotation.y = 0.3;
  items.set('itr.hub.rulebook', rulebook); spots.set('itr.hub.rulebook', L.rulebook);
  for (const it of hub.interactables) if (!items.has(it.id)) {
    const p = { x: it.position?.[0] ?? 0, z: it.position?.[1] ?? 0 };
    items.set(it.id, put(box(0.3, 0.3, 0.3, '#c0b090'), p.x, 0.15, p.z)); spots.set(it.id, p);
  }
  const shelfItems = new THREE.Group(); shelfItems.position.set(L.shelf.x, 1.48, -Dz + 0.16); room.add(shelfItems);

  room.add(mergeStatic(decor));

  // ---- va chạm: đồ đạc là hình chữ nhật (hộp xoay → lấy khung bao) ----
  const rot = boxGroup.rotation.y, bhx = (Math.abs(Math.cos(rot)) * BW + Math.abs(Math.sin(rot)) * BD) / 2, bhz = (Math.abs(Math.sin(rot)) * BW + Math.abs(Math.cos(rot)) * BD) / 2;
  const rects: Rect[] = [
    { x0: L.memory_box.x - bhx, x1: L.memory_box.x + bhx, z0: L.memory_box.z - bhz, z1: L.memory_box.z + bhz },
    { x0: L.desk.x - 0.95, x1: L.desk.x + 0.95, z0: L.desk.z - 0.4, z1: L.desk.z + 0.4 },
    { x0: L.bed.x - 0.75, x1: L.bed.x + 0.75, z0: L.bed.z - 1.1, z1: L.bed.z + 1.1 },
    ...R.colliders,
  ];
  const body = R.move.body_radius;
  const p: HubPlayer = { x: R.spawn.x, z: R.spawn.z, yaw: 0, pitch: R.look.base_pitch_deg * D2R };
  let yawT = p.yaw, pitchT = p.pitch;
  function settle(x: number, z: number) {
    let nx = clamp(x, -W + body, W - body), nz = clamp(z, -Dz + body, Dz - body);
    for (const r of rects) {
      const x0 = r.x0 - body, x1 = r.x1 + body, z0 = r.z0 - body, z1 = r.z1 + body;
      if (nx <= x0 || nx >= x1 || nz <= z0 || nz >= z1) continue;
      const pen = [nx - x0, x1 - nx, nz - z0, z1 - nz], m = Math.min(...pen);
      if (m === pen[0]) nx = x0; else if (m === pen[1]) nx = x1; else if (m === pen[2]) nz = z0; else nz = z1;
    }
    p.x = nx; p.z = nz;
  }

  // ---- camera: góc nhìn thứ nhất ↔ cận cảnh miệng hộp ----
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.05, 60);
  camera.rotation.order = 'YXZ';
  const fpPos = new THREE.Vector3(), fpQ = new THREE.Quaternion(), fpE = new THREE.Euler(0, 0, 0, 'YXZ');
  const boxCamPos = new THREE.Vector3(0, 1.15, 0.55).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot).add(new THREE.Vector3(L.memory_box.x, 0, L.memory_box.z));
  // lookAt của camera quay trục −Z về phía mục tiêu (Object3D thường quay +Z) → phải dùng một camera tạm
  const boxCamQ = (() => { const o = new THREE.PerspectiveCamera(); o.position.copy(boxCamPos); o.lookAt(L.memory_box.x, 0.12, L.memory_box.z); return o.quaternion.clone(); })();
  let boxOpen = false, blend = 0;
  const lookCfg = R.look;
  const maxYaw = lookCfg.max_yaw_deg * D2R, pUp = lookCfg.pitch_up_deg * D2R, pDown = -lookCfg.pitch_down_deg * D2R, base = lookCfg.base_pitch_deg * D2R;
  const curve = (v: number) => { const a = Math.abs(v); return a <= lookCfg.dead_zone ? 0 : Math.sign(v) * Math.min(1, (a - lookCfg.dead_zone) / (1 - lookCfg.dead_zone)); };
  const forwardOf = (yaw: number) => ({ x: -Math.sin(yaw), z: -Math.cos(yaw) });
  function placeCamera() {
    fpPos.set(p.x, R.eye_height, p.z);
    fpE.set(p.pitch, p.yaw, 0, 'YXZ'); fpQ.setFromEuler(fpE);
    const e = blend * blend * (3 - 2 * blend);
    camera.position.lerpVectors(fpPos, boxCamPos, e);
    camera.quaternion.slerpQuaternions(fpQ, boxCamQ, e);
  }
  placeCamera();

  // ---- món trong hộp ----
  interface BoxItem { obj: THREE.Object3D; mats: THREE.MeshToonMaterial[]; state: BoxItemView['state']; baseY: number }
  const boxItems = new Map<string, BoxItem>();
  function clearBoxItems() {
    for (const it of boxItems.values()) { contents.remove(it.obj); it.obj.traverse((o) => (o as THREE.Mesh).geometry?.dispose()); it.mats.forEach((m) => m.dispose()); }
    boxItems.clear();
  }

  const ray = new THREE.Raycaster();
  let hover: string | null = null;
  const hit = (objs: Iterable<[string, THREE.Object3D]>, x: number, y: number) => {
    ray.setFromCamera(new THREE.Vector2(x, y), camera);
    let best: string | null = null, bestD = Infinity;
    for (const [id, obj] of objs) {
      const h = ray.intersectObject(obj, true)[0];
      if (h && h.distance < bestD) { best = id; bestD = h.distance; }
    }
    return best;
  };
  const distTo = (id: string) => { const s = spots.get(id); return s ? Math.hypot(s.x - p.x, s.z - p.z) : Infinity; };

  return {
    scene, camera,
    get player() { return { ...p }; },
    get boxOpen() { return boxOpen; },
    get boxBlend() { return blend; },
    update(dt, t, ctl) {
      if (ctl?.cursor) {
        yawT = -curve(ctl.cursor.x) * maxYaw;
        const cy = curve(ctl.cursor.y);
        pitchT = cy >= 0 ? base + cy * (pUp - base) : base + cy * (base - pDown);
      }
      if (ctl?.drag && (ctl.drag.dx || ctl.drag.dy)) {
        yawT = clamp(yawT - ctl.drag.dx * lookCfg.touch_deg_per_px * D2R, -maxYaw, maxYaw);
        pitchT = clamp(pitchT - ctl.drag.dy * lookCfg.touch_deg_per_px * D2R, pDown, pUp);
      }
      const k = 1 - Math.exp(-lookCfg.follow * dt);
      p.yaw += (yawT - p.yaw) * k; p.pitch += (pitchT - p.pitch) * k;
      const mv = ctl?.move;
      if (mv && !boxOpen && (mv.forward || mv.strafe)) {
        const f = forwardOf(p.yaw), r = { x: -f.z, z: f.x };
        const len = Math.hypot(mv.forward, mv.strafe) || 1;
        const sp = (mv.run ? R.move.run : R.move.walk) * dt / Math.max(1, len);
        settle(p.x + (f.x * mv.forward + r.x * mv.strafe) * sp, p.z + (f.z * mv.forward + r.z * mv.strafe) * sp);
      }
      blend = clamp(blend + (boxOpen ? 1 : -1) * dt * 1.8, 0, 1);
      placeCamera();
      lidPivot.rotation.x = THREE.MathUtils.lerp(lidPivot.rotation.x, boxOpen ? -1.9 : 0, 0.12);
      for (const [id, obj] of items) {
        const k2 = id === hover && !boxOpen ? 1.06 + Math.sin(t * 6) * 0.012 : 1;
        if (id !== 'itr.hub.memory_box') obj.scale.setScalar(THREE.MathUtils.lerp(obj.scale.x, k2, 0.25));
      }
      for (const [id, it] of boxItems) {
        const s = id === hover && boxOpen ? 1.15 : 1;
        it.obj.scale.setScalar(THREE.MathUtils.lerp(it.obj.scale.x, s, 0.25));
        if (it.state === 'glow') {
          const g = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 4));
          it.mats.forEach((m) => { m.emissiveIntensity = g; });
          it.obj.position.y = it.baseY + 0.012 * (0.5 + 0.5 * Math.sin(t * 3));
        }
      }
    },
    pick(x, y) {
      // hộp đang mở: chỉ chọn món trong hộp, và chỉ khi camera đã lướt gần tới cận cảnh
      if (boxOpen) return blend > 0.6 ? hit([...boxItems].map(([id, it]) => [id, it.obj] as [string, THREE.Object3D]), x, y) : null;
      return hit(items, x, y);
    },
    setHover(id) { hover = id; },
    screenPoint(id) {
      const obj = items.get(id) ?? boxItems.get(id)?.obj;
      if (!obj) return null;
      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3()).project(camera);
      if (c.z > 1 || Math.abs(c.x) > 1 || Math.abs(c.y) > 1) return null;   // sau lưng camera / ngoài khung hình
      return { x: c.x, y: c.y };
    },
    nearest() {
      if (boxOpen) return null;
      const f = forwardOf(p.yaw), cone = Math.cos(R.view_cone_deg * D2R);
      let best: string | null = null, bestD = Infinity;
      for (const [id, s] of spots) {
        const dx = s.x - p.x, dz = s.z - p.z, d = Math.hypot(dx, dz);
        if (d > R.reach || d >= bestD) continue;
        if (d > 0.3 && (dx * f.x + dz * f.z) / d < cone) continue;
        best = id; bestD = d;
      }
      return best;
    },
    reachable(id) { return distTo(id) <= R.reach; },
    teleport(x, z, yaw) {
      settle(x, z);
      if (yaw !== undefined) { p.yaw = yawT = clamp(yaw, -maxYaw, maxYaw); }
      placeCamera();
    },
    setLighting(name) {
      const pr = config.presets[name] ?? Object.values(config.presets)[0];
      if (!pr) return;
      scene.background = new THREE.Color(pr.background);
      ambient.color.set(pr.ambient); ambient.groundColor.set(pr.ground); ambient.intensity = pr.ambientIntensity;
      key.color.set(pr.key); key.intensity = pr.keyIntensity;
      win.pane.material.color.set(config.window_colors[pr.window]);
      win.sky.visible = pr.window === 'night';
      const lampK = clamp(pr.lamp, 0, 1);
      shadeMat.emissiveIntensity = lampK;
      bulbMat.color.copy(BULB_OFF).lerp(BULB_ON, lampK);
      glowMat.opacity = 0.22 * lampK; lampGlow.visible = lampK > 0;
    },
    setShelf(artifacts) {
      for (const c of [...shelfItems.children]) { shelfItems.remove(c); c.traverse((o) => (o as THREE.Mesh).geometry?.dispose()); }
      artifacts.forEach((a, i) => {
        const m = artifactMesh(a.shape);
        m.scale.setScalar(1.4);
        m.position.x += -0.6 + (i % 5) * 0.3; m.position.y += i >= 5 ? 0.6 : 0.03;
        shelfItems.add(m);
      });
    },
    setBoxOpen(open) { boxOpen = open; if (!open) hover = null; },
    setBoxItems(list) {
      clearBoxItems();
      let artIndex = 0;
      for (const v of list) {
        const obj = v.kind === 'artifact' ? artifactMesh(v.shape) : decorMesh(v.shape);
        const slot = v.kind === 'artifact' ? ART_SLOT[artIndex++ % ART_SLOT.length] : DECOR_SLOT[v.id] ?? [0, 0.1, 0];
        obj.position.set(slot[0], slot[1], slot[2]);
        obj.userData.id = v.id;
        const mats: THREE.MeshToonMaterial[] = [];
        obj.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const m = (mesh.material as THREE.MeshToonMaterial).clone();
          if (v.state === 'dim') m.color.multiplyScalar(0.42);
          if (v.state === 'glow') { m.emissive = new THREE.Color('#ffcf5a'); m.emissiveIntensity = 0.5; }
          mesh.material = m; mats.push(m);
        });
        contents.add(obj);
        boxItems.set(v.id, { obj, mats, state: v.state, baseY: slot[1] });
      }
    },
    dispose() { clearBoxItems(); disposeScene(scene); },
  };
}
