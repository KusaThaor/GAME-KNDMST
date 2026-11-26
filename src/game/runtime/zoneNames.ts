/**
 * Phân giải tên khu hiển thị trong Ngày ký ức, có xét `day.zone_name_overrides`
 * (thay tên tạm theo điều kiện `when` cho tới khi bước `until_step` hoàn thành).
 */
import type { ContentIndex } from '../../content/indexContent';
import type { MapDef, MemoryDay, Quest, Step } from '../../content/types';
import { evalCondition, type ConditionContext } from '../../core/conditions';
import type { QuestState } from '../../core/save';

export interface ZoneNameEngine {
  conditions: ConditionContext;
  questState(questId: string): QuestState;
  activeSteps(): readonly { quest: Quest; step: Step; index: number }[];
  optionalQuests?(): readonly { quest: Quest; state: QuestState }[];
}

function isStepCompleted(stepId: string, engine: ZoneNameEngine, idx?: ContentIndex): boolean {
  const active = engine.activeSteps();
  const activeRef = active.find((r) => r.quest.steps.some((s) => s.id === stepId));
  if (activeRef) {
    const targetIdx = activeRef.quest.steps.findIndex((s) => s.id === stepId);
    return targetIdx >= 0 && activeRef.index > targetIdx;
  }

  const ref = idx?.steps.get(stepId);
  if (ref) {
    if (engine.questState(ref.quest.id) === 'completed') return true;
    const opt = engine.optionalQuests?.().find((q) => q.quest.id === ref.quest.id);
    if (opt?.state === 'completed') return true;
    return false;
  }

  const optMatch = engine.optionalQuests?.().find((q) => q.quest.steps.some((s) => s.id === stepId));
  if (optMatch) return optMatch.state === 'completed';

  const inferredQuestId = stepId.replace(/\.s\d+$/, '');
  return inferredQuestId !== stepId && engine.questState(inferredQuestId) === 'completed';
}

function findMap(day: MemoryDay, mapSource?: MapDef | ContentIndex | readonly MapDef[] | null): MapDef | undefined {
  if (!mapSource) return undefined;
  if (Array.isArray(mapSource)) return mapSource.find((m) => m.id === day.map_id);
  if ('pack' in mapSource) return mapSource.pack.maps.find((m) => m.id === day.map_id);
  return mapSource as MapDef;
}

/**
 * Trả về tên khu cần hiện cho `zoneId` trong `day`:
 * ưu tiên `zone_name_overrides` nếu `when` đạt và `until_step` chưa hoàn thành;
 * ngược lại trả về tên gốc trong `map.zones`.
 */
export function resolveZoneName(
  day: MemoryDay,
  zoneId: string | null | undefined,
  engine: ZoneNameEngine,
  mapSource?: MapDef | ContentIndex | readonly MapDef[] | null,
): string | null {
  if (!zoneId) return null;
  const idx = mapSource && !Array.isArray(mapSource) && 'pack' in mapSource ? mapSource : undefined;

  for (const over of day.zone_name_overrides ?? []) {
    if (over.zone_id !== zoneId) continue;
    if (over.when && !evalCondition(over.when, engine.conditions)) continue;
    if (over.until_step && isStepCompleted(over.until_step, engine, idx)) continue;
    return over.name;
  }

  const map = findMap(day, mapSource);
  return map?.zones.find((z) => z.zone_id === zoneId)?.name ?? null;
}
