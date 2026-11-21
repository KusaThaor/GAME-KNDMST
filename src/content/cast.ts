/**
 * Bảng ánh xạ vai → nhân vật (D-01 đã CONFIRMED 19/11: Đức + Châu gặp Player ở lớp 6 = phương án A).
 * Nội dung chỉ dùng vai: NPC_A, NPC_B = hai bạn gặp ở lớp 6; NPC_C, NPC_D = hai bạn vào nhóm ở lớp 7.
 * Bảng B/C và `?cast=` giữ lại làm công cụ thử; không sửa engine, không sửa nội dung.
 * Ở môi trường test có thể thử bằng `?cast=B`.
 */
import type { CastTable } from './types';

export const CAST_TABLES: Record<string, CastTable> = {
  A: { NPC_A: 'chr_duc', NPC_B: 'chr_chau', NPC_C: 'chr_ha', NPC_D: 'chr_quan' },   // D-01 phương án A: Đức + Châu
  B: { NPC_A: 'chr_ha', NPC_B: 'chr_quan', NPC_C: 'chr_duc', NPC_D: 'chr_chau' },   // phương án B: Hạ + Quân
  C: { NPC_A: 'chr_duc', NPC_B: 'chr_quan', NPC_C: 'chr_chau', NPC_D: 'chr_ha' },   // phương án C: Đức + Quân
};

/** Phương án A = quyết định đã chốt D-01 (19/11). */
export const ACTIVE_CAST = 'A';
