/**
 * MINIGAME: ÉP BƯỚM HOA PHƯỢNG (Trang 4 - Sân Trường Sau Mưa)
 * Kẹp hoa phượng vào trang sổ học trò tạo hình con bướm lưu bút.
 *
 * 6 bộ phận cần lắp ráp:
 * 1. Cánh trên trái (upper_left_wing)
 * 2. Cánh trên phải (upper_right_wing)
 * 3. Cánh dưới trái (lower_left_wing)
 * 4. Cánh dưới phải (lower_right_wing)
 * 5. Râu bướm trái (left_antenna) - nhị hoa cong
 * 6. Râu bướm phải (right_antenna) - nhị hoa cong
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary
} from './types';

export type ButterflyPartId =
  | 'wing_upper_left'
  | 'wing_upper_right'
  | 'wing_lower_left'
  | 'wing_lower_right'
  | 'antenna_left'
  | 'antenna_right';

export interface ButterflyPart {
  id: ButterflyPartId;
  name: string;
  current_x: number;       // Tọa độ hiện tại (0..100)
  current_y: number;
  current_rotation_deg: number; // Góc xoay hiện tại (0..360)
  target_x: number;        // Tọa độ mục tiêu chuẩn
  target_y: number;
  target_rotation_deg: number; // Góc xoay mục tiêu chuẩn
  is_placed: boolean;      // Đã gắn đúng vào trang sổ chưa
  is_snapped: boolean;     // Đã snap dính chặt vào vị trí
  accuracy: number;        // 0..100
}

export interface PhoenixButterflyState {
  game_id: MinigameId;
  parts: Record<ButterflyPartId, ButterflyPart>;
  selected_part_id: ButterflyPartId | null;
  placed_count: number;
  is_book_closed: boolean; // Đã đóng sổ ép khô chưa
  symmetry_score: number;  // 0..100
  aesthetic_score: number; // 0..100
  total_score: number;     // 0..100
  title_earned: string;
  message: string;
  is_finished: boolean;
  history: string[];
}

export type PhoenixButterflyAction =
  | { type: 'SELECT_PART'; part_id: ButterflyPartId }
  | { type: 'MOVE_PART'; x: number; y: number }
  | { type: 'ROTATE_PART'; delta_deg: number }
  | { type: 'SNAP_PART' }
  | { type: 'PRESS_BOOK' }
  | { type: 'RESET_PARTS' }
  | { type: 'QUIT' };

export class PhoenixButterflyEngine implements IMinigameEngine<PhoenixButterflyState, PhoenixButterflyAction> {
  readonly id: MinigameId = 'phoenix_butterfly';
  private state!: PhoenixButterflyState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(_config?: MinigameBaseConfig): void {
    this.startTime = Date.now();
    this.state = {
      game_id: 'phoenix_butterfly',
      parts: {
        wing_upper_left: {
          id: 'wing_upper_left',
          name: 'Cánh trên trái',
          current_x: 15,
          current_y: 80,
          current_rotation_deg: 0,
          target_x: 35,
          target_y: 35,
          target_rotation_deg: 315,
          is_placed: false,
          is_snapped: false,
          accuracy: 0
        },
        wing_upper_right: {
          id: 'wing_upper_right',
          name: 'Cánh trên phải (đốm vàng)',
          current_x: 30,
          current_y: 80,
          current_rotation_deg: 0,
          target_x: 65,
          target_y: 35,
          target_rotation_deg: 45,
          is_placed: false,
          is_snapped: false,
          accuracy: 0
        },
        wing_lower_left: {
          id: 'wing_lower_left',
          name: 'Cánh dưới trái',
          current_x: 45,
          current_y: 80,
          current_rotation_deg: 0,
          target_x: 38,
          target_y: 55,
          target_rotation_deg: 240,
          is_placed: false,
          is_snapped: false,
          accuracy: 0
        },
        wing_lower_right: {
          id: 'wing_lower_right',
          name: 'Cánh dưới phải',
          current_x: 60,
          current_y: 80,
          current_rotation_deg: 0,
          target_x: 62,
          target_y: 55,
          target_rotation_deg: 120,
          is_placed: false,
          is_snapped: false,
          accuracy: 0
        },
        antenna_left: {
          id: 'antenna_left',
          name: 'Râu nhị hoa trái',
          current_x: 75,
          current_y: 80,
          current_rotation_deg: 0,
          target_x: 45,
          target_y: 20,
          target_rotation_deg: 330,
          is_placed: false,
          is_snapped: false,
          accuracy: 0
        },
        antenna_right: {
          id: 'antenna_right',
          name: 'Râu nhị hoa phải',
          current_x: 88,
          current_y: 80,
          current_rotation_deg: 0,
          target_x: 55,
          target_y: 20,
          target_rotation_deg: 30,
          is_placed: false,
          is_snapped: false,
          accuracy: 0
        }
      },
      selected_part_id: null,
      placed_count: 0,
      is_book_closed: false,
      symmetry_score: 0,
      aesthetic_score: 0,
      total_score: 0,
      title_earned: 'Bướm phượng học trò',
      message: 'Hãy chọn từng cánh hoa phượng và nhị hoa từ khay, xếp vào khung trang sổ!',
      is_finished: false,
      history: []
    };
  }

  getState(): PhoenixButterflyState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: PhoenixButterflyAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'SELECT_PART':
        this.state.selected_part_id = action.part_id;
        const part = this.state.parts[action.part_id];
        this.state.message = `Đang chọn: ${part.name}. Kéo thả vào trang sổ và xoay cánh cho khớp.`;
        return true;

      case 'MOVE_PART':
        return this.handleMovePart(action.x, action.y);

      case 'ROTATE_PART':
        return this.handleRotatePart(action.delta_deg);

      case 'SNAP_PART':
        return this.handleSnapPart();

      case 'PRESS_BOOK':
        return this.handlePressBook();

      case 'RESET_PARTS':
        this.init();
        this.state.message = 'Đã xếp lại các cánh hoa từ đầu.';
        return true;

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng kẹp bướm hoa phượng.';
        return true;

      default:
        return false;
    }
  }

  private handleMovePart(x: number, y: number): boolean {
    if (!this.state.selected_part_id) return false;
    const part = this.state.parts[this.state.selected_part_id];
    if (part.is_snapped) return false;

    part.current_x = Math.max(0, Math.min(100, x));
    part.current_y = Math.max(0, Math.min(100, y));
    return true;
  }

  private handleRotatePart(delta_deg: number): boolean {
    if (!this.state.selected_part_id) return false;
    const part = this.state.parts[this.state.selected_part_id];
    if (part.is_snapped) return false;

    part.current_rotation_deg = (part.current_rotation_deg + delta_deg + 360) % 360;
    return true;
  }

  private handleSnapPart(): boolean {
    if (!this.state.selected_part_id) return false;
    const part = this.state.parts[this.state.selected_part_id];

    // Đo khoảng cách tọa độ và góc xoay
    const dist = Math.hypot(part.current_x - part.target_x, part.current_y - part.target_y);
    const rotDiff = Math.abs((part.current_rotation_deg - part.target_rotation_deg + 360) % 360);
    const effectiveRotDiff = Math.min(rotDiff, 360 - rotDiff);

    // Điều kiện snap: cách mục tiêu <= 15% và góc lệch <= 40 độ
    if (dist <= 15 && effectiveRotDiff <= 40) {
      part.is_snapped = true;
      part.is_placed = true;
      const accPos = Math.max(0, 100 - dist * 4);
      const accRot = Math.max(0, 100 - effectiveRotDiff * 2);
      part.accuracy = Math.round((accPos + accRot) / 2);

      this.state.placed_count = Object.values(this.state.parts).filter(p => p.is_snapped).length;
      this.state.message = `Khớp rồi! Gắn thành công ${part.name} (Độ chuẩn: ${part.accuracy}%).`;
      this.state.history.push(`Gắn ${part.name}: ${part.accuracy}%`);
      this.state.selected_part_id = null;

      if (this.state.placed_count === 6) {
        this.state.message = 'Cả 6 bộ phận đã sẵn sàng! Nhấn nút "Kẹp sổ" để ép khô con bướm nào!';
      }
      return true;
    } else {
      this.state.message = `Chưa đúng vị trí của ${part.name}! Hãy chỉnh lại góc hoặc đặt gần hình mẫu hơn.`;
      return false;
    }
  }

  private handlePressBook(): boolean {
    if (this.state.placed_count < 4) {
      this.state.message = 'Bạn cần xếp ít nhất 4 cánh hoa trước khi kẹp sổ!';
      return false;
    }

    this.state.is_book_closed = true;
    this.calculateFinalScores();
    this.state.is_finished = true;
    this.state.message = `Tách! Quyển sổ đã khép lại và ép phẳng con bướm hoa phượng. Bạn nhận được danh hiệu: ${this.state.title_earned}!`;
    return true;
  }

  private calculateFinalScores(): void {
    const partsList = Object.values(this.state.parts);
    const placedParts = partsList.filter(p => p.is_snapped);

    const avgAccuracy = placedParts.reduce((sum, p) => sum + p.accuracy, 0) / Math.max(1, placedParts.length);

    // Tính điểm đối xứng giữa cánh trái và cánh phải
    const leftUpperAcc = this.state.parts.wing_upper_left.accuracy;
    const rightUpperAcc = this.state.parts.wing_upper_right.accuracy;
    const leftLowerAcc = this.state.parts.wing_lower_left.accuracy;
    const rightLowerAcc = this.state.parts.wing_lower_right.accuracy;

    const symUpper = 100 - Math.abs(leftUpperAcc - rightUpperAcc);
    const symLower = 100 - Math.abs(leftLowerAcc - rightLowerAcc);
    const symmetry = Math.round((symUpper + symLower) / 2);

    const aesthetic = Math.round(avgAccuracy * 0.7 + (this.state.placed_count / 6) * 30);
    const total = Math.round((aesthetic * 0.6) + (symmetry * 0.4));

    let title = 'Bướm hoa phượng mộc mạc';
    if (total >= 88 && this.state.placed_count === 6) {
      title = 'Bướm phượng hoàng lửa tuyệt mỹ';
    } else if (total >= 70) {
      title = 'Cánh bướm lưu bút xinh xắn';
    }

    this.state.symmetry_score = symmetry;
    this.state.aesthetic_score = aesthetic;
    this.state.total_score = total;
    this.state.title_earned = title;
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const score = this.state.total_score;

    let stars: 1 | 2 | 3 = 1;
    if (score >= 85) stars = 3;
    else if (score >= 60) stars = 2;

    const result = this.state.is_finished ? 'complete' : 'quit';

    let dialogue: string;
    if (score >= 85) {
      dialogue = 'Hạ: Oa... con bướm phượng này đẹp như tranh vẽ ấy! Để tớ kẹp thêm một cánh hoa bằng lăng tím vào bên cạnh nhé!';
    } else if (score >= 60) {
      dialogue = 'Châu: Cậu xếp hai bên cánh rất cân đối. Hoa phượng sau mưa ép vào sổ thế này màu sẽ giữ được cả năm học đấy.';
    } else {
      dialogue = 'Đức: Nhìn con bướm của mày kìa, râu quặp cánh méo xẹo! Nhưng mà kẹp vào trang đầu quyển lưu bút thì trông vẫn ngầu chán!';
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
