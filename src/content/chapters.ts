/**
 * Nhóm (Mốc/lớp) chỉ là NHÃN gom danh sách Trang để hiện menu và báo cáo; GDD v1.0 không dùng chữ "Chương" làm đơn vị chơi (D-04).
 * Trang (mã d.gNN.KK) là đơn vị có ID ổn định. Đổi cách gom = sửa file này.
 */
import type { Chapter } from './types';

export const CHAPTERS: Chapter[] = [
  { id: 'ch_g06', label: '[PLACEHOLDER] Mốc 1 · lớp 6', memory_day_ids: ['d.g06.01'] },
  { id: 'ch_g07', label: '[PLACEHOLDER] Mốc 1 · lớp 7', memory_day_ids: ['d.g07.03'] },
];
