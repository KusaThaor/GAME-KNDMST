/** Hằng số chung của game. Giá trị điều khiển lấy từ GDD v0.3 §3 (chỉnh được). */
import type { ReleaseStage } from '../../shared/events';
import type { Gender, Tone } from '../content/types';

export const GAME_CONFIG = {
  release_stage: 'prototype' as ReleaseStage,
  /** Player: nội dung khai rig "player"; chọn bộ dựng theo giới (chỉ có nam/nữ — không tùy biến thêm). */
  player_rig_by_gender: { male: 'player1', female: 'player2' } as Record<Gender, string>,
  /** D-09: Daily chỉ hỗ trợ "1 lần mỗi Ngày ký ức", không dùng đồng hồ thật (engine khóa theo <quest>@<Ngày>). */
  daily_per_memory_day: 1,
  /** Camera và phím: xem src/config/camera.ts. */
  move: { walk: 3.2, run: 5.5, interact_radius: 1.5, area_radius: 2.5 },
  /** 3 sắc thái lựa chọn (RETAINED). */
  tone_labels: { playful: 'Rộn ràng', gentle: 'Ấm áp', curious: 'Sâu lắng' } as Record<Tone, string>,
} as const;
