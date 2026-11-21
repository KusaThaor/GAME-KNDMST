/**
 * Lưu tiến trình v3: JSON ở localStorage, ảnh ở IndexedDB (photoStoreIdb.ts).
 * - Mọi tham chiếu là ID ổn định (không dùng chỉ số mảng hay tên hiển thị).
 * - Gặp bản v1 (chưa phát hành) hoặc version lạ → xóa và tạo mới.
 * - Gặp bản v2 → chuyển đổi sang v3 (giữ tiến trình, không xóa, không đụng ảnh).
 * - Tên Player chỉ nằm ở đây (cục bộ), không bao giờ đi vào analytics.
 */
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

/** Thắng/thua/hòa theo khóa `{game_id}.{opponent_id}` (GDD 02 §4.2). Chỉ số, không có chữ tự do. */
export interface MinigameRecord { wins: number; losses: number; draws: number; last_played: string | null }
/** Kết quả LẦN ĐẦU của trò cốt truyện, dùng cho thoại. */
export interface MinigameStoryRecord { result: 'win' | 'lose' | 'draw' | 'complete' | 'quit'; stars: number | null }

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
/** Tin trong điện thoại lưu bằng ID (bước + lựa chọn, hoặc PDE) — không lưu chữ. */
export type PhoneMessage = { kind: 'sent'; step_id: string; option_id: string } | { kind: 'pde'; pde_id: string };

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
  relationships: Record<string, RelationshipState>;
  pde_done: string[];
  phone: Record<string, PhoneMessage[]>;
  public_demo_done: boolean;
  minigames: Record<string, MinigameRecord>;
  minigames_story: Record<string, MinigameStoryRecord>;
  /** Đã mở Khu Vui Chơi chưa. */
  hub: { unlocked: boolean };
  /** Kiểu điều khiển camera (chỉ lưu cục bộ, không vào analytics). Bản lưu cũ có 'A'/'B' giữ nguyên lựa chọn. */
  /** free_look: tùy chọn "Nhìn tự do" (khóa con trỏ, rê touchpad để nhìn); thiếu = tắt. */
  settings: { camera_mode: CameraModeId; free_look?: boolean };
}

export function newSave(attemptId: string): SaveState {
  return {
    v: SAVE_VERSION, attempt_id: attemptId, player_name: '', appearance: { gender: 'male', preset: 'default' }, profile_done: false,
    current: { memory_day_id: null, quest_id: null, step_id: null, replay: null },
    days: {}, quests: {}, flags: {}, artifacts: {}, album: {}, relationships: {}, pde_done: [], phone: {},
    public_demo_done: false, minigames: {}, minigames_story: {}, hub: { unlocked: false }, settings: { camera_mode: DEFAULT_CAMERA_MODE },
  };
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

export type LoadStatus = 'new' | 'loaded' | 'migrated' | 'reset_old_version' | 'reset_corrupt';

export class SaveStore {
  constructor(private kv: KeyValueStore, private uuid: () => string = () => crypto.randomUUID()) {}

  load(): { save: SaveState; status: LoadStatus } {
    let raw: string | null = null;
    try { raw = this.kv.getItem(SAVE_KEY); } catch { /* bộ nhớ bị chặn */ }
    if (!raw) return { save: newSave(this.uuid()), status: 'new' };
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { this.drop(); return { save: newSave(this.uuid()), status: 'reset_corrupt' }; }
    const p = parsed as Partial<SaveState> | null;
    if (!p || typeof p !== 'object') { this.drop(); return { save: newSave(this.uuid()), status: 'reset_corrupt' }; }
    // v1 (prototype chưa phát hành) và version lạ: xóa, không chuyển đổi. Từ v2 trở đi mỗi lần tăng `v` phải có bước chuyển đổi ở đây.
    const ver: unknown = p.v;
    if (ver !== SAVE_VERSION && ver !== 2) { this.drop(); return { save: newSave(this.uuid()), status: 'reset_old_version' }; }
    // điền các trường còn thiếu (file lưu cũ hơn bản code) để không văng lỗi
    const save = { ...newSave(typeof p.attempt_id === 'string' ? p.attempt_id : this.uuid()), ...p, v: SAVE_VERSION } as SaveState;
    save.current = { ...newSave('').current, ...(p.current ?? {}) };
    if (ver === 2) {
      // v2 → v3: chỉ thêm trường mới (đã có mặc định ở trên). Không drop(), không đụng ảnh.
      // Ghi v3 đè lên v2; nếu ghi lỗi thì bản v2 gốc còn nguyên trong máy và lần tải sau chuyển đổi lại.
      this.persist(save);
      return { save, status: 'migrated' };
    }
    return { save, status: 'loaded' };
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
