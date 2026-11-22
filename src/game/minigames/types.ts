import type { MinigameResult as EventResult } from '../../core/eventBus';

export interface MinigameResult {
  result: EventResult;
  score?: number;
  stars?: number;
  hints_used?: number;
}

export interface MinigameCtx {
  onFinish(result: MinigameResult): void;
  seed: number;
  opponentId: string | null;
  difficulty: string | null;
  save: { get(key: string): unknown; set(key: string, value: unknown): void };
}

export interface MinigameInstance {
  dispose(): void;
  pause(): void;
  resume(): void;
}

export interface MinigameModule {
  id: string;
  title: string;
  kind: 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6' | 'special';
  rules: { lines: string[]; image?: string };
  mount(el: HTMLElement, ctx: MinigameCtx): MinigameInstance;
}
