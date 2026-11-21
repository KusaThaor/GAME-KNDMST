import { describe, it, expect } from 'vitest';
import {
  createMinigame,
  MINIGAMES_CATALOG,
  OAnQuanEngine,
  HopscotchEngine,
  FoldBoatEngine,
  PhoenixButterflyEngine,
  MarblesEngine,
  RulerBattleEngine,
  RPSBattleEngine,
  RescueBoatEngine,
  SweepLeavesEngine,
  PaintSignboardEngine,
  RaindropRhythmEngine
} from '../../src/minigames';

describe('Minigames System — 11 Trò Mốc 1 & Căn Cứ', () => {
  it('đăng ký đủ 11 minigame trong danh mục MINIGAMES_CATALOG', () => {
    expect(MINIGAMES_CATALOG).toHaveLength(11);
    const ids = MINIGAMES_CATALOG.map(m => m.id);
    expect(ids).toContain('o_an_quan');
    expect(ids).toContain('nhay_lo_co');
    expect(ids).toContain('fold_boat');
    expect(ids).toContain('phoenix_butterfly');
    expect(ids).toContain('ban_bi_ve');
    expect(ids).toContain('ruler_battle');
    expect(ids).toContain('rock_paper_scissors');
    expect(ids).toContain('rescue_boat');
    expect(ids).toContain('sweep_leaves');
    expect(ids).toContain('paint_signboard');
    expect(ids).toContain('raindrop_rhythm');
  });

  describe('1. Ô Ăn Quan (o_an_quan) — Trò ưu tiên 1', () => {
    it('khởi tạo bàn cờ 12 ô chuẩn dân gian (2 quan 10 dân)', () => {
      const engine = new OAnQuanEngine({ game_id: 'o_an_quan', opponent_id: 'chau' });
      const state = engine.getState();
      expect(state.board).toHaveLength(12);
      // 2 ô quan (5 và 11) có 10 viên
      expect(state.board[5]).toBe(10);
      expect(state.board[11]).toBe(10);
      // 10 ô dân mỗi ô 5 viên
      for (const idx of [0, 1, 2, 3, 4, 6, 7, 8, 9, 10]) {
        expect(state.board[idx]).toBe(5);
      }
      expect(state.turn).toBe('player');
      expect(state.opponentId).toBe('chau');
      expect(state.difficulty).toBe('hard');
    });

    it('người chơi bốc rải sỏi hợp lệ và chuyển lượt', () => {
      const engine = new OAnQuanEngine({ game_id: 'o_an_quan', opponent_id: 'duc' });
      // Người chơi chọn ô số 1, rải theo chiều kim đồng hồ
      const ok = engine.dispatch({ cell: 1, direction: 'cw' });
      expect(ok).toBe(true);

      const state = engine.getState();
      expect(state.movesCount).toBeGreaterThanOrEqual(1);
      expect(state.history.length).toBeGreaterThan(1);
    });

    it('AI Đức và Châu có hành vi tương ứng độ khó', () => {
      const engineDuc = new OAnQuanEngine({ game_id: 'o_an_quan', opponent_id: 'duc' });
      expect(engineDuc.getState().difficulty).toBe('very_easy');

      const engineChau = new OAnQuanEngine({ game_id: 'o_an_quan', opponent_id: 'chau' });
      expect(engineChau.getState().difficulty).toBe('hard');
    });

    it('tạo kết quả và lời thoại phù hợp khi kết thúc', () => {
      const engine = new OAnQuanEngine({ game_id: 'o_an_quan', opponent_id: 'ha' });
      engine.dispatch({ type: 'QUIT' });
      expect(engine.isFinished()).toBe(true);
      const res = engine.getResult();
      expect(res.game_id).toBe('o_an_quan');
      expect(res.npc_dialogue_line).toContain('Hạ');
    });
  });

  describe('2. Nhảy Ô Lò Cò (nhay_lo_co) — Trò ưu tiên 2', () => {
    it('khởi tạo với 10 ô và thiết lập đúng 4 cấp độ đối thủ', () => {
      const engineHa = new HopscotchEngine({ game_id: 'nhay_lo_co', opponent_id: 'ha' });
      expect(engineHa.getState().difficulty).toBe('hard');

      const engineQuan = new HopscotchEngine({ game_id: 'nhay_lo_co', opponent_id: 'quan' });
      expect(engineQuan.getState().difficulty).toBe('very_easy');
    });

    it('ném sành chuẩn xác vào ô 1 và nhảy hợp lệ', () => {
      const engine = new HopscotchEngine({ game_id: 'nhay_lo_co', opponent_id: 'duc' });
      // Căn lực gần 10 cho ô 1
      engine.dispatch({ type: 'SET_THROW_POWER', power: 10, direction: 0 });
      const okThrow = engine.dispatch({ type: 'THROW_STONE' });
      expect(okThrow).toBe(true);
      expect(engine.getState().stone_at_cell).toBe(1);
      expect(engine.getState().phase).toBe('jumping_out');

      // Nhảy vào ô có sành bị phạm quy
      engine.dispatch({ type: 'JUMP', target_cell: 1, leg_type: 'single' });
      expect(engine.getState().player.fouls).toBe(1);
    });

    it('kết quả và lời thoại đúng tính cách nhân vật', () => {
      const engine = new HopscotchEngine({ game_id: 'nhay_lo_co', opponent_id: 'ha' });
      engine.dispatch({ type: 'QUIT' });
      const res = engine.getResult();
      expect(res.game_id).toBe('nhay_lo_co');
      expect(res.npc_dialogue_line).toContain('Hạ:');
    });
  });

  describe('3. Gấp Thuyền Giấy Báo (fold_boat) — Trò ưu tiên 3', () => {
    it('khởi tạo 4 nếp gấp tuần tự', () => {
      const engine = new FoldBoatEngine({ game_id: 'fold_boat' });
      const state = engine.getState();
      expect(state.steps).toHaveLength(4);
      expect(state.current_step).toBe(1);
      expect(state.is_finished).toBe(false);
    });

    it('thực hiện vuốt từng bước và hoàn thành chiếc thuyền', () => {
      const engine = new FoldBoatEngine({ game_id: 'fold_boat' });
      // Bước 1: vuốt dọc từ trên xuống dưới
      engine.dispatch({ type: 'START_SWIPE', x: 50, y: 10 });
      engine.dispatch({ type: 'FINISH_SWIPE', x: 50, y: 90 });
      expect(engine.getState().steps[0].is_completed).toBe(true);
      expect(engine.getState().current_step).toBe(2);

      // Bước 2: vuốt chéo góc tam giác
      engine.dispatch({ type: 'START_SWIPE', x: 20, y: 20 });
      engine.dispatch({ type: 'FINISH_SWIPE', x: 50, y: 40 });
      expect(engine.getState().steps[1].is_completed).toBe(true);

      // Bước 3: vành đáy ca-nô
      engine.dispatch({ type: 'START_SWIPE', x: 10, y: 80 });
      engine.dispatch({ type: 'FINISH_SWIPE', x: 90, y: 80 });

      // Bước 4: bung lòng thuyền
      engine.dispatch({ type: 'START_SWIPE', x: 30, y: 50 });
      engine.dispatch({ type: 'FINISH_SWIPE', x: 70, y: 50 });

      expect(engine.isFinished()).toBe(true);
      const res = engine.getResult();
      expect(res.score).toBeGreaterThan(0);
      expect(res.stars).toBeDefined();
    });
  });

  describe('4. Ép Bướm Hoa Phượng (phoenix_butterfly) — Trò ưu tiên 4', () => {
    it('khởi tạo 6 bộ phận cánh và nhị hoa', () => {
      const engine = new PhoenixButterflyEngine({ game_id: 'phoenix_butterfly' });
      const parts = engine.getState().parts;
      expect(Object.keys(parts)).toHaveLength(6);
      expect(parts.wing_upper_left).toBeDefined();
      expect(parts.wing_upper_right).toBeDefined();
      expect(parts.antenna_left).toBeDefined();
      expect(parts.antenna_right).toBeDefined();
    });

    it('di chuyển và snap cánh hoa vào vị trí chuẩn', () => {
      const engine = new PhoenixButterflyEngine({ game_id: 'phoenix_butterfly' });
      engine.dispatch({ type: 'SELECT_PART', part_id: 'wing_upper_left' });
      // Di chuyển gần vị trí đích (target_x: 35, target_y: 35)
      engine.dispatch({ type: 'MOVE_PART', x: 35, y: 35 });
      engine.dispatch({ type: 'ROTATE_PART', delta_deg: 315 });
      const ok = engine.dispatch({ type: 'SNAP_PART' });
      expect(ok).toBe(true);
      expect(engine.getState().parts.wing_upper_left.is_snapped).toBe(true);
    });

    it('kẹp sổ ép phẳng con bướm và nhận danh hiệu', () => {
      const engine = new PhoenixButterflyEngine({ game_id: 'phoenix_butterfly' });
      // Snap 4 cánh hoa
      for (const pid of ['wing_upper_left', 'wing_upper_right', 'wing_lower_left', 'wing_lower_right'] as const) {
        engine.dispatch({ type: 'SELECT_PART', part_id: pid });
        const p = engine.getState().parts[pid];
        engine.dispatch({ type: 'MOVE_PART', x: p.target_x, y: p.target_y });
        engine.dispatch({ type: 'ROTATE_PART', delta_deg: p.target_rotation_deg });
        engine.dispatch({ type: 'SNAP_PART' });
      }

      engine.dispatch({ type: 'PRESS_BOOK' });
      expect(engine.isFinished()).toBe(true);
      const res = engine.getResult();
      expect(res.npc_dialogue_line).toContain('Hạ:');
    });
  });

  describe('5. Bắn Bi Ve (ban_bi_ve) — 4 đối thủ Căn cứ', () => {
    it('khởi tạo vòng tròn và 4 cấp độ đối thủ chuẩn', () => {
      const engineDuc = new MarblesEngine({ game_id: 'ban_bi_ve', opponent_id: 'duc' });
      expect(engineDuc.getState().difficulty).toBe('hard');

      const engineChau = new MarblesEngine({ game_id: 'ban_bi_ve', opponent_id: 'chau' });
      expect(engineChau.getState().difficulty).toBe('very_easy');
    });

    it('ngắm và búng viên bi', () => {
      const engine = new MarblesEngine({ game_id: 'ban_bi_ve', opponent_id: 'duc' });
      engine.dispatch({ type: 'AIM', angle_deg: 270, power: 80 });
      const ok = engine.dispatch({ type: 'SHOOT' });
      expect(ok).toBe(true);
    });
  });

  describe('6. Búng Thước Kẻ (ruler_battle)', () => {
    it('khởi tạo và búng thước', () => {
      const engine = new RulerBattleEngine({ game_id: 'ruler_battle', opponent_id: 'duc' });
      expect(engine.getState().player_ruler.is_fallen).toBe(false);
      engine.dispatch({ type: 'AIM_FLICK', angle_deg: 270, power: 30 });
      const ok = engine.dispatch({ type: 'FLICK' });
      expect(ok).toBe(true);
    });
  });

  describe('7. Oẳn Tù Tì (rock_paper_scissors)', () => {
    it('chơi các lượt búa kéo bao', () => {
      const engine = new RPSBattleEngine({ game_id: 'rock_paper_scissors', opponent_id: 'duc' });
      engine.dispatch({ type: 'PLAY', choice: 'rock' });
      expect(engine.getState().current_round).toBe(2);
      expect(engine.getState().history.length).toBe(1);
    });
  });

  describe('8. Vớt Thuyền Que Tre (rescue_boat)', () => {
    it('di chuyển que tre và vớt thuyền đúng tầm', () => {
      const engine = new RescueBoatEngine({ game_id: 'rescue_boat' });
      engine.dispatch({ type: 'MOVE_STICK', x: 10 });
      engine.dispatch({ type: 'TICK_WATER', delta_ms: 400 });
      engine.dispatch({ type: 'HOOK_BOAT' });
      expect(engine.getState().boats.length).toBe(3);
    });
  });

  describe('9. Quét Lá Dọn Căn Cứ (sweep_leaves)', () => {
    it('quét gom các cụm lá khô', () => {
      const engine = new SweepLeavesEngine({ game_id: 'sweep_leaves' });
      engine.dispatch({
        type: 'SWEEP_STROKE',
        from_x: 25,
        from_y: 30,
        to_x: 85,
        to_y: 85
      });
      expect(engine.getState().sweep_strokes_count).toBe(1);
    });
  });

  describe('10. Tô Biển Tên Căn Cứ (paint_signboard)', () => {
    it('tô màu cho 5 chữ cái C Ă N C Ứ', () => {
      const engine = new PaintSignboardEngine({ game_id: 'paint_signboard' });
      expect(engine.getState().letters).toHaveLength(5);
      engine.dispatch({ type: 'PAINT_STROKE', letter_idx: 0, pressure: 0.8 });
      expect(engine.getState().letters[0].fill_percentage).toBeGreaterThan(0);
    });
  });

  describe('11. Nhịp Mưa Tí Tách (raindrop_rhythm)', () => {
    it('gõ nhịp rơi giọt mưa', () => {
      const engine = new RaindropRhythmEngine({ game_id: 'raindrop_rhythm' });
      engine.dispatch({ type: 'TICK_TIME', delta_ms: 1000 });
      engine.dispatch({ type: 'TAP_LANE', lane: 0, current_time_ms: 1000 });
      expect(engine.getState().score).toBeGreaterThan(0);
    });
  });

  describe('Factory createMinigame', () => {
    it('khởi tạo thành công cả 11 trò qua factory', () => {
      for (const meta of MINIGAMES_CATALOG) {
        const game = createMinigame(meta.id);
        expect(game).toBeDefined();
        expect(game.id).toBe(meta.id);
        expect(game.getState()).toBeDefined();
        expect(game.isFinished()).toBe(false);
      }
    });
  });
});
