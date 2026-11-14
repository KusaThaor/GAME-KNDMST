/**
 * Đo thời gian chơi thật (active playtime): chỉ tính khi đang chơi, tab hiển thị, không pause/loading,
 * và chưa idle quá 60 giây. Cứ đủ ~15 giây thì báo một nhịp (`active_heartbeat`).
 */
export const HEARTBEAT_MS = 15_000;
export const IDLE_LIMIT_MS = 60_000;

export class ActivePlaytime {
  private playing = false;
  private visible = true;
  private lastInput = -Infinity;
  private lastTick: number;
  private acc = 0;
  private readonly now: () => number;
  private readonly onBeat: (activeDeltaMs: number) => void;

  constructor(deps: { now: () => number; onBeat: (activeDeltaMs: number) => void }) {
    this.now = deps.now; this.onBeat = deps.onBeat; this.lastTick = deps.now();
  }
  setPlaying(v: boolean) { this.tick(); this.playing = v; }
  setVisible(v: boolean) { this.tick(); this.visible = v; }
  markInput() { this.lastInput = this.now(); }

  /** Gọi định kỳ (mỗi vài giây). */
  tick() {
    const now = this.now();
    const delta = now - this.lastTick;
    this.lastTick = now;
    if (delta <= 0 || !this.playing || !this.visible || now - this.lastInput > IDLE_LIMIT_MS) return;
    this.acc += delta;
    while (this.acc >= HEARTBEAT_MS) { this.acc -= HEARTBEAT_MS; this.onBeat(HEARTBEAT_MS); }
  }
}
