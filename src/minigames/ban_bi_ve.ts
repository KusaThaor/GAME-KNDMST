/**
 * MINIGAME: BẮN BI VE (Khu Vui Chơi Căn Cứ)
 * Thiết kế theo GDD 02 §3.4 và yêu cầu 4 mức độ khó đối thủ.
 *
 * 4 cấp độ đối thủ:
 * - Đức (Hard): Tay bắn bi thiện xạ đầu xóm, lực mạnh, ngắm chuẩn 90%.
 * - Quân (Medium): Bắn cẩn thận, biết tính góc phản xạ bật tường/gò đất, chuẩn 75%.
 * - Hạ (Easy): Bắn ngẫu hứng, thích nhắm vào các viên bi kim tuyến đẹp (55%).
 * - Châu (Very Easy): Ít khi chơi bắn bi vì sợ bẩn tay, ngắm lóng ngóng (40%).
 */

import {
  IMinigameEngine,
  MinigameBaseConfig,
  MinigameId,
  MinigameResultSummary,
  OpponentDifficulty,
  OpponentId
} from './types';

export interface Marble {
  id: string;
  x: number;          // 0..100
  y: number;          // 0..100
  radius: number;     // Bán kính bi
  vx: number;         // Vận tốc
  vy: number;
  type: 'player' | 'opponent' | 'target';
  in_ring: boolean;   // Còn nằm trong vòng tròn đất không
}

export interface MarblesState {
  game_id: MinigameId;
  turn: 'player' | 'opponent';
  opponent_id: OpponentId;
  difficulty: OpponentDifficulty;
  ring_center: { x: number; y: number };
  ring_radius: number;
  marbles: Marble[];
  player_score: number;
  opponent_score: number;
  aim_angle_deg: number; // 0..360
  aim_power: number;     // 0..100
  current_turn_count: number;
  max_turns: number;
  message: string;
  is_finished: boolean;
  history: string[];
}

export type MarblesAction =
  | { type: 'AIM'; angle_deg: number; power: number }
  | { type: 'SHOOT' }
  | { type: 'STEP_SIMULATION' }
  | { type: 'NEXT_TURN' }
  | { type: 'QUIT' };

export class MarblesEngine implements IMinigameEngine<MarblesState, MarblesAction> {
  readonly id: MinigameId = 'ban_bi_ve';
  private state!: MarblesState;
  private startTime: number = Date.now();

  constructor(config?: MinigameBaseConfig) {
    this.init(config);
  }

  init(config?: MinigameBaseConfig): void {
    const opponent_id: OpponentId = config?.opponent_id || 'duc';
    const difficulty: OpponentDifficulty = config?.difficulty || this.getDefaultDifficulty(opponent_id);

    this.startTime = Date.now();
    this.state = {
      game_id: 'ban_bi_ve',
      turn: 'player',
      opponent_id,
      difficulty,
      ring_center: { x: 50, y: 50 },
      ring_radius: 35,
      marbles: [
        // Bi người chơi và đối thủ nằm mép ngoài
        { id: 'player_shooter', x: 50, y: 92, radius: 2.5, vx: 0, vy: 0, type: 'player', in_ring: true },
        { id: 'opponent_shooter', x: 50, y: 8, radius: 2.5, vx: 0, vy: 0, type: 'opponent', in_ring: true },
        // 5 viên bi ve mục tiêu nằm rải trong vòng tròn
        { id: 'target_1', x: 50, y: 50, radius: 2.0, vx: 0, vy: 0, type: 'target', in_ring: true },
        { id: 'target_2', x: 44, y: 46, radius: 2.0, vx: 0, vy: 0, type: 'target', in_ring: true },
        { id: 'target_3', x: 56, y: 46, radius: 2.0, vx: 0, vy: 0, type: 'target', in_ring: true },
        { id: 'target_4', x: 45, y: 55, radius: 2.0, vx: 0, vy: 0, type: 'target', in_ring: true },
        { id: 'target_5', x: 55, y: 55, radius: 2.0, vx: 0, vy: 0, type: 'target', in_ring: true }
      ],
      player_score: 0,
      opponent_score: 0,
      aim_angle_deg: 270, // Ngắm thẳng lên trên
      aim_power: 60,
      current_turn_count: 1,
      max_turns: 6,
      message: `Bắt đầu trận bắn bi ve với ${this.getOpponentDisplayName(opponent_id)}. Hãy ngắm góc và kéo lực bắn!`,
      is_finished: false,
      history: []
    };
  }

  private getDefaultDifficulty(op: OpponentId): OpponentDifficulty {
    switch (op) {
      case 'duc': return 'hard';
      case 'quan': return 'medium';
      case 'ha': return 'easy';
      case 'chau': return 'very_easy';
    }
  }

