/**
 * Lưu tiến trình v3: JSON ở localStorage, ảnh ở IndexedDB (photoStoreIdb.ts).
 * - Mọi tham chiếu là ID ổn định (không dùng chỉ số mảng hay tên hiển thị).
 * - Gặp bản v1 (chưa phát hành) → xóa và tạo mới.
 * - Tên Player chỉ nằm ở đây (cục bộ), không bao giờ đi vào analytics.
 */
import type { MinigameContext, MinigameResult } from './eventBus';
import type { ContentIndex } from '../content/indexContent';
import type { FlagValue, Gender, Tone } from '../content/types';
import { DEFAULT_CAMERA_MODE, type CameraModeId } from '../config/camera';

export const SAVE_VERSION = 3;
export const SAVE_KEY = 'htx.save';
export const PLAYER_NAME_MAX = 12;

export type DayState = 'locked' | 'available' | 'in_progress' | 'completed';
export type QuestState = 'locked' | 'available' | 'active' | 'completed' | 'missed';
export type ArtifactState = 'hidden' | 'dim' | 'glowing' | 'visited' | 'on_shelf';
export type EntryStatus = 'locked' | 'available' | 'owned';

export interface QuestRecord { state: QuestState; step_id: string | null; progress: string[] }
export interface AlbumRecord { status: EntryStatus; variants: string[]; selected: number }
export interface RelationshipState {
  character_id: string;
  flags: Record<string, FlagValue>;
  tone_counts: Record<Tone, number>;
  arc_progress: Record<string, number>;
  bond: null;                          // để trống ở MVP (D-08)
  contacted_2026: boolean;
}
/** Lượt chơi lại một Ngày: trạng thái quest và flag riêng, không ghi đè câu chuyện của lần đầu. */
export interface ReplayState { memory_day_id: string; quests: Record<string, QuestRecord>; flags: Record<string, FlagValue> }
/** Tin trong điện thoại lưu bằng ID (bước + lựa chọn, hoặc PDE), kèm chữ tự gõ cục bộ nếu có. */
export type PhoneMessage = { kind: 'sent'; step_id: string; option_id: string; custom_text?: string } | { kind: 'pde'; pde_id: string };

export interface MinigameStats {
  wins: number; losses: number; draws: number; last_played: string | null;
}
interface StoryResult { result: MinigameResult; stars: number | null }
type DuelResult = 'win' | 'lose' | 'draw';

export interface SaveState {
  v: typeof SAVE_VERSION;
  attempt_id: string;
  player_name: string;
  appearance: { gender: Gender; preset: string };
  profile_done: boolean;
  current: {
    memory_day_id: string | null; quest_id: string | null; step_id: string | null; replay: ReplayState | null;
    /** Câu chuyện lúc vào Ngày đang dở (để chơi lại Ngày từ đầu). */
    day_start?: { flags: Record<string, FlagValue>; relationships: Record<string, RelationshipState> };
    /** Khu đang đứng trong Ngày đang dở — tải lại trang thì đứng lại ở điểm xuất hiện của khu này (S2). */
    zone_id?: string | null;
  };
  days: Record<string, { state: DayState; replayed: boolean }>;
  quests: Record<string, QuestRecord>;
  flags: Record<string, FlagValue>;
  artifacts: Record<string, ArtifactState>;
  album: Record<string, AlbumRecord>;
  /** Sticker người chơi tự kéo thả trang trí lên từng trang Album (lưu cục bộ theo page_id). */
  album_stickers?: Record<string, { id: string; kind: string; x: number; y: number; rotate: number }[]>;
  relationships: Record<string, RelationshipState>;
  pde_done: string[];
  phone: Record<string, PhoneMessage[]>;
  public_demo_done: boolean;
  minigames: Record<string, MinigameStats>;
  minigames_story: Record<string, StoryResult>;
  caro: { series: { quan: number; duc: number }; story_result: { result: DuelResult; opponent: string } | null };
  sudoku: { best: Record<string, { time_s: number; stars: number }>; story_result: 'win' | 'lose' | null };
  story: { valentine: {
    recipient?: 'duc' | 'chau' | 'quan' | 'ha' | 'group';
    kind?: 'thanks' | 'tease' | 'invite' | 'group_text' | 'group_drawing';
    /** Mã câu viết sẵn, kiểu hòm thư và kết quả nhánh trong dữ liệu nội dung. */
    groupMsg?: string; boxStyle?: string; branch_result?: string;
  } };
  hub: { unlocked: boolean };
  /** Kiểu điều khiển camera (chỉ lưu cục bộ, không vào analytics). Bản lưu cũ có 'A'/'B' giữ nguyên lựa chọn. */
  /** free_look: tùy chọn "Nhìn tự do" (khóa con trỏ, rê touchpad để nhìn); thiếu = tắt. */
  settings: {
    camera_mode: CameraModeId; free_look?: boolean;
    volume: number; text_speed: 'slow' | 'normal' | 'fast'; difficulty: 'easy' | 'normal' | 'hard';
    caro_rule: 'freestyle' | 'blocked_ends'; sudoku_mistake_mode: 'off' | 'duplicates';
  };
}

