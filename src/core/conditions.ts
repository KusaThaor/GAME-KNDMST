import type { Condition, FlagValue } from '../content/types';

export interface ConditionContext {
  flag(name: string): FlagValue | undefined;
  questCompleted(questId: string): boolean;
  dayCompleted(dayId: string): boolean;
}

/** all / any / flag (có giá trị, hoặc bằng `equals`) / quest đã xong / Ngày đã xong. */
export function evalCondition(c: Condition | undefined, ctx: ConditionContext): boolean {
  if (!c || 'always' in c) return true;
  if ('all' in c) return c.all.every((x) => evalCondition(x, ctx));
  if ('any' in c) return c.any.some((x) => evalCondition(x, ctx));
  if ('flag' in c) { const v = ctx.flag(c.flag); return c.equals === undefined ? v !== undefined && v !== false : v === c.equals; }
  if ('quest' in c) return ctx.questCompleted(c.quest);
  return ctx.dayCompleted(c.day);
}
