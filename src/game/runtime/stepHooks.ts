/**
 * Điểm nối Đợt 2 (R-B0w): mọi phần trình bày mới của 4 Trang Mốc 1 cắm vào đây, KHÔNG sửa presentationQueue/dayController.
 *
 *  - R-B2 (thẻ chữ, lời dẫn hệ thống): `before` (title_card + narrative.before), `after` (narrative.after).
 *  - R-B1 (đạo diễn NPC, máy quay): `stage` — gọi ở 'start', trước từng dòng thoại `{ line: i }`, và 'end'.
 *  - R-B3/R-B4: tự đăng ký phần của mình nếu cần mốc trước/sau bước.
 *
 * Thứ tự một bước có thoại (talk / interact / cutscene / minigame có intro_lines):
 *   before → stage('start') → [stage({line: i}) → hiện dòng i]… → stage('end') → after → engine.complete
 * Bước không có thoại (choice, photo, free…): before → stage('start') → nội dung bước → stage('end') → after.
 * `{ line: i }` đếm theo MẢNG GỐC của bước (cả dòng bị lọc bởi `when` vẫn tính chỉ số), nên người số hóa đếm thẳng trong file.
 *
 * Phần nào lỗi thì ghi console và bỏ qua — không làm kẹt mạch chơi.
 */
import type { StageAt, Step } from '../../content/types';

export interface StepHookPart {
  /** Tên phần (để báo lỗi), vd. 'R-B2 narrative'. */
  id: string;
  /** Trước nội dung bước. Trả false = phiên trình diễn đã bị hủy (chuyển cảnh) → dừng bước. */
  before?(step: Step, alive: () => boolean): Promise<boolean> | boolean;
  /** Sau nội dung bước, trước khi báo xong bước. Trả false = bị hủy. */
  after?(step: Step, alive: () => boolean): Promise<boolean> | boolean;
  /** Một mốc đạo diễn. Phần tự lọc `step.stage` theo `at`; cue có `wait: true` thì await xong mới trả về. */
  stage?(step: Step, at: StageAt): Promise<void> | void;
}

export interface StepHooks {
  before(step: Step, alive: () => boolean): Promise<boolean>;
  after(step: Step, alive: () => boolean): Promise<boolean>;
  stage(step: Step, at: StageAt): Promise<void>;
  /** Cắm một phần; trả hàm gỡ. */
  register(part: StepHookPart): () => void;
  /** Danh sách phần đang cắm (để test). */
  parts(): readonly StepHookPart[];
}

export function createStepHooks(initial: StepHookPart[] = []): StepHooks {
  const list: StepHookPart[] = [...initial];
  const guard = async <T>(part: StepHookPart, what: string, fn: () => Promise<T> | T, fallback: T): Promise<T> => {
    try { return await fn(); } catch (e) { console.error(`[stepHooks] ${part.id}.${what} lỗi`, e); return fallback; }
  };
  return {
    async before(step, alive) {
      for (const p of [...list]) {
        if (!p.before) continue;
        if (!(await guard(p, 'before', () => p.before!(step, alive), true)) || !alive()) return false;
      }
      return alive();
    },
    async after(step, alive) {
      for (const p of [...list]) {
        if (!p.after) continue;
        if (!(await guard(p, 'after', () => p.after!(step, alive), true)) || !alive()) return false;
      }
      return alive();
    },
    async stage(step, at) {
      for (const p of [...list]) if (p.stage) await guard(p, 'stage', () => p.stage!(step, at), undefined);
    },
    register(part) {
      list.push(part);
      return () => { const i = list.indexOf(part); if (i >= 0) list.splice(i, 1); };
    },
    parts: () => list,
  };
}
