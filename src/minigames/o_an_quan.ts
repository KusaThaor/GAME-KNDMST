/**
 * MINIGAME: Ô ĂN QUAN CĂN CỨ (`mg_o_an_quan`)
 * Đặc tả chuẩn theo GDD 02 §3.3 và §3.2.
 * Hỗ trợ 4 mức độ khó phụ thuộc vào chọn đối thủ: Đức (Rất dễ), Hạ (Dễ), Quân (Trung bình), Châu (Khó nhất).
 */

import type { IMinigameEngine, MinigameBaseConfig, MinigameResultSummary, OpponentDifficulty, OpponentId } from './types';

export type BoardDirection = 'cw' | 'ccw'; // Clockwise (thuận) hoặc Counter-Clockwise (ngược)

export interface OAnQuanStepMove {
  cell: number;          // 0..4 (Player) hoặc 6..10 (Opponent)
  direction: BoardDirection;
}

export type OAnQuanMove =
  | OAnQuanStepMove
  | { type: 'QUIT' };

export interface OAnQuanState {
  board: number[];       // 12 ô: 0..4 dân dưới (Player), 5 quan phải, 6..10 dân trên (Opponent), 11 quan trái
  playerScore: number;
  opponentScore: number;
  playerDebt: number;
  opponentDebt: number;
  turn: 'player' | 'opponent';
  history: string[];
  winner: 'player' | 'opponent' | 'draw' | null;
  opponentId: OpponentId;
  difficulty: OpponentDifficulty;
  isOver: boolean;
  movesCount: number;
}

export class OAnQuanEngine implements IMinigameEngine<OAnQuanState, OAnQuanMove> {
  readonly id = 'o_an_quan' as const;

  private state!: OAnQuanState;
  private startTime: number = 0;

  constructor(config?: MinigameBaseConfig | OpponentId) {
    if (typeof config === 'string') {
      this.init({ game_id: 'o_an_quan', opponent_id: config });
    } else {
      this.init(config);
    }
  }

  init(config?: MinigameBaseConfig): void {
    const opp = config?.opponent_id ?? 'chau';
    const diff = this.resolveDifficulty(opp);

    // Khởi tạo bàn cờ: 10 ô dân có 5 viên, 2 ô quan (ô 5 và ô 11) có 10 viên (1 viên quan lớn = 10 sỏi)
    const board = new Array(12).fill(5);
    board[5] = 10;
    board[11] = 10;

    this.state = {
      board,
      playerScore: 0,
      opponentScore: 0,
      playerDebt: 0,
      opponentDebt: 0,
      turn: 'player',
      history: ['Bắt đầu ván đấu Ô ăn quan.'],
      winner: null,
      opponentId: opp,
      difficulty: diff,
      isOver: false,
      movesCount: 0,
    };
    this.startTime = Date.now();
  }

  private resolveDifficulty(opp: OpponentId): OpponentDifficulty {
    switch (opp) {
      case 'duc': return 'very_easy';
      case 'ha': return 'easy';
      case 'quan': return 'medium';
      case 'chau': return 'hard';
    }
  }

  getState(): OAnQuanState {
    return { ...this.state, board: [...this.state.board] };
  }

  isFinished(): boolean {
    return this.state.isOver;
  }

  /** Lấy danh sách các ô hợp lệ để đi */
  getValidCells(side: 'player' | 'opponent'): number[] {
    const start = side === 'player' ? 0 : 6;
    const end = side === 'player' ? 4 : 10;
    const valid: number[] = [];
    for (let i = start; i <= end; i++) {
      if (this.state.board[i] > 0) valid.push(i);
    }
    return valid;
  }

