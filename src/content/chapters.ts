/**
 * Nhóm (Mốc/lớp) chỉ là NHÃN gom danh sách Trang để hiện menu và báo cáo; GDD v1.0 không dùng chữ "Chương" làm đơn vị chơi (D-04).
 * Trang (mã d.gNN.KK) là đơn vị có ID ổn định.
 * Tên Mốc 1: chủ dự án chốt 25/11 (TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md Phần 3 mục 1).
 */
import type { Chapter } from './types';

export const CHAPTERS: Chapter[] = [
  { id: 'ch_m1', label: 'Mốc 1 · Căn cứ đầu tiên (Lớp 6–7)', memory_day_ids: ['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03'] },
];
