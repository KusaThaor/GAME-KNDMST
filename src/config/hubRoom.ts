/**
 * Phòng 2026 (hub) đi lại được bằng góc nhìn thứ nhất — bố trí, điều khiển, đồ trong Hộp Kỷ Vật và câu "lục đồ".
 *
 * ĐÃ CHỐT 25/11 (R-P1): lời mở hộp + 6 món đồ nền theo docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md Phần 2
 * (Chương mở đầu, Về phòng sau Trang 1/2) và Phần 3 mục 3 — giữ đủ 6 món, câu chữ tự nhiên. Đổi lời = sửa file này, không sửa engine.
 * Xưng hô: Player 23 tuổi nói một mình → "mình", gọi nhóm "tụi mình" (GDD 01 §2.3: Player theo người đối diện).
 */
import type { DialogueLine, OwnershipLabel } from '../content/types';

export type HubDecorShape = 'notebooks' | 'scarf' | 'class_photo' | 'pencil_case' | 'eraser' | 'ruler';
export interface HubDecor { id: string; name: string; shape: HubDecorShape; ownership_label: OwnershipLabel; lines: DialogueLine[] }

const me = (text: string): DialogueLine => ({ speaker: 'player', text });

export const HUB_ROOM = {
  /** Phòng: x ∈ [-w/2, w/2], z ∈ [-d/2, d/2] (z âm = tường có cửa sổ). Đơn vị mét. */
  size: { w: 7, d: 5, h: 2.8 },
  /** Player 23 tuổi (GDD 01 §3). */
  eye_height: 1.6,
  spawn: { x: 0, z: 1.7 },
  move: { walk: 1.5, run: 2.4, body_radius: 0.25 },
  /**
   * Góc nhìn thứ nhất, chỉ quay trong một khoảng (chủ dự án chốt 22/11): rê chuột về phía nào thì nhìn về phía đó,
   * tới mép màn hình là hết góc. Không quay vòng, không bay quanh phòng. Cảm ứng: kéo màn hình, cũng bị chặn ở giới hạn.
   */
  look: { max_yaw_deg: 65, pitch_up_deg: 18, pitch_down_deg: 45, base_pitch_deg: -10, dead_zone: 0.15, follow: 7, touch_deg_per_px: 0.25 },
  /** Lại gần trong khoảng này (m) và vật nằm trong góc nhìn (độ) thì hiện gợi ý tương tác. */
  reach: 1.5,
  view_cone_deg: 60,
  /** Vị trí đồ đạc (tâm, mét). Hộp Kỷ Vật nằm ở góc trong cùng bên trái. */
  layout: {
    memory_box: { x: -2.75, z: -1.85 },
    desk: { x: 1.9, z: -2.05 },
    bed: { x: 2.65, z: 1.3 },
    album: { x: 1.35, z: -2.05 },
    phone: { x: 2.45, z: -1.95 },
    shelf: { x: 2.2, z: -2.3 },
    /** Sổ luật Căn cứ (N-08): đứng ở đầu phải ván dưới của kệ. */
    rulebook: { x: 3.03, z: -2.2 },
    /** Tâm ô kính cửa sổ trên tường z âm. */
    window: { x: -0.6, z: -2.5 },
    rug: { x: -0.9, z: 0.0 },
  },
  /**
   * Đồ trang trí K2 (world/props/hub): tâm đáy, mét; `rot_deg` quay quanh trục Y (mặt trước +z: 90 = quay ra +x, −90 = ra −x).
   * Tường trái (x = −3,5): kệ sách, chậu cây, móc balo, cửa ra vào. Tường phải (x = 3,5): tủ áo (+ hộp trên nóc), bảng ghim trên giường.
   */
  decor: {
    bookshelf: { x: -3.34, z: -0.6, rot_deg: 90 },
    plant: { x: -3.12, z: 0.3 },
    bag_hook: { x: -3.5, z: 0.95, y: 0.95, rot_deg: 90 },
    door: { x: -3.5, z: 1.85, rot_deg: 90 },
    wardrobe: { x: 3.225, z: -0.85, rot_deg: -90 },
    storage_boxes: { x: 3.2, z: -0.85, y: 1.9, rot_deg: -90 },
    chair: { x: 1.9, z: -1.4, rot_deg: 180 },
    pinboard: { x: 3.5, z: 1.0, y: 1.15, rot_deg: -90 },
    ceiling_lamp: { x: 0, z: 0, y: 2.68 },
  },
  /** Va chạm thêm cho đồ K2 (hình chữ nhật trên mặt sàn, mét) — camera đi lại không xuyên qua. */
  colliders: [
    { id: 'bookshelf', x0: -3.5, x1: -3.18, z0: -1.05, z1: -0.15 },
    { id: 'plant', x0: -3.3, x1: -2.94, z0: 0.12, z1: 0.48 },
    { id: 'wardrobe', x0: 2.95, x1: 3.5, z0: -1.35, z1: -0.35 },
    { id: 'chair', x0: 1.67, x1: 2.13, z0: -1.63, z1: -1.17 },
  ],
  /**
   * Màu vật liệu phòng (K2 khử ám vàng: trung tính, ấm rất nhẹ). Đổi tông phòng = sửa ở đây, không sửa scene.
   * Trước K2: sàn #b89b7a, tường #d9d2c4 / #cfc8ba, trần #ece6da, bàn #a67c52 — đều ngả be → cả khung hình vàng.
   */
  colors: {
    floor: '#a3988c', ceiling: '#f3f3f1', wall: '#ecebe7', wall_side: '#e6e5e1',
    bed: '#7f95b5', pillow: '#f4f2ee', desk: '#a68d74', desk_leg: '#8a7560', shelf: '#9a8268',
    rug: ['#8ea3b8', '#e9e4da', '#6f86a0'] as const, curtain: '#e6dccd',
  },
} as const;

