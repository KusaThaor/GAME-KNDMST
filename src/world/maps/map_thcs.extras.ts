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

const Z = { classroom: 'zone.thcs.classroom', corridor: 'zone.thcs.corridor', yard: 'zone.thcs.yard', gate: 'zone.thcs.gate', field: 'zone.thcs.field', base: 'zone.thcs.base' } as const;
const CORRIDOR_Y = 0.15;          // sàn hành lang + lớp học cao hơn sân 0,15 m
const PI = Math.PI;

/**
 * Marker Mốc 2 (N-04b) — đúng 16 mã của hợp đồng ở docs/handoff/NEXT_BATCH_2026-11-23_N14-N23.md mục 2.
 * Quy ước: `itr.`/`spot.` là CHỖ ĐỨNG (có sàn, ngoài vật cản), `facing` = hướng người đứng nhìn (0 = +z nam, π/2 = +x đông).
 * Đồ vật chưa có trong GLB (cột rổ, tivi, hòm thư, lều, lửa trại) do task đạo cụ dựng; ghi chỗ đặt ngay cạnh từng marker.
 */
export const M2_MARKERS = [
  // Trang 5 — Lên lớp 8
  ...cameraPair('cam.thcs.m2_opening', Z.yard, [4, 0.5, 6.6], [4, 2.0, 1.0]),                    // ảnh khai giảng: máy thấp, ngửa lên (hàng spot.thcs.yard_group_1…4 + trời + cột cờ)
  marker('interact', 'itr.thcs.chalk_box', Z.classroom, [0, CORRIDOR_Y, -28.4], -PI / 2),        // hộp phấn trên bàn giáo viên (−0,7; −28,4); đứng giữa bàn và bảng, nhìn sang bàn
  ...cameraPair('cam.thcs.m2_caro_board', Z.classroom, [-3.8, 1.65, -26], [1.0, 1.7, -26]),       // nhìn thẳng bảng đen (rộng 4,3 m lọt khung ở fov 40)
  marker('spot', 'spot.thcs.guard_corridor', Z.corridor, [1.4, CORRIDOR_Y, -20.8], -PI / 2),     // bác bảo vệ ngoài cửa lớp, nhìn về cửa (x −1,6…−0,4)
  // Trang 6 — Valentine
  marker('spot', 'spot.thcs.library_porch', Z.corridor, [19.2, CORRIDOR_Y, -20.5], 0),           // hiên phòng cuối dãy (cửa x ≈ 20,4) coi là thư viện; GLB chưa có biển thư viện
  marker('spot', 'spot.thcs.phuong_root', Z.yard, [-10.2, 0, -5.0], 1.06),                         // gốc phượng (−12; −6), lưng tựa bồn cây, nhìn ra sân
  marker('interact', 'itr.thcs.m2_mailbox', Z.base, [45.8, 0, -28.0], -1.75),                      // hòm thư đứng ĐÚNG chỗ này, mặt quay về bàn Căn cứ (43; −28,75)
  ...cameraPair('cam.thcs.m2_valentine_group', Z.base, [42.5, 1.0, -28.6], [46.6, 0.9, -29.4]),   // máy đặt trên bàn Căn cứ; hòm thư bên phải khung, nhóm trước chòi
  marker('interact', 'itr.thcs.m2_hoop', Z.yard, [-29, 0, -14], -3 * PI / 4),                     // chỗ ném; cột rổ (chưa có trong GLB) ở góc tây bắc sân, ~2 m trước mặt
  // Trang 7 — Báo tường
  ...cameraPair('cam.thcs.m2_newspaper', Z.classroom, [-6, 1.8, -27.3], [-6, 1.75, -29.8]),       // nhìn thẳng góc báo tường (itr.thcs.wall_news)
  // Trang 8 — Rã băng
  marker('interact', 'itr.thcs.m2_grocery_tv', Z.gate, [-4.4, 0, 28.3], 0),                       // tivi đặt ở mép đông quầy tạp hóa (≈ −4,4; 29,4), quay ra ngõ
  ...cameraPair('cam.thcs.m2_tv_group', Z.gate, [-4.4, 1.45, 23.8], [-4.4, 1.1, 28.6]),           // nhìn về tiệm: nhóm ngồi trước, tivi + mái hiên phía sau
  marker('interact', 'itr.thcs.m2_tent', Z.field, [40.5, 0, 9], -PI / 2),                          // trước cửa lều; lều dựng phía tây marker (≈ 38,5; 9)
  marker('interact', 'itr.thcs.m2_campfire', Z.field, [44.5, 0, 0.5], 0, 2.5),                     // TÂM lửa trại chung (N-13 đặt lửa ở đây)
  ...cameraPair('cam.thcs.m2_campfire_group', Z.field, [45, 0.8, 9.6], [44.6, 1.0, 1.0]),         // máy đặt trên khúc gỗ (spot.thcs.field_log), lửa trại phía sau nhóm
  // Trang 9 — Vẫn đủ năm đứa
  ...cameraPair('cam.thcs.m2_final_five', Z.yard, [-4.0, 1.3, -4.6], [-10.6, 2.6, -5.8]),         // nhìn về gốc phượng (tán cây lọt khung), hoàng hôn
];

