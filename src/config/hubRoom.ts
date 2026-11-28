/**
 * Phòng 2026 (hub) đi lại được bằng góc nhìn thứ nhất — bố trí, điều khiển, đồ trong Hộp Kỷ Vật và câu "lục đồ".
 *
 * ĐÃ CHỐT 25/11 (R-P1): lời mở hộp + 6 món đồ nền theo docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md Phần 2
 * (Chương mở đầu, Về phòng sau Trang 1/2) và Phần 3 mục 3 — giữ đủ 6 món, câu chữ tự nhiên. Đổi lời = sửa file này, không sửa engine.
 * Xưng hô: Player 23 tuổi nói một mình → "mình", gọi nhóm "tụi mình" (GDD 01 §2.3: Player theo người đối diện).
 */
import type { DialogueLine, OwnershipLabel } from '../content/types';

export type HubDecorShape = 'notebooks' | 'scarf' | 'class_photo' | 'pencil_case' | 'eraser' | 'ruler';
export interface HubDecor { id: string; name: string; desc: string; shape: HubDecorShape; ownership_label: OwnershipLabel; lines: DialogueLine[] }

const me = (text: string): DialogueLine => ({ speaker: 'player', text });
const narr = (text: string): DialogueLine => ({ speaker: 'narrator', text });

export const HUB_ROOM = {
  /** Phòng: x ∈ [-w/2, w/2], z ∈ [-d/2, d/2] (z âm = tường có cửa sổ). Đơn vị mét. */
  size: { w: 7, d: 5, h: 2.8 },
  /** Player 23 tuổi (GDD 01 §3). */
  eye_height: 1.6,
  spawn: { x: 0, z: 1.7 },
  move: { walk: 1.5, run: 2.4, body_radius: 0.25 },
  /**
   * Góc nhìn thứ nhất 360 độ tự do từ tầm mắt cố định: xoay người nhìn mọi hướng trong phòng (kéo chuột/chạm, rê mép, phím mũi tên).
   */
  look: { max_yaw_deg: 360, pitch_up_deg: 28, pitch_down_deg: 45, base_pitch_deg: -6, dead_zone: 0.08, follow: 10, touch_deg_per_px: 0.32 },
  /** Lại gần trong khoảng này (m) và vật nằm trong góc nhìn (độ) thì hiện gợi ý tương tác. */
  reach: 1.7,
  view_cone_deg: 75,
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
    lamp: { x: 2.6, z: -2.25 },
    book: { x: -3.0, z: -0.6 },
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
  open_first: [
    narr('Chiếc thùng carton cũ phủ một lớp bụi mỏng. Mở nắp ra, mùi giấy cũ và năm tháng ùa về...'),
    me('Toàn đồ hồi cấp hai… Vở cũ, khăn quàng đỏ, cả tấm ảnh lớp.'),
    me('Ủa, mẩu giấy gấp tư góc này… là cái gì đây ta?'),
  ],
  open_again: [me('Lục tiếp coi trong thùng còn giữ món nào nữa.')],
  /** Bấm vào kỷ vật chưa tới lượt (còn mờ). */
  locked: [me('Món này còn mờ quá… để mình nhớ lại từ từ đã.')],
};

/** Lời thoại riêng biệt khi bấm vào từng kỷ vật chưa mở (màu mờ) trong hộp */
export const HUB_ARTIFACT_LOCKED_LINES: Record<string, DialogueLine[]> = {
  art_m1_02: [
    narr('Một chiếc thuyền giấy gấp bằng giấy vở ô ly cũ, nếp gấp vẫn còn ngay ngắn dù giấy đã ngả màu.'),
    me('Chiếc thuyền giấy tụi mình từng thả dưới mương nước sau trường những chiều mưa lớp 7... Mình cần nhớ lại Trang 1 trước đã.'),
  ],
  art_m1_03: [
    narr('Tấm biển gỗ nhỏ khắc vụng về cùng cuốn sổ tay ghi chép những luật lệ bí mật của nhóm.'),
    me('Tấm biển Căn cứ và sổ quy ước lớp 7! Hồi đó cả đám bày ra bao nhiêu trò nghịch ngợm. Để khi nào tới lượt mình sẽ xem kỹ lại.'),
  ],
  art_m1_05: [
    narr('Bức ảnh chụp nhóm bạn thân trong buổi cắm trại, nắng hè rực rỡ trên những nụ cười vô tư.'),
    me('Tấm ảnh chụp chung cả bọn... Nhiều năm rồi mỗi đứa một nơi. Để từ từ nhớ lại từng trang đã nhé.'),
  ],
};

/** Dòng hướng dẫn trên màn hình (không phải thoại). */
export const HUB_BOX_HINTS = {
  first: 'Bấm vào mẩu giấy gấp tư đang sáng · hoặc rê chuột khám phá các đồ vật trong thùng',
  normal: 'Bấm vào một món để xem · món đang sáng sẽ đưa bạn về quá khứ · Esc để đóng hộp',
};

