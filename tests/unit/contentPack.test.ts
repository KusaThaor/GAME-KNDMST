/**
 * Kiểm gói nội dung THẬT trong repo — chạy trong mọi lần `npm test`.
 * Nội dung sai ID/tham chiếu → test này đỏ và in đúng ID bị sai.
 */
import { describe, expect, it } from 'vitest';
import { CONTENT, contentConfig } from '../../src/content/pack';
import { ACTIVE_CAST, CAST_TABLES } from '../../src/content/cast';
import { RELEASES } from '../../src/content/release';
import { CHAPTERS } from '../../src/content/chapters';
import { formatReport, validateContent, PLACEHOLDER_TAG } from '../../src/content/validate';
import { indexContent } from '../../src/content/indexContent';
import { PHOTO_CONFIG, photoQuality } from '../../src/config/photo';

describe('gói nội dung trong repo', () => {
  it('hợp lệ ở môi trường test', () => {
    const r = validateContent(CONTENT, contentConfig('test'));
    expect(formatReport({ errors: r.errors, warnings: [] })).toBe('');
  });
  it('hợp lệ ở production (nội dung giả không được lọt vào)', () => {
    const r = validateContent(CONTENT, contentConfig('production'));
    expect(formatReport({ errors: r.errors, warnings: [] })).toBe('');
    expect(RELEASES.production.memory_day_ids).toEqual([]);
  });
  it('mọi bảng vai (D-01) đều chạy được với cùng nội dung', () => {
    expect(Object.keys(CAST_TABLES)).toContain(ACTIVE_CAST);
    for (const name of Object.keys(CAST_TABLES)) {
      const r = validateContent(CONTENT, contentConfig('test', name));
      expect(`${name}: ${formatReport({ errors: r.errors, warnings: [] })}`).toBe(`${name}: `);
      expect(new Set(Object.values(CAST_TABLES[name])).size).toBe(4);
    }
  });
  it('có 2 Ngày giả d.g06.01 và d.g07.03 với kỷ vật art_m1_01, art_m1_05', () => {
    const idx = indexContent(CONTENT, contentConfig('test'));
    expect(idx.releaseDays.map((d) => d.id)).toEqual(['d.g06.01', 'd.g07.03']);
    expect(idx.artifactOfDay('d.g06.01')?.id).toBe('art_m1_01');
    expect(idx.artifactOfDay('d.g07.03')?.id).toBe('art_m1_05');
    const d1 = idx.days.get('d.g06.01')!;
    expect(idx.quests.get(d1.main_chain[0])!.steps).toHaveLength(2);
    expect(d1.side_quests).toHaveLength(1);
    expect(d1.daily_pool).toHaveLength(1);
    const photo = idx.quests.get('q_m1_main_05')!.steps.find((s) => s.kind === 'photo');
    expect(photo).toMatchObject({ mode: 'timer' });
    expect(photo && photo.kind === 'photo' && photo.subjects).toHaveLength(5);
  });
  it('mọi quest là AI_PROPOSED và mọi chữ có nhãn [PLACEHOLDER]', () => {
    for (const q of CONTENT.quests) expect(q.ownership_label).toBe('AI_PROPOSED');
    for (const a of CONTENT.artifacts) { expect(a.name).toContain(PLACEHOLDER_TAG); expect(a.hook_2026).toContain(PLACEHOLDER_TAG); }
    for (const f of CONTENT.fragments) if (f.text) expect(f.text).toContain(PLACEHOLDER_TAG);
    for (const t of CONTENT.hub.threads) for (const l of t.history) expect(l.text).toContain(PLACEHOLDER_TAG);
    for (const c of CHAPTERS) expect(c.label).toContain(PLACEHOLDER_TAG);
  });
  it('nội dung chỉ dùng vai NPC_A…D, không gọi thẳng chr_* (chờ D-01)', () => {
    const json = JSON.stringify({ q: CONTENT.quests, d: CONTENT.days, h: CONTENT.hub, p: CONTENT.pdes });
    expect(json).not.toMatch(/chr_(duc|quan|chau|ha)/);
  });
});

describe('chất lượng ảnh (D-12, cấu hình)', () => {
  it('luôn tính 3 tiêu chí; hiển thị theo cờ marks/score', () => {
    const q = photoQuality({ all_in_frame: true, player_in_zone: false, posed_in_time: true }, PHOTO_CONFIG);
    expect(q.marks).toEqual([true, false, true]);
    expect(q.score).toBe(PHOTO_CONFIG.score_weights.all_in_frame + PHOTO_CONFIG.score_weights.posed_in_time);
    expect(q.display).toBe(PHOTO_CONFIG.quality_display);
    expect(photoQuality({ all_in_frame: true, player_in_zone: true, posed_in_time: true }, { ...PHOTO_CONFIG, quality_display: 'score' })).toMatchObject({ score: 100, display: 'score' });
  });
});