export function newSave(attemptId: string): SaveState {
  return {
    v: SAVE_VERSION, attempt_id: attemptId, player_name: '', appearance: { gender: 'male', preset: 'default' }, profile_done: false,
    current: { memory_day_id: null, quest_id: null, step_id: null, replay: null },
    days: {}, quests: {}, flags: {}, artifacts: {}, album: {}, relationships: {}, pde_done: [], phone: {},
    public_demo_done: false,
    minigames: {}, minigames_story: {}, caro: { series: { quan: 3, duc: 3 }, story_result: null },
    sudoku: { best: {}, story_result: null }, story: { valentine: {} }, hub: { unlocked: false },
    settings: { camera_mode: DEFAULT_CAMERA_MODE, volume: 1, text_speed: 'normal', difficulty: 'normal',
      caro_rule: 'freestyle', sudoku_mistake_mode: 'off' },
  };
}

export function getMg(save: SaveState, id: string, opp?: string | null): MinigameStats {
  return save.minigames[`${id}.${opp ?? '-'}`] ?? { wins: 0, losses: 0, draws: 0, last_played: null };
}

/** Gọi trên bản lưu của phiên chơi; caller phát save_requested sau khi ghi kết quả. */
export function recordMg(save: SaveState, id: string,
  round: MinigameResult | { result: MinigameResult; stars?: number | null },
  opp?: string | null, context: MinigameContext = 'story'): void {
  const { result, stars } = typeof round === 'string' ? { result: round, stars: null } : round;
  const stats = getMg(save, id, opp);
  stats.last_played = new Date().toISOString();
  const outcome = result === 'quit' ? 'lose' : result;
  if (outcome === 'win') stats.wins++;
  if (outcome === 'lose') stats.losses++;
  if (outcome === 'draw') stats.draws++;
  save.minigames[`${id}.${opp ?? '-'}`] = stats;

  if (context !== 'story' || Object.hasOwn(save.minigames_story, id)) return;
  save.minigames_story[id] = { result, stars: stars ?? null };
  if ((id === 'sudoku' || id === 'mg_sudoku') && (outcome === 'win' || outcome === 'lose')) {
    save.sudoku.story_result ??= outcome;
  }
  if ((id === 'caro' || id === 'mg_caro') && !save.caro.story_result && outcome !== 'complete' && opp) {
    const side = opp.replace(/^chr_/, '');
    if (side !== 'duc' && side !== 'quan') return;
    save.caro.story_result = { result: outcome, opponent: opp };
    if (outcome === 'lose') save.caro.series[side]++;
    if (outcome === 'win') save.caro.series[side === 'duc' ? 'quan' : 'duc']++;
  }
}

