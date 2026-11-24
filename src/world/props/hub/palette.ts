/**
 * Bảng màu đồ trang trí phòng 2026 (K2). Ít màu có chủ đích: mỗi màu là một vật liệu toon (cache theo màu), sau
 * `mergeStatic()` mỗi màu = một lượt vẽ → giữ ngân sách ≤ 15 lượt vẽ cho đồ mới. Tông trung tính, ấm rất nhẹ
 * (khử ám vàng): gỗ sáng, trắng ngà, xanh xám; điểm màu ấm nằm ở đèn bàn và chậu cây.
 */
import { PAL } from '../../school/props';

export const HUB_PROP_COLORS = {
  /** Gỗ sơn trắng ngà: kệ sách, tủ áo, khuôn cửa, ô cửa, đế đèn trần. */
  white_wood: '#ebe7e0',
  /** Gỗ tự nhiên bớt bão hòa: ghế, cánh cửa, khung bảng ghim, thanh móc, thân cây. */
  wood: '#a68d74',
  /** Nâu sẫm: tay nắm, chân đế tủ, chốt móc, đất trong chậu. */
  handle: '#5b5048',
  /** Đệm ghế + túi trước balo (cùng tông chăn giường). */
  cushion: '#7f95b5',
  kraft: '#c4a687',
  shoebox: '#a9bccb',
  pot: '#b47258',
  leaf: PAL.leaf,
  cork: '#c2a27f',
  bag: '#5b7fa6',
  lamp_diffuser: '#f7f5f0',
  lamp_glow: '#fff4e6',
  pin: '#c0392b',
  /** Giấy note trống (màu trơn, không chữ). */
  notes: ['#fff3b0', '#ffd8cc', '#cfe6f5', '#d9efc9', '#f6f5f0'],
  /** Gáy sách (màu trơn, không chữ). */
  books: ['#4f6d8f', '#8f4a46', '#5f8a6a', '#d9cdb8', '#c58b4a', '#3d4b5c', '#a7b6c2', '#7a6a8f', '#e6e1d6'],
} as const;
