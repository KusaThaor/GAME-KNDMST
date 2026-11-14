/**
 * Theo dõi điểm dừng của bản phát hành (D-03, khai ở content/release.ts).
 * `public_demo_completed` phát khi xong Ngày kết thúc (+ bước gửi tin nếu có khai) — LUÔN trước form phản hồi:
 * UI chỉ mở màn kết/form sau khi nghe sự kiện này, và gửi/bỏ qua form không đổi trạng thái hoàn thành.
 */
import type { ContentIndex } from '../content/indexContent';
import type { EventBus } from '../core/eventBus';
import type { SaveState } from '../core/save';

export class ReleaseTracker {
  private readonly idx: ContentIndex;
  private readonly save: SaveState;
  private readonly bus: EventBus;

  constructor(deps: { idx: ContentIndex; save: SaveState; bus: EventBus }) {
    this.idx = deps.idx; this.save = deps.save; this.bus = deps.bus;
    const rel = this.idx.config.release;
    this.bus.on('day_completed', (e) => { if (e.day_id === rel.end_day_id) this.check(); });
    this.bus.on('step_completed', (e) => { if (rel.end_step_id && e.step_id === rel.end_step_id) this.check(true); });
  }

  private stepDone(stepId: string): boolean {
    const ref = this.idx.steps.get(stepId);
    const rec = ref && this.save.quests[ref.quest.id];
    if (!ref || !rec) return false;
    if (rec.state === 'completed') return true;
    const cur = rec.step_id ? this.idx.steps.get(rec.step_id) : undefined;
    return rec.state === 'active' && !!cur && cur.index > ref.index;
  }

  check(endStepJustDone = false): boolean {
    const rel = this.idx.config.release;
    if (this.save.public_demo_done || !rel.end_day_id) return false;
    if (this.save.days[rel.end_day_id]?.state !== 'completed') return false;
    if (rel.end_step_id && !endStepJustDone && !this.stepDone(rel.end_step_id)) return false;
    this.save.public_demo_done = true;
    this.bus.emit('public_demo_completed', {});
    this.bus.emit('save_requested', { reason: 'public_demo_completed' });
    return true;
  }
}