/** Tên do người chơi nhập: giữ dấu và hoa/thường, tối đa 12 chữ, bỏ ký tự có thể phá mẫu thoại. */
export function sanitizePlayerName(raw: string): string {
  const clean = raw.normalize('NFC').replace(/[{}<>]/g, '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return Array.from(clean).slice(0, PLAYER_NAME_MAX).join('').trim();
}

// ---------- nơi chứa ----------
export interface KeyValueStore { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
export class MemoryKv implements KeyValueStore {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

export type PhotoData = Blob | Uint8Array;
export interface PhotoStore {
  put(key: string, data: PhotoData): Promise<void>;
  get(key: string): Promise<PhotoData | null>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
}
export class MemoryPhotoStore implements PhotoStore {
  private m = new Map<string, PhotoData>();
  async put(key: string, data: PhotoData) { this.m.set(key, data); }
  async get(key: string) { return this.m.get(key) ?? null; }
  async delete(key: string) { this.m.delete(key); }
  async keys() { return [...this.m.keys()]; }
  async clear() { this.m.clear(); }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type LoadStatus = 'new' | 'loaded' | 'migrated' | 'reset_old_version' | 'reset_corrupt';
type LoadedSave = { save: SaveState; status: LoadStatus };

/** Các bản v2 cũ có thể thiếu trường. Chỉ bù phần thiếu; giữ nguyên checkpoint, ID và khóa ảnh. */
function decodeSave(p: unknown, uuid: () => string): LoadedSave {
  const fresh = (status: LoadStatus): LoadedSave => ({ save: newSave(uuid()), status });
  if (!isRecord(p)) return fresh('reset_corrupt');
  if (p.v === 1) return fresh('reset_old_version');
  if (typeof p.v === 'number' && p.v > SAVE_VERSION) {
    // Dừng trước khi autosave có thể ghi đè dữ liệu của phiên bản mới hơn.
    throw new Error(`Bản lưu v${p.v} cần phiên bản game mới hơn`);
  }
  if (p.v !== 2 && p.v !== SAVE_VERSION) return fresh('reset_corrupt');
  const defaults = newSave(typeof p.attempt_id === 'string' ? p.attempt_id : uuid());
  for (const [key, value] of Object.entries(defaults)) {
    if (!Object.hasOwn(p, key)) continue;
    const field = p[key];
    if (Array.isArray(value)) {
      if (!Array.isArray(field)) return fresh('reset_corrupt');
    } else if (isRecord(value)) {
      if (!isRecord(field)) return fresh('reset_corrupt');
    } else if (typeof field !== typeof value) return fresh('reset_corrupt');
  }
  const saved = p as Partial<Omit<SaveState, 'v'>>;
  const save: SaveState = { ...defaults, ...saved, v: SAVE_VERSION,
    current: { ...defaults.current, ...saved.current },
    settings: { ...defaults.settings, ...saved.settings },
  };
  // reconcileSave đọc cả quest của lượt chơi lại ngay sau load().
  const validQuests = (records: unknown) => isRecord(records) && Object.values(records).every(
    q => isRecord(q) && typeof q.state === 'string' && Array.isArray(q.progress));
  const replay = save.current.replay;
  if (!validQuests(save.quests) || (replay !== null && (!isRecord(replay) ||
    !validQuests(replay.quests) || !isRecord(replay.flags)))) return fresh('reset_corrupt');
  if (!Object.values(save.album).every(a => isRecord(a) && Array.isArray(a.variants))) return fresh('reset_corrupt');
  return { save, status: p.v === 2 ? 'migrated' : 'loaded' };
}

export function migrate(p: unknown): SaveState {
  return decodeSave(p, () => crypto.randomUUID()).save;
}

export class SaveStore {
  constructor(private kv: KeyValueStore, private uuid: () => string = () => crypto.randomUUID()) {}

  load(): { save: SaveState; status: LoadStatus } {
    let raw: string | null = null;
    try { raw = this.kv.getItem(SAVE_KEY); } catch { /* bộ nhớ bị chặn */ }
    if (raw === null) return { save: newSave(this.uuid()), status: 'new' };
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { /* decodeSave xử lý dữ liệu hỏng */ }
    const loaded = decodeSave(parsed, this.uuid);
    if (loaded.status === 'migrated') this.persist(loaded.save);
    if (loaded.status === 'reset_old_version' || loaded.status === 'reset_corrupt') this.drop();
    return loaded;
  }

  /** Ghi xuống máy. Trả false nếu trình duyệt chặn/đầy bộ nhớ (game vẫn chơi tiếp trong phiên). */
  persist(save: SaveState): boolean {
    try { this.kv.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; }
  }

  private drop() { try { this.kv.removeItem(SAVE_KEY); } catch { /* */ } }

  /** "Xóa tiến trình": bỏ file lưu + toàn bộ ảnh, trả về file lưu mới (attempt mới). */
  async wipe(photos: PhotoStore): Promise<SaveState> {
    this.drop();
    await photos.clear().catch(() => undefined);
    return newSave(this.uuid());
  }
}

/**
 * Khớp file lưu với nội dung hiện tại (GDD_MASTER §8.4):
 * - checkpoint trỏ tới bước đã bị xóa → về đầu quest đó;
 * - Ngày đã `completed` không bao giờ bị mở lại;
 * - ID không còn trong nội dung (deprecated) được giữ nguyên, không xóa.
 */
export function reconcileSave(save: SaveState, idx: ContentIndex): SaveState {
  const fix = (records: Record<string, QuestRecord>) => {
    for (const [qid, rec] of Object.entries(records)) {
      if (rec.state !== 'active' || !idx.quests.has(qid)) continue;
      if (!rec.step_id || idx.steps.get(rec.step_id)?.quest.id !== qid) { rec.step_id = idx.firstStepId(qid); rec.progress = []; }
    }
  };
  fix(save.quests);
  if (save.current.replay) {
    if (!idx.days.has(save.current.replay.memory_day_id)) save.current.replay = null;
    else fix(save.current.replay.quests);
  }
  const cur = save.current;
  if (cur.memory_day_id && !idx.days.has(cur.memory_day_id)) { cur.memory_day_id = null; cur.quest_id = null; cur.step_id = null; cur.replay = null; }
  if (cur.quest_id) {
    const rec = (cur.replay?.quests ?? save.quests)[cur.quest_id];
    if (!idx.quests.has(cur.quest_id) || !rec) { cur.quest_id = null; cur.step_id = null; } else cur.step_id = rec.step_id;
  }
  return save;
}

/** Tự lưu: ranh giới bước (engine báo `save_requested`), đầu mỗi phần của Event Quest, khi về Hub. */
export function attachAutosave(bus: import('./eventBus').EventBus, store: SaveStore, getSave: () => SaveState): () => void {
  const write = () => { store.persist(getSave()); };
  const offs = [bus.on('save_requested', write), bus.on('hub_entered', write), bus.on('part_started', write)];
  return () => offs.forEach((off) => off());
}
