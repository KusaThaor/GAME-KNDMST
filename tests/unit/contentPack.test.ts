/**
 * Kiểm gói nội dung THẬT trong repo — chạy trong mọi lần `npm test`.
 * Nội dung sai ID/tham chiếu → test này đỏ và in đúng ID bị sai.
 */
import { describe, expect, it } from 'vitest';
import { CONTENT, contentConfig, filterPackForRelease } from '../../src/content/pack';
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
    // Từ N-22a production có 4 Trang; Side/Daily AI bị tắt bởi filterPackForRelease (kiểm chi tiết ở releaseProduction.test.ts).
    const r = validateContent(filterPackForRelease(CONTENT, 'production'), contentConfig('production'));
    expect(formatReport({ errors: r.errors, warnings: [] })).toBe('');
    expect(RELEASES.production.memory_day_ids).toHaveLength(4);
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
    expect(idx.quests.get(d1.main_chain[0])!.steps).toHaveLength(8);   // N-01b: thêm s08 (3 câu bàn về ảnh tự sướng, sau ảnh s07)
    expect(d1.side_quests).toEqual(['q_m1_ai_side_01']);
    expect(d1.daily_pool).toEqual(['q_m1_ai_daily_01']);

    const d2 = idx.days.get('d.g07.01')!;
    expect(idx.quests.get(d2.main_chain[0])!.steps).toHaveLength(7);
    expect(d2.side_quests).toEqual(['q_m1_ai_side_03']);
    expect(d2.daily_pool).toHaveLength(0);

    const d3 = idx.days.get('d.g07.02')!;
    expect(idx.quests.get(d3.main_chain[0])!.steps).toHaveLength(7);
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
  it('thoại bước minigame tách trước/sau trò (N-01b): intro_lines phát trước, lines phát sau; ba câu về ảnh tự sướng ở s08 sau ảnh s07', () => {
    const idx = indexContent(CONTENT, contentConfig('test'));
    const text = (ls?: { text: string }[]) => (ls ?? []).map((l) => l.text);
    const mg = (qid: string, sid: string) => {
      const s = idx.quests.get(qid)!.steps.find((x) => x.id === sid)!;
      if (s.kind !== 'minigame') throw new Error(`${sid} không phải minigame`);
      return s;
    };
    const cipher = mg('q_m1_main_01', 'q_m1_main_01.s02');
    expect(text(cipher.intro_lines)).toEqual(['Ê, đọc đi! Mật lệnh tuyệt mật đó.']);
    expect(text(cipher.lines)).toHaveLength(7);
    expect(text(cipher.lines)[6]).toBe('Lo chép bài đi, chút ra chơi rồi tính tiếp.');
    const footbag = mg('q_m1_main_01', 'q_m1_main_01.s03');
    expect(text(footbag.intro_lines)).toEqual(['Cậu cứ nhìn là biết tớ đá cầu giỏi cỡ nào!']);
    expect(text(footbag.lines)).toHaveLength(3);
    const wipe = mg('q_m1_main_01', 'q_m1_main_01.s04');
    expect(text(wipe.intro_lines)).toEqual(['Ghế tui xếp xong rồi. Bảng là phần hai người nha.']);
    expect(text(wipe.lines)).toHaveLength(6);
    const noodle = mg('q_m1_main_01', 'q_m1_main_01.s06');
    expect(text(noodle.intro_lines)).toEqual(['Ê ê! Còn đúng một gói mì thôi! Lẹ lên mày!']);
    expect(text(noodle.lines)).toHaveLength(6);
    const steps = idx.quests.get('q_m1_main_01')!.steps;
    expect(steps.map((s) => s.id)).toEqual(['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08'].map((n) => `q_m1_main_01.${n}`));
    expect(steps[6].kind).toBe('photo');
    const after = steps[7];
    expect(after.kind).toBe('cutscene');
    expect(after.kind === 'cutscene' && text(after.lines)).toEqual([
      'Tấm này hư cấu quá! Chụp lại đi!',
      'Tui thấy giữ tấm này được nè. Nhìn ngố y chang ông đó Đức.',
      'Mai mốt nhất định tụi mình phải chụp thêm nhiều tấm nữa nha.',
      'Chốt! Sau này chụp đủ một bộ sưu tập luôn!',
    ]);
    const rules = mg('q_m1_main_03', 'q_m1_main_03.s05');
    expect(text(rules.intro_lines)).toHaveLength(5);
    expect(text(rules.intro_lines)[0]).toBe('Phải có luật. Điều 1: không tự lấy đồ của người khác.');
    expect(text(rules.intro_lines)[3]).toBe('Nếu có ai buồn thì… mọi người đừng bỏ bạn đó ở lại một mình nha.');   // chữ "ở lại" đã chốt ở 2bbf275
    expect(text(rules.intro_lines)[4]).toBe('Điều 5: chụp ảnh thì phải đủ người.');
    expect(text(rules.lines)).toEqual([
      'Chốt! Sổ luật viết xong rồi, ai vô Căn cứ cũng phải tuân thủ!',
      'Ông nói như có cả trăm người muốn vô vậy.',
      'Biết đâu sau này tụi mình nổi tiếng thiệt!',
    ]);
    const total = (q: string) => idx.quests.get(q)!.steps.reduce((n, s) => n + (s.kind === 'minigame' ? (s.intro_lines?.length ?? 0) + (s.lines?.length ?? 0) : s.kind === 'cutscene' && s.id.endsWith('.s08') ? s.lines.length : 0), 0);
    expect(total('q_m1_main_01')).toBe(30);
    expect(total('q_m1_main_03')).toBe(11);
  });
  it('kỷ vật Mốc 1 sáng lần lượt: món của Trang N chỉ sáng khi xong đúng Trang N-1 (Hộp Kỷ Vật, hub 2026)', () => {
    const idx = indexContent(CONTENT, contentConfig('test'));
    const days = idx.releaseDays.map((d) => d.id);
    expect(idx.artifactOfDay(days[0])?.appear_when).toEqual({ quest: idx.pack.hub.intro_quest_id });
    for (let i = 1; i < days.length; i++) expect(idx.artifactOfDay(days[i])?.appear_when, days[i]).toEqual({ day: days[i - 1] });
  });
  it('kỷ vật Mốc 1 sáng lần lượt: món của Trang N chỉ sáng khi xong đúng Trang N-1 (Hộp Kỷ Vật, hub 2026)', () => {
    const idx = indexContent(CONTENT, contentConfig('test'));
    const days = idx.releaseDays.map((d) => d.id);
    expect(idx.artifactOfDay(days[0])?.appear_when).toEqual({ quest: idx.pack.hub.intro_quest_id });
    for (let i = 1; i < days.length; i++) expect(idx.artifactOfDay(days[i])?.appear_when, days[i]).toEqual({ day: days[i - 1] });
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
