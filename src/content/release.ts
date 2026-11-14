/**
 * Phạm vi từng bản phát hành (D-03: CHƯA CHỐT).
 * - `memory_day_ids`: các Ngày có trong bản, theo thứ tự chơi.
 * - `end_day_id` (+ `end_step_id` nếu có): điểm dừng — xong là ghi `public_demo_completed`.
 * Bản production KHÔNG được chứa nội dung giả; validator chặn nếu lỡ thêm.
 */
import type { ReleaseDef } from './types';

export const RELEASES: Record<'test' | 'production', ReleaseDef> = {
  // Bản thử trên nhánh dev: gói nội dung giả để chạy khung từ đầu tới cuối.
  test: { memory_day_ids: ['d.g06.01', 'd.g07.03'], end_day_id: 'd.g07.03', end_step_id: 'q_hub_pd_03.s01' },
  // Bản production: để trống cho tới khi có nội dung HUMAN_CANON và D-03 được chốt.
  production: { memory_day_ids: [], end_day_id: null },
};