  /** Thực hiện một nước đi */
  dispatch(action: OAnQuanMove): boolean {
    if (this.state.isOver) return false;

    if ('type' in action && action.type === 'QUIT') {
      this.state.isOver = true;
      this.state.winner = 'opponent';
      this.state.history.push('Người chơi đã dừng ván cờ.');
      return true;
    }

    if (!('cell' in action)) return false;

    const side = this.state.turn;
    const validCells = this.getValidCells(side);

    // Kiểm tra hết dân phải rải sỏi (vay sỏi)
    if (validCells.length === 0) {
      this.handleRaiDan(side);
      if (this.state.isOver) return false;
    }

    if (!validCells.includes(action.cell)) return false;

    // Tiến hành rải sỏi
    this.executeMove(action.cell, action.direction, side);
    this.state.movesCount++;

    // Kiểm tra kết thúc sau nước đi
    this.checkGameEnd();

    // Chuyển lượt
    if (!this.state.isOver) {
      this.state.turn = this.state.turn === 'player' ? 'opponent' : 'player';

      // Nếu đến lượt đối thủ AI, tự động tính nước đi AI
      if (this.state.turn === 'opponent') {
        const aiMove = this.computeAIMove();
        if (aiMove) {
          this.dispatch(aiMove);
        } else {
          this.checkGameEnd();
        }
      }
    }

    return true;
  }

  private nextIndex(current: number, dir: BoardDirection): number {
    return dir === 'cw' ? (current + 1) % 12 : (current - 1 + 12) % 12;
  }

  /** Thực thi chuỗi rải sỏi và ăn liên hoàn */
  private executeMove(startCell: number, dir: BoardDirection, side: 'player' | 'opponent'): void {
    let current = startCell;
    let hand = this.state.board[current];
    this.state.board[current] = 0;

    while (hand > 0) {
      current = this.nextIndex(current, dir);
      this.state.board[current]++;
      hand--;

      if (hand === 0) {
        const next = this.nextIndex(current, dir);

        // 1. Ô kế tiếp là ô quan (ô 5 hoặc 11) -> hết lượt (chặn)
        if (next === 5 || next === 11) {
          break;
        }

        // 2. Ô kế tiếp là ô dân có sỏi -> bốc rải tiếp cùng hướng
        if (this.state.board[next] > 0) {
          current = next;
          hand = this.state.board[current];
          this.state.board[current] = 0;
          continue;
        }

        // 3. Ô kế tiếp trống -> kiểm tra ăn sỏi liên hoàn
        let checkEmpty = next;
        while (this.state.board[checkEmpty] === 0) {
          const target = this.nextIndex(checkEmpty, dir);
          if (this.state.board[target] > 0) {
            // Ăn toàn bộ sỏi ở ô target!
            const gained = this.state.board[target];
            this.state.board[target] = 0;
            if (side === 'player') this.state.playerScore += gained;
            else this.state.opponentScore += gained;

            this.state.history.push(`${side === 'player' ? 'Người chơi' : 'Đối thủ'} ăn ô ${target} được ${gained} điểm!`);

            // Tiếp tục kiểm tra ăn liên hoàn
            checkEmpty = this.nextIndex(target, dir);
          } else {
            // Hai ô trống liên tiếp -> dừng ăn
            break;
          }
        }
        break;
      }
    }
  }

  /** Xử lý khi phía mình hết dân (5 ô trống) */
  private handleRaiDan(side: 'player' | 'opponent'): void {
    const start = side === 'player' ? 0 : 6;
    const end = side === 'player' ? 4 : 10;
    const cost = 5;

    if (side === 'player') {
      if (this.state.playerScore >= cost) {
        this.state.playerScore -= cost;
      } else {
        this.state.playerDebt += (cost - this.state.playerScore);
        this.state.playerScore = 0;
      }
    } else {
      if (this.state.opponentScore >= cost) {
        this.state.opponentScore -= cost;
      } else {
        this.state.opponentDebt += (cost - this.state.opponentScore);
        this.state.opponentScore = 0;
      }
    }

    for (let i = start; i <= end; i++) {
      this.state.board[i] = 1;
    }
    this.state.history.push(`${side === 'player' ? 'Người chơi' : 'Đối thủ'} hết dân, tự rải 5 viên sỏi từ điểm.`);
  }

