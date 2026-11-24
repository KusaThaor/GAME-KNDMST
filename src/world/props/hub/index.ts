/**
 * Đồ trang trí phòng 2026 (K2, E5 — chiều sâu, ấm cúng, không chữ). Vị trí khai ở config/hubRoom.ts (`decor`),
 * va chạm ở `colliders`. `buildHubDecor()` trả một nhóm CHƯA gộp: hubScene gọi `mergeStatic()` (mỗi màu một lượt vẽ,
 * InstancedMesh giữ nguyên). Ngân sách đồ mới: ≤ 15.000 tam giác, ≤ 15 lượt vẽ (tests/unit/props_hub.test.ts).
 */
import * as THREE from 'three';
import { makeBagHook, makeCeilingLamp, makePinboard, makePottedPlant } from './decor';
import { makeBookshelf, makeDeskChair, makeDoor, makeStorageBoxes, makeWardrobe } from './furniture';

export * from './decor';
export * from './furniture';
export { HUB_PROP_COLORS } from './palette';

export interface DecorPlace { x: number; z: number; y?: number; rot_deg?: number }
export type HubDecorKey = 'bookshelf' | 'wardrobe' | 'storage_boxes' | 'chair' | 'door' | 'plant' | 'ceiling_lamp' | 'pinboard' | 'bag_hook';

/** Hàm dựng của từng món (đáy min.y = 0, mặt trước +z). */
export const HUB_DECOR_BUILDERS: Record<HubDecorKey, () => THREE.Object3D> = {
  bookshelf: () => makeBookshelf(),
  wardrobe: makeWardrobe,
  storage_boxes: makeStorageBoxes,
  chair: makeDeskChair,
  door: makeDoor,
  plant: () => makePottedPlant(),
  ceiling_lamp: makeCeilingLamp,
  pinboard: () => makePinboard(),
  bag_hook: makeBagHook,
};

/** Dựng và đặt mọi món theo bảng vị trí. Đồ lớn đổ bóng + nhận bóng; đồ treo tường/trần chỉ nhận bóng. */
export function buildHubDecor(places: Record<HubDecorKey, DecorPlace>): THREE.Group {
  const g = new THREE.Group();
  g.name = 'hub-decor';
  const castsShadow: Record<HubDecorKey, boolean> = {
    bookshelf: true, wardrobe: true, storage_boxes: true, chair: true, plant: true, door: false, ceiling_lamp: false, pinboard: false, bag_hook: true,
  };
  for (const key of Object.keys(HUB_DECOR_BUILDERS) as HubDecorKey[]) {
    const p = places[key];
    const o = HUB_DECOR_BUILDERS[key]();
    o.name = `decor:${key}`;
    o.position.set(p.x, p.y ?? 0, p.z);
    o.rotation.y = ((p.rot_deg ?? 0) * Math.PI) / 180;
    o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = castsShadow[key]; c.receiveShadow = true; } });
    g.add(o);
  }
  return g;
}
