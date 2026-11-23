import { describe, expect, it } from 'vitest';
import { formatReport, validateContent } from '../../src/content/validate';
import type { Step } from '../../src/content/types';
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

describe('N-10 · bước mở quest tùy chọn', () => {
  it.each(['side', 'daily'] as const)('%s không khởi động được bằng cutscene', type => {
    const p = makePack();
    const q = p.quests.find(q => q.type === type)!;
    q.steps[0] = { id: q.steps[0].id, kind: 'cutscene', lines: [] };
    expect(codes(validateContent(p, makeConfig()))).toContain(`optional_quest_unstartable:${q.id}`);
  });

  it('talk cần NPC đã đặt và marker spot trong khu mở của Trang', () => {
    const p = makePack();
    const day = p.days[0];
    const npc = day.npc_placements.find(n => n.actor === 'NPC_B')!;
    delete npc.position;
    npc.marker = 'spot.thcs.yard_bench_2';
    day.open_zones = ['zone.thcs.yard'];
    const errors = () => validateContent(p, makeConfig()).errors.filter(e => e.code === 'optional_quest_unstartable');
    expect(errors()).toEqual([]);
    day.open_zones = ['zone.thcs.classroom'];
    expect(errors()[0].message).toContain('zone.thcs.yard');
    npc.marker = 'spot.thcs.missing';
    expect(errors()[0].message).toContain(npc.marker);
    day.npc_placements = [];
    expect(errors()[0].message).toContain('NPC_B');
  });

  const target = 'itr.thcs.blackboard';
  const id = 'q_m1_side_01.s01';
  const openings: Step[] = [
    { id, kind: 'interact', target },
    { id, kind: 'goto', target },
    { id, kind: 'place', item: 'chalk', target },
    { id, kind: 'collect', item: 'chalk', targets: ['itr.thcs.desk', target], count: 2 },
  ];

  it.each(openings)('$kind kiểm từng đích trong Trang và khu mở', step => {
    const p = makePack();
    const day = p.days[0];
    const q = p.quests.find(q => q.type === 'side')!;
    q.steps[0] = step;
    const errors = () => validateContent(p, makeConfig()).errors.filter(e => e.code === 'optional_quest_unstartable');
    expect(errors()[0].message).toContain(target);
    day.interactables.push({ id: target, kind: 'object', label: 'Bảng' });
    expect(errors()).toEqual([]);
    day.open_zones = ['zone.thcs.yard'];
    expect(errors()[0].message).toContain('zone.thcs.classroom');
  });

  it('điểm tương tác được khai nhưng thiếu marker trong bản đồ', () => {
    const p = makePack();
    const q = p.quests.find(q => q.type === 'side')!;
    const target = 'itr.thcs.nonexistent';
    q.steps[0] = { id: q.steps[0].id, kind: 'interact', target };
    p.days[0].interactables.push({ id: target, kind: 'object', label: 'Bảng' });
    expect(validateContent(p, makeConfig()).errors).toContainEqual({
      code: 'optional_quest_unstartable', id: q.id, message: expect.stringContaining(target),
    });
  });

  it('Daily dùng chung kiểm riêng theo khu mở của từng Trang, kể cả vị trí cũ', () => {
    const p = makePack();
    for (const d of p.days) d.interactables.find(i => i.id === 'itr.thcs.board')!.zone_id = 'zone.thcs.yard';
    p.days[0].open_zones = ['zone.thcs.yard'];
    p.days[1].open_zones = [];
    const issues = validateContent(p, makeConfig()).errors.filter(e => e.code === 'optional_quest_unstartable');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ id: 'q_m1_daily_01', message: expect.stringContaining(p.days[1].id) });
  });
});

describe('N-10 · mã trò và nội dung phát hành', () => {
  it('chấp nhận các mã trò cốt truyện N-01, N-15 và N-16', () => {
    const p = makePack(), q = p.quests[0];
    const games = ['cipher', 'footbag', 'wipe_board', 'noodle', 'boat', 'base_build', 'rules', 'lineup',
      'caro', 'sudoku', 'throw', 'photo_hunt', 'decorate', 'mailbox_build'];
    q.steps.push(...games.map((name, i): Step => ({
      id: `${q.id}.s${i + 10}`, kind: 'minigame', game: `mg_${name}`, level: 'min',
    })));
    const r = validateContent(p, makeConfig());
    expect([...r.errors, ...r.warnings]).toEqual([]);
  });

  it.each(['test', 'production'] as const)('mã lạ ở %s ghi rõ mã trò và bước, đúng mức độ', environment => {
    const p = makePack(), q = p.quests[0];
    const id = q.id + '.s04';
    q.steps.push({ id, kind: 'minigame', game: 'mg_typo', level: 'min' });
    const r = validateContent(p, makeConfig({ environment }));
    const issues = (environment === 'production' ? r.errors : r.warnings).filter(e => e.code === 'minigame_unknown_id');
    expect(issues).toEqual([{ code: 'minigame_unknown_id', id, message: expect.stringContaining('mg_typo') }]);
    expect((environment === 'production' ? r.warnings : r.errors).some(e => e.code === 'minigame_unknown_id')).toBe(false);
  });

  it('báo từng quest AI phát hành đúng một lần, bỏ qua Side/Daily đã gỡ khỏi các Trang', () => {
    const p = makePack(), prod = makeConfig({ environment: 'production' });
    const blocked = () => validateContent(p, prod).errors.filter(e => e.code === 'placeholder_in_production');
    const initial = blocked();
    expect(initial.map(e => e.id).sort()).toEqual(p.quests.map(q => q.id).sort());
    const report = formatReport({ errors: initial, warnings: [] });
    for (const q of p.quests) expect(report).toContain(q.id);
    for (const day of p.days) { day.side_quests = []; day.daily_pool = []; }
    for (const q of p.quests) if (q.type !== 'side' && q.type !== 'daily') q.ownership_label = 'HUMAN_CANON';
    expect(validateContent(p, prod).errors).toEqual([]);
    p.days[0].side_quests = ['q_m1_side_01'];
    p.quests.find(q => q.type === 'side')!.ownership_label = 'HUMAN_DRAFT';
    expect(validateContent(p, prod).errors).toEqual([]);
    p.quests[0].ownership_label = 'HUMAN_DRAFT';
    expect(blocked().map(e => e.id)).toEqual([p.quests[0].id]);
  });
});
