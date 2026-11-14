/** Hằng số chung của game. Giá trị điều khiển/camera lấy từ GDD v0.3 §3 (chỉnh được, chốt ở spike S2). */
import type { ReleaseStage } from '../../shared/events';
import type { Gender, Tone } from '../content/types';

export const GAME_CONFIG = {
  release_stage: 'prototype' as ReleaseStage,
  /** Player: nội dung khai rig "player"; chọn bộ dựng theo giới (chỉ có nam/nữ — không tùy biến thêm). */
  player_rig_by_gender: { male: 'player1', female: 'player2' } as Record<Gender, string>,
  /** D-09: Daily chỉ hỗ trợ "1 lần mỗi Ngày ký ức", không dùng đồng hồ thật (engine khóa theo <quest>@<Ngày>). */
  daily_per_memory_day: 1,
  move: { walk: 3.2, run: 5.5, interact_radius: 1.5, area_radius: 2.5 },
  camera: { distance: 5.5, min: 3.5, max: 8, pitch_deg: 30 },
  /** 3 sắc thái lựa chọn (RETAINED). */
  tone_labels: { playful: 'Rộn ràng', gentle: 'Ấm áp', curious: 'Sâu lắng' } as Record<Tone, string>,
  bounds: { minX: -16.5, maxX: 16.5, minZ: -7.5, maxZ: 13 },
} as const;
