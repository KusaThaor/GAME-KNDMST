/**
 * Hội thoại (F5): tên động + biến thể nam/nữ + dòng có điều kiện. Quy chuẩn: QUEST_CONTENT_FRAMEWORK_v1 §6.
 * Thuần hàm — UI chỉ việc hiện kết quả.
 */
import type { ContentIndex } from '../content/indexContent';
import type { DialogueLine, Gender } from '../content/types';
import { evalCondition, type ConditionContext } from '../core/conditions';

export interface PlayerProfile { player_name: string; gender: Gender }
const DEFAULT_NAME = 'bạn';

/** `{player_name}` → tên người chơi (không đổi hoa/thường); `{g:<khi nam>|<khi nữ>}` → theo giới đã chọn. */
export function formatText(text: string, p: PlayerProfile): string {
  return text
    .replace(/\{g:([^|{}]*)\|([^|{}]*)\}/g, (_m, male: string, female: string) => (p.gender === 'male' ? male : female))
    .replace(/\{player_name\}/g, () => p.player_name || DEFAULT_NAME);
}

export interface ResolvedLine { speaker: string; text: string }

/** Lọc dòng theo điều kiện: đạt → `text`; không đạt → `fallback` (rỗng/không có = bỏ dòng). */
export function resolveLines(lines: DialogueLine[], ctx: ConditionContext): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const l of lines) {
    if (!l.when || evalCondition(l.when, ctx)) out.push({ speaker: l.speaker, text: l.text });
    else if (l.fallback) out.push({ speaker: l.speaker, text: l.fallback });
  }
  return out;
}

/** Tên hiện trong ô thoại. Vai tạm (NPC_A…) đi qua bảng cast nên đổi cast không phải sửa nội dung. */
export function speakerName(ref: string, idx: ContentIndex, p: PlayerProfile): string {
  if (ref === 'narrator') return '';
  if (ref === 'player') return p.player_name || DEFAULT_NAME;
  const chr = idx.resolveActor(ref);
  return chr ? formatText(chr.display_name, p) : ref;
}