/**
 * R-D0 — marker Trang 1–4 Mốc 1 (MAP-1, MAP-2; kịch bản chốt 25/11 TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md).
 * KHÔNG dời marker có sẵn trong GLB (tripod_spot, yard_group…; sửa GLB = Blender, trái D3): thêm mã MỚI, nội dung Trang 4
 * chuyển sang mã mới ở R-D4. `cam.thcs.rainbow` (giữa sân) giữ nguyên tới khi R-D4 đổi xong rồi mới gỡ.
 * Chỗ đứng nhóm: `<…>_group` = vòng sáng của người chơi (giữa), `_1…_4` = 4 bạn (hai đầu lùi 0,25 m thành vòng cung), mặt nhìn máy.
 */
export const M1_MARKERS = [
  // Trang 1 — Cảnh 1 (BUG-T1-B): Đức nhặt vở, dừng trước mặt người chơi vừa xuất hiện (spawn.thcs.yard [3; 11], nhìn bắc)
  marker('spot', 'spot.thcs.notebook_drop', Z.yard, [3, 0, 8.8], 0),
  // Trang 1 — Cảnh 2: bảng phân lớp + cửa lớp
  marker('spot', 'spot.thcs.class_list_1', Z.corridor, [-5.0, CORRIDOR_Y, -20.5], PI),            // Đức đứng cạnh người chơi trước bảng (itr.thcs.class_list)
  marker('spot', 'spot.thcs.class_door', Z.corridor, [-1.0, CORRIDOR_Y, -20.9], -PI / 2),         // Châu đứng trước cửa lớp (khe tường x −1,6…−0,4) ngoái về phía bảng
  // Trang 1 — Cảnh 3: ba bạn đứng quanh bàn r2c1 (cạnh tường sau, có cửa sổ); mảnh giấy mật lệnh trên mặt bàn
  marker('interact', 'itr.thcs.desk3', Z.classroom, [-6.9, CORRIDOR_Y, -28.4], PI / 2),           // người chơi, phía tây bàn, nhìn về bảng đen
  marker('spot', 'spot.thcs.desk3_1', Z.classroom, [-6.05, CORRIDOR_Y, -29.4], 0),                // Đức, khe giữa bàn và tường sau
  marker('spot', 'spot.thcs.desk3_2', Z.classroom, [-5.2, CORRIDOR_Y, -28.4], -PI / 2),           // Châu, khe giữa dãy bàn 2 và 3
  ...cameraPair('cam.thcs.desk3', Z.classroom, [-7.6, 1.45, -27.4], [-6.05, 0.86, -28.4]),        // ĐẨY-MÁY vào mặt bàn (mảnh giấy)
  // Trang 1 — Cảnh 4: bụi cây ven vòng đá cầu (cầu rơi vào); R-B4 dời cụm makeFootbagSpot về itr này
  marker('interact', 'itr.thcs.shuttle_bush', Z.yard, [14.6, 0, 9.2], 0.86),
  marker('spot', 'spot.thcs.shuttle_bush', Z.yard, [13.9, 0, 8.6], 0.86),                         // Châu tới lượm cầu
  // Trang 1 — Cảnh 4 (BUG-T1-B): vòng đá cầu itr.thcs.shuttle_ring (12; 7) — người chơi đối diện Đức, Châu cầm cầu đứng cạnh
  marker('spot', 'spot.thcs.shuttle_group', Z.yard, [12, 0, 8.3], PI),                              // người chơi, nhìn bắc về Đức
  marker('spot', 'spot.thcs.shuttle_group_1', Z.yard, [12, 0, 5.7], 0),                             // Đức, nhìn nam về người chơi
  marker('spot', 'spot.thcs.shuttle_group_2', Z.yard, [13.6, 0, 7.0], -PI / 2),                     // Châu, mép đông vòng, nhìn vào giữa
  // Trang 1 — Cảnh 5 (BUG-T1-B): trực nhật — hai bạn trước bảng đen (vách đông lớp, itr.thcs.blackboard), Châu đứng trong cửa lớp
  marker('spot', 'spot.thcs.board_group', Z.classroom, [-0.4, CORRIDOR_Y, -26.6], PI / 2),        // người chơi, nhìn đông vào bảng
  marker('spot', 'spot.thcs.board_group_1', Z.classroom, [-0.4, CORRIDOR_Y, -25.3], PI / 2),      // Đức, cạnh người chơi
  marker('spot', 'spot.thcs.class_door_in', Z.classroom, [-1.0, CORRIDOR_Y, -22.3], PI),          // Châu đeo cặp ở cửa (khe tường x −1,6…−0,4), ngoái về bảng
  // Trang 1 — Cảnh 6–7 (BUG-T1-B): người chơi đứng gần cổng nhìn về bậc thềm tiệm (itr.thcs.grocery_steps); camera góc ba ở phía cổng
  marker('spot', 'spot.thcs.grocery_watch', Z.gate, [-5.6, 0, 24.0], -0.59),
  // Trang 1 — Cảnh 8 (BUG-T1-B): người chơi đứng giữa Đức (spot.thcs.grocery_1) và Châu (spot.thcs.grocery_2) trên bậc thềm,
  // nhìn về máy cam.thcs.grocery (ảnh tự sướng bộ ba)
  marker('spot', 'spot.thcs.grocery_group', Z.gate, [-7.75, 0, 27.0], 2.45),
  // Trang 2 — Cảnh 4: đứng lùi 2,7 m chụp 5 thuyền ở mép rãnh; Cảnh 5–6: cuối rãnh (thuyền Hạ mắc lại)
  marker('spot', 'spot.thcs.gutter_photo', Z.yard, [-14, 0, -15.4], PI),
  marker('interact', 'itr.thcs.gutter_end', Z.yard, [-6.0, 0, -17.6], PI),                         // vớt thuyền, ký tên lên buồm
  marker('spot', 'spot.thcs.gutter_end_ref', Z.yard, [-5.0, 0, -17.4], -PI / 2),                  // Châu làm trọng tài, nhìn ngược về chỗ thả
  // Trang 4 — Cảnh 2–5: ảnh 1 dưới gốc phượng; máy đặt trên ghế đá (COLLIDER_bench_phuong), nhóm đứng mép tán phượng
  // chỗ đứng đặt máy = itr.thcs.stone_bench có sẵn trong GLB (−14,4; −2,2), không thêm mã trùng
  ...cameraPair('cam.thcs.phuong_group', Z.yard, [-14.5, 0.62, -2.6], [-10.0, 1.1, -5.3]),
  marker('spot', 'spot.thcs.phuong_group_1', Z.yard, [-10.42, 0, -6.33], -0.83),
  marker('spot', 'spot.thcs.phuong_group_2', Z.yard, [-9.92, 0, -5.69], -0.98),
  marker('spot', 'spot.thcs.phuong_group', Z.yard, [-9.5, 0, -5.0], -1.12),
  marker('spot', 'spot.thcs.phuong_group_3', Z.yard, [-9.23, 0, -4.24], -1.27),
  marker('spot', 'spot.thcs.phuong_group_4', Z.yard, [-9.03, 0, -3.45], -1.42),
  // Trang 4 — Cảnh 7: ảnh cầu vồng ở khúc gỗ bãi đất (COLLIDER_log). Cầu vồng ở sky.ts luôn nằm phía bắc máy (theo máy) →
  // máy nhìn bắc lệch đông 6°, ngửa 8° (khác ảnh Trang 8: cam.thcs.m2_campfire_group nhìn thẳng bắc, ngang tầm lửa trại).
  marker('interact', 'itr.thcs.field_log_cam', Z.field, [46.3, 0, 12.1], PI),                    // đứng phía nam khúc gỗ đặt máy
  ...cameraPair('cam.thcs.rainbow_log', Z.field, [46, 0.62, 11], [46.48, 1.27, 6.43]),          // R-D4 khai fov 44
  marker('spot', 'spot.thcs.rainbow_group_1', Z.field, [44.86, 0, 6.51], 0.25),
  marker('spot', 'spot.thcs.rainbow_group_2', Z.field, [45.68, 0, 6.42], 0.07),
  marker('spot', 'spot.thcs.rainbow_group', Z.field, [46.48, 0, 6.43], -0.1),
  marker('spot', 'spot.thcs.rainbow_group_3', Z.field, [47.27, 0, 6.59], -0.28),
  marker('spot', 'spot.thcs.rainbow_group_4', Z.field, [48.05, 0, 6.84], -0.46),
  // Trang 4 — Cảnh 8: tường dán ảnh trong chòi Căn cứ (vách sau COLLIDER_hut_back)
  marker('interact', 'itr.thcs.base_photo_wall', Z.base, [47.6, 0, -31.9], PI),
  ...cameraPair('cam.thcs.base_photo_wall', Z.base, [47.6, 1.5, -30.4], [47.6, 1.35, -32.85]),
];

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
    marker('spot', 'spot.thcs.grocery_1', Z.gate, [-8.6, 0, 27.5], 2.4),                              // Đức, bậc thềm tiệm: trong khung cam.thcs.grocery, nhìn về máy [N-01]
    marker('spot', 'spot.thcs.grocery_2', Z.gate, [-6.9, 0, 27.6], 2.6),                              // Châu, như trên [N-01]
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
    ...M1_MARKERS,
    ...M2_MARKERS,
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
