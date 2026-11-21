/**
 * MINIGAME: TÔ BIỂN TÊN CĂN CỨ (Trang 3 - Căn Cứ Bí Mật)
 * Dùng bút dạ/màu sáp tô biển hiệu "C Ă N C Ứ" treo trước cửa căn cứ.
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary
} from './types';

export interface SignLetter {
  char: string;
  target_color: string;
  painted_color: string | null;
  fill_percentage: number; // 0..100
  neatness: number;        // Độ gọn gàng không lem viền (0..100)
}

export interface PaintSignboardState {
  game_id: MinigameId;
  letters: SignLetter[];
  selected_color: string;
  palette: string[];
  current_letter_idx: number;
  total_beauty_score: number;
  message: string;
  is_finished: boolean;
  history: string[];
}

export type PaintSignboardAction =
  | { type: 'SELECT_COLOR'; color: string }
  | { type: 'PAINT_STROKE'; letter_idx: number; pressure: number }
  | { type: 'FINISH_SIGNBOARD' }
  | { type: 'QUIT' };

export class PaintSignboardEngine implements IMinigameEngine<PaintSignboardState, PaintSignboardAction> {
  readonly id: MinigameId = 'paint_signboard';
  private state!: PaintSignboardState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(_config?: MinigameBaseConfig): void {
    this.startTime = Date.now();
    this.state = {
      game_id: 'paint_signboard',
      letters: [
        { char: 'C', target_color: '#E53E3E', painted_color: null, fill_percentage: 0, neatness: 100 },
        { char: 'Ă', target_color: '#DD6B20', painted_color: null, fill_percentage: 0, neatness: 100 },
        { char: 'N', target_color: '#D69E2E', painted_color: null, fill_percentage: 0, neatness: 100 },
        { char: 'C', target_color: '#38A169', painted_color: null, fill_percentage: 0, neatness: 100 },
        { char: 'Ứ', target_color: '#3182CE', painted_color: null, fill_percentage: 0, neatness: 100 }
      ],
      selected_color: '#E53E3E', // Mặc định màu đỏ
      palette: ['#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5'],
      current_letter_idx: 0,
      total_beauty_score: 0,
      message: 'Chọn màu sáp và tô kín 5 chữ cái "C Ă N C Ứ" trên tấm biển gỗ!',
      is_finished: false,
      history: []
    };
  }

  getState(): PaintSignboardState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: PaintSignboardAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'SELECT_COLOR':
        this.state.selected_color = action.color;
        this.state.message = `Đã chọn màu sáp mới.`;
        return true;

      case 'PAINT_STROKE':
        return this.handlePaintStroke(action.letter_idx, action.pressure);

      case 'FINISH_SIGNBOARD':
        return this.handleFinishSignboard();

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng tô biển tên.';
        return true;

      default:
        return false;
    }
  }

  private handlePaintStroke(letterIdx: number, pressure: number): boolean {
    const letter = this.state.letters[letterIdx];
    if (!letter) return false;

    letter.painted_color = this.state.selected_color;

    // Tô tăng % phủ màu
    const fillGain = Math.min(35, Math.max(10, Math.round(pressure * 30)));
    letter.fill_percentage = Math.min(100, letter.fill_percentage + fillGain);

    // Nếu ấn bút quá mạnh (> 0.85) thì lem viền nhẹ
    if (pressure > 0.85) {
      letter.neatness = Math.max(40, letter.neatness - 8);
    }

    this.state.current_letter_idx = letterIdx;
    this.state.message = `Đang tô chữ ${letter.char}: Phủ kín ${letter.fill_percentage}%.`;

    // Kiểm tra xem đã tô xong hết 5 chữ chưa
    const allFilled = this.state.letters.every(l => l.fill_percentage >= 80);
    if (allFilled) {
      return this.handleFinishSignboard();
    }

    return true;
  }

  private handleFinishSignboard(): boolean {
    this.calculateBeautyScore();
    this.state.is_finished = true;
    this.state.message = `Biển hiệu "C Ă N C Ứ" đã hoàn tất rực rỡ sắc màu (Thẩm mỹ: ${this.state.total_beauty_score}/100)!`;
    return true;
  }

  private calculateBeautyScore(): void {
    let totalFill = 0;
    let totalNeat = 0;

    for (const l of this.state.letters) {
      totalFill += l.fill_percentage;
      totalNeat += l.neatness;
    }

    const avgFill = totalFill / this.state.letters.length;
    const avgNeat = totalNeat / this.state.letters.length;

    this.state.total_beauty_score = Math.round((avgFill * 0.6) + (avgNeat * 0.4));
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const score = this.state.total_beauty_score;

    let result: 'win' | 'lose' | 'complete' = 'complete';
    if (score >= 80) result = 'win';
    else if (score < 40) result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (score >= 85) stars = 3;
    else if (score >= 65) stars = 2;

    let dialogue: string;
    if (score >= 85) {
      dialogue = 'Hạ: Oa, biển tên nhiều màu nổi bật ghê! Treo ngay trên chạc cây nhìn từ đầu hẻm là thấy liền!';
    } else if (score >= 65) {
      dialogue = 'Quân: Chữ Căn Cứ nét đậm rõ ràng ghê, nhìn y như bảng hiệu của mấy căn cứ biệt đội trong truyện tranh!';
    } else {
      dialogue = 'Đức: Màu hơi lem xíu nhưng mà nhìn bụi bặm đúng chất căn cứ bí mật của tụi mình!';
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
