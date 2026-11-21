/**
 * MINIGAME: VỚT THUYỀN QUE TRE (Trang 2 - Mương Thoát Nước Sau Mưa)
 * Dùng cành cây/que tre cứu những chiếc thuyền giấy mắc kẹt trước khi trôi vào cống.
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary
} from './types';

export interface FloatingBoat {
  id: number;
  name: string;
  x: number;          // 0..100 (trôi từ 0 -> 100)
  speed: number;      // Tốc độ trôi
  is_rescued: boolean;
  is_lost: boolean;   // Trôi tụt vào cống (> 95)
}

export interface RescueBoatState {
  game_id: MinigameId;
  stick_x: number;    // Vị trí đầu que tre (0..100)
  stick_reach: number;// Tầm với của que tre
  boats: FloatingBoat[];
  current_boat_idx: number;
  rescued_count: number;
  lost_count: number;
  message: string;
  is_finished: boolean;
  history: string[];
}

export type RescueBoatAction =
  | { type: 'MOVE_STICK'; x: number }
  | { type: 'HOOK_BOAT' }
  | { type: 'TICK_WATER'; delta_ms: number }
  | { type: 'QUIT' };

export class RescueBoatEngine implements IMinigameEngine<RescueBoatState, RescueBoatAction> {
  readonly id: MinigameId = 'rescue_boat';
  private state!: RescueBoatState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(_config?: MinigameBaseConfig): void {
    this.startTime = Date.now();
    this.state = {
      game_id: 'rescue_boat',
      stick_x: 50,
      stick_reach: 8, // Bán kính vợt của đầu que tre
      boats: [
        { id: 1, name: 'Thuyền giấy báo của Đức (đang ướt sũng)', x: 5, speed: 1.2, is_rescued: false, is_lost: false },
        { id: 2, name: 'Thuyền gấp ô ly của Hạ (mắc vào rác)', x: 0, speed: 1.6, is_rescued: false, is_lost: false },
        { id: 3, name: 'Thuyền buồm giấy màu của Châu (trôi xoáy)', x: -5, speed: 2.0, is_rescued: false, is_lost: false }
      ],
      current_boat_idx: 0,
      rescued_count: 0,
      lost_count: 0,
      message: 'Cầm chắc cành cây! Canh đúng lúc thuyền trôi qua để khều vào bờ!',
      is_finished: false,
      history: []
    };
  }

  getState(): RescueBoatState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: RescueBoatAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'MOVE_STICK':
        this.state.stick_x = Math.max(10, Math.min(90, action.x));
        return true;

      case 'HOOK_BOAT':
        return this.handleHook();

      case 'TICK_WATER':
        return this.handleTickWater(action.delta_ms);

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng vớt thuyền.';
        return true;

      default:
        return false;
    }
  }

  private handleHook(): boolean {
    const curIdx = this.state.current_boat_idx;
    const boat = this.state.boats[curIdx];
    if (!boat || boat.is_rescued || boat.is_lost) return false;

    // Khoảng cách giữa đầu que và thuyền
    const dist = Math.abs(boat.x - this.state.stick_x);
    if (dist <= this.state.stick_reach) {
      boat.is_rescued = true;
      this.state.rescued_count++;
      this.state.message = `Vớt thành công ${boat.name}! Cứu kịp trước miệng cống!`;
      this.state.history.push(`Cứu được ${boat.name}`);
      this.advanceNextBoat();
      return true;
    } else {
      this.state.message = 'Khều hụt rồi! Nhanh tay đón đầu dòng nước!';
      return false;
    }
  }

  private handleTickWater(delta_ms: number): boolean {
    const curIdx = this.state.current_boat_idx;
    const boat = this.state.boats[curIdx];
    if (!boat || boat.is_rescued || boat.is_lost) return false;

    boat.x += (boat.speed * (delta_ms / 100));

    if (boat.x >= 95) {
      boat.is_lost = true;
      this.state.lost_count++;
      this.state.message = `Ôi không! ${boat.name} đã bị nước xoáy cuốn tọt vào cống rồi!`;
      this.state.history.push(`Để mất ${boat.name}`);
      this.advanceNextBoat();
    }
    return true;
  }

  private advanceNextBoat(): void {
    if (this.state.current_boat_idx < this.state.boats.length - 1) {
      this.state.current_boat_idx++;
      const nextBoat = this.state.boats[this.state.current_boat_idx];
      this.state.message = `Chiếc tiếp theo đang trôi tới: ${nextBoat.name}! Chuẩn bị que khều!`;
    } else {
      this.state.is_finished = true;
      this.state.message = `Đã hết thuyền! Bạn cứu được ${this.state.rescued_count}/${this.state.boats.length} chiếc thuyền giấy!`;
    }
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const score = this.state.rescued_count * 35;

    let result: 'win' | 'lose' | 'complete' = 'complete';
    if (this.state.rescued_count === 3) result = 'win';
    else if (this.state.rescued_count === 0) result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (this.state.rescued_count === 3) stars = 3;
    else if (this.state.rescued_count >= 2) stars = 2;

    let dialogue: string;
    if (this.state.rescued_count === 3) {
      dialogue = 'Đức: Hay quá mày ơi! Cứu được chiếc chiến hạm của tao rồi! Đem phơi nắng trên nắp cống lát nữa thả tiếp!';
    } else if (this.state.rescued_count >= 1) {
      dialogue = 'Hạ: May mà vớt được chiếc thuyền của tớ lên bờ, chứ trôi vô cống tối om thì tiếc lắm!';
    } else {
      dialogue = 'Quân: Nước chảy sau mưa xiết quá, thuyền giấy gặp nước rã nhanh ghê... Lần sau mình lấy vỏ hộp sữa gấp nha.';
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
