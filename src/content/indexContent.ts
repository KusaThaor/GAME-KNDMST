/** Chỉ mục tra cứu nội dung theo ID — engine dùng cái này, không duyệt mảng trực tiếp. */
import { CAST_ROLES, type AlbumEntry, type Artifact, type CastRole, type Character, type ContentConfig, type ContentPack, type MemoryDay, type MilestoneId, type Quest, type Step } from './types';

export interface StepRef { quest: Quest; step: Step; index: number }

export interface ContentIndex {
  pack: ContentPack;
  config: ContentConfig;
  characters: Map<string, Character>;
  days: Map<string, MemoryDay>;
  quests: Map<string, Quest>;
  artifacts: Map<string, Artifact>;
  entries: Map<string, AlbumEntry>;
  steps: Map<string, StepRef>;
  /** Các Ngày thuộc bản phát hành, theo thứ tự chơi. */
  releaseDays: MemoryDay[];
  firstStepId(questId: string): string | null;
  artifactOfDay(dayId: string): Artifact | undefined;
  dayOfPage(pageId: string): MemoryDay | undefined;
  entriesOfPage(pageId: string): AlbumEntry[];
  milestoneOfDay(dayId: string): MilestoneId | undefined;
  chapterLabel(dayId: string): string | undefined;
  /** 'player' → chr_player; vai NPC_A…D → nhân vật theo bảng cast; còn lại tra thẳng. */
  resolveActor(ref: string): Character | undefined;
}

export function indexContent(pack: ContentPack, config: ContentConfig): ContentIndex {
  const by = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
  const days = by(pack.days), quests = by(pack.quests), artifacts = by(pack.artifacts), entries = by(pack.album_entries), characters = by(pack.characters);
  const years = by(pack.school_years);
  const steps = new Map<string, StepRef>();
  for (const quest of pack.quests) quest.steps.forEach((step, index) => steps.set(step.id, { quest, step, index }));
  return {
    pack, config, characters, days, quests, artifacts, entries, steps,
    releaseDays: config.release.memory_day_ids.map((id) => days.get(id)).filter((d): d is MemoryDay => !!d),
    firstStepId: (questId) => quests.get(questId)?.steps[0]?.id ?? null,
    artifactOfDay: (dayId) => pack.artifacts.find((a) => a.target_memory_day_id === dayId),
    dayOfPage: (pageId) => pack.days.find((d) => d.album_page_id === pageId),
    entriesOfPage: (pageId) => pack.album_entries.filter((e) => e.page_id === pageId).sort((a, b) => a.slot_index - b.slot_index),
    milestoneOfDay: (dayId) => years.get(days.get(dayId)?.school_year_id ?? '')?.milestone_id,
    chapterLabel: (dayId) => pack.chapters.find((c) => c.memory_day_ids.includes(dayId))?.label,
    resolveActor: (ref) => {
      if (ref === 'player') return characters.get('chr_player');
      if ((CAST_ROLES as readonly string[]).includes(ref)) return characters.get(config.cast[ref as CastRole]);
      return characters.get(ref);
    },
  };
}
