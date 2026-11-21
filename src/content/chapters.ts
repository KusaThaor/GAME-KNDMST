/**
 * Nhóm (Mốc/lớp) chỉ là NHÃN gom danh sách Trang để hiện menu và báo cáo; GDD v1.0 không dùng chữ "Chương" làm đơn vị chơi (D-04).
 * Trang (mã d.gNN.KK) là đơn vị có ID ổn định.
 */
import type { Chapter } from './types';

export const CHAPTERS: Chapter[] = [
  { id: 'ch_m1', label: '[PLACEHOLDER] Mốc 1 · lớp 6–7', memory_day_ids: ['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03'] },
  { id: 'ch_m2', label: '[PLACEHOLDER] Mốc 2 · lớp 8–9', memory_day_ids: ['d.g08.01'] },
];