  private getOpponentDisplayName(op: OpponentId): string {
    switch (op) {
      case 'duc': return 'Đức';
      case 'quan': return 'Quân';
      case 'ha': return 'Hạ';
      case 'chau': return 'Châu';
    }
  }

  getState(): MarblesState {
    return JSON.parse(JSON.stringify(this.state));
  }

  isFinished(): boolean {
    return this.state.is_finished;
  }

  dispatch(action: MarblesAction): boolean {
    if (this.isFinished() && action.type !== 'QUIT') return false;

    switch (action.type) {
      case 'AIM':
        this.state.aim_angle_deg = (action.angle_deg + 360) % 360;
        this.state.aim_power = Math.max(10, Math.min(100, action.power));
        return true;

      case 'SHOOT':
        return this.handleShoot();

      case 'STEP_SIMULATION':
        return this.simulatePhysicsStep();

      case 'NEXT_TURN':
        return this.handleNextTurn();

      case 'QUIT':
        this.state.is_finished = true;
        this.state.message = 'Bạn đã dừng ván bắn bi ve.';
        return true;

      default:
        return false;
    }
  }

  private handleShoot(): boolean {
    if (this.state.turn === 'player') {
      const shooter = this.state.marbles.find(m => m.type === 'player');
      if (!shooter) return false;

      const rad = (this.state.aim_angle_deg * Math.PI) / 180;
      const speed = this.state.aim_power * 0.35;
      shooter.vx = Math.cos(rad) * speed;
      shooter.vy = Math.sin(rad) * speed;

      this.runQuickPhysics(shooter);
      return true;
    } else {
      // AI bắn
      return this.handleAiShoot();
    }
  }

  private handleAiShoot(): boolean {
    const shooter = this.state.marbles.find(m => m.type === 'opponent');
    if (!shooter) return false;

    // Tìm một bi mục tiêu còn trong vòng
    const activeTargets = this.state.marbles.filter(m => m.type === 'target' && m.in_ring);
    if (activeTargets.length === 0) {
      this.finishGame();
      return true;
    }

    const target = activeTargets[0];
    const dx = target.x - shooter.x;
    const dy = target.y - shooter.y;
    let idealAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (idealAngle < 0) idealAngle += 360;

    // Sai số theo độ khó
    let angleNoise = 0;
    let powerNoise = 0;
    switch (this.state.difficulty) {
      case 'hard': // Đức
        angleNoise = (Math.random() - 0.5) * 6;
        powerNoise = (Math.random() - 0.5) * 10;
        break;
      case 'medium': // Quân
        angleNoise = (Math.random() - 0.5) * 16;
        powerNoise = (Math.random() - 0.5) * 20;
        break;
      case 'easy': // Hạ
        angleNoise = (Math.random() - 0.5) * 30;
        powerNoise = (Math.random() - 0.5) * 35;
        break;
      case 'very_easy': // Châu
        angleNoise = (Math.random() - 0.5) * 45;
        powerNoise = (Math.random() - 0.5) * 50;
        break;
    }

    const finalAngle = (idealAngle + angleNoise + 360) % 360;
    const finalPower = Math.max(20, Math.min(95, 65 + powerNoise));

    const rad = (finalAngle * Math.PI) / 180;
    const speed = finalPower * 0.35;
    shooter.vx = Math.cos(rad) * speed;
    shooter.vy = Math.sin(rad) * speed;

    this.runQuickPhysics(shooter);
    return true;
  }

  private runQuickPhysics(activeShooter: Marble): void {
    // Chạy mô phỏng va chạm 10 bước
    let knockedOut = 0;
    const isPlayer = activeShooter.type === 'player';

    for (let step = 0; step < 12; step++) {
      activeShooter.x += activeShooter.vx * 0.6;
      activeShooter.y += activeShooter.vy * 0.6;
      activeShooter.vx *= 0.85;
      activeShooter.vy *= 0.85;

      // Kiểm tra va chạm với các viên bi mục tiêu
      for (const m of this.state.marbles) {
        if (m.type === 'target' && m.in_ring) {
          const d = Math.hypot(m.x - activeShooter.x, m.y - activeShooter.y);
          if (d <= (m.radius + activeShooter.radius)) {
            // Va chạm đàn hồi! Truyền lực đẩy bi mục tiêu
            m.vx = activeShooter.vx * 1.2;
            m.vy = activeShooter.vy * 1.2;
            m.x += m.vx;
            m.y += m.vy;

            // Kiểm tra xem viên bi mục tiêu có văng khỏi vòng tròn không
            const distFromCenter = Math.hypot(m.x - this.state.ring_center.x, m.y - this.state.ring_center.y);
            if (distFromCenter > this.state.ring_radius) {
              m.in_ring = false;
              knockedOut++;
            }
          }
        }
      }
    }

    if (isPlayer) {
      this.state.player_score += knockedOut * 10;
      this.state.message = knockedOut > 0
        ? `Bắn trúng phóc! Bạn đã hất văng ${knockedOut} viên bi ra khỏi vòng (+${knockedOut * 10} điểm)!`
        : 'Viên bi trượt qua mép hoặc lực chưa đủ để hất bi mục tiêu ra khỏi vòng.';
      this.state.history.push(`Bạn hất được ${knockedOut} bi`);
    } else {
      const opName = this.getOpponentDisplayName(this.state.opponent_id);
      this.state.opponent_score += knockedOut * 10;
      this.state.message = knockedOut > 0
        ? `${opName} búng viên bi cực xoáy, hất văng ${knockedOut} viên bi ra ngoài!`
        : `${opName} ngắm bắn nhưng bi chỉ liếm nhẹ qua mép.`;
      this.state.history.push(`${opName} hất được ${knockedOut} bi`);
    }

    // Đặt lại vị trí shooter về mép sân cho lượt sau
    if (isPlayer) {
      activeShooter.x = 50;
      activeShooter.y = 92;
      activeShooter.vx = 0;
      activeShooter.vy = 0;
    } else {
      activeShooter.x = 50;
      activeShooter.y = 8;
      activeShooter.vx = 0;
      activeShooter.vy = 0;
    }
  }

