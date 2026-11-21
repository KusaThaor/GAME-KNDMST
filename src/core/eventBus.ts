/** Event bus có kiểu: engine phát sự kiện, UI/analytics/lưu chỉ lắng nghe (không gọi ngược vào nhau). */
import type { PhotoMode, QuestType, StepKind, Tone } from '../content/types';
import type { QuestState } from './save';

export type MinigameContext = 'story' | 'hub' | 'side';
export type MinigameResult = 'win' | 'lose' | 'draw' | 'complete' | 'quit';

export interface PhotoCriteria { all_in_frame: boolean; player_in_zone: boolean; posed_in_time: boolean }

export interface GameEvents {
  flow_changed: { from: string; to: string };
  hub_entered: { first: boolean };
  game_resumed: { memory_day_id: string | null; step_id: string | null };
  profile_set: { gender: 'male' | 'female' };
  artifact_opened: { artifact_id: string; memory_day_id: string; is_replay: boolean };
  day_started: { day_id: string; is_replay: boolean; resumed: boolean };
  main_chain_completed: { day_id: string; is_replay: boolean };
  day_end_prompt: { day_id: string; open_side_quests: string[] };
  day_end_answered: { day_id: string; answer: 'leave' | 'stay'; open_side_quests: number };
  day_completed: { day_id: string; is_replay: boolean };
  quest_state: { quest_id: string; state: QuestState; is_replay: boolean };
  quest_started: { quest_id: string; quest_type: QuestType; memory_day_id: string | null; is_replay: boolean };
  quest_completed: { quest_id: string; quest_type: QuestType; memory_day_id: string | null; is_replay: boolean };
  part_started: { quest_id: string; part_id: string };
  step_activated: { quest_id: string; step_id: string; kind: StepKind; is_replay: boolean; resumed: boolean };
  step_progress: { quest_id: string; step_id: string; done: number; total: number };
  step_completed: { quest_id: string; step_id: string; kind: StepKind; quest_type: QuestType; memory_day_id: string | null; is_replay: boolean };
  choice_made: { step_id: string; choice_id: string; option_id: string; tone: Tone | null; measured: boolean; is_replay: boolean };
  message_sent: { quest_id: string; step_id: string; tone: Tone | null };
  /** Minigame (GDD 02 §1.1, §5.1). `game_id`: caro | sudoku | bottle | boat | ... (khung thật chưa có — hiện chỉ phát từ thẻ giả). */
  minigame_started: { game_id: string; context: MinigameContext; page_id: string | null; opponent_id: string | null; difficulty: string | null };
  minigame_finished: { game_id: string; context: MinigameContext; page_id: string | null; opponent_id: string | null; difficulty: string | null; result: MinigameResult; duration_s: number; stars: number | null; hints_used: number | null; score: number | null };
  /** Mở Bảng trò chơi ở Căn cứ (Khu Vui Chơi). Chưa có nơi phát — khung Khu Vui Chơi chưa làm. */
  hub_opened: { page_id: string | null };
  photo_attempt: { step_id: string | null; mode: PhotoMode | 'free'; retry_index: number } & PhotoCriteria;
  photo_kept: { step_id: string | null; mode: PhotoMode | 'free'; retry_index: number } & PhotoCriteria;
  free_photo_taken: { memory_day_id: string; zone_id: string | null };
  zone_entered: { memory_day_id: string; zone_id: string };
  album_page_restored: { page_id: string };
  album_viewed: { pages_restored: number };
  photo_back_viewed: { album_entry_id: string };
  pde_fired: { pde_id: string; type: string };
  public_demo_completed: Record<string, never>;
  feedback_shown: { placement: string };
  feedback_submitted: { feedback_id: string };
  feedback_skipped: { placement: string };
  save_requested: { reason: string };
}
export type GameEventName = keyof GameEvents;
type Handler<K extends GameEventName> = (payload: GameEvents[K]) => void;
type AnyHandler = <K extends GameEventName>(name: K, payload: GameEvents[K]) => void;

export class EventBus {
  private handlers = new Map<GameEventName, Set<Handler<never>>>();
  private any = new Set<AnyHandler>();

  on<K extends GameEventName>(name: K, fn: Handler<K>): () => void {
    let set = this.handlers.get(name);
    if (!set) this.handlers.set(name, (set = new Set()));
    set.add(fn as Handler<never>);
    return () => set.delete(fn as Handler<never>);
  }
  onAny(fn: AnyHandler): () => void { this.any.add(fn); return () => this.any.delete(fn); }

  emit<K extends GameEventName>(name: K, payload: GameEvents[K]): void {
    for (const fn of [...(this.handlers.get(name) ?? [])]) (fn as Handler<K>)(payload);
    for (const fn of [...this.any]) fn(name, payload);
  }
}
