/**
 * Album (F6): Album → Phần (Mốc) → Trang (Ngày) → Ô. Thuần logic trên SaveState; ảnh nằm ở PhotoStore (IndexedDB).
 * Trạng thái trang: locked / faded / restored / enriched / complete (MEMORY_ALBUM_SYSTEM_v1 §5.3).
 */
import { SLOT_WEIGHT_GROUP, type AlbumConfig } from '../config/album';
import type { ContentIndex } from '../content/indexContent';
import type { AlbumEntry, MemoryDay, MilestoneId } from '../content/types';
import type { EventBus } from '../core/eventBus';
import type { AlbumRecord, PhotoData, PhotoStore, SaveState } from '../core/save';

export type PageState = 'locked' | 'faded' | 'restored' | 'enriched' | 'complete';
export interface PageView {
  page_id: string;
  day: MemoryDay;
  milestone_id: MilestoneId | undefined;
  state: PageState;
  entries: { entry: AlbumEntry; owned: boolean; record: AlbumRecord | undefined }[];
}

/** Khóa ảnh tự chụp (máy ảnh ảo đặt sẵn) của một ô — cũng là ảnh dự phòng khi ảnh của người chơi bị mất. */
export const autoPhotoKey = (entryId: string) => `auto:${entryId}`;
const PHOTO_SLOTS = new Set(['main_photo', 'free_photo']);

export class AlbumModel {
  private readonly idx: ContentIndex;
  private readonly save: SaveState;
  private readonly bus: EventBus;
  private readonly config: AlbumConfig;

  constructor(deps: { idx: ContentIndex; save: SaveState; bus: EventBus; config: AlbumConfig }) {
    this.idx = deps.idx; this.save = deps.save; this.bus = deps.bus; this.config = deps.config;
    // Ô tùy chọn: xong quest nào thì nhận ô gắn với quest đó (lần đầu hay chơi lại đều bổ sung Album).
    // Daily dùng chung nhiều Ngày → chỉ nhận ô nằm trên trang của Ngày vừa chơi.
    this.bus.on('quest_completed', ({ quest_id, memory_day_id }) => {
      for (const e of this.idx.pack.album_entries) {
        if (e.unlock_quest_id !== quest_id) continue;
        const pageDay = this.idx.dayOfPage(e.page_id)?.id;
        if (!memory_day_id || pageDay === memory_day_id) this.grant(e.id);
      }
      for (const id of this.idx.quests.get(quest_id)?.rewards?.album_entry_ids ?? []) this.grant(id);
    });
  }

  private rec(entryId: string): AlbumRecord { return (this.save.album[entryId] ??= { status: 'locked', variants: [], selected: 0 }); }
  owned(entryId: string): boolean { return this.save.album[entryId]?.status === 'owned'; }

  grant(entryId: string): boolean {
    if (!this.idx.entries.has(entryId) || this.owned(entryId)) return false;
    this.rec(entryId).status = 'owned';
    return true;
  }

  pageState(pageId: string): PageState {
    const day = this.idx.dayOfPage(pageId);
    if (!day) return 'locked';
    const entries = this.idx.entriesOfPage(pageId);
    const dayDone = this.save.days[day.id]?.state === 'completed';
    const requiredOk = entries.filter((e) => e.required_for_restore).every((e) => this.owned(e.id));
    if (dayDone && requiredOk) {
      const optional = entries.filter((e) => !e.required_for_restore);
      const got = optional.filter((e) => this.owned(e.id)).length;
      if (got === optional.length) return 'complete';
      return got > 0 ? 'enriched' : 'restored';
    }
    const art = this.save.artifacts[this.idx.artifactOfDay(day.id)?.id ?? ''];
    return dayDone || (art && art !== 'hidden' && art !== 'dim') ? 'faded' : 'locked';
  }

  /** Phục hồi trang sau khi xong Ngày (PDE RESTORE): nhận mọi ô bắt buộc. Trả về các ô vừa nhận. */
  restorePage(pageId: string): string[] {
    const day = this.idx.dayOfPage(pageId);
    if (!day || this.save.days[day.id]?.state !== 'completed') return [];
    const granted = this.idx.entriesOfPage(pageId).filter((e) => e.required_for_restore && this.grant(e.id)).map((e) => e.id);
    if (granted.length) this.bus.emit('album_page_restored', { page_id: pageId });
    return granted;
  }

  /** Giữ một ảnh mới cho ô ảnh. Tối đa `max_variants`; đầy thì bỏ ảnh cũ nhất không đang được chọn. */
  addVariant(entryId: string, photoKey: string): { removed: string | null } {
    const r = this.rec(entryId);
    let removed: string | null = null;
    if (r.variants.length >= this.config.max_variants) {
      const drop = r.selected === 0 ? 1 : 0;
      const keep = r.variants[r.selected];
      removed = r.variants.splice(drop, 1)[0] ?? null;
      r.selected = Math.max(0, r.variants.indexOf(keep));
    }
    r.variants.push(photoKey);
    r.selected = r.variants.length - 1;
    r.status = 'owned';
    return { removed };
  }

