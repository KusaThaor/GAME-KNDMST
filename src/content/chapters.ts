/**
 * Nhóm (Mốc/lớp) chỉ là NHÃN gom danh sách Trang để hiện menu và báo cáo; GDD v1.0 không dùng chữ "Chương" làm đơn vị chơi (D-04).
 * Trang (mã d.gNN.KK) là đơn vị có ID ổn định. Đổi cách gom = sửa file này.
 */
import type { Chapter } from './types';

export const CHAPTERS: Chapter[] = [
  { id: 'ch_m1', label: '[PLACEHOLDER] Mốc 1 · lớp 6–7', memory_day_ids: ['d.g06.01', 'd.g07.03'] }, // CHỜ T-05: thêm d.g07.01, d.g07.02 vào giữa (thứ tự đích: g06.01, g07.01, g07.02, g07.03)
];
