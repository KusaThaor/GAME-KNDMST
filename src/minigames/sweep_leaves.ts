/**
 * MINIGAME: QUÉT LÁ DỌN CĂN CỨ (Trang 3 - Bãi Đất Gốc Cây Căn Cứ)
 * Cầm chổi rơm/chổi chà quét gom lá khô dọn mặt bằng Căn cứ bí mật.
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary
} from './types';

export interface LeafCluster {
  id: number;
  x: number;          // 0..100
  y: number;
  radius: number;
  is_gathered: boolean; // Đã quét dồn vào đống rác chưa
}

export interface SweepLeavesState {
  game_id: MinigameId;
  clusters: LeafCluster[];
  target_pile: { x: number; y: number; radius: number };
  broom_x: number;
  broom_y: number;
  clean_percentage: number;
  sweep_strokes_count: number;
  message: string;
  is_finished: boolean;
  history: string[];
}

export type SweepLeavesAction =
  | { type: 'SWEEP_STROKE'; from_x: number; from_y: number; to_x: number; to_y: number }
  | { type: 'FINISH_SWEEP' }
  | { type: 'QUIT' };

export class SweepLeavesEngine implements IMinigameEngine<SweepLeavesState, SweepLeavesAction> {
  readonly id: MinigameId = 'sweep_leaves';
  private state!: SweepLeavesState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(_config?: MinigameBaseConfig): void {
    this.startTime = Date.now();
    this.state = {
      game_id: 'sweep_leaves',
      clusters: [
        { id: 1, x: 25, y: 30, radius: 8, is_gathered: false },
        { id: 2, x: 35, y: 65, radius: 9, is_gathered: false },
        { id: 3, x: 60, y: 35, radius: 10, is_gathered: false },
        { id: 4, x: 45, y: 50, radius: 8, is_gathered: false },
        { id: 5, x: 70, y: 70, radius: 7, is_gathered: false },
        { id: 6, x: 20, y: 80, radius: 8, is_gathered: false }
      ],
      target_pile: { x: 85, y: 85, radius: 15 },
      broom_x: 50,
      broom_y: 50,
      clean_percentage: 0,
      sweep_strokes_count: 0,
      message: 'Cầm chổi quét từng vệt lá khô dồn về góc gốc cây (vòng tròn góc phải dưới)!',
      is_finished: false,
      history: []
    };
  }

  getState(): SweepLeavesState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: SweepLeavesAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'SWEEP_STROKE':
        return this.handleSweepStroke(action.from_x, action.from_y, action.to_x, action.to_y);

      case 'FINISH_SWEEP':
        return this.handleFinishSweep();

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng quét dọn lá.';
        return true;

      default:
        return false;
    }
  }

  private handleSweepStroke(fromX: number, fromY: number, toX: number, toY: number): boolean {
    this.state.sweep_strokes_count++;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const strokeLen = Math.hypot(dx, dy);

    if (strokeLen < 5) return false;

    const dirX = dx / strokeLen;
    const dirY = dy / strokeLen;

    // Di chuyển các đám lá nằm gần đường quét
    for (const cluster of this.state.clusters) {
      if (cluster.is_gathered) continue;

      const dist = Math.hypot(cluster.x - fromX, cluster.y - fromY);
      if (dist < 20) {
        // Đẩy lá theo hướng quét
        cluster.x += dirX * 25;
        cluster.y += dirY * 25;

        // Kiểm tra xem đã vào hố rác/gốc cây chưa
        const distToPile = Math.hypot(cluster.x - this.state.target_pile.x, cluster.y - this.state.target_pile.y);
        if (distToPile <= this.state.target_pile.radius + cluster.radius) {
          cluster.is_gathered = true;
        }
      }
    }

    const gatheredCount = this.state.clusters.filter(c => c.is_gathered).length;
    this.state.clean_percentage = Math.round((gatheredCount / this.state.clusters.length) * 100);

    if (this.state.clean_percentage >= 100) {
      this.state.is_finished = true;
      this.state.message = 'Sạch bóng bãi đất rồi! Nền đất phẳng phiu sẵn sàng để trải bạt dựng Căn cứ!';
    } else {
      this.state.message = `Đã dọn sạch ${this.state.clean_percentage}% lá khô. Tiếp tục quét nào!`;
    }

    return true;
  }

  private handleFinishSweep(): boolean {
    this.state.is_finished = true;
    this.state.message = `Dọn dẹp hoàn tất với mức độ sạch ${this.state.clean_percentage}%.`;
    return true;
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const score = this.state.clean_percentage;

    let result: 'win' | 'lose' | 'complete' = 'complete';
    if (score >= 80) result = 'win';
    else if (score < 40) result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (score >= 90 && this.state.sweep_strokes_count <= 10) stars = 3;
    else if (score >= 70) stars = 2;

    let dialogue: string;
    if (score >= 80) {
      dialogue = 'Châu: Cậu quét dọn kỹ thật đấy, mặt đất không còn sót cành cây gai góc nào, trải bạt ngồi sẽ rất êm.';
    } else if (score >= 50) {
      dialogue = 'Đức: Gom đống lá lại góc đó để tí nữa tao kiếm hộp quẹt gom đốt un khói đuổi muỗi!';
    } else {
      dialogue = 'Hạ: Vẫn còn mấy cụm lá ướt dính bùn kìa, để tớ cầm chổi quét phụ một tay nha.';
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
