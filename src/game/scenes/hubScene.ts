/**
 * Scene Hub 2026: phòng nhìn từ góc cố định (RETAINED). Rê chuột làm sáng vật; click để chọn. Không di chuyển nhân vật.
 * Hình khối tạm (greybox có màu) — đồ thật và ánh sáng theo tiến trình sẽ bổ sung sau; tông phòng lấy từ config/hub.ts (D-13).
 */
import * as THREE from 'three';
import type { HubConfig } from '../../config/hub';
import type { Artifact, HubContent } from '../../content/types';
import { toon } from '../../render/materials';
import { box } from '../../world/school/props';
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

function artifactMesh(shape: Artifact['shape']): THREE.Object3D {
  switch (shape) {
    case 'paper': { const m = box(0.22, 0.02, 0.3, '#f4ecd2'); m.rotation.y = 0.4; return m; }
    case 'photo': { const g = new THREE.Group(); const f = box(0.3, 0.24, 0.02, '#f8f4ea'); const p = box(0.24, 0.17, 0.022, '#9db7c9'); p.position.z = 0.002; g.add(f, p); g.rotation.x = -0.25; g.position.y = 0.11; return g; }
    case 'boat': { const m = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), toon('#f1e9d0')); m.rotation.z = Math.PI / 2; m.position.y = 0.08; return m; }
    case 'sign': return box(0.34, 0.16, 0.03, '#b98a5a');
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

  const room = new THREE.Group(); scene.add(room);
  const put = (m: THREE.Object3D, x: number, y: number, z: number) => { m.position.set(x, y, z); room.add(m); m.traverse((c) => { c.castShadow = true; c.receiveShadow = true; }); return m; };
  put(box(7, 0.1, 5, '#b89b7a'), 0, -0.05, 0);                          // sàn
  put(box(7, 3.2, 0.12, '#d9d2c4'), 0, 1.6, -2.5);                      // tường sau
  put(box(0.12, 3.2, 5, '#cfc8ba'), -3.5, 1.6, 0);                      // tường trái
  put(box(2.4, 0.42, 1.5, '#7f95b5', 0.06), -2.1, 0.21, -1.6);          // giường
  put(box(0.7, 0.14, 0.5, '#f1ede4', 0.05), -2.9, 0.5, -1.9);           // gối
  put(box(1.9, 0.08, 0.8, '#a67c52'), 1.2, 0.78, 0.9);                  // mặt bàn
  for (const [x, z] of [[0.35, 0.6], [2.05, 0.6], [0.35, 1.2], [2.05, 1.2]]) put(box(0.08, 0.76, 0.08, '#8a6642'), x, 0.38, z);
  const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshBasicMaterial({ color: '#9fb4d6' }));
  windowPane.material.userData.outlineParameters = { visible: false };
  windowPane.position.set(-1.9, 1.95, -2.43); room.add(windowPane);
  put(box(1.66, 0.08, 0.1, '#f3efe6'), -1.9, 1.36, -2.42); put(box(1.66, 0.08, 0.1, '#f3efe6'), -1.9, 2.54, -2.42);

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
  for (const it of hub.interactables) if (!items.has(it.id)) items.set(it.id, put(box(0.3, 0.3, 0.3, '#c0b090'), it.position?.[0] ?? 0, 0.15, it.position?.[1] ?? 0));
  const shelfItems = new THREE.Group(); shelfItems.position.set(2.2, 1.48, -2.28); room.add(shelfItems);

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
      windowPane.material.color.set(p.window === 'sunny' ? '#ffe9b0' : p.window === 'cloudy' ? '#c9d3e0' : '#7d90ad');
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
