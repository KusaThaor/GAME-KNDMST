/** Ghép gói nội dung. Thêm một Ngày mới: tạo file trong days/, thêm vào DAYS bên dưới, khai trong release.ts + chapters.ts. */
import { CHARACTERS, MAPS, MILESTONES, SCHOOL_YEARS } from './base';
import { ACTIVE_CAST, CAST_TABLES } from './cast';
import { CHAPTERS } from './chapters';
import * as d0601 from './days/d_g06_01';
import * as d0701 from './days/d_g07_01';
import * as d0702 from './days/d_g07_02';
import * as d0703 from './days/d_g07_03';
import { HUB, HUB_QUESTS, PDES } from './hub';
import { RELEASES } from './release';
import type { Condition, ContentConfig, ContentPack, PresentDayEvent } from './types';

const DAYS = [d0601, d0701, d0702, d0703];
const uniqueById = <T extends { id: string }>(list: T[]) => [...new Map(list.map((x) => [x.id, x])).values()];

const questsOf = (c: Condition): string[] =>
  'all' in c ? c.all.flatMap(questsOf) : 'any' in c ? c.any.flatMap(questsOf) : 'quest' in c ? [c.quest] : [];

/**
 * Lọc gói nội dung theo bản phát hành (N-22a, G-3). Bản `test` giữ nguyên (trả lại chính gói đưa vào).
 * Bản `production` tắt Side/Daily: Side/Daily là nội dung do AI nghĩ (AI_PROPOSED + [PLACEHOLDER]), chưa được duyệt.
 * Không chỉ bỏ danh sách của Ngày: còn gỡ mọi thứ chỉ tồn tại nhờ các quest đó — nếu để lại, chữ [PLACEHOLDER] vẫn
 * hiện ở Album (ô tùy chọn), mảnh ký ức và PDE "hiện mảnh" khi xong Side. Chuỗi Main, kỷ vật, ô bắt buộc và PDE khác giữ nguyên.
 * Không sửa gói đưa vào. Tham chiếu còn sót tới thứ đã gỡ sẽ bị validator báo `missing_ref` (tests/unit/releaseProduction.test.ts).
 */
export function filterPackForRelease(pack: ContentPack, environment: 'test' | 'production'): ContentPack {
  if (environment !== 'production') return pack;
  const off = new Set(pack.quests.filter((q) => q.type === 'side' || q.type === 'daily').map((q) => q.id));
  const fragmentsOff = new Set(pack.fragments.filter((f) => f.source_quest_id && off.has(f.source_quest_id)).map((f) => f.id));
  const entriesOff = new Set(pack.album_entries
    .filter((e) => (e.unlock_quest_id && off.has(e.unlock_quest_id)) || fragmentsOff.has(e.fragment_id)).map((e) => e.id));
  const pdeOff = (p: PresentDayEvent) => questsOf(p.trigger).some((id) => off.has(id))
    || p.effects.some((fx) => (fx.kind === 'add_fragment' && entriesOff.has(fx.album_entry_id)) || (fx.kind === 'unlock_quest' && off.has(fx.quest_id)));
  return {
    ...pack,
    days: pack.days.map((d) => ({ ...d, side_quests: [], daily_pool: [] })),
    quests: pack.quests.filter((q) => !off.has(q.id)),
    fragments: pack.fragments.filter((f) => !fragmentsOff.has(f.id)),
    album_entries: pack.album_entries.filter((e) => !entriesOff.has(e.id)),
    artifacts: pack.artifacts.map((a) => ({
      ...a,
      reward_fragment_ids: a.reward_fragment_ids.filter((id) => !fragmentsOff.has(id)),
      album_entry_ids: a.album_entry_ids.filter((id) => !entriesOff.has(id)),
    })),
    pdes: pack.pdes.filter((p) => !pdeOff(p)),
  };
}

const FULL_PACK: ContentPack = {
  characters: CHARACTERS, milestones: MILESTONES, school_years: SCHOOL_YEARS, maps: MAPS, chapters: CHAPTERS,
  days: DAYS.map((d) => d.day),
  // Daily dùng chung nhiều Ngày nên có thể được khai ở nhiều file — gộp theo ID.
  quests: uniqueById([...DAYS.flatMap((d) => d.quests), ...HUB_QUESTS]),
  artifacts: DAYS.map((d) => d.artifact),
  fragments: DAYS.flatMap((d) => d.fragments),
  album_entries: DAYS.flatMap((d) => d.entries),
  pdes: PDES, endings: [], hub: HUB,
};

/**
 * Gói mà game nạp. `__APP_ENV__` do Vite/Vitest định nghĩa (vitest đặt 'test' nên test cũ không đổi); công cụ dòng lệnh dựng Vite
 * không có `define` (scripts/world.mjs → `npm run validate:world`) nên coi là 'test' thay vì lỗi ReferenceError.
 */
export const CONTENT: ContentPack = filterPackForRelease(FULL_PACK, typeof __APP_ENV__ === 'undefined' ? 'test' : __APP_ENV__);

/** Cấu hình nội dung theo môi trường. `castName` chỉ dùng cho công cụ test (?cast=B). */
export function contentConfig(environment: 'test' | 'production', castName: string = ACTIVE_CAST): ContentConfig {
  return { cast: CAST_TABLES[castName] ?? CAST_TABLES[ACTIVE_CAST], release: RELEASES[environment], environment };
}