/** Câu khi mở Hộp Kỷ Vật: lần đầu (2 dòng) và các lần sau (1 dòng). */
export const HUB_BOX_LINES = {
  open_first: [me('Toàn đồ hồi cấp hai… Vở cũ, khăn quàng đỏ, cả tấm ảnh lớp.'), me('Ủa, mẩu giấy gấp tư góc này… là cái gì đây ta?')],
  open_again: [me('Lục tiếp coi trong thùng còn giữ món nào nữa.')],
  /** Bấm vào kỷ vật chưa tới lượt (còn mờ). */
  locked: [me('Món này còn mờ quá… để mình nhớ lại từ từ đã.')],
};

/** Dòng hướng dẫn trên màn hình (không phải thoại). */
export const HUB_BOX_HINTS = {
  first: 'Bấm vào mẩu giấy gấp tư đang sáng',
  normal: 'Bấm vào một món để xem · món đang sáng sẽ đưa bạn về quá khứ · Esc để đóng hộp',
};

/** Đồ linh tinh trong hộp: bấm chỉ nói một câu, không chuyển cảnh. */
export const HUB_DECOR: HubDecor[] = [
  { id: 'deco.notebooks', name: 'Mấy cuốn vở cũ', shape: 'notebooks', ownership_label: 'HUMAN_CANON', lines: [me('Vở bài tập lớp 6… Chữ mình hồi đó viết nghệch ngoạc ghê.')] },
  { id: 'deco.scarf', name: 'Khăn quàng đỏ', shape: 'scarf', ownership_label: 'HUMAN_CANON', lines: [me('Khăn quàng đỏ nè… Hồi đó sáng nào quên đeo là bị sao đỏ ghi tên.')] },
  { id: 'deco.class_photo', name: 'Tấm ảnh lớp đã phai', shape: 'class_photo', ownership_label: 'HUMAN_CANON', lines: [me('Tấm ảnh lớp hồi đó… màu phai gần hết, nhìn hồi lâu mới nhận ra từng đứa.')] },
  { id: 'deco.pencil_case', name: 'Hộp bút sắt', shape: 'pencil_case', ownership_label: 'HUMAN_CANON', lines: [me('Hộp bút cũ lắc lên còn kêu lạch cạch. Nắp hộp vẫn còn mấy vết xước hồi đi học.')] },
  { id: 'deco.eraser', name: 'Cục gôm mòn', shape: 'eraser', ownership_label: 'HUMAN_CANON', lines: [me('Cục gôm mòn vẹt một góc, hồi đó đứa nào cũng hay mượn rồi quên trả.')] },
  { id: 'deco.ruler', name: 'Cây thước kẻ', shape: 'ruler', ownership_label: 'HUMAN_CANON', lines: [me('Cây thước nhựa tróc hết vạch số, trên mép còn khắc mấy chữ mờ tịt.')] },
];
