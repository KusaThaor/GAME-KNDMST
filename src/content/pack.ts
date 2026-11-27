/** Ghép gói nội dung. Thêm một Ngày mới: tạo file trong days/, thêm vào mảng bên dưới, khai trong release.ts + chapters.ts. */
import { CHARACTERS, MAPS, MILESTONES, SCHOOL_YEARS } from './base';
import { ACTIVE_CAST, CAST_TABLES } from './cast';
import { CHAPTERS } from './chapters';
import {
  artifact as art0601, day as day0601, entries as ent0601, fragments as frag0601, quests as q0601,
  sideEntries as sideEnt0601, sideFragments as sideFrag0601, sideQuests as sideQ0601,
} from './days/d_g06_01';
import {
  artifact as art0701, day as day0701, entries as ent0701, fragments as frag0701, quests as q0701,
  sideEntries as sideEnt0701, sideFragments as sideFrag0701, sideQuests as sideQ0701,
} from './days/d_g07_01';
import {
  artifact as art0702, day as day0702, entries as ent0702, fragments as frag0702, quests as q0702,
  sideEntries as sideEnt0702, sideFragments as sideFrag0702, sideQuests as sideQ0702,
} from './days/d_g07_02';
import {
  artifact as art0703, day as day0703, entries as ent0703, fragments as frag0703, quests as q0703,
  sideEntries as sideEnt0703, sideFragments as sideFrag0703, sideQuests as sideQ0703,
} from './days/d_g07_03';
import { HUB, HUB_QUESTS, PDES } from './hub';
import { RELEASES } from './release';
import type { Condition, ContentConfig, ContentPack, PresentDayEvent } from './types';

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
  const quests = pack.quests.filter((q) => !off.has(q.id));
  const questIds = new Set(quests.map((q) => q.id));
  const fragments = pack.fragments.filter((f) => !(f.source_quest_id && !questIds.has(f.source_quest_id)));
  const fragIds = new Set(fragments.map((f) => f.id));
  const album_entries = pack.album_entries.filter((e) => !(e.unlock_quest_id && !questIds.has(e.unlock_quest_id)) && fragIds.has(e.fragment_id));
  const entryIds = new Set(album_entries.map((e) => e.id));
  const pdeOff = (p: PresentDayEvent) => questsOf(p.trigger).some((id) => !questIds.has(id))
    || p.effects.some((fx) => (fx.kind === 'add_fragment' && !entryIds.has(fx.album_entry_id)) || (fx.kind === 'unlock_quest' && !questIds.has(fx.quest_id)));
  return {
    ...pack,
    days: pack.days.map((d) => ({ ...d, side_quests: [], daily_pool: [] })),
    quests,
    fragments,
    album_entries,
    artifacts: pack.artifacts.map((a) => ({
      ...a,
      reward_fragment_ids: a.reward_fragment_ids.filter((id) => fragIds.has(id)),
      album_entry_ids: a.album_entry_ids.filter((id) => entryIds.has(id)),
    })),
    pdes: pack.pdes.filter((p) => !pdeOff(p)),
  };
}

const commonPack = () => ({
  characters: CHARACTERS,
  milestones: MILESTONES,
  school_years: SCHOOL_YEARS,
  maps: MAPS,
  chapters: CHAPTERS,
  days: [day0601, day0701, day0702, day0703],
  artifacts: [art0601, art0701, art0702, art0703],
  pdes: PDES,
  endings: [],
  hub: HUB,
});

/**
 * Gói mà game nạp. Nhánh `__APP_ENV__ === 'production'` dùng named imports riêng để Vite tree-shake sạch
 * `sideQuests`/`sideFragments`/`sideEntries` (`AI_PROPOSED` + `[PLACEHOLDER]`) khỏi bundle `dist/`.
 * `scripts/world.mjs` chạy ngoài Vite không có `define`, nên kiểm `typeof __APP_ENV__ !== 'undefined'` để rơi về bản `test`.
 */
export const CONTENT: ContentPack =
  typeof __APP_ENV__ !== 'undefined' && __APP_ENV__ === 'production'
    ? filterPackForRelease(
        {
          ...commonPack(),
          quests: uniqueById([...q0601, ...q0701, ...q0702, ...q0703, ...HUB_QUESTS]),
          fragments: [...frag0601, ...frag0701, ...frag0702, ...frag0703],
          album_entries: [...ent0601, ...ent0701, ...ent0702, ...ent0703],
        },
        'production',
      )
    : {
        ...commonPack(),
        quests: uniqueById([
          ...q0601, ...sideQ0601,
          ...q0701, ...sideQ0701,
          ...q0702, ...sideQ0702,
          ...q0703, ...sideQ0703,
          ...HUB_QUESTS,
        ]),
        fragments: [
          ...frag0601, ...sideFrag0601,
          ...frag0701, ...sideFrag0701,
          ...frag0702, ...sideFrag0702,
          ...frag0703, ...sideFrag0703,
        ],
        album_entries: [
          ...ent0601, ...sideEnt0601,
          ...ent0701, ...sideEnt0701,
          ...ent0702, ...sideEnt0702,
          ...ent0703, ...sideEnt0703,
        ],
      };

/**
 * Gói mà phiên chơi dùng (BUG-T1-A). Bản `test` mặc định gỡ Side/Daily nháp giống production; `showDrafts` = true giữ lại.
 * Bản `production` đã lọc sẵn trong `CONTENT`, lọc lại không đổi gì.
 */
export function packForSession(pack: ContentPack, environment: 'test' | 'production', showDrafts: boolean): ContentPack {
  if (environment === 'test' && showDrafts) return pack;
  return filterPackForRelease(pack, 'production');
}

/** Cấu hình nội dung theo môi trường. `castName` chỉ dùng cho công cụ test (?cast=B). */
export function contentConfig(environment: 'test' | 'production', castName: string = ACTIVE_CAST): ContentConfig {
  return { cast: CAST_TABLES[castName] ?? CAST_TABLES[ACTIVE_CAST], release: RELEASES[environment], environment };
}