  /**
   * Giữ cả loạt ảnh của một lần chụp nhiều tấm (N-14, ảnh tự sướng Trang 1): loạt mới thay các phiên bản cũ của ô,
   * `pick` = tấm người chơi chọn (chỉ số trong loạt) → `selected`. Loạt dài hơn `max_variants` thì luôn giữ tấm được chọn
   * và bỏ bớt tấm khác ở cuối loạt. Trả về các khóa ảnh không còn dùng để xóa khỏi máy.
   */
  keepShots(entryId: string, keys: string[], pick: number): { removed: string[] } {
    if (!keys.length) return { removed: [] };
    if (!this.idx.entries.has(entryId)) return { removed: [...keys] };
    const chosen = keys[Math.min(Math.max(0, Math.floor(pick) || 0), keys.length - 1)];
    const others = keys.filter((k) => k !== chosen).slice(0, Math.max(1, this.config.max_variants) - 1);
    const kept = keys.filter((k) => k === chosen || others.includes(k));
    const r = this.rec(entryId);
    const removed = [...r.variants, ...keys].filter((k) => !kept.includes(k));
    r.variants = kept;
    r.selected = kept.indexOf(chosen);
    r.status = 'owned';
    return { removed: [...new Set(removed)] };
  }

  /**
   * Ô ảnh trên bìa Album (Trang 4: ảnh cầu vồng). Lấy ô đầu tiên trong cấu hình CÓ trong nội dung và là ô ảnh;
   * ô dự phòng chỉ dùng khi ô chính chưa có trong nội dung. null = bìa trống (chưa nhận ô đó).
   */
  coverEntryId(): string | null {
    const id = [this.config.cover_entry_id, this.config.cover_fallback_entry_id].find((x) => !!x && this.idx.entries.has(x));
    if (!id || !PHOTO_SLOTS.has(this.idx.entries.get(id)!.slot_type)) return null;
    return this.owned(id) ? id : null;
  }

  selectVariant(entryId: string, index: number): boolean {
    const r = this.save.album[entryId];
    if (!r || index < 0 || index >= r.variants.length) return false;
    r.selected = index;
    return true;
  }

  /** Thứ tự tìm ảnh hiển thị: ảnh đang chọn → các ảnh khác → ảnh tự chụp. */
  photoCandidates(entryId: string): string[] {
    const e = this.idx.entries.get(entryId);
    if (!e || !PHOTO_SLOTS.has(e.slot_type)) return [];
    const r = this.save.album[entryId];
    const variants = r ? [r.variants[r.selected], ...r.variants.filter((_, i) => i !== r.selected)].filter(Boolean) : [];
    return [...variants, autoPhotoKey(entryId)];
  }

  /** Lấy ảnh hiển thị. null = không còn ảnh nào trong máy → cảnh 3D chụp lại ảnh tự chụp rồi gọi lại. */
  async resolvePhoto(entryId: string, store: PhotoStore): Promise<{ key: string; data: PhotoData } | null> {
    for (const key of this.photoCandidates(entryId)) {
      const data = await store.get(key).catch(() => null);
      if (data) return { key, data };
    }
    return null;
  }

  pages(): PageView[] {
    return this.idx.releaseDays.map((day) => ({
      page_id: day.album_page_id, day, milestone_id: this.idx.milestoneOfDay(day.id), state: this.pageState(day.album_page_id),
      entries: this.idx.entriesOfPage(day.album_page_id).map((entry) => ({ entry, owned: this.owned(entry.id), record: this.save.album[entry.id] })),
    }));
  }

  /** Tiến độ: số trang đã phục hồi (hiển thị theo cấu hình D-20) + phần trăm tính ngầm theo trọng số ảnh/sticker/ghi chú. */
  progress(): { pages_restored: number; pages_total: number; percent: number; display: AlbumConfig['progress_display'] } {
    const pages = this.pages();
    const tally = { photo: [0, 0], sticker: [0, 0], note: [0, 0] };
    for (const p of pages) for (const { entry, owned } of p.entries) { const g = tally[SLOT_WEIGHT_GROUP[entry.slot_type]]; g[1]++; if (owned) g[0]++; }
    let sum = 0, weight = 0;
    for (const k of ['photo', 'sticker', 'note'] as const) {
      if (!tally[k][1]) continue;
      weight += this.config.percent_weights[k];
      sum += this.config.percent_weights[k] * (tally[k][0] / tally[k][1]);
    }
    return {
      pages_restored: pages.filter((p) => p.state !== 'locked' && p.state !== 'faded').length,
      pages_total: pages.length,
      percent: weight ? Math.round((sum / weight) * 100) : 0,
      display: this.config.progress_display,
    };
  }

  markViewed(): void { this.bus.emit('album_viewed', { pages_restored: this.progress().pages_restored }); }
  markBackViewed(entryId: string): void { this.bus.emit('photo_back_viewed', { album_entry_id: entryId }); }
}
