/**
 * MINIGAME: OẲN TÙ TÌ BÚNG TAI (Trang 1 - Giờ Ra Chơi Lớp 6A3)
 * Trò chơi phân định thắng thua tuổi thơ với tâm lý ra đòn của từng bạn.
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary,
  OpponentId
} from './types';

export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSState {
  game_id: MinigameId;
  opponent_id: OpponentId;
  player_score: number;
  opponent_score: number;
  current_round: number;
  target_score: number; // Đánh chạm 3
  last_player_choice: RPSChoice | null;
  last_opponent_choice: RPSChoice | null;
  last_round_winner: 'player' | 'opponent' | 'draw' | null;
  message: string;
  is_finished: boolean;
  history: string[];
}

export type RPSAction =
  | { type: 'PLAY'; choice: RPSChoice }
  | { type: 'QUIT' };

export class RPSBattleEngine implements IMinigameEngine<RPSState, RPSAction> {
  readonly id: MinigameId = 'rock_paper_scissors';
  private state!: RPSState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(config?: MinigameBaseConfig): void {
    const opponent_id: OpponentId = config?.opponent_id || 'duc';
    this.startTime = Date.now();

    this.state = {
      game_id: 'rock_paper_scissors',
      opponent_id,
      player_score: 0,
      opponent_score: 0,
      current_round: 1,
      target_score: 3,
      last_player_choice: null,
      last_opponent_choice: null,
      last_round_winner: null,
      message: `Oẳn tù tì với ${this.getOpponentName(opponent_id)}! Ai chạm 3 trước sẽ được búng tai người kia!`,
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

  getState(): RPSState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: RPSAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'PLAY':
        return this.handlePlay(action.choice);

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng ván oẳn tù tì.';
        return true;

      default:
        return false;
    }
  }

  private handlePlay(playerChoice: RPSChoice): boolean {
    const opponentChoice = this.getAiChoice(playerChoice);

    this.state.last_player_choice = playerChoice;
    this.state.last_opponent_choice = opponentChoice;

    const opName = this.getOpponentName(this.state.opponent_id);
    const pStr = this.choiceToText(playerChoice);
    const oStr = this.choiceToText(opponentChoice);

    if (playerChoice === opponentChoice) {
      this.state.last_round_winner = 'draw';
      this.state.message = `Cả hai cùng ra ${pStr}! Hòa nhau, ra lại nào!`;
      this.state.history.push(`Ván ${this.state.current_round}: Hòa (${pStr})`);
    } else if (
      (playerChoice === 'rock' && opponentChoice === 'scissors') ||
      (playerChoice === 'scissors' && opponentChoice === 'paper') ||
      (playerChoice === 'paper' && opponentChoice === 'rock')
    ) {
      this.state.last_round_winner = 'player';
      this.state.player_score++;
      this.state.message = `Bạn ra ${pStr} thắng ${oStr} của ${opName}! "Chách!" - Búng tai một cái nào!`;
      this.state.history.push(`Ván ${this.state.current_round}: Bạn thắng (${pStr} vs ${oStr})`);
    } else {
      this.state.last_round_winner = 'opponent';
      this.state.opponent_score++;
      this.state.message = `${opName} ra ${oStr} thắng ${pStr} của bạn! Bị búng tai đau điếng rồi!`;
      this.state.history.push(`Ván ${this.state.current_round}: ${opName} thắng (${oStr} vs ${pStr})`);
    }

    this.state.current_round++;

    if (this.state.player_score >= this.state.target_score || this.state.opponent_score >= this.state.target_score) {
      this.state.is_finished = true;
      if (this.state.player_score > this.state.opponent_score) {
        this.state.message = `Chiến thắng chung cuộc! Bạn đã thắng ${opName} với tỉ số ${this.state.player_score} - ${this.state.opponent_score}! Tai ${opName} đỏ ửng rồi!`;
      } else {
        this.state.message = `${opName} đã thắng chung cuộc ${this.state.opponent_score} - ${this.state.player_score}. Tai bạn nóng ran cả lên!`;
      }
    }

    return true;
  }

  private getAiChoice(_playerChoice: RPSChoice): RPSChoice {
    const rand = Math.random();
    switch (this.state.opponent_id) {
      case 'duc':
        // Đức bộc trực, 60% thích ra búa (rock)
        if (rand < 0.6) return 'rock';
        if (rand < 0.8) return 'scissors';
        return 'paper';

      case 'ha':
        // Hạ thích ra bao (paper) nhẹ nhàng
        if (rand < 0.55) return 'paper';
        if (rand < 0.8) return 'scissors';
        return 'rock';

      case 'chau':
        // Châu tính toán, nếu ván trước bạn vừa ra gì, Châu sẽ ra nước khắc chế nước đó
        if (this.state.last_player_choice) {
          if (this.state.last_player_choice === 'rock') return 'paper';
          if (this.state.last_player_choice === 'paper') return 'scissors';
          if (this.state.last_player_choice === 'scissors') return 'rock';
        }
        return rand < 0.33 ? 'rock' : rand < 0.66 ? 'paper' : 'scissors';

      case 'quan':
        // Quân vụng về, hay ra kéo
        if (rand < 0.5) return 'scissors';
        if (rand < 0.75) return 'paper';
        return 'rock';
    }
  }

  private choiceToText(c: RPSChoice): string {
    switch (c) {
      case 'rock': return 'Búa';
      case 'paper': return 'Bao';
      case 'scissors': return 'Kéo';
    }
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const p = this.state.player_score;
    const o = this.state.opponent_score;

    let result: 'win' | 'lose' | 'draw' = 'draw';
    if (p > o) result = 'win';
    else if (p < o) result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (result === 'win' && o === 0) stars = 3;
    else if (result === 'win') stars = 2;

    const opName = this.getOpponentName(this.state.opponent_id);
    const dialogue = result === 'win'
      ? `${opName}: Ui da búng đau thế! Cậu đoán được tớ sắp ra gì đúng không? Lần sau tớ không thèm ra nước đó nữa đâu!`
      : `${opName}: Đưa cái tai đây nào! Chách! Haha, ai bảo cứ ham ra búa đập kéo chi cho bị bao bọc lại!`;

    return {
      game_id: this.id,
      result,
      score: p * 30,
      stars,
      duration_s,
      opponent_id: this.state.opponent_id,
      difficulty: null,
      npc_dialogue_line: dialogue
    };
  }
}