/** Chú thích gợi nhớ và lời thoại riêng cho từng món kỷ vật chính */
export const HUB_ARTIFACT_DESCRIPTIONS: Record<string, { desc: string; icon?: string }> = {
  art_m1_01: { desc: 'Mảnh giấy mật mã phát sáng kỳ lạ · Bấm để quay về quá khứ', icon: '📜' },
  art_m1_02: { desc: 'Chiếc thuyền giấy ngày mưa lớp 7 · Cần nhớ lại Trang 1', icon: '⛵' },
  art_m1_03: { desc: 'Tấm biển Căn cứ & Sổ luật mật · Kỷ vật chưa mở', icon: '🪵' },
  art_m1_05: { desc: 'Tấm ảnh chụp chung cả nhóm hè lớp 7 · Kỷ vật chưa mở', icon: '📷' },
};

/** Đồ linh tinh trong hộp: có tên, chú thích khác nhau và lời thoại hoài niệm riêng biệt (giữ đúng thứ tự 6 món canonical). */
export const HUB_DECOR: HubDecor[] = [
  {
    id: 'deco.notebooks',
    name: 'Mấy cuốn vở cũ',
    desc: 'Vở bài tập ô ly lớp 6 bìa hoa, dán nhãn nắn nót tên lớp',
    shape: 'notebooks',
    ownership_label: 'HUMAN_CANON',
    lines: [
      narr('Mấy cuốn vở ô ly từ hồi cấp hai, mép quăn queo, trang bìa dán nhãn nắn nót tên lớp.'),
      me('Vở bài tập lớp 6… Nhìn nét chữ nắn nót từng nét thanh nét đậm hồi đó, so với chữ viết vội bây giờ đúng là khác một trời một vực.'),
    ],
  },
  {
    id: 'deco.scarf',
    name: 'Khăn quàng đỏ',
    desc: 'Khăn quàng Đội viên bạc màu viền, vải nhăn nhúm thân quen',
    shape: 'scarf',
    ownership_label: 'HUMAN_CANON',
    lines: [
      narr('Chiếc khăn quàng đỏ đã bạc màu viền, vải nhăn nhúm nằm cuộn tròn dưới đáy thùng.'),
      me('Khăn quàng đỏ nè… Hồi đó sáng nào quên đeo là sợ bị Đội cờ đỏ ghi tên vào sổ đầu bài, phải chạy đi mượn khắp nơi.'),
    ],
  },
  {
    id: 'deco.class_photo',
    name: 'Tấm ảnh lớp đã phai',
    desc: 'Ảnh chụp tập thể lớp 6 khai giảng, màu phim đã ngả vàng',
    shape: 'class_photo',
    ownership_label: 'HUMAN_CANON',
    lines: [
      narr('Bức ảnh tập thể chụp trước cổng trường năm khai giảng lớp 6, màu ảnh đã ngả sang tông nâu ấm áp.'),
      me('Tấm ảnh lớp hồi đó… Mắt đứa nào cũng mở to ngơ ngác trước ống kính. Nhiều đứa trong này giờ đã lập gia đình rồi.'),
    ],
  },
  {
    id: 'deco.pencil_case',
    name: 'Hộp bút sắt',
    desc: 'Hộp bút hai tầng sơn xanh tróc góc, lắc lên kêu lạch cạch',
    shape: 'pencil_case',
    ownership_label: 'HUMAN_CANON',
    lines: [
      narr('Hộp bút bằng sắt sơn xanh tróc sơn ở các góc, mở ra còn vương mùi mực tím và những mẩu tẩy vụn.'),
      me('Hộp bút sắt hồi lớp 6 nè… Lắc lên kêu lạch cạch vui tai. Nhớ hồi đó ai có hộp bút hai tầng là oách nhất lớp!'),
    ],
  },
  {
    id: 'deco.eraser',
    name: 'Cục gôm mòn',
    desc: 'Cục gôm thơm bị gặm mất góc, từng chuyền tay cả bàn',
    shape: 'eraser',
    ownership_label: 'HUMAN_CANON',
    lines: [
      narr('Cục gôm hình chữ nhật thơm mùi hoa quả, góc bị bấm lỗ kim và vẹt hẳn một đầu.'),
      me('Cục gôm thơm huyền thoại! Hồi đó đứa nào trong bàn cũng mượn rồi tiện tay cắn một góc, chuyền qua chuyền lại mòn vẹt.'),
    ],
  },
  {
    id: 'deco.ruler',
    name: 'Cây thước kẻ',
    desc: 'Thước kẻ dẻo in bảng cửu chương mờ nét, mép khắc chi chít',
    shape: 'ruler',
    ownership_label: 'HUMAN_CANON',
    lines: [
      narr('Cây thước nhựa dẻo 20cm, các vạch chia độ đã mờ theo năm tháng, trên mặt thước còn chi chít nét khắc bút bi.'),
      me('Cây thước kẻ này chuyên dùng để kẻ khung bài kiểm tra và… gõ bàn mỗi lần cả đám ồn ào. Vẫn còn nguyên vẹn ghê.'),
    ],
  },
];
