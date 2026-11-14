/**
 * Cấu hình Album — các điểm CHƯA CHỐT nằm ở đây, engine không viết cứng.
 * D-19 (nguồn ảnh): nguồn của từng ô khai trong nội dung (`AlbumEntry.source`); ở đây chỉ khai nguồn nào được phép.
 * D-20 (hiển thị tiến độ): 'pages' = số trang + chấm; 'percent' = phần trăm. Phần trăm luôn được tính ngầm.
 */
import type { EntrySource, SlotType } from '../content/types';

export interface AlbumConfig {
  max_variants: number;
  progress_display: 'pages' | 'percent';
  percent_weights: { photo: number; sticker: number; note: number };
  allowed_sources: EntrySource[];
  /** Ô hiện trên bìa Album (ảnh "đủ năm đứa" — chờ D-02). null = bìa trống. */
  cover_entry_id: string | null;
}

export const ALBUM_CONFIG: AlbumConfig = {
  max_variants: 3,
  progress_display: 'pages',
  percent_weights: { photo: 60, sticker: 25, note: 15 },
  allowed_sources: ['gameplay_photo', 'auto_snapshot', 'text', 'sticker_art'],
  cover_entry_id: 'alb.d.g07.03.01',
};

export const SLOT_WEIGHT_GROUP: Record<SlotType, keyof AlbumConfig['percent_weights']> = {
  main_photo: 'photo', free_photo: 'photo',
  sticker: 'sticker', quest_record: 'sticker',
  note: 'note', artifact: 'note', personal_memory: 'note', back_note: 'note',
};