  private simulatePhysicsStep(): boolean {
    return true;
  }

  private handleNextTurn(): boolean {
    // Đổi lượt
    if (this.state.turn === 'player') {
      this.state.turn = 'opponent';
      this.handleShoot(); // AI bắn luôn
      return true;
    } else {
      this.state.turn = 'player';
      this.state.current_turn_count++;

      const remainingTargets = this.state.marbles.filter(m => m.type === 'target' && m.in_ring).length;
      if (this.state.current_turn_count > this.state.max_turns || remainingTargets === 0) {
        return this.finishGame();
      }

      this.state.message = `Lượt ${this.state.current_turn_count}/${this.state.max_turns}: Đến lượt bạn bắn! Còn ${remainingTargets} viên bi trong vòng.`;
      return true;
    }
  }

  private finishGame(): boolean {
    this.state.is_finished = true;
    const p = this.state.player_score;
    const o = this.state.opponent_score;
    const opName = this.getOpponentDisplayName(this.state.opponent_id);

    if (p > o) {
      this.state.message = `Chiến thắng rực rỡ! Bạn thắng ${opName} với tỉ số ${p} - ${o}!`;
    } else if (p < o) {
      this.state.message = `${opName} đã giành phần thắng với tỉ số ${o} - ${p}.`;
    } else {
      this.state.message = `Trận đấu kết thúc với kết quả hòa ${p} đều!`;
    }
    return true;
  }

  getResult(): MinigameResultSummary {
    const duration_s = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const p = this.state.player_score;
    const o = this.state.opponent_score;

    let result: 'win' | 'lose' | 'draw' = 'draw';
    if (p > o) result = 'win';
    else if (p < o) result = 'lose';

    let stars: 1 | 2 | 3 = 1;
    if (result === 'win' && p >= 30) stars = 3;
    else if (result === 'win' || p >= 20) stars = 2;

    let dialogue: string;
    switch (this.state.opponent_id) {
      case 'duc':
        dialogue = result === 'win'
          ? 'Đức: Ê con bi ve mắt mèo của tao hôm nay bị mẻ cạnh nên lực bắn mới tản ra đó! Không phục, mai đấu lại!'
          : 'Đức: Thấy ngón tay cái kẹp ngón trỏ của tao búng chưa? Đạn thần công xóm này là đây!';
        break;
      case 'quan':
        dialogue = result === 'win'
          ? 'Quân: Cậu canh góc lệch chuẩn ghê, bi va một cái là văng tít ra ngoài bờ gạch.'
          : 'Quân: Tớ bắn nhẹ nhẹ thế mà bi lại lăn đúng vào thế hiểm, hên quá chừng.';
        break;
      case 'ha':
        dialogue = result === 'win'
          ? 'Hạ: Cậu bắn trúng viên bi ve ánh xanh của tớ rồi! Mai nhớ đem theo túi bi để trả đấy nhé!'
          : 'Hạ: Hihi, tớ thắng rồi! Viên bi bảy màu này tớ nhường cho cậu mượn ngắm một lát đó.';
        break;
      case 'chau':
        dialogue = result === 'win'
          ? 'Châu: Cậu bắn lực rất vừa phải, bi không bị vỡ mẻ mép đất. Rất khéo.'
          : 'Châu: Tớ chỉ tính đường bi dội góc bàn theo hình tam giác thôi, không ngờ trúng thật.';
        break;
    }

    return {
      game_id: this.id,
      result,
      score: p,
      stars,
      duration_s,
      opponent_id: this.state.opponent_id,
      difficulty: this.state.difficulty,
      npc_dialogue_line: dialogue
    };
  }
}
