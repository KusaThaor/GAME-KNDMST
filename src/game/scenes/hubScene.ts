/**
 * Scene Hub 2026: phòng nhìn từ góc cố định (RETAINED). Rê chuột làm sáng vật; click để chọn. Không di chuyển nhân vật.
 * Đồ trong phòng dựng procedural (D3, PX-50): gốc min.y = 0, mét, Y lên, mặt trước +z; vật liệu `toon()`, màu lấy từ `PAL`;
 * không dùng texture nên không có chuyện lệch colorSpace. Đồ tĩnh gộp bằng `mergeStatic()`, vật lặp dùng `InstancedMesh`.
 * Tông phòng và độ sáng đèn bàn lấy từ config/hub.ts.
 */
import * as THREE from 'three';
import type { HubConfig } from '../../config/hub';
import type { Artifact, HubContent } from '../../content/types';
import { flat, toon } from '../../render/materials';
import { mergeStatic } from '../../render/merge';
import { PAL, box } from '../../world/school/props';
import { disposeScene } from '../view';

export interface HubScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update(dt: number, t: number): void;
  /** Vật tương tác dưới con trỏ (toạ độ NDC). */
  pick(ndcX: number, ndcY: number): string | null;
  setHover(id: string | null): void;
  /** Tâm của một vật tương tác trên màn hình (toạ độ NDC) — cho bot/test bấm chuột thật. */
  screenPoint(id: string): { x: number; y: number } | null;
  setLighting(presetName: string): void;
  /** Kỷ vật đã lên kệ (phòng có thêm một món sau mỗi Ngày). */
  setShelf(artifacts: Artifact[]): void;
  setBoxOpen(open: boolean): void;
  dispose(): void;
}

/** Cường độ đèn bàn khi preset đặt `lamp: 1` (candela — đèn điểm, decay 2). */
const LAMP_CANDELA = 4;
const LAMP_COLOR = '#ffcf8a';

const lift = <T extends THREE.Object3D>(o: T, y: number): T => { o.position.y += y; return o; };

// ---------------------------------------------------------------------------
// Đồ procedural của phòng 2026 — mỗi hàm trả nhóm có đáy nằm đúng y = 0.
// ---------------------------------------------------------------------------

/** Đèn bàn: đế tròn, thân mảnh, chụp đèn vàng ấm phát sáng. Cao ≈ 0,43 m. */
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
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), flat('#fff1c8'));
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
export function makeRug(rx = 1.5, rz = 1.0): THREE.Group {
  const g = new THREE.Group();
  const layer = (k: number, h: number, color: string) => {
    const geo = new THREE.CylinderGeometry(k, k, h, 40); geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, toon(color, { outline: false })); m.scale.set(rx, 1, rz);
    return m;
  };
  g.add(layer(1, 0.02, PAL.roof), layer(0.82, 0.024, PAL.wallCream), layer(0.66, 0.028, PAL.roofDark));
  return g;
}

/** Một tấm rèm xếp nếp (InstancedMesh các dải đứng), treo từ y = h xuống y = 0. */
export function makeCurtain(w: number, h: number, folds = 6): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry((w / folds) * 0.94, h, 0.04); geo.translate(0, h / 2, 0);
  const mesh = new THREE.InstancedMesh(geo, toon(PAL.wallYellow), folds);
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

/** Cuốn sổ luật Căn cứ: đứng, gáy quay ra +z, bìa xanh đậm, có dải tiêu đề. Cao 0,30 m. */
export function makeRulebook(): THREE.Group {
  const g = new THREE.Group();
  const H = 0.3, T = 0.06, D = 0.2;
  const parts: [THREE.Mesh, number, number, number][] = [
    [box(T - 0.012, H - 0.01, D - 0.012, PAL.trim), 0, H / 2, 0],                 // ruột sách
    [box(0.008, H, D, PAL.frameDark), -(T / 2 - 0.004), H / 2, 0],                // bìa sau
    [box(0.008, H, D, PAL.frameDark), T / 2 - 0.004, H / 2, 0],                   // bìa trước
    [box(T, H, 0.01, PAL.frame), 0, H / 2, D / 2 - 0.005],                        // gáy
    [box(T + 0.004, 0.05, 0.012, PAL.wallYellow), 0, H * 0.72, D / 2 - 0.004],    // dải tiêu đề
  ];
  for (const [m, x, y, z] of parts) { m.position.set(x, y, z); g.add(m); }
  return g;
}

