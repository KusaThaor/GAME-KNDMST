/**
 * MINIGAME: NHỊP MƯA TÍ TÁCH (Trang 4 - Trú Mưa Mái Căn Cứ)
 * Trò chơi gõ nhịp điệu giọt mưa tí tách rơi trên mái tôn/mái bạt mùa hè.
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary
} from './types';

export interface RaindropNote {
  id: number;
  lane: 0 | 1 | 2;      // 3 làn: Trái, Giữa, Phải
  y: number;           // 0..100 (rơi từ 0 xuống 85)
  hit_time_ms: number; // Thời điểm chạm vạch (ms)
  is_hit: boolean;
  is_missed: boolean;
  hit_judgment?: 'PERFECT' | 'GOOD' | 'MISS';
}

export interface RaindropRhythmState {
  game_id: MinigameId;
  notes: RaindropNote[];
  elapsed_ms: number;
  total_duration_ms: number;
  score: number;
  combo: number;
  max_combo: number;
  perfect_count: number;
  good_count: number;
  miss_count: number;
  message: string;
  is_finished: boolean;
}

export type RaindropRhythmAction =
  | { type: 'TAP_LANE'; lane: 0 | 1 | 2; current_time_ms: number }
  | { type: 'TICK_TIME'; delta_ms: number }
  | { type: 'FINISH_SONG' }
  | { type: 'QUIT' };

export class RaindropRhythmEngine implements IMinigameEngine<RaindropRhythmState, RaindropRhythmAction> {
  readonly id: MinigameId = 'raindrop_rhythm';
  private state!: RaindropRhythmState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(_config?: MinigameBaseConfig): void {
    this.startTime = Date.now();
    // Tạo chuỗi 15 giọt mưa theo nhịp
    const pattern: Array<{ lane: 0 | 1 | 2; time_ms: number }> = [
      { lane: 0, time_ms: 1000 },
      { lane: 1, time_ms: 2000 },
      { lane: 2, time_ms: 3000 },
      { lane: 1, time_ms: 4000 },
      { lane: 0, time_ms: 5000 },
      { lane: 0, time_ms: 6000 },
      { lane: 2, time_ms: 7000 },
      { lane: 1, time_ms: 8000 },
      { lane: 2, time_ms: 9000 },
      { lane: 0, time_ms: 10000 },
      { lane: 1, time_ms: 11000 },
      { lane: 2, time_ms: 12000 },
      { lane: 1, time_ms: 13000 },
      { lane: 0, time_ms: 14000 },
      { lane: 2, time_ms: 15000 }
    ];

    this.state = {
      game_id: 'raindrop_rhythm',
      notes: pattern.map((p, idx) => ({
        id: idx + 1,
        lane: p.lane,
        y: 0,
        hit_time_ms: p.time_ms,
        is_hit: false,
        is_missed: false
      })),
      elapsed_ms: 0,
      total_duration_ms: 17000,
      score: 0,
      combo: 0,
      max_combo: 0,
      perfect_count: 0,
      good_count: 0,
      miss_count: 0,
      message: 'Lắng nghe tiếng mưa! Chạm vào làn tương ứng khi giọt nước rơi chạm vạch hứng!',
      is_finished: false
    };
  }

  getState(): RaindropRhythmState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: RaindropRhythmAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'TAP_LANE':
        return this.handleTapLane(action.lane, action.current_time_ms);

      case 'TICK_TIME':
        return this.handleTickTime(action.delta_ms);

      case 'FINISH_SONG':
        this.state.is_finished = true;
        this.state.message = 'Khúc ca mưa rào kết thúc.';
        return true;

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng nghe nhịp mưa.';
        return true;

      default:
        return false;
    }
  }

  private handleTapLane(lane: 0 | 1 | 2, timeMs: number): boolean {
    // Tìm nốt gần nhất trên làn này chưa bị hit hoặc miss
    const availableNotes = this.state.notes.filter(n => n.lane === lane && !n.is_hit && !n.is_missed);
    if (availableNotes.length === 0) return false;

    // Sắp xếp theo khoảng cách thời gian
    availableNotes.sort((a, b) => Math.abs(a.hit_time_ms - timeMs) - Math.abs(b.hit_time_ms - timeMs));
    const target = availableNotes[0];
    const diff = Math.abs(target.hit_time_ms - timeMs);

    if (diff <= 150) {
      // PERFECT
      target.is_hit = true;
      target.hit_judgment = 'PERFECT';
      this.state.score += 100;
      this.state.combo++;
      this.state.perfect_count++;
      this.state.max_combo = Math.max(this.state.max_combo, this.state.combo);
      this.state.message = `PERFECT! (+100) Combo x${this.state.combo}!`;
      return true;
    } else if (diff <= 350) {
      // GOOD
      target.is_hit = true;
      target.hit_judgment = 'GOOD';
      this.state.score += 60;
      this.state.combo++;
      this.state.good_count++;
      this.state.max_combo = Math.max(this.state.max_combo, this.state.combo);
      this.state.message = `GOOD! (+60) Combo x${this.state.combo}!`;
      return true;
    } else {
      // Quá sớm hoặc quá trễ
      return false;
    }
  }

  private handleTickTime(delta_ms: number): boolean {
    this.state.elapsed_ms += delta_ms;

    // Cập nhật vị trí y của các nốt rơi
    for (const note of this.state.notes) {
      if (note.is_hit || note.is_missed) continue;

      const timeRemaining = note.hit_time_ms - this.state.elapsed_ms;
      // Khi timeRemaining = 1500ms thì y = 0, khi timeRemaining = 0 thì y = 85
      const progress = Math.max(0, Math.min(1.2, 1 - (timeRemaining / 1500)));
      note.y = progress * 85;

      // Nếu trôi qua vạch hơn 350ms mà chưa bấm -> MISS
      if (timeRemaining < -350) {
        note.is_missed = true;
        note.hit_judgment = 'MISS';
        this.state.miss_count++;
        this.state.combo = 0;
        this.state.message = 'MISS! Hụt một giọt mưa tí tách rồi!';
      }
    }

    if (this.state.elapsed_ms >= this.state.total_duration_ms) {
      this.state.is_finished = true;
      this.state.message = `Cơn mưa tạnh dần! Tổng điểm: ${this.state.score} (Max combo: x${this.state.max_combo})!`;
    }

    return true;
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const score = this.state.score;

    let result: 'win' | 'lose' | 'complete' = 'complete';
    if (score >= 1000) result = 'win';
    else if (score < 400) result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (score >= 1200 && this.state.miss_count <= 1) stars = 3;
    else if (score >= 800) stars = 2;

    let dialogue: string;
    if (score >= 1000) {
      dialogue = 'Châu: Cậu bắt đúng nhịp điệu của hạt mưa rơi trên mái bạt ghê. Nghe êm tai như một khúc ca mùa hạ.';
    } else if (score >= 600) {
      dialogue = 'Quân: Ngồi trú mưa trong này mà có tiếng gõ tí tách thế này ấm cúng thật đấy.';
    } else {
      dialogue = 'Đức: Mưa rào tạt ướt cả góc áo rồi mà tụi mình vẫn ngồi gõ nhịp được, vui quá trời!';
    }

    return {
      game_id: this.id,
      result,
      score,
      stars,
      duration_s,
      opponent_id: null,
      difficulty: null,
      npc_dialogue_line: dialogue
    };
  }
}
