/**
 * Kiểm gói nội dung THẬT trong repo — chạy trong mọi lần `npm test`.
 * Nội dung sai ID/tham chiếu → test này đỏ và in đúng ID bị sai.
 */
import { describe, expect, it } from 'vitest';
import { CONTENT, contentConfig } from '../../src/content/pack';
import { ACTIVE_CAST, CAST_TABLES } from '../../src/content/cast';
import { RELEASES } from '../../src/content/release';
import { formatReport, validateContent } from '../../src/content/validate';
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
  it('có đủ 4 Ngày Mốc 1 (d.g06.01 -> d.g07.03) với các kỷ vật tương ứng', () => {
    const idx = indexContent(CONTENT, contentConfig('test'));
    expect(idx.releaseDays.map((d) => d.id)).toEqual(['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03']);
    expect(idx.artifactOfDay('d.g06.01')?.id).toBe('art_m1_01');
    expect(idx.artifactOfDay('d.g07.01')?.id).toBe('art_m1_02');
    expect(idx.artifactOfDay('d.g07.02')?.id).toBe('art_m1_03');
    expect(idx.artifactOfDay('d.g07.03')?.id).toBe('art_m1_05');
    const d1 = idx.days.get('d.g06.01')!;
    expect(idx.quests.get(d1.main_chain[0])!.steps).toHaveLength(7);
    expect(d1.side_quests).toEqual(['q_m1_ai_side_01']);
    expect(d1.daily_pool).toEqual(['q_m1_ai_daily_01']);

    const d2 = idx.days.get('d.g07.01')!;
    expect(idx.quests.get(d2.main_chain[0])!.steps).toHaveLength(5);
    expect(d2.side_quests).toEqual(['q_m1_ai_side_03']);
    expect(d2.daily_pool).toHaveLength(0);

    const d3 = idx.days.get('d.g07.02')!;
    expect(idx.quests.get(d3.main_chain[0])!.steps).toHaveLength(6);
    expect(d3.side_quests).toHaveLength(0);
    expect(d3.daily_pool).toHaveLength(0);

    const d4 = idx.days.get('d.g07.03')!;
    expect(idx.quests.get(d4.main_chain[0])!.steps).toHaveLength(8);
    expect(d4.side_quests).toEqual(['q_m1_ai_side_02']);
    expect(d4.daily_pool).toHaveLength(0);

    const photos = idx.quests.get('q_m1_main_05')!.steps.filter((s) => s.kind === 'photo');
    expect(photos).toHaveLength(2);
    expect(photos[0]).toMatchObject({ mode: 'timer', album_entry_id: 'alb.d.g07.03.01' });
    expect(photos[0] && photos[0].kind === 'photo' && photos[0].subjects).toHaveLength(5);
    expect(photos[1]).toMatchObject({ mode: 'timer', album_entry_id: 'alb.d.g07.03.cover' });
    expect(photos[1] && photos[1].kind === 'photo' && photos[1].subjects).toHaveLength(5);
  });
  it('nội dung kịch bản Mốc 1 chuẩn hóa vai diễn và quyền sở hữu', () => {
    for (const q of CONTENT.quests) {
      expect(['HUMAN_CANON', 'HUMAN_DRAFT', 'AI_ASSISTED', 'AI_PROPOSED']).toContain(q.ownership_label);
    }
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