function artifactMesh(shape: Artifact['shape']): THREE.Object3D {
  switch (shape) {
    case 'paper': { const m = box(0.22, 0.02, 0.3, '#f4ecd2'); m.rotation.y = 0.4; return m; }
    case 'photo': { const g = new THREE.Group(); const f = box(0.3, 0.24, 0.02, '#f8f4ea'); const p = box(0.24, 0.17, 0.022, '#9db7c9'); p.position.z = 0.002; g.add(f, p); g.rotation.x = -0.25; g.position.y = 0.11; return g; }
    case 'boat': { const m = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), toon('#f1e9d0')); m.rotation.z = Math.PI / 2; m.position.y = 0.08; return m; }
    case 'sign': return box(0.34, 0.16, 0.03, '#b98a5a');
    case 'box': {                                         // hộp phấn giấy đã móp: thân + nắp lệch
      const g = new THREE.Group();
      g.add(lift(box(0.2, 0.08, 0.13, PAL.trim, 0.012), 0.04));
      const lid = lift(box(0.206, 0.025, 0.136, PAL.wallYellow, 0.008), 0.0925); lid.rotation.z = 0.06; g.add(lid);
      return g;
    }
    default: return box(0.2, 0.14, 0.2, '#c9a56b', 0.03);
  }
}

