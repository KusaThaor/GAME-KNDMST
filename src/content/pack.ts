/** Ghép gói nội dung. Thêm một Ngày mới: tạo file trong days/, thêm vào DAYS bên dưới, khai trong release.ts + chapters.ts. */
import { CHARACTERS, MAPS, MILESTONES, SCHOOL_YEARS } from './base';
import { ACTIVE_CAST, CAST_TABLES } from './cast';
import { CHAPTERS } from './chapters';
import * as d0601 from './days/d_g06_01';
import * as d0701 from './days/d_g07_01';
import * as d0702 from './days/d_g07_02';
import * as d0703 from './days/d_g07_03';
import * as d0801 from './days/d_g08_01';
import * as d0802 from './days/d_g08_02';
import * as d0901 from './days/d_g09_01';
import * as d0902 from './days/d_g09_02';
import * as d0903 from './days/d_g09_03';
import { HUB, HUB_QUESTS, PDES } from './hub';
import { RELEASES } from './release';
import type { ContentConfig, ContentPack } from './types';

const DAYS = [d0601, d0701, d0702, d0703, d0801, d0802, d0901, d0902, d0903];
const uniqueById = <T extends { id: string }>(list: T[]) => [...new Map(list.map((x) => [x.id, x])).values()];

export const CONTENT: ContentPack = {
  characters: CHARACTERS, milestones: MILESTONES, school_years: SCHOOL_YEARS, maps: MAPS, chapters: CHAPTERS,
  days: DAYS.map((d) => d.day),
  // Daily dùng chung nhiều Ngày nên có thể được khai ở nhiều file — gộp theo ID.
  quests: uniqueById([...DAYS.flatMap((d) => d.quests), ...HUB_QUESTS]),
  artifacts: DAYS.map((d) => d.artifact),
  fragments: DAYS.flatMap((d) => d.fragments),
  album_entries: DAYS.flatMap((d) => d.entries),
  pdes: PDES, endings: [], hub: HUB,
};

/** Cấu hình nội dung theo môi trường. `castName` chỉ dùng cho công cụ test (?cast=B). */
export function contentConfig(environment: 'test' | 'production', castName: string = ACTIVE_CAST): ContentConfig {
  return { cast: CAST_TABLES[castName] ?? CAST_TABLES[ACTIVE_CAST], release: RELEASES[environment], environment };
}
