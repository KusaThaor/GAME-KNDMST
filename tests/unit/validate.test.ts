import { describe, expect, it } from 'vitest';
import { validateContent } from '../../src/content/validate';
import { makeConfig, makePack } from './fixtures/pack';

const codes = (r: ReturnType<typeof validateContent>) => r.errors.map((e) => `${e.code}:${e.id}`);

describe('validateContent', () => {
  it('gói mẫu hợp lệ → không lỗi', () => {
    const r = validateContent(makePack(), makeConfig());
    expect(r.errors).toEqual([]);
  });

  it('tham chiếu sai → báo đúng ID bị thiếu', () => {
    const p = makePack();
    p.days[0].main_chain = ['q_m1_main_99'];
    const r = validateContent(p, makeConfig());
    expect(codes(r)).toContain('missing_ref:q_m1_main_99');
    expect(r.errors.find((e) => e.id === 'q_m1_main_99')!.message).toContain('d.g06.01');
  });

  it('ID sai mẫu §6', () => {
    const p = makePack();
    p.days[0].id = 'day_6_1';
    p.quests[0].steps[0].id = 'q_m1_main_01.step1';
    p.artifacts[0].id = 'artifact1';
    const c = codes(validateContent(p, makeConfig()));
    expect(c).toContain('bad_id:day_6_1');
    expect(c).toContain('bad_id:q_m1_main_01.step1');
    expect(c).toContain('bad_id:artifact1');
  });

  it('ID trùng', () => {
    const p = makePack();
    p.quests.push({ ...p.quests[0] });
    expect(codes(validateContent(p, makeConfig()))).toContain('duplicate_id:q_m1_main_01');
  });

  it('mỗi kỷ vật trỏ đúng 1 Ngày, mỗi Ngày đúng 1 kỷ vật', () => {
    const p = makePack();
    p.artifacts[1].target_memory_day_id = 'd.g06.01';
    const c = codes(validateContent(p, makeConfig()));
    expect(c).toContain('day_artifact_count:d.g06.01');
    expect(c).toContain('day_artifact_count:d.g07.03');
  });

  it('chuỗi Main rỗng', () => {
    const p = makePack();
    p.days[1].main_chain = [];
    expect(codes(validateContent(p, makeConfig()))).toContain('empty_main_chain:d.g07.03');
  });

  it('Side/Daily không được chặn Main', () => {
    const p = makePack();
    p.quests.find((q) => q.id === 'q_m1_side_01')!.blocks_main = true;
    expect(codes(validateContent(p, makeConfig()))).toContain('side_blocks_main:q_m1_side_01');
  });

  describe('A-02: Side/Daily phải mở đầu bằng hành động trong thế giới', () => {
    const quest = (p: ReturnType<typeof makePack>, id: string) => p.quests.find((q) => q.id === id)!;
    const dlg = [{ speaker: 'narrator', text: '[PLACEHOLDER] lời dẫn' }];

    it('Side mở đầu bằng cutscene → lỗi optional_quest_unstartable (kèm cách sửa)', () => {
      const p = makePack();
      const q = quest(p, 'q_m1_side_01');
      q.steps = [{ id: 'q_m1_side_01.s01', kind: 'cutscene', lines: dlg }, ...q.steps.slice(1)];
      const r = validateContent(p, makeConfig());
      expect(codes(r)).toContain('optional_quest_unstartable:q_m1_side_01');
      const msg = r.errors.find((e) => e.code === 'optional_quest_unstartable')!.message;
      expect(msg).toContain('cutscene');
      expect(msg).toMatch(/talk|goto|interact/);
    });

    it('Daily mở đầu bằng bước không phải hành động (free) → lỗi', () => {
      const p = makePack();
      quest(p, 'q_m1_daily_01').steps = [{ id: 'q_m1_daily_01.s01', kind: 'free', prompt: '[PLACEHOLDER]' }];
      expect(codes(validateContent(p, makeConfig()))).toContain('optional_quest_unstartable:q_m1_daily_01');
    });

    it('chỉ xét BƯỚC ĐẦU: Side mở bằng talk, có cutscene ở bước sau → không lỗi mới', () => {
      const p = makePack();
      const q = quest(p, 'q_m1_side_01');
      q.steps = [q.steps[0], { id: 'q_m1_side_01.s02', kind: 'cutscene', lines: dlg }];
      expect(codes(validateContent(p, makeConfig())).filter((c) => c.startsWith('optional_quest_unstartable'))).toEqual([]);
    });

    it('Main mở đầu bằng cutscene vẫn hợp lệ (luật chỉ áp cho Side/Daily)', () => {
      const p = makePack();
      const q = quest(p, 'q_m1_main_05');
      q.steps = [{ id: 'q_m1_main_05.s01', kind: 'cutscene', lines: dlg }, ...q.steps.slice(1).map((s, i) => ({ ...s, id: `q_m1_main_05.s0${i + 2}` }))];
      expect(codes(validateContent(p, makeConfig())).filter((c) => c.startsWith('optional_quest_unstartable'))).toEqual([]);
    });

    it('5 loại bước đầu hợp lệ (talk | interact | goto | collect | place) → không báo nhầm', () => {
      const first = [
        { kind: 'talk', with: 'NPC_B', lines: dlg },
        { kind: 'interact', target: 'itr.thcs.board' },
        { kind: 'goto', target: 'itr.thcs.tree' },
        { kind: 'collect', item: 'item.x', targets: ['itr.thcs.tree'], count: 1 },
        { kind: 'place', item: 'item.x', target: 'itr.thcs.tree' },
      ] as const;
      for (const f of first) {
        const p = makePack();
        const q = quest(p, 'q_m1_side_01');
        q.steps = [{ id: 'q_m1_side_01.s01', ...f } as (typeof q.steps)[number]];
        expect(codes(validateContent(p, makeConfig())).filter((c) => c.startsWith('optional_quest_unstartable')), f.kind).toEqual([]);
      }
    });
  });

  it('trang phải có ít nhất 1 ô required_for_restore', () => {
    const p = makePack();
    for (const e of p.album_entries) if (e.page_id === 'page.d.g07.03') e.required_for_restore = false;
    expect(codes(validateContent(p, makeConfig()))).toContain('page_no_required_entry:page.d.g07.03');
  });

  it('Ngày không có trang Album', () => {
    const p = makePack();
    p.album_entries = p.album_entries.filter((e) => e.page_id !== 'page.d.g07.03');
    p.artifacts[1].album_entry_ids = [];
    p.quests.find((q) => q.id === 'q_m1_main_05')!.steps.pop();
    expect(codes(validateContent(p, makeConfig()))).toContain('day_no_album_page:d.g07.03');
  });

  it('bước trỏ tới vật tương tác / nhân vật / máy ảnh không có trong Ngày', () => {
    const p = makePack();
    const q = p.quests[0];
    (q.steps[2] as { target: string }).target = 'itr.thcs.nowhere';
    (q.steps[0] as { with: string }).with = 'NPC_D';
    const c = codes(validateContent(p, makeConfig()));
    expect(c).toContain('missing_ref:itr.thcs.nowhere');
    expect(c).toContain('actor_not_placed:NPC_D');
  });

  it('điều kiện trỏ tới quest/Ngày không tồn tại, flag sai mẫu', () => {
    const p = makePack();
    p.pdes[0].trigger = { all: [{ day: 'd.g09.09' }, { any: [{ quest: 'q_m3_main_77' }, { flag: 'BadFlag' }] }] };
    const c = codes(validateContent(p, makeConfig()));
    expect(c).toContain('missing_ref:d.g09.09');
    expect(c).toContain('missing_ref:q_m3_main_77');
    expect(c).toContain('bad_id:BadFlag');
  });

  it('bảng vai và phạm vi phát hành trỏ sai', () => {
    const p = makePack();
    const r = validateContent(p, makeConfig({
      cast: { NPC_A: 'chr_ghost', NPC_B: 'chr_chau', NPC_C: 'chr_ha', NPC_D: 'chr_quan' },
      release: { memory_day_ids: ['d.g06.01', 'd.g08.01'], end_day_id: 'd.g07.03' },
    }));
    const c = codes(r);
    expect(c).toContain('missing_ref:chr_ghost');
    expect(c).toContain('missing_ref:d.g08.01');
    expect(c).toContain('release_end_not_in_list:d.g07.03');
  });

  it('production không được chứa nội dung giả (AI_PROPOSED)', () => {
    const c = codes(validateContent(makePack(), makeConfig({ environment: 'production' })));
    expect(c).toContain('placeholder_in_production:q_m1_main_01');
  });

  it('nội dung AI_PROPOSED thiếu nhãn [PLACEHOLDER] → lỗi', () => {
    const p = makePack();
    (p.quests[0].steps[0] as { lines: { text: string }[] }).lines[0].text = 'Chào cậu!';
    expect(codes(validateContent(p, makeConfig()))).toContain('missing_placeholder_tag:q_m1_main_01.s01');
  });

  it('dòng callback theo flag phải có dòng dự phòng', () => {
    const p = makePack();
    (p.quests[0].steps[0] as { lines: object[] }).lines.push({ speaker: 'NPC_A', text: '[PLACEHOLDER] nhớ', when: { flag: 'm1.greet', equals: 'playful' } });
    expect(codes(validateContent(p, makeConfig()))).toContain('callback_without_fallback:q_m1_main_01.s01');
  });

  it('cảnh báo dòng thoại quá dài hoặc quá 2 dòng (không chặn)', () => {
    const p = makePack();
    const lines = (p.quests[0].steps[0] as { lines: { speaker: string; text: string }[] }).lines;
    lines.push({ speaker: 'NPC_A', text: `[PLACEHOLDER] ${'dài '.repeat(30)}` });
    lines.push({ speaker: 'NPC_A', text: '[PLACEHOLDER] a\nb\nc' });
    const r = validateContent(p, makeConfig());
    expect(r.errors).toEqual([]);
    expect(r.warnings.filter((w) => w.code === 'line_too_long')).toHaveLength(2);
  });
});