export function buildHubScene(hub: HubContent, config: HubConfig): HubScene {
  const scene = new THREE.Scene();
  const ambient = new THREE.HemisphereLight('#ffffff', '#8a7a6a', 1);
  const key = new THREE.DirectionalLight('#ffffff', 1.2);
  key.position.set(-2.5, 4.5, 3); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const sc = key.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 0.5; sc.far = 20;
  scene.add(ambient, key);

  // Kính trong suốt không đổ bóng.
  const shadowed = (m: THREE.Object3D) => m.traverse((c) => {
    const mesh = c as THREE.Mesh;
    if (mesh.isMesh) { mesh.castShadow = !(mesh.material as THREE.Material).transparent; mesh.receiveShadow = true; }
  });
  const room = new THREE.Group(); scene.add(room);
  /** Vật tương tác / vật động: đặt thẳng vào `room` để còn bắt chuột và phóng to khi rê. */
  const put = (m: THREE.Object3D, x: number, y: number, z: number) => { m.position.set(x, y, z); room.add(m); shadowed(m); return m; };
  /** Đồ trang trí tĩnh: gom vào `decor`, cuối hàm gộp một lần bằng `mergeStatic`. */
  const decor = new THREE.Group();
  const fix = (m: THREE.Object3D, x: number, y: number, z: number, rotY = 0, rotZ = 0) => { m.position.set(x, y, z); m.rotation.y = rotY; m.rotation.z = rotZ; decor.add(m); shadowed(m); return m; };

  fix(box(7, 0.1, 5, '#b89b7a'), 0, -0.05, 0);                          // sàn
  fix(box(7, 3.2, 0.12, '#d9d2c4'), 0, 1.6, -2.5);                      // tường sau
  fix(box(0.12, 3.2, 5, '#cfc8ba'), -3.5, 1.6, 0);                      // tường trái
  fix(box(2.4, 0.42, 1.5, '#7f95b5', 0.06), -2.1, 0.21, -1.6);          // giường
  fix(box(0.7, 0.14, 0.5, '#f1ede4', 0.05), -2.9, 0.5, -1.9);           // gối
  fix(box(1.9, 0.08, 0.8, '#a67c52'), 1.2, 0.78, 0.9);                  // mặt bàn
  for (const [x, z] of [[0.35, 0.6], [2.05, 0.6], [0.35, 1.2], [2.05, 1.2]]) fix(box(0.08, 0.76, 0.08, '#8a6642'), x, 0.38, z);

  // ---- đồ trang trí (PX-50) ----
  fix(makeRug(1.5, 1.0), -0.2, 0, 1.0);                                  // thảm dưới Hộp Kỷ Vật
  const win = makeNightWindow(1.5, 1.1);
  fix(win.frame, -1.9, 1.32, -2.42);                                     // cửa sổ: khung tĩnh
  win.pane.position.add(new THREE.Vector3(-1.9, 1.32, -2.42)); room.add(win.pane);
  win.sky.position.set(-1.9, 1.32, -2.42); room.add(win.sky);
  fix(box(2.1, 0.03, 0.03, PAL.trunkDark), -1.9, 2.64, -2.36);          // thanh treo rèm
  for (const x of [-2.77, -1.03]) { const c = makeCurtain(0.4, 1.72); c.position.set(x, 0.92, -2.37); room.add(c); }
  fix(makeWallFrame(0.46, 0.34, '#9db7c9'), 0.1, 1.75, -2.44, 0, 0.02);  // khung ảnh tường
  fix(makeWallFrame(0.3, 0.4, PAL.wallYellow), 0.72, 2.0, -2.44, 0, -0.03);
  fix(makeWallFrame(0.36, 0.26, PAL.leaf2), 0.62, 1.55, -2.44, 0, 0.015);
  fix(makeGlassFrame(0.2, 0.15), 1.25, 0.82, 0.6, 0.15);                // khung kính trên bàn
  fix(makeDeskLamp(), 1.95, 0.82, 0.62);                                 // đèn bàn
  const lampLight = new THREE.PointLight(LAMP_COLOR, 0, 6, 2);
  lampLight.position.set(1.95, 0.82 + 0.3, 0.62);
  room.add(lampLight);

  // ---- vật tương tác (id khớp content/hub.ts) ----
  const items = new Map<string, THREE.Object3D>();
  const boxBody = new THREE.Group();
  boxBody.add(box(0.9, 0.45, 0.6, '#b08355', 0.03));
  const lid = box(0.94, 0.08, 0.64, '#c4955f', 0.03); lid.position.set(0, 0.27, 0); boxBody.add(lid);
  items.set('itr.hub.memory_box', put(boxBody, -0.9, 0.225, 0.6));
  items.set('itr.hub.album', put(box(0.5, 0.07, 0.38, '#8b3a3a', 0.02), 0.75, 0.86, 0.9));
  items.set('itr.hub.phone', put(box(0.16, 0.025, 0.3, '#2c2f36', 0.01), 1.7, 0.835, 0.95));
  const shelf = new THREE.Group();
  shelf.add(box(1.8, 0.05, 0.3, '#9a7650'));
  const plank2 = box(1.8, 0.05, 0.3, '#9a7650'); plank2.position.y = 0.55; shelf.add(plank2);
  items.set('itr.hub.shelf', put(shelf, 2.2, 1.45, -2.28));
  // Sổ luật Căn cứ: đứng ở đầu tấm ván dưới, hơi xoay và nhô ra phía trước.
  const rulebook = put(makeRulebook(), 3.04, 1.45 + 0.025, -2.2);
  rulebook.rotation.y = 0.3;
  items.set('itr.hub.rulebook', rulebook);
  for (const it of hub.interactables) if (!items.has(it.id)) items.set(it.id, put(box(0.3, 0.3, 0.3, '#c0b090'), it.position?.[0] ?? 0, 0.15, it.position?.[1] ?? 0));
  const shelfItems = new THREE.Group(); shelfItems.position.set(2.2, 1.48, -2.28); room.add(shelfItems);

  room.add(mergeStatic(decor));

  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 60);
  camera.position.set(1.4, 3.4, 6.4);
  camera.lookAt(0.1, 0.9, -0.4);

  const ray = new THREE.Raycaster();
  let hover: string | null = null;
  let boxOpen = false;

  return {
    scene, camera,
    update(_dt, t) {
      for (const [id, obj] of items) {
        const k = id === hover ? 1.08 + Math.sin(t * 6) * 0.015 : 1;
        obj.scale.setScalar(THREE.MathUtils.lerp(obj.scale.x, k, 0.25));
      }
      lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, boxOpen ? -1.1 : 0, 0.12);
      lid.position.z = THREE.MathUtils.lerp(lid.position.z, boxOpen ? -0.28 : 0, 0.12);
    },
    pick(x, y) {
      ray.setFromCamera(new THREE.Vector2(x, y), camera);
      let best: string | null = null, bestD = Infinity;
      for (const [id, obj] of items) {
        const hit = ray.intersectObject(obj, true)[0];
        if (hit && hit.distance < bestD) { best = id; bestD = hit.distance; }
      }
      return best;
    },
    setHover(id) { hover = id; },
    screenPoint(id) {
      const obj = items.get(id);
      if (!obj) return null;
      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3()).project(camera);
      return { x: c.x, y: c.y };
    },
    setLighting(name) {
      const p = config.presets[name] ?? Object.values(config.presets)[0];
      if (!p) return;
      scene.background = new THREE.Color(p.background);
      ambient.color.set(p.ambient); ambient.intensity = p.ambientIntensity;
      key.color.set(p.key); key.intensity = p.keyIntensity;
      win.pane.material.color.set(p.window === 'night' ? '#1f2a48' : p.window === 'sunny' ? '#ffe9b0' : p.window === 'cloudy' ? '#c9d3e0' : '#7d90ad');
      win.sky.visible = p.window === 'night';
      lampLight.intensity = p.lamp * LAMP_CANDELA;
    },
    setShelf(artifacts) {
      for (const c of [...shelfItems.children]) { shelfItems.remove(c); c.traverse((o) => (o as THREE.Mesh).geometry?.dispose()); }
      artifacts.forEach((a, i) => {
        const m = artifactMesh(a.shape);
        m.position.x += -0.7 + (i % 5) * 0.35; m.position.y += i >= 5 ? 0.6 : 0.04;
        shelfItems.add(m);
      });
    },
    setBoxOpen(open) { boxOpen = open; },
    dispose() { disposeScene(scene); },
  };
}
