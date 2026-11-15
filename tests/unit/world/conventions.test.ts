/**
 * Quy ước hai phía của pipeline bản đồ phải khớp nhau:
 *   - phía Blender: tools/blender/world/pipeline_config.py  (NAME_PREFIX_KIND, KINDS_NEED_ID, KINDS)
 *   - phía game:    src/world/types.ts                      (NAME_PREFIX_KIND, KINDS_NEED_ID, MARKER_KINDS)
 * Đọc file Python dạng chữ (không cần Python/Blender). Sửa một bên mà quên bên kia → test này đỏ.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KINDS_NEED_ID, MARKER_KINDS, NAME_PREFIX_KIND } from '../../../src/world/types';

const PY_PATH = resolve(__dirname, '../../../tools/blender/world/pipeline_config.py');
const PY = readFileSync(PY_PATH, 'utf8');

/** Phần thân giữa cặp ngoặc của phép gán `NAME = <mở> … <đóng>` ở đầu dòng. Không thấy → ném lỗi (để test đỏ rõ ràng). */
export function pyBody(src: string, name: string): string {
  const m = new RegExp(`^${name}\\s*=\\s*([\\[({])`, 'm').exec(src);
  if (!m) throw new Error(`pipeline_config.py: không thấy phép gán ${name}`);
  const open = m[1];
  const close = { '[': ']', '(': ')', '{': '}' }[open]!;
  let depth = 0;
  for (let i = m.index + m[0].length - 1; i < src.length; i++) {
    const ch = src[i];
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return src.slice(m.index + m[0].length, i);
  }
  throw new Error(`pipeline_config.py: ${name} thiếu dấu đóng ${close}`);
}

const STR = `(?:'([^']*)'|"([^"]*)")`;
const stripComments = (s: string) => s.replace(/#[^\n]*/g, '');

/** Danh sách các chuỗi trong một list/tuple/set Python. */
export function pyStrings(src: string, name: string): string[] {
  return [...stripComments(pyBody(src, name)).matchAll(new RegExp(STR, 'g'))].map((m) => m[1] ?? m[2]);
}

/** Danh sách cặp (tiền tố, loại) trong NAME_PREFIX_KIND, giữ đúng thứ tự. */
export function pyPairs(src: string, name: string): [string, string][] {
  const re = new RegExp(`\\(\\s*${STR}\\s*,\\s*${STR}\\s*\\)`, 'g');
  return [...stripComments(pyBody(src, name)).matchAll(re)].map((m) => [m[1] ?? m[2], m[3] ?? m[4]]);
}

/** So quy ước của một bản pipeline_config.py với phía game. Trả về danh sách chỗ lệch (rỗng = khớp). */
export function conventionDiffs(src: string): string[] {
  const out: string[] = [];
  const pyPrefix = pyPairs(src, 'NAME_PREFIX_KIND');
  const tsPrefix = NAME_PREFIX_KIND.map(([p, k]) => [p, k] as [string, string]);
  if (JSON.stringify(pyPrefix) !== JSON.stringify(tsPrefix)) {
    out.push(`NAME_PREFIX_KIND lệch (thứ tự cũng phải giống): Python=${JSON.stringify(pyPrefix)} · TS=${JSON.stringify(tsPrefix)}`);
  }
  const pyNeed = [...new Set(pyStrings(src, 'KINDS_NEED_ID'))].sort();
  const tsNeed = [...new Set(KINDS_NEED_ID)].sort();
  if (JSON.stringify(pyNeed) !== JSON.stringify(tsNeed)) out.push(`KINDS_NEED_ID lệch: Python=${pyNeed} · TS=${tsNeed}`);
  // KINDS phía Python = MARKER_KINDS phía game + 2 loại không phải marker (collider, floor)
  const pyKinds = [...new Set(pyStrings(src, 'KINDS'))].sort();
  const tsKinds = [...new Set<string>([...MARKER_KINDS, 'collider', 'floor'])].sort();
  if (JSON.stringify(pyKinds) !== JSON.stringify(tsKinds)) out.push(`KINDS lệch: Python=${pyKinds} · TS(MARKER_KINDS+collider+floor)=${tsKinds}`);
  return out;
}

describe('quy ước Blender (pipeline_config.py) ↔ game (types.ts)', () => {
  it('đọc được đủ các mục từ file Python', () => {
    expect(pyPairs(PY, 'NAME_PREFIX_KIND').length).toBeGreaterThanOrEqual(10);
    expect(pyStrings(PY, 'KINDS_NEED_ID').length).toBeGreaterThanOrEqual(1);
    expect(pyStrings(PY, 'KINDS').length).toBeGreaterThanOrEqual(10);
  });

  it('NAME_PREFIX_KIND, KINDS_NEED_ID, KINDS khớp hai phía', () => {
    expect(conventionDiffs(PY)).toEqual([]);
  });

  it('mọi loại trong tiền tố tên và KINDS_NEED_ID đều là loại hợp lệ', () => {
    const kinds = new Set(pyStrings(PY, 'KINDS'));
    for (const [, k] of pyPairs(PY, 'NAME_PREFIX_KIND')) expect(kinds.has(k), k).toBe(true);
    for (const k of pyStrings(PY, 'KINDS_NEED_ID')) expect(kinds.has(k), k).toBe(true);
  });

  // Chứng minh test bắt được lệch thật: sửa bản sao trong bộ nhớ, không đụng file.
  it('bắt được khi phía Python bị sửa lệch', () => {
    const dropped = PY.replace(/\('TRIGGER_', 'trigger'\)/, '').replace(/,\s*\]/, ']');
    expect(conventionDiffs(dropped).some((d) => d.startsWith('NAME_PREFIX_KIND'))).toBe(true);
    const renamed = PY.replace("('ITR_', 'interact')", "('ITEM_', 'interact')");
    expect(conventionDiffs(renamed).some((d) => d.startsWith('NAME_PREFIX_KIND'))).toBe(true);
    const swapped = PY.replace(/\('ITR_', 'interact'\),(\s*)\('INTERACT_', 'interact'\)/, "('INTERACT_', 'interact'),$1('ITR_', 'interact')");
    expect(swapped).not.toBe(PY);
    expect(conventionDiffs(swapped).some((d) => d.startsWith('NAME_PREFIX_KIND'))).toBe(true);
    const lessId = PY.replace("KINDS_NEED_ID = {'spawn', ", 'KINDS_NEED_ID = {');
    expect(lessId).not.toBe(PY);
    expect(conventionDiffs(lessId).some((d) => d.startsWith('KINDS_NEED_ID'))).toBe(true);
    const moreKind = PY.replace("'zone', 'trigger')", "'zone', 'trigger', 'door')");
    expect(moreKind).not.toBe(PY);
    expect(conventionDiffs(moreKind).some((d) => d.startsWith('KINDS lệch'))).toBe(true);
  });

  it('báo lỗi rõ khi mất hẳn một mục', () => {
    expect(() => conventionDiffs(PY.replace(/^KINDS_NEED_ID\s*=/m, 'KINDS_NEED_IDS ='))).toThrow(/KINDS_NEED_ID/);
  });
});
