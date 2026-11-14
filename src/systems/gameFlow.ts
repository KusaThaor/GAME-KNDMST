/**
 * Luồng game (F3): Boot → Hub(intro|idle) → Transition → MemoryDay → DayEnd → Transition → Hub.
 * Máy trạng thái thuần; phần dựng cảnh nghe `flow_changed` rồi làm việc của nó và báo lại `scene_ready`.
 */
import type { EventBus } from '../core/eventBus';

export type FlowState = 'boot' | 'hub_intro' | 'hub_idle' | 'to_day' | 'memory_day' | 'day_end' | 'to_hub';
export type FlowAction = 'boot_new' | 'boot_idle' | 'boot_resume_day' | 'intro_done' | 'open_day' | 'scene_ready' | 'day_completed' | 'leave_day' | 'continue';

const TABLE: Record<FlowState, Partial<Record<FlowAction, FlowState>>> = {
  boot: { boot_new: 'hub_intro', boot_idle: 'hub_idle', boot_resume_day: 'to_day' },
  hub_intro: { intro_done: 'hub_idle' },
  hub_idle: { open_day: 'to_day' },
  to_day: { scene_ready: 'memory_day' },
  memory_day: { day_completed: 'day_end', leave_day: 'to_hub' },
  day_end: { continue: 'to_hub' },
  to_hub: { scene_ready: 'hub_idle' },
};

export class GameFlow {
  state: FlowState = 'boot';
  constructor(private bus: EventBus) {}

  can(action: FlowAction): boolean { return !!TABLE[this.state][action]; }

  dispatch(action: FlowAction): boolean {
    const to = TABLE[this.state][action];
    if (!to) return false;
    const from = this.state;
    this.state = to;
    this.bus.emit('flow_changed', { from, to });
    return true;
  }
}
