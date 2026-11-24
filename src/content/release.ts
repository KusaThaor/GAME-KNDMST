/**
 * Phạm vi từng bản phát hành (D-03: Mốc 1 gồm 4 Trang d.g06.01 -> d.g07.03).
 * - `memory_day_ids`: các Ngày có trong bản, theo thứ tự chơi.
 * - `end_day_id` (+ `end_step_id` nếu có): điểm dừng — xong là ghi `public_demo_completed`.
 * Bản production KHÔNG được chứa nội dung giả; validator chặn nếu lỡ thêm.
 */
import type { ReleaseDef } from './types';

export const RELEASES: Record<'test' | 'production', ReleaseDef> = {
  // Bản thử: đủ 4 Trang Mốc 1 theo thứ tự d.g06.01, d.g07.01, d.g07.02, d.g07.03; kết thúc tại Trang 4.
  test: {
    memory_day_ids: ['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03'],
    end_day_id: 'd.g07.03',
    end_step_id: 'q_hub_pd_03.s01',
  },
  // Bản production: chờ hoàn tất nghiệm thu T-06 và kiểm toán chốt D-03 để kích hoạt trọn Mốc 1.
  production: { memory_day_ids: [], end_day_id: null },
};
