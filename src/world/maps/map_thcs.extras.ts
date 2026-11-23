/**
 * World Extras của map_thcs (N-04) — thêm bằng code, KHÔNG xuất lại Blender (quyết định D3).
 * Toạ độ: mét, x sang phải (đông), z về phía nam, y lên. Bố cục gốc: tools/blender/world/gen_map_thcs.py (dict L).
 *
 * BG-1 "Căn cứ trong trường": bãi đất + Căn cứ thành SÂN SAU của trường.
 *  - mở lối ở tường rào phía đông sân (x = 26, z −14…−10): tắt vật cản + ẩn tường GLB `wall_fence_east`, dựng lại 2 đoạn có khe;
 *  - chặn lối ngõ → bãi đất (x 31…35, z 18): tường sân sau chạy liền qua khe này;
 *  - tường rào sân sau bao bãi đất + Căn cứ; nhà kho cạnh lối vào Căn cứ.
 * Phần để nhìn dựng ở src/world/dressing/sets/backyard.ts từ CÙNG hằng số `BACKYARD` bên dưới.
 */
import { boxCollider, cameraPair, marker } from '../extras';
import type { ExtraCollider, WorldExtras } from '../types';

const Z = { corridor: 'zone.thcs.corridor', yard: 'zone.thcs.yard', gate: 'zone.thcs.gate', field: 'zone.thcs.field', base: 'zone.thcs.base' } as const;
const CORRIDOR_Y = 0.15;          // sàn hành lang cao hơn sân 0,15 m

/** Một đoạn tường thẳng theo trục x hoặc z, từ (x0, z0) tới (x1, z1). */
export interface WallSeg { id: string; zone: string; x0: number; z0: number; x1: number; z1: number }

export const BACKYARD = {
  wallH: 2.1, wallT: 0.25, capH: 0.12, capPad: 0.14,
  /** Lối mới sân → sân sau trên tường rào phía đông của trường. */
  opening: { x: 26, z0: -14, z1: -10 },
  /** Tường rào phía đông của trường, dựng lại thành 2 đoạn chừa lối (thay `WALL_fence_east` của GLB). */
  eastFence: [
    { id: 'wall_fence_east_n', zone: Z.yard, x0: 26, z0: -31, x1: 26, z1: -14 },
    { id: 'wall_fence_east_s', zone: Z.yard, x0: 26, z0: -10, x1: 26, z1: 18 },
  ] as WallSeg[],
  /** Tường rào sân sau, chạy ngoài hàng bụi rậm của bãi đất/Căn cứ, nối vào tường trường ở (26, −22,9) và (26, 18). */
  perimeter: [
    { id: 'wall_backyard_nw', zone: Z.field, x0: 26.125, z0: -22.9, x1: 37.1, z1: -22.9 },
    { id: 'wall_backyard_base_w', zone: Z.base, x0: 37.1, z0: -22.9, x1: 37.1, z1: -37.0 },
    { id: 'wall_backyard_base_n', zone: Z.base, x0: 37.1, z0: -37.0, x1: 52.9, z1: -37.0 },
    { id: 'wall_backyard_e', zone: Z.field, x0: 52.9, z0: -37.0, x1: 52.9, z1: 18.0 },
    // chạy liền qua khe ngõ → bãi đất (x 31,6…34,4) = chặn lối cũ
    { id: 'wall_backyard_s', zone: Z.field, x0: 26.125, z0: 18.0, x1: 52.9, z1: 18.0 },
  ] as WallSeg[],
  /** Khoảng cách cột tường (m). */
  pillarStep: 4,
  /** Nhà kho 4 × 3 × 2,6 m, cửa nhìn về phía tây (lối vào Căn cứ); toạ độ là tâm đáy. */
  shed: { cx: 49.4, cz: -19.3, w: 4, d: 3, h: 2.6, facing: -Math.PI / 2 },
} as const;

