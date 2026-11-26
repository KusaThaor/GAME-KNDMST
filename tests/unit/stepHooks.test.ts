import { describe, expect, it, vi } from 'vitest';
import { createStepHooks } from '../../src/game/runtime/stepHooks';
import type { Step } from '../../src/content/types';

const step: Step = { id: 'q_m1_main_01.s01', kind: 'talk', with: 'NPC_A', lines: [], stage: [{ cue: 'motion', actor: 'NPC_A', motion: 'cheer' }] };

describe('stepHooks — điểm nối Đợt 2 (R-B0w)', () => {
  it('không có phần nào: before/after trả true, stage không làm gì', async () => {
    const h = createStepHooks();
    expect(await h.before(step, () => true)).toBe(true);
    expect(await h.after(step, () => true)).toBe(true);
    await expect(h.stage(step, 'start')).resolves.toBeUndefined();
  });

  it('gọi các phần theo thứ tự đăng ký; một phần trả false thì dừng; gỡ được', async () => {
    const log: string[] = [];
    const h = createStepHooks();
    const off = h.register({ id: 'a', before: () => { log.push('a'); return true; }, stage: (_s, at) => { log.push(`a:${JSON.stringify(at)}`); } });
    h.register({ id: 'b', before: async () => { log.push('b'); return false; } });
    h.register({ id: 'c', before: () => { log.push('c'); return true; } });
    expect(await h.before(step, () => true)).toBe(false);
    await h.stage(step, { line: 2 });
    expect(log).toEqual(['a', 'b', 'a:{"line":2}']);
    off();
    expect(h.parts().map((p) => p.id)).toEqual(['b', 'c']);
  });

  it('phần lỗi chỉ ghi console, không làm kẹt mạch chơi; bị hủy (alive=false) thì trả false', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = createStepHooks([{ id: 'hỏng', before: () => { throw new Error('x'); }, stage: () => { throw new Error('y'); } }]);
    expect(await h.before(step, () => true)).toBe(true);
    await expect(h.stage(step, 'end')).resolves.toBeUndefined();
    expect(err).toHaveBeenCalledTimes(2);
    expect(await h.after(step, () => false)).toBe(false);
    err.mockRestore();
  });
});
