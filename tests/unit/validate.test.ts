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

  it('production chấp nhận bốn màn 2D Mốc 2 và báo lỗi cho mã màn viết sai', () => {
    const p = makePack(), q = p.quests[0];
    const screens = ['mg_screen_confession', 'mg_screen_letter_write', 'mg_screen_letter_read', 'mg_screen_three_gates'];
    q.steps.push(...screens.map((game, i): Step => ({
      id: `${q.id}.s${i + 10}`, kind: 'minigame', game, level: 'min',
    })));
    const typo = { id: q.id + '.s14', kind: 'minigame', game: 'mg_screen_three_gate', level: 'min' } as const;
    q.steps.push(typo);
    const r = validateContent(p, makeConfig({ environment: 'production' }));
    expect(r.errors.filter(e => e.code === 'minigame_unknown_id')).toEqual([
      { code: 'minigame_unknown_id', id: typo.id, message: expect.stringContaining(typo.game) },
    ]);
    expect(r.warnings.filter(e => e.code === 'minigame_unknown_id')).toEqual([]);
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

describe('R-D0 — hợp đồng trình bày (thẻ chữ, lời dẫn, đạo diễn, ảnh, gom, chọn, tên khu)', () => {
  const P = '[PLACEHOLDER]';
  const errs = (p: ReturnType<typeof makePack>) => validateContent(p, makeConfig()).errors;
  const main = (p: ReturnType<typeof makePack>) => p.quests.find((q) => q.id === 'q_m1_main_01')!;

  it('dữ liệu mới hợp lệ (marker thật của map_thcs, máy ảnh của Ngày, preset thời tiết có thật) → không lỗi', () => {
    const p = makePack();
    const s0 = main(p).steps[0];
    Object.assign(s0, {
      title_card: { title: `${P} Ngày đầu lớp 6`, subtitle: `${P} Một buổi sáng tháng Chín, năm 2014` },
      narrative: { before: [{ id: 'narr_x', text: `${P} Một tiếng "bịch" vang lên phía sau.`, sfx: 'sfx_book_drop' }], after: [{ channel: 'world_event', text: `${P} Nắng chuyển vàng.` }] },
      stage: [
        { cue: 'move', actor: 'NPC_A', to: 'spot.thcs.yard_group_1', pace: 'run', wait: true },
        { cue: 'face', actor: 'NPC_A', toward: 'player', at: { line: 0 } },
        { cue: 'face', actor: 'NPC_B', toward: 'itr.thcs.flagpole' },
        { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: 'end' },
        { cue: 'visible', actor: 'NPC_B', visible: false },
        { cue: 'prop', actor: 'player', prop: 'prop.notebook' },
        { cue: 'camera', camera_id: 'cam.d0601.desk', dolly_ms: 900 },
        { cue: 'camera', camera_id: null },
        { cue: 'weather', preset: 'rain_shower', tween_s: 2 },
        { cue: 'sfx', sfx: 'sfx_book_drop' },
      ],
    });
    p.days[0].zone_name_overrides = [{ zone_id: 'zone.thcs.yard', name: `${P} Góc sân sau`, until_step: 'q_m1_main_01.s02' }];
    expect(errs(p)).toEqual([]);
  });

  it('cue sai: marker không có, máy ảnh không có, vai chưa đặt, dòng vượt số thoại, preset lạ, ẩn người chơi', () => {
    const p = makePack();
    main(p).steps[0].stage = [
      { cue: 'move', actor: 'NPC_A', to: 'spot.thcs.khong_co' },
      { cue: 'face', actor: 'NPC_A', toward: 'spot.thcs.cung_khong_co' },
      { cue: 'camera', camera_id: 'cam.d0601.khong_co' },
      { cue: 'motion', actor: 'NPC_D', motion: 'cheer' },
      { cue: 'motion', actor: 'NPC_A', motion: 'talk', at: { line: 5 } },
      { cue: 'weather', preset: 'bao_tuyet' },
      { cue: 'visible', actor: 'player', visible: false },
    ];
    const c = codes(validateContent(p, makeConfig()));
    expect(c).toEqual(expect.arrayContaining([
      'missing_marker:spot.thcs.khong_co', 'missing_marker:spot.thcs.cung_khong_co', 'missing_ref:cam.d0601.khong_co',
      'actor_not_placed:NPC_D', 'stage_bad_line:q_m1_main_01.s01', 'missing_ref:bao_tuyet', 'stage_bad_cue:q_m1_main_01.s01',
    ]));
  });

  it('ảnh: lời nhắc nhiều hơn số lần chụp, thoại đếm ngược ở ảnh không hẹn giờ → lỗi', () => {
    const p = makePack();
    const q = main(p);
    q.steps.push({ id: 'q_m1_main_01.s09', kind: 'photo', mode: 'handheld', camera_id: 'cam.d0601.desk', subjects: ['NPC_A'], album_entry_id: p.album_entries[0].id, shots: 2,
      shot_prompts: [`${P} 1`, `${P} 2`, `${P} 3`], countdown_lines: [{ speaker: 'NPC_A', text: `${P} Ba… hai…` }] });
    const c = codes(validateContent(p, makeConfig()));
    expect(c.filter((x) => x === 'bad_photo:q_m1_main_01.s09')).toHaveLength(2);
  });

  it('thoại đếm ngược / sau ảnh lọc theo flag phải có fallback (rỗng = bỏ dòng)', () => {
    const p = makePack();
    const q = main(p);
    const when = { flag: 'm1.group_photo_style', equals: 'playful' } as const;
    q.steps.push({ id: 'q_m1_main_01.s09', kind: 'photo', mode: 'timer', camera_id: 'cam.d0601.desk', subjects: ['NPC_A'], album_entry_id: p.album_entries[0].id,
      countdown_lines: [{ speaker: 'NPC_A', text: `${P} Làm mặt hề!`, when }], after_lines: [{ speaker: 'NPC_A', text: `${P} Khoan!`, when, fallback: '' }] });
    expect(codes(validateContent(p, makeConfig()))).toContain('callback_without_fallback:q_m1_main_01.s09');
    (q.steps.at(-1) as Extract<Step, { kind: 'photo' }>).countdown_lines![0].fallback = '';
    expect(codes(validateContent(p, makeConfig()))).not.toContain('callback_without_fallback:q_m1_main_01.s09');
  });

  it('gom: lines_by_target chỉ nhận điểm có trong targets; chọn: phản ứng theo lựa chọn kiểm người nói', () => {
    const p = makePack();
    const q = main(p);
    q.steps.push({ id: 'q_m1_main_01.s09', kind: 'collect', item: 'survey', targets: ['itr.thcs.desk', 'itr.thcs.board'], count: 2,
      lines_by_target: { 'itr.thcs.desk': [{ speaker: 'NPC_A', text: `${P} ✓` }], 'itr.thcs.la': [{ speaker: 'NPC_A', text: `${P} ?` }] } });
    const choice = q.steps.find((s) => s.kind === 'choice') as Extract<Step, { kind: 'choice' }>;
    choice.options[0].lines = [{ speaker: 'NPC_Z', text: `${P} ồ` }];
    const c = codes(validateContent(p, makeConfig()));
    expect(c).toContain('missing_ref:itr.thcs.la');
    expect(c).toContain('missing_ref:NPC_Z');
  });

  it('AI_PROPOSED: chữ ở thẻ chữ / lời dẫn / lời nhắc chụp cũng phải ghi [PLACEHOLDER]', () => {
    const p = makePack();
    main(p).steps[0].title_card = { title: 'Ngày đầu lớp 6' };
    expect(codes(validateContent(p, makeConfig()))).toContain('missing_placeholder_tag:q_m1_main_01.s01');
    main(p).steps[0].title_card = { title: `${P} Ngày đầu lớp 6` };
    main(p).steps[0].narrative = { before: [{ text: 'Tùng… tùng… tùng…' }] };
    expect(codes(validateContent(p, makeConfig()))).toContain('missing_placeholder_tag:q_m1_main_01.s01');
  });

  it('tên khu thay tạm: khu phải có trong bản đồ, until_step phải là bước của chính Ngày đó', () => {
    const p = makePack();
    p.days[0].zone_name_overrides = [
      { zone_id: 'zone.thcs.khong_co', name: 'X' },
      { zone_id: 'zone.thcs.yard', name: 'Y', until_step: 'q_m1_main_05.s01' },
      { zone_id: 'zone.thcs.yard', name: 'Z', until_step: 'q_m1_main_01.s99' },
    ];
    const c = codes(validateContent(p, makeConfig()));
    expect(c).toEqual(expect.arrayContaining(['missing_ref:zone.thcs.khong_co', 'bad_zone_override:q_m1_main_05.s01', 'missing_ref:q_m1_main_01.s99']));
  });

  it('mã minigame gấp thuyền mg_fold_boat (R-B5) được nhận cả ở production', () => {
    const p = makePack();
    main(p).steps[0] = { id: 'q_m1_main_01.s01', kind: 'minigame', game: 'mg_fold_boat' };
    const r = validateContent(p, makeConfig({ environment: 'production' }));
    expect(r.errors.map((e) => e.code)).not.toContain('minigame_unknown_id');
  });
});
