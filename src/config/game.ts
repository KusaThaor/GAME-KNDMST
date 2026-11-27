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
  tone_labels: { playful: 'Rộn ràng', gentle: 'Ấm áp', deep: 'Sâu lắng' } as Record<Tone, string>,
} as const;

/**
 * BUG-T1-A (chủ dự án chốt 27/11): tạm ẩn nhiệm vụ Side/Daily nháp (AI_PROPOSED + [PLACEHOLDER]) ở bản test/Preview,
 * để người chơi thử gặp đúng luồng như bản production. Bản production luôn tắt (filterPackForRelease), không phụ thuộc cờ này.
 * Bật lại khi cần kiểm nhiệm vụ nháp: đổi `show_in_test` thành true, hoặc mở bản test với `?drafts=1`.
 */
export const DRAFT_QUESTS = {
  show_in_test: false,
  url_param: 'drafts',
} as const;
