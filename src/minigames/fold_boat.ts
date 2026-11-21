/**
 * MINIGAME: GẤP THUYỀN GIẤY BÁO (Trang 2 - Mương Nước Sau Mưa)
 * Thiết kế Origami 4 bước theo GDD 02 §2.4 và kịch bản Trang 2.
 *
 * 4 nếp gấp tuần tự:
 * 1. Gấp đôi giấy theo chiều dọc (đường sống thuyền).
 * 2. Gấp 2 góc tam giác đỉnh vào giữa (tạo mũi nhọn).
 * 3. Gấp mép đáy lật lên 2 bên (vành thuyền).
 * 4. Kéo nhẹ bung lòng thuyền và miết đáy (thành hình chiếc thuyền nổi).
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary
} from './types';

export interface FoldStep {
  step_number: 1 | 2 | 3 | 4;
  title: string;
  instruction: string;
  target_start: { x: number; y: number }; // Tọa độ chuẩn 0..100
  target_end: { x: number; y: number };
  ideal_angle_deg: number;                // Góc vuốt chuẩn (độ)
  user_accuracy: number;                  // 0..100
  is_completed: boolean;
}

export interface BoatStats {
  sharpness: number;  // Độ sắc nét của nếp gấp (0..100)
  symmetry: number;   // Độ cân đối hai mạn thuyền (0..100)
  buoyancy: number;   // Điểm nổi trên mặt nước (0..100)
  boat_tier: 'Tồi tàn (dễ chìm)' | 'Bình thường' | 'Cân đối đẹp mắt' | 'Chiến hạm giấy báo';
}

export interface FoldBoatState {
  game_id: MinigameId;
  current_step: 1 | 2 | 3 | 4;
  steps: FoldStep[];
  boat_stats: BoatStats;
  is_folding: boolean;
  paper_color: 'newspaper' | 'notebook_grid' | 'colored_red';
  message: string;
  is_finished: boolean;
  fold_history: string[];
}

export type FoldBoatAction =
  | { type: 'CHOOSE_PAPER'; paper_type: 'newspaper' | 'notebook_grid' | 'colored_red' }
  | { type: 'START_SWIPE'; x: number; y: number }
  | { type: 'FINISH_SWIPE'; x: number; y: number }
  | { type: 'UNDO_STEP' }
  | { type: 'QUIT' };

export class FoldBoatEngine implements IMinigameEngine<FoldBoatState, FoldBoatAction> {
  readonly id: MinigameId = 'fold_boat';
  private state!: FoldBoatState;
  private swipeStart: { x: number; y: number } | null = null;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(_config?: MinigameBaseConfig): void {
    this.startTime = Date.now();
    this.swipeStart = null;
    this.state = {
      game_id: 'fold_boat',
      current_step: 1,
      steps: [
        {
          step_number: 1,
          title: 'Gấp đôi tờ giấy',
          instruction: 'Vuốt thẳng từ mép trên xuống mép dưới để tạo đường sống giữa.',
          target_start: { x: 50, y: 10 },
          target_end: { x: 50, y: 90 },
          ideal_angle_deg: 90,
          user_accuracy: 0,
          is_completed: false
        },
        {
          step_number: 2,
          title: 'Gấp hai đỉnh tam giác',
          instruction: 'Kéo hai góc trên chụm vào đường sống giữa tạo mũi thuyền nhọn.',
          target_start: { x: 20, y: 20 },
          target_end: { x: 50, y: 40 },
          ideal_angle_deg: 35,
          user_accuracy: 0,
          is_completed: false
        },
        {
          step_number: 3,
          title: 'Gấp vành đáy ca-nô',
          instruction: 'Gấp mép giấy phía dưới lật ngược lên hai bên mạn thuyền.',
          target_start: { x: 10, y: 80 },
          target_end: { x: 90, y: 80 },
          ideal_angle_deg: 0,
          user_accuracy: 0,
          is_completed: false
        },
        {
          step_number: 4,
          title: 'Bung lòng thuyền & Miết đáy',
          instruction: 'Luồn hai ngón tay vào giữa, kéo nhẹ sang hai bên để mở bung lòng thuyền.',
          target_start: { x: 30, y: 50 },
          target_end: { x: 70, y: 50 },
          ideal_angle_deg: 0,
          user_accuracy: 0,
          is_completed: false
        }
      ],
      boat_stats: {
        sharpness: 0,
        symmetry: 0,
        buoyancy: 0,
        boat_tier: 'Tồi tàn (dễ chìm)'
      },
      is_folding: false,
      paper_color: 'newspaper',
      message: 'Hãy chọn giấy và bắt đầu vuốt nếp gấp đầu tiên!',
      is_finished: false,
      fold_history: []
    };
  }

  getState(): FoldBoatState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: FoldBoatAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'CHOOSE_PAPER':
        this.state.paper_color = action.paper_type;
        this.state.message = `Đã chọn loại giấy: ${action.paper_type === 'newspaper' ? 'Báo cũ' : action.paper_type === 'notebook_grid' ? 'Giấy tập ô ly' : 'Giấy màu thủ công'}.`;
        return true;

      case 'START_SWIPE':
        this.swipeStart = { x: action.x, y: action.y };
        this.state.is_folding = true;
        return true;

      case 'FINISH_SWIPE':
        return this.handleFinishSwipe(action.x, action.y);

      case 'UNDO_STEP':
        return this.handleUndoStep();

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng gấp thuyền giấy.';
        return true;

      default:
        return false;
    }
  }

  private handleFinishSwipe(endX: number, endY: number): boolean {
    if (!this.swipeStart) return false;

    const startX = this.swipeStart.x;
    const startY = this.swipeStart.y;
    this.swipeStart = null;
    this.state.is_folding = false;

    const currentStepIdx = this.state.current_step - 1;
    const step = this.state.steps[currentStepIdx];
    if (!step || step.is_completed) return false;

    // Tính vector và góc
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);

    if (distance < 15) {
      this.state.message = 'Nét vuốt quá ngắn! Hãy miết mạnh tay từ đầu đến cuối nếp.';
      return false;
    }

    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 180; // Chuẩn hóa góc 0..180

    // Tính độ lệch góc
    let targetAngle = step.ideal_angle_deg;
    if (targetAngle < 0) targetAngle += 180;

    const angleDiff = Math.abs(angleDeg - targetAngle);
    // Tính độ chính xác nếp gấp
    let accuracy = Math.max(20, Math.round(100 - angleDiff * 1.5));
    if (accuracy > 100) accuracy = 100;

    step.user_accuracy = accuracy;
    step.is_completed = true;
    this.state.fold_history.push(`Bước ${this.state.current_step}: Độ chuẩn ${accuracy}%`);

    if (this.state.current_step < 4) {
      this.state.current_step++;
      this.state.message = `Nếp gấp bước ${step.step_number} hoàn thành (${accuracy}%). Sang bước ${this.state.current_step}: ${this.state.steps[this.state.current_step - 1].title}!`;
    } else {
      // Hoàn thành cả 4 bước
      this.calculateBoatStats();
      this.state.is_finished = true;
      this.state.message = `Chiếc thuyền giấy đã hoàn thành! Đạt chuẩn: ${this.state.boat_stats.boat_tier}!`;
    }
    return true;
  }

  private handleUndoStep(): boolean {
    if (this.state.current_step === 1 && !this.state.steps[0].is_completed) return false;

    if (this.state.is_finished) {
      this.state.is_finished = false;
    }

    const prevIdx = this.state.steps[this.state.current_step - 1].is_completed
      ? this.state.current_step - 1
      : Math.max(0, this.state.current_step - 2);

    this.state.steps[prevIdx].is_completed = false;
    this.state.steps[prevIdx].user_accuracy = 0;
    this.state.current_step = (prevIdx + 1) as 1 | 2 | 3 | 4;
    this.state.message = `Đã quay lại bước ${this.state.current_step}: ${this.state.steps[prevIdx].title}.`;
    return true;
  }

  private calculateBoatStats(): void {
    const accList = this.state.steps.map(s => s.user_accuracy);
    const avgAcc = accList.reduce((a, b) => a + b, 0) / accList.length;

    const sharpness = Math.round(avgAcc * 0.95);
    const symmetry = Math.round((accList[1] + accList[2]) / 2);
    const buoyancy = Math.round((sharpness * 0.6) + (symmetry * 0.4));

    let tier: BoatStats['boat_tier'] = 'Bình thường';
    if (buoyancy >= 85) tier = 'Chiến hạm giấy báo';
    else if (buoyancy >= 70) tier = 'Cân đối đẹp mắt';
    else if (buoyancy < 50) tier = 'Tồi tàn (dễ chìm)';

    this.state.boat_stats = {
      sharpness,
      symmetry,
      buoyancy,
      boat_tier: tier
    };
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const score = this.state.boat_stats.buoyancy;

    let stars: 1 | 2 | 3 = 1;
    if (score >= 85) stars = 3;
    else if (score >= 65) stars = 2;

    const result = this.state.is_finished ? (score >= 50 ? 'win' : 'complete') : 'quit';

    let dialogue: string;
    if (score >= 85) {
      dialogue = 'Quân: Thuyền cậu gấp mũi nhọn hoắt mà đáy phẳng lì, thả xuống mương chắc chắn sẽ lướt nhanh như ca-nô!';
    } else if (score >= 65) {
      dialogue = 'Châu: Đường miết nếp tương đối thẳng đấy, chiếc thuyền này sẽ giữ thăng bằng tốt khi qua đoạn xoáy nước.';
    } else {
      dialogue = 'Đức: Haha nhìn cái mạn thuyền quăn queo kìa! Thôi không sao, lật thì ta thi coi thuyền ai chìm lâu hơn!';
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
