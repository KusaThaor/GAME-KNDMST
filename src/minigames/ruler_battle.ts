/**
 * MINIGAME: BÚNG THƯỚC KẺ HỌC TRÒ (Trang 1 - Bàn Học Gỗ Lớp 6A3)
 * Trò chơi kinh điển trên mặt bàn gỗ học sinh thập niên 2010.
 *
 * Luật chơi:
 * - Búng thước nhựa/mica trên mặt bàn.
 * - Thước bên nào gác đè lên thước đối phương -> ghi điểm.
 * - Đẩy thước đối phương rớt khỏi mép bàn -> thắng hiệp ngay.
 * - Tự búng thước mình rớt khỏi mép bàn -> thua hiệp đó.
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary,
  OpponentId
} from './types';

export interface RulerItem {
  id: 'player' | 'opponent';
  name: string;
  x: number;          // Tọa độ tâm (0..100)
  y: number;
  rotation_deg: number;
  length: number;     // Chiều dài thước (ví dụ 16)
  width: number;      // Chiều rộng thước (ví dụ 3)
  is_fallen: boolean; // Bị rơi khỏi mép bàn
}

export interface RulerBattleState {
  game_id: MinigameId;
  turn: 'player' | 'opponent';
  opponent_id: OpponentId;
  player_ruler: RulerItem;
  opponent_ruler: RulerItem;
  player_round_wins: number;
  opponent_round_wins: number;
  current_round: number;
  max_rounds: number; // Đánh BO3
  flick_angle_deg: number;
  flick_power: number; // 0..100
  message: string;
  is_finished: boolean;
  history: string[];
}

export type RulerBattleAction =
  | { type: 'AIM_FLICK'; angle_deg: number; power: number }
  | { type: 'FLICK' }
  | { type: 'NEXT_ROUND' }
  | { type: 'QUIT' };

export class RulerBattleEngine implements IMinigameEngine<RulerBattleState, RulerBattleAction> {
  readonly id: MinigameId = 'ruler_battle';
  private state!: RulerBattleState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(config?: MinigameBaseConfig): void {
    const opponent_id: OpponentId = config?.opponent_id || 'duc';
    this.startTime = Date.now();

    this.state = {
      game_id: 'ruler_battle',
      turn: 'player',
      opponent_id,
      player_ruler: {
        id: 'player',
        name: 'Thước ke dẻo xanh của bạn',
        x: 50,
        y: 85,
        rotation_deg: 0,
        length: 18,
        width: 3.5,
        is_fallen: false
      },
      opponent_ruler: {
        id: 'opponent',
        name: `Thước eke mica của ${this.getOpponentName(opponent_id)}`,
        x: 50,
        y: 20,
        rotation_deg: 0,
        length: 18,
        width: 3.5,
        is_fallen: false
      },
      player_round_wins: 0,
      opponent_round_wins: 0,
      current_round: 1,
      max_rounds: 3,
      flick_angle_deg: 270,
      flick_power: 50,
      message: `Hiệp 1 bắt đầu! Nhắm vào thước của ${this.getOpponentName(opponent_id)} và búng ngón tay!`,
      is_finished: false,
      history: []
    };
  }

  private getOpponentName(op: OpponentId): string {
    switch (op) {
      case 'duc': return 'Đức';
      case 'quan': return 'Quân';
      case 'ha': return 'Hạ';
      case 'chau': return 'Châu';
    }
  }

  getState(): RulerBattleState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: RulerBattleAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'AIM_FLICK':
        this.state.flick_angle_deg = (action.angle_deg + 360) % 360;
        this.state.flick_power = Math.max(10, Math.min(100, action.power));
        return true;

      case 'FLICK':
        return this.handleFlick();

      case 'NEXT_ROUND':
        return this.handleNextRound();

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng ván búng thước.';
        return true;

      default:
        return false;
    }
  }

  private handleFlick(): boolean {
    const isPlayer = this.state.turn === 'player';
    const active = isPlayer ? this.state.player_ruler : this.state.opponent_ruler;
    const passive = isPlayer ? this.state.opponent_ruler : this.state.player_ruler;

    let angle = this.state.flick_angle_deg;
    let power = this.state.flick_power;

    if (!isPlayer) {
      // AI búng
      const dx = passive.x - active.x;
      const dy = passive.y - active.y;
      angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      power = 40 + Math.random() * 30;
    }

    const rad = (angle * Math.PI) / 180;
    const dist = (power * 0.45);
    active.x += Math.cos(rad) * dist;
    active.y += Math.sin(rad) * dist;
    active.rotation_deg = (active.rotation_deg + power * 1.5) % 360;

    // Kiểm tra mép bàn (mặt bàn 0..100)
    if (active.x < 5 || active.x > 95 || active.y < 5 || active.y > 95) {
      active.is_fallen = true;
      if (isPlayer) {
        this.state.opponent_round_wins++;
        this.state.message = 'Lực quá mạnh! Thước của bạn đã bay khỏi mép bàn gỗ!';
        this.state.history.push(`Hiệp ${this.state.current_round}: Bạn rơi bàn`);
      } else {
        this.state.player_round_wins++;
        this.state.message = `${this.getOpponentName(this.state.opponent_id)} búng hăng quá làm thước văng xuống đất!`;
        this.state.history.push(`Hiệp ${this.state.current_round}: ${this.getOpponentName(this.state.opponent_id)} rơi bàn`);
      }
      return this.checkRoundEnd();
    }

    // Kiểm tra va chạm với thước bên kia
    const d = Math.hypot(active.x - passive.x, active.y - passive.y);
    if (d < 10) {
      // Đè lên hoặc đẩy thước đối phương
      if (d < 5) {
        // Đè lên hoàn toàn
        if (isPlayer) {
          this.state.player_round_wins++;
          this.state.message = 'Răng rắc! Thước của bạn đã đè bẹp lên thước đối phương! Thắng hiệp!';
          this.state.history.push(`Hiệp ${this.state.current_round}: Bạn đè thước thắng`);
        } else {
          this.state.opponent_round_wins++;
          this.state.message = `${this.getOpponentName(this.state.opponent_id)} đã búng thước đè lên thước của bạn!`;
          this.state.history.push(`Hiệp ${this.state.current_round}: Đối thủ đè thước`);
        }
        return this.checkRoundEnd();
      } else {
        // Đẩy văng passive
        passive.x += Math.cos(rad) * (dist * 0.6);
        passive.y += Math.sin(rad) * (dist * 0.6);
        if (passive.x < 5 || passive.x > 95 || passive.y < 5 || passive.y > 95) {
          passive.is_fallen = true;
          if (isPlayer) {
            this.state.player_round_wins++;
            this.state.message = 'Cú búng hoàn hảo hất văng thước đối thủ xuống gầm bàn!';
            this.state.history.push(`Hiệp ${this.state.current_round}: Bạn hất rơi thước đối thủ`);
          } else {
            this.state.opponent_round_wins++;
            this.state.message = `Thước của bạn bị hất văng khỏi mép bàn gỗ!`;
            this.state.history.push(`Hiệp ${this.state.current_round}: Bạn bị hất rơi thước`);
          }
          return this.checkRoundEnd();
        }
      }
    }

    // Nếu không ai rơi hoặc đè -> đổi lượt
    this.state.turn = isPlayer ? 'opponent' : 'player';
    this.state.message = isPlayer
      ? `Đến lượt búng của ${this.getOpponentName(this.state.opponent_id)}!`
      : 'Đến lượt của bạn! Căn góc búng tiếp!';
    return true;
  }

  private checkRoundEnd(): boolean {
    if (this.state.player_round_wins >= 2 || this.state.opponent_round_wins >= 2 || this.state.current_round >= this.state.max_rounds) {
      this.state.is_finished = true;
      const pWins = this.state.player_round_wins;
      const oWins = this.state.opponent_round_wins;
      const opName = this.getOpponentName(this.state.opponent_id);

      if (pWins > oWins) {
        this.state.message = `Tuyệt đỉnh búng thước! Bạn đã thắng chung cuộc ${pWins} - ${oWins}!`;
      } else if (pWins < oWins) {
        this.state.message = `${opName} đã thắng chung cuộc với tỉ số ${oWins} - ${pWins}.`;
      } else {
        this.state.message = `Hòa nhau ${pWins} đều sau các hiệp búng thước căng thẳng!`;
      }
    }
    return true;
  }

  private handleNextRound(): boolean {
    this.state.current_round++;
    this.state.turn = 'player';
    this.state.player_ruler.x = 50;
    this.state.player_ruler.y = 85;
    this.state.player_ruler.is_fallen = false;
    this.state.opponent_ruler.x = 50;
    this.state.opponent_ruler.y = 20;
    this.state.opponent_ruler.is_fallen = false;
    this.state.message = `Bắt đầu Hiệp ${this.state.current_round}!`;
    return true;
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const p = this.state.player_round_wins;
    const o = this.state.opponent_round_wins;

    let result: 'win' | 'lose' | 'draw' = 'draw';
    if (p > o) result = 'win';
    else if (p < o) result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (result === 'win' && p >= 2 && o === 0) stars = 3;
    else if (result === 'win') stars = 2;

    const opName = this.getOpponentName(this.state.opponent_id);
    const dialogue = result === 'win'
      ? `${opName}: Búng đau cả móng tay mà vẫn thua thước dẻo của mày! Để tao đổi cây thước sắt mượn của anh hai coi!`
      : `${opName}: Haha! Cú búng xoáy góc bàn của tao là gia truyền đấy, thước mày còn non lắm!`;

    return {
      game_id: this.id,
      result,
      score: p * 50,
      stars,
      duration_s,
      opponent_id: this.state.opponent_id,
      difficulty: null,
      npc_dialogue_line: dialogue
    };
  }
}
