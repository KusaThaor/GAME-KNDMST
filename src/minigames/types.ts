/**
 * MINIGAMES SYSTEM TYPES — Hành Trình Thanh Xuân (KNĐMST)
 * Hệ thống kiểu dữ liệu chuẩn cho toàn bộ 11 minigame Mốc 1 & Căn cứ.
 * Thiết kế theo GDD 02 §1 (vòng đời), §2 (cốt truyện), §3 (Khu Vui Chơi Căn Cứ).
 */

export type MinigameId =
  // 4 trò ưu tiên hàng đầu:
  | 'o_an_quan'           // Ô ăn quan Căn cứ (4 mức độ khó đối thủ)
  | 'nhay_lo_co'          // Nhảy ô lò cò Căn cứ (4 mức độ khó đối thủ)
  | 'fold_boat'           // Gấp thuyền giấy báo (Trang 2)
  | 'phoenix_butterfly'   // Ép bướm hoa phượng (Trang 4)
  // 7 trò hoàn thiện theo mức độ ưu tiên:
  | 'ban_bi_ve'           // Bắn bi ve bãi đất (Căn cứ, 4 đối thủ)
  | 'ruler_battle'        // Búng thước kẻ học trò (Trang 1)
  | 'rock_paper_scissors' // Oẳn tù tì búng tai (Trang 1)
  | 'rescue_boat'         // Vớt thuyền que tre (Trang 2)
  | 'sweep_leaves'        // Quét lá dọn Căn cứ (Trang 3)
  | 'paint_signboard'     // Tô biển tên Căn cứ (Trang 3)
  | 'raindrop_rhythm';    // Nhịp mưa tí tách mái Căn cứ (Trang 4)

export type OpponentId = 'duc' | 'ha' | 'quan' | 'chau';

export type OpponentDifficulty = 'very_easy' | 'easy' | 'medium' | 'hard';

export type MinigameCategory = 'story' | 'base_free' | 'classroom' | 'nature';

export type MinigameResultStatus = 'win' | 'lose' | 'draw' | 'complete' | 'quit';

export interface MinigameResultSummary {
  game_id: MinigameId;
  result: MinigameResultStatus;
  score: number;
  stars: 1 | 2 | 3 | null;
  duration_s: number;
  opponent_id: OpponentId | null;
  difficulty: OpponentDifficulty | null;
  npc_dialogue_line: string;
}

export interface MinigameBaseConfig {
  game_id: MinigameId;
  opponent_id?: OpponentId | null;
  difficulty?: OpponentDifficulty | null;
  time_limit_s?: number;
}

/** Interface tổng quát cho mọi minigame engine */
export interface IMinigameEngine<TState, TAction> {
  readonly id: MinigameId;
  init(config?: MinigameBaseConfig): void;
  getState(): TState;
  dispatch(action: TAction): boolean;
  isFinished(): boolean;
  getResult(): MinigameResultSummary;
}

export interface MinigameMeta {
  id: MinigameId;
  name: string;
  category: MinigameCategory;
  priority: 1 | 2 | 3;
  page_scope: 'Trang 1' | 'Trang 2' | 'Trang 3' | 'Trang 4' | 'Căn cứ';
  description: string;
  controls_hint: string;
}
