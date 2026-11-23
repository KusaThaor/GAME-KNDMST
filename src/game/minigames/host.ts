import type { FlagValue } from '../../content/types';
import type { MinigameCtx, MinigameInstance, MinigameModule, MinigameResult } from './types';

// Save v2: giữ kết quả kể chuyện đầu tiên, còn thống kê tính từng ván.
export function recordRound(flags: Record<string, FlagValue>, id: string, round: MinigameResult) {
  const prefix = `mg.${id}.`;
  flags[prefix + 'result'] ??= round.result;
  const counter = prefix + (round.result === 'quit' ? 'lose' : round.result);
  flags[counter] = Number(flags[counter] ?? 0) + 1;
  if (round.score !== undefined) {
    const best = flags[prefix + 'best_score'];
    flags[prefix + 'best_score'] = typeof best === 'number' ? Math.max(best, round.score) : round.score;
  }
}

interface HostHooks {
  changed(): void;
  started(): void;
  finished(round: MinigameResult, duration: number): void;
  next(): void;
}

export class MinigameHost {
  phase: 'rules' | 'playing' | 'result' | 'closed' = 'rules';
  overlay: 'menu' | 'help' | null = null;
  result?: MinigameResult;
  private instance?: MinigameInstance;
  private attempt = 0;
  private since = 0;
  private elapsed = 0;

  constructor(readonly game: MinigameModule, readonly seen: boolean,
    private ctx: Omit<MinigameCtx, 'onFinish' | 'seed'>, private hooks: HostHooks,
    private now = () => performance.now()) {}

  play(el: HTMLElement) {
    if (this.overlay || (this.phase !== 'rules' && this.phase !== 'result')) return;
    const attempt = ++this.attempt;
    this.phase = 'playing';
    this.elapsed = 0;
    this.since = this.now();
    this.result = undefined;
    this.hooks.started();
    const instance = this.game.mount(el, {
      ...this.ctx, seed: Math.floor(Math.random() * 0x100000000),
      onFinish: round => {
        if (this.attempt === attempt && this.phase === 'playing' && !this.overlay) this.finish(round);
      },
    });
    // Một module có thể trả kết quả ngay trong mount.
    if (this.phase === 'playing') this.instance = instance;
    else instance.dispose();
    this.hooks.changed();
  }

  toggleOverlay(kind: 'menu' | 'help') {
    if (this.phase === 'closed') return;
    if (this.overlay && this.overlay !== kind) {
      this.overlay = kind;
    } else if (this.overlay) {
      this.overlay = null;
      if (this.phase === 'playing') {
        this.since = this.now();
        this.instance?.resume();
      }
    } else {
      this.overlay = kind;
      if (this.phase === 'playing') {
        this.elapsed += this.now() - this.since;
        this.instance?.pause();
      }
    }
    this.hooks.changed();
  }

  private finish(round: MinigameResult) {
    if (this.phase === 'rules') this.hooks.started(); // Bỏ qua ngay ở màn luật.
    if (this.phase === 'playing' && !this.overlay) this.elapsed += this.now() - this.since;
    this.phase = 'result';
    this.overlay = null;
    this.result = round;
    this.instance?.dispose();
    this.instance = undefined;
    this.hooks.finished(round, Math.round(this.elapsed / 1000));
    this.hooks.changed();
  }

  quit() {
    if (this.phase === 'closed') return;
    if (this.phase !== 'result') this.finish({ result: 'quit' });
    this.next();
  }

  next() {
    if (this.phase !== 'result') return;
    this.dispose();
    this.hooks.next();
  }

  dispose() {
    this.phase = 'closed';
    this.instance?.dispose();
    this.instance = undefined;
  }
}
