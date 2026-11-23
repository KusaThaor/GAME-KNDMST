/**
 * Phòng 2026 (hub) đi lại được bằng góc nhìn thứ nhất — bố trí, điều khiển, đồ trong Hộp Kỷ Vật và câu "lục đồ".
 *
 * CHƯA CHỐT: mọi câu thoại ở đây là AI_PROPOSED, ghi [PLACEHOLDER]; đổi lời = sửa file này, không sửa engine.
 * Tên các món đồ linh tinh lấy theo kịch bản v1.4 "MỞ ĐẦU — PHÒNG 2026" (vở cũ, khăn quàng đỏ, ảnh lớp đã phai);
 * hộp bút, cục gôm, thước kẻ là đồ AI thêm cho thùng đỡ trống (AI_PROPOSED).
 * Xưng hô: Player 23 tuổi nói một mình → "mình", gọi nhóm "tụi mình" (GDD 01 §2.3: Player theo người đối diện).
 */
import type { DialogueLine } from '../content/types';

export type HubDecorShape = 'notebooks' | 'scarf' | 'class_photo' | 'pencil_case' | 'eraser' | 'ruler';
export interface HubDecor { id: string; name: string; shape: HubDecorShape; ownership_label: 'AI_PROPOSED'; lines: DialogueLine[] }

const P = '[PLACEHOLDER]';
const me = (text: string): DialogueLine => ({ speaker: 'player', text: `${P} ${text}` });

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
  /** Màu vật liệu phòng (tường, sàn, đồ lớn). Đổi tông phòng = sửa ở đây, không sửa scene. */
  colors: {
    floor: '#b89b7a', ceiling: '#ece6da', wall: '#d9d2c4', wall_side: '#cfc8ba',
    bed: '#7f95b5', pillow: '#f1ede4', desk: '#a67c52', desk_leg: '#8a6642',
  },
} as const;

/** Câu khi mở Hộp Kỷ Vật: lần đầu (2 dòng) và các lần sau (1 dòng). */
export const HUB_BOX_LINES = {
  open_first: [me('Toàn đồ hồi cấp 2… vở, khăn quàng, ảnh lớp.'), me('Còn mẩu giấy gấp tư này là gì đây ta?')],
  open_again: [me('Lục tiếp coi còn gì nữa nè.')],
  /** Bấm vào kỷ vật chưa tới lượt (còn mờ). */
  locked: [me('Món này… để từ từ mình nhớ ra.')],
};

/** Dòng hướng dẫn trên màn hình (không phải thoại). */
export const HUB_BOX_HINTS = {
  first: 'Bấm vào mẩu giấy gấp tư đang sáng',
  normal: 'Bấm vào một món để xem · món đang sáng sẽ đưa bạn về quá khứ · Esc để đóng hộp',
};

/** Đồ linh tinh trong hộp: bấm chỉ nói một câu, không chuyển cảnh. */
export const HUB_DECOR: HubDecor[] = [
  { id: 'deco.notebooks', name: 'Mấy cuốn vở cũ', shape: 'notebooks', ownership_label: 'AI_PROPOSED', lines: [me('Vở Toán lớp 6. Chữ mình hồi đó xấu dữ thần.')] },
  { id: 'deco.scarf', name: 'Khăn quàng đỏ', shape: 'scarf', ownership_label: 'AI_PROPOSED', lines: [me('Khăn quàng đỏ… sáng nào quên đeo là bị ghi tên.')] },
  { id: 'deco.class_photo', name: 'Tấm ảnh lớp đã phai', shape: 'class_photo', ownership_label: 'AI_PROPOSED', lines: [me('Ảnh cả lớp. Mặt ai cũng mờ hết rồi.')] },
  { id: 'deco.pencil_case', name: 'Hộp bút sắt', shape: 'pencil_case', ownership_label: 'AI_PROPOSED', lines: [me('Hộp bút sắt, lắc lên còn kêu lạch cạch.')] },
  { id: 'deco.eraser', name: 'Cục gôm mòn', shape: 'eraser', ownership_label: 'AI_PROPOSED', lines: [me('Cục gôm mòn còn có một nửa.')] },
  { id: 'deco.ruler', name: 'Cây thước kẻ', shape: 'ruler', ownership_label: 'AI_PROPOSED', lines: [me('Thước kẻ ai khắc tên lên đây vậy ta?'), me('Chắc của mình thiệt.')] },
];
