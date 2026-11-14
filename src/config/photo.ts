/**
 * Cấu hình ảnh. D-12 (hiển thị chất lượng ảnh: 3 dấu hay điểm 0–100) CHƯA CHỐT → cờ `quality_display`.
 * Engine luôn tính đủ 3 tiêu chí; chất lượng ảnh không bao giờ chặn quest.
 */
import type { PhotoCriteria } from '../core/eventBus';

export interface PhotoConfig {
  quality_display: 'marks' | 'score';
  score_weights: Record<keyof PhotoCriteria, number>;
  /** Thời gian hẹn giờ (GDD v0.3 §7.1: thử 10s và 8s — chốt ở spike). */
  timer_seconds: number;
  free_roll_max_per_day: number;
  jpeg: { width: number; height: number; quality: number };
}

export const PHOTO_CONFIG: PhotoConfig = {
  quality_display: 'marks',
  score_weights: { all_in_frame: 40, player_in_zone: 30, posed_in_time: 30 },
  timer_seconds: 8,
  free_roll_max_per_day: 12,
  jpeg: { width: 1024, height: 768, quality: 0.85 },
};

export const CRITERIA_LABELS: Record<keyof PhotoCriteria, string> = {
  all_in_frame: 'Đủ người', player_in_zone: 'Trong khung', posed_in_time: 'Kịp tạo dáng',
};

export function photoQuality(c: PhotoCriteria, cfg: PhotoConfig): { marks: [boolean, boolean, boolean]; score: number; display: PhotoConfig['quality_display'] } {
  const w = cfg.score_weights;
  return {
    marks: [c.all_in_frame, c.player_in_zone, c.posed_in_time],
    score: (c.all_in_frame ? w.all_in_frame : 0) + (c.player_in_zone ? w.player_in_zone : 0) + (c.posed_in_time ? w.posed_in_time : 0),
    display: cfg.quality_display,
  };
}
