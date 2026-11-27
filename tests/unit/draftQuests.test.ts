/**
 * BUG-T1-A: bản test/Preview mặc định ẩn Side/Daily nháp (AI_PROPOSED + [PLACEHOLDER]), bật lại bằng ?drafts=1.
 * Lý do: người chơi thử Trang 1 gặp thoại [PLACEHOLDER] của Châu và popup "Kết thúc ngày?" chỉ vì còn nhiệm vụ nháp mở.
 */
import { describe, expect, it } from 'vitest';
import { DRAFT_QUESTS } from '../../src/config/game';
import { indexContent } from '../../src/content/indexContent';
import { CONTENT, contentConfig, packForSession } from '../../src/content/pack';
import { validateContent } from '../../src/content/validate';

const hasPlaceholder = (v: unknown) => JSON.stringify(v).includes('[PLACEHOLDER]');

describe('BUG-T1-A ẩn nhiệm vụ nháp ở bản test', () => {
  it('mặc định tắt', () => {
    expect(DRAFT_QUESTS.show_in_test).toBe(false);
    expect(DRAFT_QUESTS.url_param).toBe('drafts');
  });

  it('bản test không bật drafts: không còn Side/Daily, không còn [PLACEHOLDER] trong quest/album/mảnh ký ức', () => {
    const pack = packForSession(CONTENT, 'test', false);
    expect(pack.quests.some((q) => q.type === 'side' || q.type === 'daily')).toBe(false);
    expect(pack.quests.map((q) => q.id)).not.toContain('q_m1_ai_side_01');
    expect(pack.days.every((d) => d.side_quests.length === 0 && d.daily_pool.length === 0)).toBe(true);
    expect(hasPlaceholder(pack.quests)).toBe(false);
    expect(hasPlaceholder(pack.fragments)).toBe(false);
    // Mạch chính còn nguyên
    expect(pack.quests.map((q) => q.id)).toContain('q_m1_main_01');
  });

  it('bản test bật drafts (?drafts=1): giữ nguyên gói đầy đủ', () => {
    const pack = packForSession(CONTENT, 'test', true);
    expect(pack).toBe(CONTENT);
    expect(pack.quests.map((q) => q.id)).toContain('q_m1_ai_side_01');
  });

  it('production luôn tắt, kể cả khi cờ bật', () => {
    const pack = packForSession(CONTENT, 'production', true);
    expect(pack.quests.some((q) => q.type === 'side' || q.type === 'daily')).toBe(false);
  });

  it('gói đã ẩn vẫn qua validator bản test, 0 lỗi', () => {
    const pack = packForSession(CONTENT, 'test', false);
    const report = validateContent(pack, indexContent(pack, contentConfig('test')).config);
    expect(report.errors).toEqual([]);
  });
});