const wallCollider = (s: WallSeg): ExtraCollider => {
  const t = BACKYARD.wallT / 2;
  return boxCollider(s.id, s.zone, Math.min(s.x0, s.x1) - (s.x0 === s.x1 ? t : 0), Math.min(s.z0, s.z1) - (s.z0 === s.z1 ? t : 0),
    Math.max(s.x0, s.x1) + (s.x0 === s.x1 ? t : 0), Math.max(s.z0, s.z1) + (s.z0 === s.z1 ? t : 0), BACKYARD.wallH);
};
const shedHalf = () => {
  const s = BACKYARD.shed, rotated = Math.abs(Math.sin(s.facing)) > 0.5;
  return { hx: (rotated ? s.d : s.w) / 2, hz: (rotated ? s.w : s.d) / 2 };
};

export const EXTRAS: WorldExtras = {
  map_id: 'map_thcs',
  markers: [
    // Trang 1
    marker('interact', 'itr.thcs.class_list', Z.corridor, [-6, CORRIDOR_Y, -20.4]),                 // bảng phân lớp, hành lang
    marker('interact', 'itr.thcs.grocery_steps', Z.gate, [-7.75, 0, 27.2]),                          // trước tiệm tạp hóa
    ...cameraPair('cam.thcs.grocery', Z.gate, [-5.5, 1.6, 24.5], [-7.75, 0.8, 27.6]),                // ảnh bộ ba
    // Trang 2 — 5 chỗ đứng trú mưa dưới hiên, nhìn ra rãnh nước (+z)
    ...[-16, -14.8, -13.6, -12.4, -11.2].map((x, i) => marker('spot', `spot.thcs.eave_${i + 1}`, Z.corridor, [x, CORRIDOR_Y, -20.4], 0)),
    ...cameraPair('cam.thcs.gutter', Z.yard, [-12, 2.0, -16.5], [-14, 0, -18.1]),                    // ảnh 5 thuyền
    // Trang 3 — 3 điểm khảo sát Căn cứ + biển tên
    marker('interact', 'itr.thcs.base_survey_roof', Z.base, [45.3, 0, -32.2]),                       // mái che (bảng thẻ: [46, 0, −32,5] nằm trong vách chòi → dời ra 0,7 m)
    marker('interact', 'itr.thcs.base_survey_stump', Z.base, [41, 0, -25]),                          // gốc cây
    marker('interact', 'itr.thcs.base_survey_boxes', Z.base, [49.5, 0, -26]),                        // đống thùng giấy
    ...cameraPair('cam.thcs.base_sign', Z.base, [45, 1.7, -23.5], [45, 1.6, -30.5]),                  // ảnh biển tên
    // Trang 4
    ...cameraPair('cam.thcs.rainbow', Z.yard, [4, 1.3, 10.5], [4, 3.5, -10]),                         // ảnh cầu vồng (gốc phượng)
    // BG-1: vào sân sau từ sân, nhìn về phía đông
    marker('spawn', 'spawn.thcs.backyard', Z.field, [30, 0, -12], Math.PI / 2),
  ],
  disableColliders: ['wall_fence_east'],
  hideVisuals: [{ zone: Z.yard, node: 'WALL_fence_east' }],
  colliders: [
    ...BACKYARD.eastFence.map(wallCollider),
    ...BACKYARD.perimeter.map(wallCollider),
    boxCollider('backyard_shed', Z.field, BACKYARD.shed.cx - shedHalf().hx, BACKYARD.shed.cz - shedHalf().hz, BACKYARD.shed.cx + shedHalf().hx, BACKYARD.shed.cz + shedHalf().hz, BACKYARD.shed.h + 0.4),
    // bãi đất chưa mở trong Ngày này → dây chắn ở lối mới (giống `gate_field` ở lối ngõ cũ)
    boxCollider('gate_backyard_opening', Z.yard, BACKYARD.opening.x - 0.25, BACKYARD.opening.z0, BACKYARD.opening.x + 0.25, BACKYARD.opening.z1, 1.2, { blocksCamera: false, gate_zone: Z.field }),
  ],
  // khe 0,2 m giữa sàn sân (x ≤ 26) và sàn bãi đất (x ≥ 26,2) ở chỗ lối mới
  floors: [{ id: 'backyard_opening', zone: Z.yard, x0: 25.8, z0: BACKYARD.opening.z0, x1: 26.4, z1: BACKYARD.opening.z1, y: 0 }],
};