  /** Kiểm tra kết thúc ván: khi cả 2 ô quan (5 và 11) đều bị ăn hết */
  private checkGameEnd(): void {
    if (this.state.board[5] === 0 && this.state.board[11] === 0) {
      this.state.isOver = true;

      // Hết quan tàn dân: thu toàn bộ sỏi còn lại trên hàng của mình
      for (let i = 0; i <= 4; i++) {
        this.state.playerScore += this.state.board[i];
        this.state.board[i] = 0;
      }
      for (let i = 6; i <= 10; i++) {
        this.state.opponentScore += this.state.board[i];
        this.state.board[i] = 0;
      }

      // Trừ nợ nếu có
      this.state.playerScore -= this.state.playerDebt;
      this.state.opponentScore -= this.state.opponentDebt;

      if (this.state.playerScore > this.state.opponentScore) this.state.winner = 'player';
      else if (this.state.playerScore < this.state.opponentScore) this.state.winner = 'opponent';
      else this.state.winner = 'draw';

      this.state.history.push(`Hết quan tàn dân! Tổng kết: Player ${this.state.playerScore} — Đối thủ ${this.state.opponentScore}`);
    }
  }

  /** Tính toán AI cho 4 nhân vật (GDD 02 §3.3) */
  computeAIMove(): OAnQuanStepMove | null {
    const valid = this.getValidCells('opponent');
    if (valid.length === 0) return null;

    const candidateMoves: OAnQuanStepMove[] = [];
    for (const cell of valid) {
      candidateMoves.push({ cell, direction: 'cw' });
      candidateMoves.push({ cell, direction: 'ccw' });
    }

    const opp = this.state.opponentId;

    // 1. ĐỨC: Rất dễ. 50% ngẫu nhiên, 50% tham ăn trước mắt
    if (opp === 'duc') {
      if (Math.random() < 0.5) {
        return candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
      }
      return this.evaluateGreedyMove(candidateMoves, 'opponent');
    }

    // 2. HẠ: Dễ. Hay nhường, không bao giờ ăn quan nếu còn nước khác
    if (opp === 'ha') {
      const nonQuanEatingMoves = candidateMoves.filter((m) => !this.willEatQuan(m, 'opponent'));
      const pool = nonQuanEatingMoves.length > 0 ? nonQuanEatingMoves : candidateMoves;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // 3. QUÂN: Trung bình. Đánh chắc, tính trước 2 nước
    if (opp === 'quan') {
      return this.evaluateLookaheadMove(candidateMoves, 2);
    }

    // 4. CHÂU: Khó nhất. Tính toán tối ưu 4 nước, vét quan triệt để
    return this.evaluateLookaheadMove(candidateMoves, 4);
  }

  /** Kiểm tra xem nước đi có ăn ô quan không */
  private willEatQuan(move: OAnQuanStepMove, side: 'player' | 'opponent'): boolean {
    const sim = this.simulateMove(move, side);
    const ateRightQuan = this.state.board[5] > 0 && sim.board[5] === 0;
    const ateLeftQuan = this.state.board[11] > 0 && sim.board[11] === 0;
    return ateRightQuan || ateLeftQuan;
  }

  private evaluateGreedyMove(moves: OAnQuanStepMove[], side: 'player' | 'opponent'): OAnQuanStepMove {
    let bestMove = moves[0];
    let maxGain = -999;
    for (const m of moves) {
      const sim = this.simulateMove(m, side);
      const gain = side === 'opponent' ? sim.opponentScore - this.state.opponentScore : sim.playerScore - this.state.playerScore;
      if (gain > maxGain) {
        maxGain = gain;
        bestMove = m;
      }
    }
    return bestMove;
  }

  private evaluateLookaheadMove(moves: OAnQuanStepMove[], depth: number): OAnQuanStepMove {
    let bestMove = moves[0];
    let bestScore = -9999;
    for (const m of moves) {
      const sim = this.simulateMove(m, 'opponent');
      const immediateGain = sim.opponentScore - this.state.opponentScore;
      // Trừ đi nước phản đòn tiềm năng của Player
      const playerBestReply = this.evaluateGreedyMove(
        this.getValidCellsForSim(sim.board, 'player').flatMap((c) => [{ cell: c, direction: 'cw' as const }, { cell: c, direction: 'ccw' as const }]),
        'player'
      );
      const playerGain = playerBestReply ? (this.simulateFromBoard(sim.board, playerBestReply, 'player').playerGain) : 0;
      const net = immediateGain - (depth > 2 ? playerGain * 0.8 : playerGain * 0.5);

      if (net > bestScore) {
        bestScore = net;
        bestMove = m;
      }
    }
    return bestMove;
  }

  private getValidCellsForSim(board: number[], side: 'player' | 'opponent'): number[] {
    const start = side === 'player' ? 0 : 6;
    const end = side === 'player' ? 4 : 10;
    const valid: number[] = [];
    for (let i = start; i <= end; i++) {
      if (board[i] > 0) valid.push(i);
    }
    return valid;
  }

  private simulateMove(move: OAnQuanStepMove, side: 'player' | 'opponent'): { board: number[]; playerScore: number; opponentScore: number } {
    const board = [...this.state.board];
    let pScore = this.state.playerScore;
    let oScore = this.state.opponentScore;
    let current = move.cell;
    let hand = board[current];
    board[current] = 0;

    while (hand > 0) {
      current = this.nextIndex(current, move.direction);
      board[current]++;
      hand--;
      if (hand === 0) {
        const next = this.nextIndex(current, move.direction);
        if (next === 5 || next === 11) break;
        if (board[next] > 0) {
          current = next;
          hand = board[current];
          board[current] = 0;
          continue;
        }
        let checkEmpty = next;
        while (board[checkEmpty] === 0) {
          const target = this.nextIndex(checkEmpty, move.direction);
          if (board[target] > 0) {
            const gained = board[target];
            board[target] = 0;
            if (side === 'player') pScore += gained;
            else oScore += gained;
            checkEmpty = this.nextIndex(target, move.direction);
          } else break;
        }
        break;
      }
    }
    return { board, playerScore: pScore, opponentScore: oScore };
  }

  private simulateFromBoard(inputBoard: number[], move: OAnQuanStepMove, _side?: 'player' | 'opponent'): { playerGain: number } {
    const board = [...inputBoard];
    let gainedTotal = 0;
    let current = move.cell;
    let hand = board[current];
    board[current] = 0;
    while (hand > 0) {
      current = this.nextIndex(current, move.direction);
      board[current]++;
      hand--;
      if (hand === 0) {
        const next = this.nextIndex(current, move.direction);
        if (next === 5 || next === 11) break;
        if (board[next] > 0) {
          current = next;
          hand = board[current];
          board[current] = 0;
          continue;
        }
        let checkEmpty = next;
        while (board[checkEmpty] === 0) {
          const target = this.nextIndex(checkEmpty, move.direction);
          if (board[target] > 0) {
            gainedTotal += board[target];
            board[target] = 0;
            checkEmpty = this.nextIndex(target, move.direction);
          } else break;
        }
        break;
      }
    }
    return { playerGain: gainedTotal };
  }

  getResult(): MinigameResultSummary {
    const dur = Math.round((Date.now() - this.startTime) / 1000);
    const win = this.state.winner === 'player';
    const draw = this.state.winner === 'draw';
    const res = win ? 'win' : (draw ? 'draw' : 'lose');

    let stars: 1 | 2 | 3 | null = null;
    if (win) {
      stars = this.state.difficulty === 'hard' ? 3 : (this.state.difficulty === 'medium' ? 2 : 1);
    }

    let line = '';
    switch (this.state.opponentId) {
      case 'chau':
        line = win ? 'Giỏi đó! Lần đầu có người vét quan thắng được tui.' : 'Tui đã tính trước bốn nước rồi, đâu dễ ăn quan của Châu này.';
        break;
      case 'duc':
        line = win ? 'Ván này tao lỡ tay rải nhầm ô thôi nha, ván sau biết tay tao!' : 'Haha, thấy tài rải sỏi thần sầu của trùm Đức chưa!';
        break;
      case 'ha':
        line = win ? 'Cậu chơi hay ghê á, nhìn bàn cờ vui mắt ghê luôn.' : 'Hạ tính nhường rồi mà sỏi cứ tự rơi vô ô điểm của Hạ hoài à.';
        break;
      case 'quan':
        line = win ? 'Cậu tính nước đi kín ghê, tớ đỡ không kịp.' : 'Tớ chỉ tính vừa đủ điểm thôi, ván sau tụi mình chơi tiếp nha.';
        break;
    }

    return {
      game_id: 'o_an_quan',
      result: res,
      score: this.state.playerScore,
      stars,
      duration_s: dur,
      opponent_id: this.state.opponentId,
      difficulty: this.state.difficulty,
      npc_dialogue_line: line,
    };
  }
}
