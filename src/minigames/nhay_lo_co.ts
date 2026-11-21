/**
 * MINIGAME: NHẢY Ô LÒ CÒ (Khu Vui Chơi Căn Cứ)
 * Thiết kế theo GDD 02 §3.4 và yêu cầu đối thủ 4 mức độ khó.
 *
 * Sơ đồ 10 ô lò cò truyền thống Việt Nam:
 * [10: Chảo / Bán nguyệt (Nghỉ, quay đầu)]
 * [  9: Đơn  ]
 * [7: Kép][8: Kép]
 * [  6: Đơn  ]
 * [4: Kép][5: Kép]
 * [  3: Đơn  ]
 * [  2: Đơn  ]
 * [  1: Đơn  ]
 *
 * Cấp độ khó đối thủ:
 * - Hạ (Hard): Bậc thầy lò cò, phản xạ thăng bằng 95%, ném sành cực chuẩn.
 * - Châu (Medium): Nhảy cẩn thận, tính toán nhịp đều, tỉ lệ trúng 80%.
 * - Đức (Easy): Hăng hái nhưng vội vã, dễ ném chệch hoặc đạp vạch (60%).
 * - Quân (Very Easy): Hay loạng choạng, chân tay lóng ngóng, dễ mất thăng bằng (45%).
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary,
  OpponentDifficulty,
  OpponentId
} from './types';

export type HopscotchPhase =
  | 'aim_throw'       // Căn lực/góc ném miếng sành
  | 'jumping_out'     // Nhảy từ ô 1 lên ô 10
  | 'turning_around'  // Đứng ở ô 10 quay đầu lại
  | 'jumping_back'    // Nhảy từ ô 9 về, dừng trước ô sành để nhặt
  | 'picking_stone'   // Giữ thăng bằng nhặt miếng sành
  | 'ai_turn'         // Lượt của bạn chơi máy
  | 'round_end'       // Kết thúc một vòng ném
  | 'game_over';      // Xong trò chơi

export interface HopscotchCell {
  id: number;         // 1 -> 10
  type: 'single' | 'double_left' | 'double_right' | 'head'; // Đơn, kép trái, kép phải, chảo
  has_stone: boolean;
}

export interface HopscotchPlayerState {
  name: string;
  current_target_cell: number; // Đang chinh phục ô số mấy (1 -> 10)
  score: number;               // Số ô đã vượt qua thành công
  current_cell: number;        // Vị trí chân đang đứng
  balance: number;             // Độ thăng bằng 0..100 (rơi dưới 20 hoặc quá 80 là ngã)
  fouls: number;               // Số lần phạm quy (đạp vạch, ném hỏng)
}

export interface HopscotchState {
  game_id: MinigameId;
  phase: HopscotchPhase;
  turn: 'player' | 'opponent';
  opponent_id: OpponentId;
  difficulty: OpponentDifficulty;
  player: HopscotchPlayerState;
  opponent: HopscotchPlayerState;
  stone_at_cell: number | null; // Ô đang có miếng sành
  throw_power: number;          // 0..100 dao động để căn ném
  throw_direction: number;      // -10..10 độ lệch
  max_rounds: number;           // Mặc định chơi 3 hoặc 5 vòng
  current_round: number;
  message: string;
  winner: 'player' | 'opponent' | 'draw' | null;
  history: string[];
}

export type HopscotchAction =
  | { type: 'SET_THROW_POWER'; power: number; direction?: number }
  | { type: 'THROW_STONE' }
  | { type: 'JUMP'; target_cell: number; leg_type: 'single' | 'double' }
  | { type: 'MAINTAIN_BALANCE'; delta: number } // Điều chỉnh cân bằng qua lại (-5, +5)
  | { type: 'PICK_STONE' }
  | { type: 'STEP_AI' }
  | { type: 'NEXT_ROUND' }
  | { type: 'QUIT' };

export class HopscotchEngine implements IMinigameEngine<HopscotchState, HopscotchAction> {
  readonly id: MinigameId = 'nhay_lo_co';
  private state!: HopscotchState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(config?: MinigameBaseConfig): void {
    const opponent_id: OpponentId = config?.opponent_id || 'ha';
    const difficulty: OpponentDifficulty = config?.difficulty || this.getDefaultDifficulty(opponent_id);

    this.startTime = Date.now();
    this.state = {
      game_id: 'nhay_lo_co',
      phase: 'aim_throw',
      turn: 'player',
      opponent_id,
      difficulty,
      player: {
        name: 'Bạn',
        current_target_cell: 1,
        score: 0,
        current_cell: 0, // ngoài sân
        balance: 50,
        fouls: 0
      },
      opponent: {
        name: this.getOpponentDisplayName(opponent_id),
        current_target_cell: 1,
        score: 0,
        current_cell: 0,
        balance: 50,
        fouls: 0
      },
      stone_at_cell: null,
      throw_power: 50,
      throw_direction: 0,
      max_rounds: 3,
      current_round: 1,
      message: `Bắt đầu ván Lò Cò với ${this.getOpponentDisplayName(opponent_id)}. Hãy ném miếng sành vào ô 1!`,
      winner: null,
      history: []
    };
  }

  private getDefaultDifficulty(opponent_id: OpponentId): OpponentDifficulty {
    switch (opponent_id) {
      case 'ha': return 'hard';       // Hạ là trùm nhảy dây và lò cò
      case 'chau': return 'medium';   // Châu điềm đạm, ném chuẩn
      case 'duc': return 'easy';      // Đức hấp tấp
      case 'quan': return 'very_easy';// Quân vụng về chân tay
    }
  }

  private getOpponentDisplayName(id: OpponentId): string {
    switch (id) {
      case 'ha': return 'Hạ';
      case 'chau': return 'Châu';
      case 'duc': return 'Đức';
      case 'quan': return 'Quân';
    }
  }

  getState(): HopscotchState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.phase === 'game_over';
  }

  dispatch(action: HopscotchAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') {
      return false;
    }

    switch (action.type) {
      case 'SET_THROW_POWER':
        this.state.throw_power = Math.max(0, Math.min(100, action.power));
        if (action.direction !== undefined) {
          this.state.throw_direction = Math.max(-10, Math.min(10, action.direction));
        }
        return true;

      case 'THROW_STONE':
        return this.handlePlayerThrow();

      case 'JUMP':
        return this.handlePlayerJump(action.target_cell, action.leg_type);

      case 'MAINTAIN_BALANCE':
        this.state.player.balance = Math.max(0, Math.min(100, this.state.player.balance + action.delta));
        if (this.state.player.balance <= 15 || this.state.player.balance >= 85) {
          // Mất thăng bằng ngã!
          this.state.player.fouls++;
          this.state.message = 'Ui da! Bạn bị mất thăng bằng chạm cả hai chân/đạp vạch rồi!';
          this.state.phase = 'round_end';
        }
        return true;

      case 'PICK_STONE':
        return this.handlePlayerPickStone();

      case 'STEP_AI':
        return this.handleAiTurn();

      case 'NEXT_ROUND':
        return this.handleNextRound();

      case 'QUIT':
        this.state.phase = 'game_over';
        this.state.winner = 'opponent';
        this.state.message = 'Bạn đã dừng ván lò cò giữa chừng.';
        return true;

      default:
        return false;
    }
  }

  private handlePlayerThrow(): boolean {
    if (this.state.phase !== 'aim_throw' || this.state.turn !== 'player') return false;

    const target = this.state.player.current_target_cell;
    // Điểm lực lý tưởng cho từng ô (ô 1: 10%, ô 5: 50%, ô 10: 95%)
    const idealPower = target * 9.5;
    const powerDiff = Math.abs(this.state.throw_power - idealPower);
    const dirDiff = Math.abs(this.state.throw_direction);

    // Ném trúng nếu độ chệch nhỏ
    const isSuccess = powerDiff <= 12 && dirDiff <= 3;

    if (isSuccess) {
      this.state.stone_at_cell = target;
      this.state.phase = 'jumping_out';
      this.state.player.current_cell = 0;
      this.state.message = `Tuyệt vời! Miếng sành nằm gọn trong ô ${target}. Bắt đầu nhảy lò cò nào!`;
      this.state.history.push(`Bạn ném chuẩn vào ô ${target}`);
    } else {
      this.state.stone_at_cell = null;
      this.state.player.fouls++;
      this.state.message = `Tiếc quá! Ném chệch vạch ô ${target} rồi. Chuyển lượt cho ${this.state.opponent.name}!`;
      this.state.history.push(`Bạn ném hỏng ô ${target}`);
      this.state.turn = 'opponent';
      this.state.phase = 'ai_turn';
    }
    return true;
  }

  private handlePlayerJump(target_cell: number, leg_type: 'single' | 'double'): boolean {
    if (this.state.turn !== 'player') return false;
    if (this.state.phase !== 'jumping_out' && this.state.phase !== 'jumping_back') return false;

    // Không được nhảy vào ô có sành
    if (target_cell === this.state.stone_at_cell) {
      this.state.player.fouls++;
      this.state.message = `Phạm quy! Bạn đạp trúng ô ${target_cell} đang có miếng sành!`;
      this.state.phase = 'round_end';
      return true;
    }

    // Kiểm tra tính hợp lệ của bước nhảy
    // Ô đơn (1, 2, 3, 6, 9) phải nhảy 1 chân ('single')
    // Ô kép (4-5, 7-8) phải nhảy dạng 2 chân ('double')
    const isSingleCell = [1, 2, 3, 6, 9].includes(target_cell);
    const isDoubleCell = [4, 5, 7, 8].includes(target_cell);

    if (isSingleCell && leg_type !== 'single') {
      this.state.player.fouls++;
      this.state.message = `Ô ${target_cell} là ô đơn, bạn phải nhảy một chân!`;
      this.state.phase = 'round_end';
      return true;
    }

    if (isDoubleCell && leg_type !== 'double') {
      this.state.player.fouls++;
      this.state.message = `Ô ${target_cell} là ô đôi, bạn phải bung hai chân!`;
      this.state.phase = 'round_end';
      return true;
    }

    this.state.player.current_cell = target_cell;

    // Đến chảo (ô 10)
    if (target_cell === 10 && this.state.phase === 'jumping_out') {
      this.state.phase = 'turning_around';
      this.state.message = 'Đến Chảo ô 10 rồi! Được nghỉ hai chân và quay đầu lại chuẩn bị nhảy về!';
      return true;
    }

    // Nếu đang nhảy về và đang ở ô liền kề trước ô có sành
    if (this.state.phase === 'jumping_back') {
      const stoneCell = this.state.stone_at_cell ?? 0;
      // Ví dụ sành ở ô 3, nhảy về từ 4 xuống, dừng ở 4 hoặc từ trên xuống dừng ở trước ô sành
      if (Math.abs(target_cell - stoneCell) === 1) {
        this.state.phase = 'picking_stone';
        this.state.message = `Đang đứng trước ô ${stoneCell}. Hãy giữ thăng bằng và nhặt miếng sành lên!`;
        return true;
      }
    }

    return true;
  }

  private handlePlayerPickStone(): boolean {
    if (this.state.phase !== 'picking_stone' || this.state.turn !== 'player') return false;

    // Kiểm tra độ thăng bằng khi nhặt
    if (this.state.player.balance >= 30 && this.state.player.balance <= 70) {
      this.state.stone_at_cell = null;
      this.state.player.score += 10;
      this.state.player.current_target_cell++;
      this.state.message = 'Nhặt sành thành công! Nhảy nốt ra ngoài vạch xuất phát để ghi điểm!';
      this.state.phase = 'round_end';
      this.state.history.push(`Bạn vượt qua thành công ô ${this.state.player.current_target_cell - 1}`);
    } else {
      this.state.player.fouls++;
      this.state.message = 'Lảo đảo quá nên chạm tay xuống đất! Phạm quy rồi.';
      this.state.phase = 'round_end';
    }
    return true;
  }

  private handleAiTurn(): boolean {
    if (this.state.phase !== 'ai_turn' || this.state.turn !== 'opponent') return false;

    // Xác suất thành công dựa vào độ khó
    let hitRate: number;
    let balanceRate: number;

    switch (this.state.difficulty) {
      case 'hard': // Hạ
        hitRate = 0.95;
        balanceRate = 0.95;
        break;
      case 'medium': // Châu
        hitRate = 0.80;
        balanceRate = 0.85;
        break;
      case 'easy': // Đức
        hitRate = 0.60;
        balanceRate = 0.65;
        break;
      case 'very_easy': // Quân
        hitRate = 0.45;
        balanceRate = 0.50;
        break;
    }

    const target = this.state.opponent.current_target_cell;
    const rollThrow = Math.random();

    if (rollThrow < hitRate) {
      const rollBalance = Math.random();
      if (rollBalance < balanceRate) {
        this.state.opponent.score += 10;
        this.state.opponent.current_target_cell++;
        this.state.message = `${this.state.opponent.name} ném trúng ô ${target} và nhảy nhặt sành rất gọn gàng! (+10 điểm)`;
        this.state.history.push(`${this.state.opponent.name} qua ô ${target}`);
      } else {
        this.state.opponent.fouls++;
        this.state.message = `${this.state.opponent.name} ném trúng nhưng lúc nhặt sành bị chao đảo chạm vạch!`;
        this.state.history.push(`${this.state.opponent.name} mất thăng bằng ở ô ${target}`);
      }
    } else {
      this.state.opponent.fouls++;
      this.state.message = `${this.state.opponent.name} ném sành văng ra ngoài ô ${target} rồi!`;
      this.state.history.push(`${this.state.opponent.name} ném trượt ô ${target}`);
    }

    this.state.phase = 'round_end';
    return true;
  }

  private handleNextRound(): boolean {
    if (this.state.phase !== 'round_end') return false;

    // Đổi lượt
    if (this.state.turn === 'player') {
      this.state.turn = 'opponent';
      this.state.phase = 'ai_turn';
      this.state.message = `Đến lượt của ${this.state.opponent.name}!`;
      return true;
    } else {
      // Kết thúc 1 round đầy đủ (cả 2 bên đã chơi)
      this.state.current_round++;
      if (this.state.current_round > this.state.max_rounds || this.state.player.current_target_cell > 10) {
        return this.finishGame();
      }
      this.state.turn = 'player';
      this.state.phase = 'aim_throw';
      this.state.player.current_cell = 0;
      this.state.player.balance = 50;
      this.state.stone_at_cell = null;
      this.state.message = `Vòng ${this.state.current_round}: Đến lượt bạn ném sành vào ô ${this.state.player.current_target_cell}!`;
      return true;
    }
  }

  private finishGame(): boolean {
    this.state.phase = 'game_over';
    const pScore = this.state.player.score;
    const oScore = this.state.opponent.score;

    if (pScore > oScore) {
      this.state.winner = 'player';
      this.state.message = `Hoan hô! Bạn đã thắng ${this.state.opponent.name} với tỉ số ${pScore} - ${oScore}!`;
    } else if (pScore < oScore) {
      this.state.winner = 'opponent';
      this.state.message = `${this.state.opponent.name} đã giành chiến thắng với tỉ số ${oScore} - ${pScore}.`;
    } else {
      this.state.winner = 'draw';
      this.state.message = `Bất phân thắng bại! Hai bên hòa nhau ${pScore} đều.`;
    }
    return true;
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const pScore = this.state.player.score;

    let result: 'win' | 'lose' | 'draw' = 'draw';
    if (this.state.winner === 'player') result = 'win';
    else if (this.state.winner === 'opponent') result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (result === 'win' && this.state.player.fouls === 0) stars = 3;
    else if (result === 'win' || pScore >= 20) stars = 2;

    const dialogue = this.getFinishDialogue(result, this.state.opponent_id);

    return {
      game_id: this.id,
      result,
      score: pScore,
      stars,
      duration_s,
      opponent_id: this.state.opponent_id,
      difficulty: this.state.difficulty,
      npc_dialogue_line: dialogue
    };
  }

  private getFinishDialogue(result: 'win' | 'lose' | 'draw', op: OpponentId): string {
    switch (op) {
      case 'ha':
        return result === 'win'
          ? 'Hạ: Cậu nhảy dẻo ghê đó! Tớ cứ tưởng không ai ở trường này qua mặt được tớ môn lò cò chứ!'
          : 'Hạ: Haha, tớ đã bảo rồi mà, lò cò là nghề ruột của tớ! Lần sau tớ chấp cậu một chân!';
      case 'chau':
        return result === 'win'
          ? 'Châu: Cậu giữ nhịp thăng bằng rất tốt. Đúng là người có tính kiên nhẫn.'
          : 'Châu: Chỉ cần canh chuẩn lực ném vào giữa ô là cậu sẽ nhảy êm hơn nhiều đấy.';
      case 'duc':
        return result === 'win'
          ? 'Đức: Ê khoan, tại gió thổi làm trượt miếng sành của tao chứ bộ! Chơi lại ván nữa coi!'
          : 'Đức: Thấy tao co chân đứng một ngón đỉnh chưa? Căn cứ này tao trùm lò cò!';
      case 'quan':
        return result === 'win'
          ? 'Quân: Cậu nhảy thoăn thoắt thích thật... Tớ co một chân là người nó cứ nghiêng như sắp đổ.'
          : 'Quân: May quá, nãy tớ ném bừa mà nó cũng lọt vào ô... Cậu đừng cười tớ nha.';
    }
  }
}
