import { describe, expect, it } from 'vitest';
import { QuestEngine } from '../../src/systems/questEngine';
import { evalCondition } from '../../src/core/conditions';
import { EventBus, type GameEventName } from '../../src/core/eventBus';
import { MemoryKv, SaveStore, newSave, reconcileSave, type SaveState } from '../../src/core/save';
import { indexContent } from '../../src/content/indexContent';
import { validateContent } from '../../src/content/validate';
import type { ContentPack, Quest, Step } from '../../src/content/types';
import { makeConfig, makePack } from './fixtures/pack';

function setup(pack: ContentPack = makePack(), save: SaveState = newSave('a')) {
  const idx = indexContent(pack, makeConfig());
  const bus = new EventBus();
  const log: { name: GameEventName; p: Record<string, unknown> }[] = [];
  bus.onAny((name, p) => log.push({ name, p: p as Record<string, unknown> }));
  const engine = new QuestEngine({ idx, save, bus });
  const names = () => log.map((e) => e.name);
  const of = (n: GameEventName) => log.filter((e) => e.name === n).map((e) => e.p);
  return { idx, bus, save, engine, log, names, of };
}

/** Chơi hết chuỗi Main của Ngày 1 trong gói mẫu (talk → choice → interact). */
function playDay1Main(engine: QuestEngine, option = 'a') {
  expect(engine.trigger('interact', 'NPC_A')?.action).toBe('present');
  engine.complete('q_m1_main_01.s01');
  engine.complete('q_m1_main_01.s02', { option_id: option });
  engine.trigger('interact', 'itr.thcs.desk');
}

describe('điều kiện', () => {
  const ctx = { flag: (n: string) => ({ 'm1.a': true, 'm1.b': 'x', 'm1.c': false } as Record<string, string | boolean>)[n], questCompleted: (q: string) => q === 'q1', dayCompleted: (d: string) => d === 'd1' };
  it('flag / quest / day', () => {
    expect(evalCondition({ flag: 'm1.a' }, ctx)).toBe(true);
    expect(evalCondition({ flag: 'm1.c' }, ctx)).toBe(false);
    expect(evalCondition({ flag: 'm1.zzz' }, ctx)).toBe(false);
    expect(evalCondition({ flag: 'm1.b', equals: 'x' }, ctx)).toBe(true);
    expect(evalCondition({ flag: 'm1.b', equals: 'y' }, ctx)).toBe(false);
    expect(evalCondition({ quest: 'q1' }, ctx)).toBe(true);
    expect(evalCondition({ day: 'd2' }, ctx)).toBe(false);
    expect(evalCondition(undefined, ctx)).toBe(true);
  });
  it('all cần mọi nhánh, any cần một nhánh', () => {
    expect(evalCondition({ all: [{ flag: 'm1.a' }, { quest: 'q1' }] }, ctx)).toBe(true);
    expect(evalCondition({ all: [{ flag: 'm1.a' }, { quest: 'q2' }] }, ctx)).toBe(false);
    expect(evalCondition({ any: [{ flag: 'm1.zzz' }, { day: 'd1' }] }, ctx)).toBe(true);
    expect(evalCondition({ any: [{ flag: 'm1.zzz' }, { day: 'd9' }] }, ctx)).toBe(false);
    expect(evalCondition({ all: [{ any: [{ quest: 'q2' }, { quest: 'q1' }] }, { flag: 'm1.b', equals: 'x' }] }, ctx)).toBe(true);
  });
});

describe('QuestEngine — Ngày ký ức', () => {
  it('vào Ngày: quest Main đầu tiên active ở bước đầu, Ngày in_progress', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    expect(t.save.days['d.g06.01'].state).toBe('in_progress');
    expect(t.engine.questState('q_m1_main_01')).toBe('active');
    expect(t.engine.mainStep()?.step.id).toBe('q_m1_main_01.s01');
    expect(t.save.current).toMatchObject({ memory_day_id: 'd.g06.01', quest_id: 'q_m1_main_01', step_id: 'q_m1_main_01.s01' });
    expect(t.names()).toEqual(expect.arrayContaining(['day_started', 'quest_started', 'step_activated']));
  });

  it('tương tác sai chỗ / hoàn thành sai bước → không có gì xảy ra', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    expect(t.engine.trigger('interact', 'itr.thcs.desk')).toBeNull();
    expect(t.engine.complete('q_m1_main_01.s02', { option_id: 'a' })).toBe(false);
    expect(t.engine.complete('không_có')).toBe(false);
    expect(t.engine.mainStep()?.step.id).toBe('q_m1_main_01.s01');
  });

  it('choice: bắt buộc có lựa chọn hợp lệ; ghi flag + đếm sắc thái + phát choice_made', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    expect(t.engine.complete('q_m1_main_01.s02')).toBe(false);
    expect(t.engine.complete('q_m1_main_01.s02', { option_id: 'zzz' })).toBe(false);
    expect(t.engine.complete('q_m1_main_01.s02', { option_id: 'b' })).toBe(true);
    expect(t.save.flags['m1.greet']).toBe('gentle');
    expect(t.save.relationships['chr_duc'].tone_counts).toEqual({ playful: 0, gentle: 1, deep: 0 });
    expect(t.of('choice_made')[0]).toMatchObject({ choice_id: 'c_m1_01', option_id: 'b', tone: 'gentle', measured: true, is_replay: false });
  });

  it('xong chuỗi Main, không còn Side mở → Ngày completed', () => {
    const pack = makePack();
    pack.days[0].side_quests = [];
    pack.album_entries = pack.album_entries.filter((e) => e.id !== 'alb.d.g06.01.04');
    pack.pdes = pack.pdes.filter((p) => p.id !== 'pde_03');
    pack.quests = pack.quests.filter((q) => q.id !== 'q_m1_side_01');
    pack.fragments = pack.fragments.filter((f) => f.id !== 'frag.d.g06.01.04');
    const t = setup(pack);
    t.engine.startDay('d.g06.01');
    playDay1Main(t.engine);
    expect(t.save.days['d.g06.01'].state).toBe('completed');
    expect(t.engine.phase).toBe('ended');
    expect(t.save.current.memory_day_id).toBeNull();
    expect(t.of('day_completed')).toEqual([{ day_id: 'd.g06.01', is_replay: false }]);
    // Daily chưa làm → missed
    expect(t.save.quests['q_m1_daily_01@d.g06.01'].state).toBe('missed');
  });

  it('Side không chặn Main; còn Side mở → lời nhắc kết ngày; Đi tiếp → Side thành missed', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    expect(t.engine.questState('q_m1_side_01')).toBe('available');
    playDay1Main(t.engine);
    expect(t.engine.phase).toBe('end_prompt');
    expect(t.of('day_end_prompt')[0]).toEqual({ day_id: 'd.g06.01', open_side_quests: ['q_m1_side_01'] });
    expect(t.save.days['d.g06.01'].state).toBe('in_progress');
    t.engine.answerEndPrompt('leave');
    expect(t.of('day_end_answered')[0]).toMatchObject({ answer: 'leave', open_side_quests: 1 });
    expect(t.engine.questState('q_m1_side_01')).toBe('missed');
    expect(t.save.days['d.g06.01'].state).toBe('completed');
  });

  it('Ở lại → làm Side rồi tự kết Ngày bằng requestEndDay', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    playDay1Main(t.engine);
    t.engine.answerEndPrompt('stay');
    expect(t.engine.phase).toBe('free_after_main');
    expect(t.engine.trigger('interact', 'NPC_B')?.action).toBe('present');
    expect(t.engine.questState('q_m1_side_01')).toBe('active');
    t.engine.complete('q_m1_side_01.s01');
    expect(t.engine.trigger('arrive', 'itr.thcs.tree')?.action).toBe('completed');
    expect(t.engine.questState('q_m1_side_01')).toBe('completed');
    t.engine.requestEndDay();
    expect(t.save.days['d.g06.01'].state).toBe('completed');
    expect(t.of('quest_completed').map((e) => e.quest_id)).toEqual(['q_m1_main_01', 'q_m1_side_01']);
  });

  it('Side có điều kiện: locked cho tới khi flag có', () => {
    const pack = makePack();
    pack.quests.find((q) => q.id === 'q_m1_side_01')!.available_when = { all: [{ flag: 'm1.greet', equals: 'deep' }] };
    const t = setup(pack);
    t.engine.startDay('d.g06.01');
    expect(t.engine.questState('q_m1_side_01')).toBe('locked');
    expect(t.engine.trigger('interact', 'NPC_B')).toBeNull();
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    t.engine.complete('q_m1_main_01.s02', { option_id: 'c' });
    expect(t.engine.questState('q_m1_side_01')).toBe('available');
  });

  it('Daily: 1 lần mỗi Ngày, sang Ngày khác làm lại được', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    expect(t.engine.trigger('interact', 'itr.thcs.board')?.action).toBe('completed');
    expect(t.engine.questState('q_m1_daily_01')).toBe('completed');
    expect(t.engine.trigger('interact', 'itr.thcs.board')).toBeNull();
    playDay1Main(t.engine); t.engine.answerEndPrompt('leave');
    t.engine.startDay('d.g07.03');
    expect(t.engine.questState('q_m1_daily_01')).toBe('available');
    expect(t.engine.trigger('interact', 'itr.thcs.board')?.action).toBe('completed');
    expect(t.save.quests['q_m1_daily_01@d.g06.01'].state).toBe('completed');
    expect(t.save.quests['q_m1_daily_01@d.g07.03'].state).toBe('completed');
  });

  it('chuỗi Main nhiều quest: tuyến tính, quest sau chỉ mở khi quest trước xong', () => {
    const pack = makePack();
    const second: Quest = {
      ...pack.quests[0], id: 'q_m1_main_02',
      steps: [{ id: 'q_m1_main_02.s01', kind: 'goto', target: 'itr.thcs.tree' }],
    };
    pack.quests.push(second);
    pack.days[0].main_chain = ['q_m1_main_01', 'q_m1_main_02'];
    pack.days[0].side_quests = [];
    const t = setup(pack);
    t.engine.startDay('d.g06.01');
    expect(t.engine.questState('q_m1_main_02')).toBe('locked');
    expect(t.engine.trigger('arrive', 'itr.thcs.tree')).toBeNull();
    playDay1Main(t.engine);
    expect(t.engine.questState('q_m1_main_02')).toBe('active');
    expect(t.save.days['d.g06.01'].state).toBe('in_progress');
    t.engine.trigger('arrive', 'itr.thcs.tree');
    expect(t.save.days['d.g06.01'].state).toBe('completed');
  });

  it('không có trạng thái thất bại', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    playDay1Main(t.engine); t.engine.answerEndPrompt('leave');
    const states = new Set(Object.values(t.save.quests).map((r) => r.state));
    for (const s of states) expect(['locked', 'available', 'active', 'completed', 'missed']).toContain(s);
  });
});

describe('QuestEngine — từng kiểu bước', () => {
  /** Một quest Main chứa đủ 14 kiểu bước. */
  function allKindsPack() {
    const pack = makePack();
    const id = 'q_m1_main_01';
    const steps: Step[] = [
      { id: `${id}.s01`, kind: 'talk', with: 'NPC_A', lines: [{ speaker: 'NPC_A', text: '[PLACEHOLDER] a' }] },
      { id: `${id}.s02`, kind: 'goto', target: 'itr.thcs.tree' },
      { id: `${id}.s03`, kind: 'interact', target: 'itr.thcs.desk' },
      { id: `${id}.s04`, kind: 'interact', target: 'itr.thcs.board', lines: [{ speaker: 'narrator', text: '[PLACEHOLDER] b' }] },
      { id: `${id}.s05`, kind: 'choice', choice_id: 'c_all', options: [{ id: 'x', text: '[PLACEHOLDER] x', set_flags: { 'm1.pick': 'x' } }, { id: 'y', text: '[PLACEHOLDER] y' }] },
      { id: `${id}.s06`, kind: 'collect', item: 'PRP_LEAF', targets: ['itr.thcs.desk', 'itr.thcs.board', 'itr.thcs.tree'], count: 2 },
      { id: `${id}.s07`, kind: 'place', item: 'PRP_LEAF', target: 'itr.thcs.desk' },
      { id: `${id}.s08`, kind: 'photo', mode: 'handheld', camera_id: 'cam.d0601.desk', subjects: ['NPC_A'], album_entry_id: 'alb.d.g06.01.01' },
      { id: `${id}.s09`, kind: 'minigame', game: 'boat', level: 'min' },
      { id: `${id}.s10`, kind: 'cutscene', lines: [{ speaker: 'narrator', text: '[PLACEHOLDER] c' }] },
      { id: `${id}.s11`, kind: 'free', prompt: '[PLACEHOLDER] dạo chơi' },
      { id: `${id}.s12`, kind: 'setFlag', flag: 'm1.auto', value: 7 },
      { id: `${id}.s13`, kind: 'phone_ui', screen: 'group_chat', thread_id: 'thread.group' },
      { id: `${id}.s14`, kind: 'compose_message', thread_id: 'thread.group', openers: [{ id: 'a', tone: 'playful', text: '[PLACEHOLDER] 1' }, { id: 'b', tone: 'gentle', text: '[PLACEHOLDER] 2' }] },
      { id: `${id}.s15`, kind: 'album_restore', page_id: 'page.d.g06.01' },
    ];
    pack.quests[0].steps = steps;
    pack.quests[0].parts = [{ id: 'part2', title: '[PLACEHOLDER] phần 2', first_step_id: `${id}.s09` }];
    pack.album_entries[0].snapshot = { camera_id: 'cam.d0601.desk', at_step_id: `${id}.s03` };
    pack.days[0].side_quests = []; pack.days[0].daily_pool = [];
    return pack;
  }

  it('gói đủ kiểu bước hợp lệ theo validator', () => {
    expect(validateContent(allKindsPack(), makeConfig()).errors).toEqual([]);
  });

  it('đi qua đủ 14 kiểu bước', () => {
    const t = setup(allKindsPack());
    const e = t.engine, id = 'q_m1_main_01';
    const at = () => e.mainStep()?.step.id;
    e.startDay('d.g06.01');
    // talk: phải nói chuyện đúng người, rồi UI báo xong thoại
    expect(e.trigger('interact', 'NPC_B')).toBeNull();
    expect(e.trigger('interact', 'NPC_A')).toMatchObject({ action: 'present' });
    expect(at()).toBe(`${id}.s01`);
    e.complete(`${id}.s01`);
    // goto: tới nơi là xong; tương tác không tính
    expect(e.trigger('interact', 'itr.thcs.tree')).toBeNull();
    expect(e.trigger('arrive', 'itr.thcs.tree')).toMatchObject({ action: 'completed' });
    // interact không thoại: xong ngay
    expect(e.trigger('interact', 'itr.thcs.desk')).toMatchObject({ action: 'completed' });
    // interact có thoại: chờ UI
    expect(e.trigger('interact', 'itr.thcs.board')).toMatchObject({ action: 'present' });
    e.complete(`${id}.s04`);
    // choice nội dung (không sắc thái)
    e.complete(`${id}.s05`, { option_id: 'x' });
    expect(t.save.flags['m1.pick']).toBe('x');
    expect(t.of('choice_made')[0]).toMatchObject({ tone: null });
    // collect: 2 trong 3 điểm, cùng một điểm không tính hai lần
    expect(e.trigger('interact', 'itr.thcs.desk')).toMatchObject({ action: 'progress' });
    expect(e.trigger('interact', 'itr.thcs.desk')).toBeNull();
    expect(t.of('step_progress')[0]).toMatchObject({ done: 1, total: 2 });
    expect(e.trigger('interact', 'itr.thcs.tree')).toMatchObject({ action: 'completed' });
    // place
    expect(e.trigger('interact', 'itr.thcs.desk')).toMatchObject({ action: 'completed' });
    // photo / minigame / cutscene / free: UI báo xong
    expect(e.trigger('interact', 'itr.thcs.desk')).toBeNull();
    e.complete(`${id}.s08`);
    expect(t.of('part_started')).toEqual([{ quest_id: id, part_id: 'part2' }]);
    e.complete(`${id}.s09`);
    e.complete(`${id}.s10`);
    e.complete(`${id}.s11`);
    // setFlag tự chạy khi tới lượt
    expect(t.save.flags['m1.auto']).toBe(7);
    expect(at()).toBe(`${id}.s13`);
    e.complete(`${id}.s13`);
    // compose_message: cần chọn cách mở lời; lưu bằng ID, không lưu chữ
    expect(e.complete(`${id}.s14`)).toBe(false);
    e.complete(`${id}.s14`, { option_id: 'b' });
    expect(t.save.phone['thread.group']).toEqual([{ kind: 'sent', step_id: `${id}.s14`, option_id: 'b' }]);
    expect(t.of('message_sent')[0]).toEqual({ quest_id: id, step_id: `${id}.s14`, tone: 'gentle' });
    e.complete(`${id}.s15`);
    expect(e.questState(id)).toBe('completed');
    expect(t.of('step_completed').map((s) => s.kind)).toEqual(['talk', 'goto', 'interact', 'interact', 'choice', 'collect', 'place', 'photo', 'minigame', 'cutscene', 'free', 'setFlag', 'phone_ui', 'compose_message', 'album_restore']);
  });
});

describe('QuestEngine — checkpoint', () => {
  it('lưu ở ranh giới bước → nạp lại quay về đúng bước đang dở', () => {
    const kv = new MemoryKv();
    const store = new SaveStore(kv, () => 'a');
    const t = setup(makePack(), store.load().save);
    t.bus.on('save_requested', () => store.persist(t.save));
    t.engine.startDay('d.g06.01');
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    // "tải lại trang" giữa bước s02
    const loaded = new SaveStore(kv, () => 'b').load();
    expect(loaded.status).toBe('loaded');
    const t2 = setup(makePack(), reconcileSave(loaded.save, indexContent(makePack(), makeConfig())));
    expect(t2.engine.resume()).toBe('day');
    expect(t2.engine.mainStep()?.step.id).toBe('q_m1_main_01.s02');
    expect(t2.of('step_activated').at(-1)).toMatchObject({ step_id: 'q_m1_main_01.s02', resumed: true });
    expect(t2.of('day_started')[0]).toMatchObject({ resumed: true });
    t2.engine.complete('q_m1_main_01.s02', { option_id: 'a' });
    expect(t2.engine.mainStep()?.step.id).toBe('q_m1_main_01.s03');
  });

  it('nạp lại khi đang ở lời nhắc kết ngày → hiện lại lời nhắc', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    playDay1Main(t.engine);
    const t2 = setup(makePack(), JSON.parse(JSON.stringify(t.save)));
    t2.engine.resume();
    expect(t2.engine.phase).toBe('end_prompt');
    expect(t2.of('day_end_prompt')).toHaveLength(1);
  });

  it('không có Ngày đang dở → resume trả "hub"', () => {
    expect(setup().engine.resume()).toBe('hub');
  });
});

describe('QuestEngine — chơi lại', () => {
  function finishedDay1() {
    const t = setup();
    t.engine.startDay('d.g06.01');
    playDay1Main(t.engine, 'a');
    t.engine.answerEndPrompt('leave');
    t.log.length = 0;
    return t;
  }

  it('chỉ chơi lại được Ngày đã xong', () => {
    const t = setup();
    expect(() => t.engine.startDay('d.g06.01', { replay: true })).toThrow();
  });

  it('không đổi flag câu chuyện và số đếm sắc thái; mọi event có is_replay=true', () => {
    const t = finishedDay1();
    t.engine.startDay('d.g06.01', { replay: true });
    playDay1Main(t.engine, 'c');
    expect(t.save.flags['m1.greet']).toBe('playful');
    expect(t.save.relationships['chr_duc'].tone_counts).toEqual({ playful: 1, gentle: 0, deep: 0 });
    expect(t.of('choice_made')[0]).toMatchObject({ option_id: 'c', is_replay: true });
    for (const n of ['day_started', 'quest_started', 'step_completed', 'quest_completed'] as const) {
      expect(t.of(n).every((e) => e.is_replay === true)).toBe(true);
    }
  });

  it('làm được Side đã lỡ; xong thì Side thành completed trong câu chuyện; Ngày vẫn completed + replayed', () => {
    const t = finishedDay1();
    expect(t.save.quests['q_m1_side_01'].state).toBe('missed');
    t.engine.startDay('d.g06.01', { replay: true });
    expect(t.engine.questState('q_m1_side_01')).toBe('available');
    t.engine.trigger('interact', 'NPC_B'); t.engine.complete('q_m1_side_01.s01');
    t.engine.trigger('arrive', 'itr.thcs.tree');
    playDay1Main(t.engine);
    expect(t.engine.phase).toBe('ended');
    expect(t.save.quests['q_m1_side_01'].state).toBe('completed');
    expect(t.save.days['d.g06.01']).toEqual({ state: 'completed', replayed: true });
    expect(t.save.current.replay).toBeNull();
    expect(t.of('day_completed')).toEqual([{ day_id: 'd.g06.01', is_replay: true }]);
  });

  it('bỏ dở lượt chơi lại (về Hub) → câu chuyện không đổi', () => {
    const t = finishedDay1();
    const before = JSON.stringify({ q: t.save.quests, f: t.save.flags, d: t.save.days });
    t.engine.startDay('d.g06.01', { replay: true });
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    t.engine.abandonReplay();
    expect(JSON.stringify({ q: t.save.quests, f: t.save.flags, d: t.save.days })).toBe(before);
    expect(t.save.current.replay).toBeNull();
  });
});

describe('QuestEngine — Hub', () => {
  it('lần đầu vào Hub: quest mở đầu active; quest liên lạc khóa cho tới khi được mở', () => {
    const t = setup();
    t.engine.enterHub();
    expect(t.engine.questState('q_hub_pd_01')).toBe('active');
    expect(t.engine.questState('q_hub_pd_02')).toBe('locked');
    t.engine.complete('q_hub_pd_01.s01');
    expect(t.engine.trigger('interact', 'itr.hub.memory_box')?.action).toBe('completed');
    expect(t.engine.questState('q_hub_pd_01')).toBe('completed');
    t.engine.unlockQuest('q_hub_pd_02');
    expect(t.engine.questState('q_hub_pd_02')).toBe('active');
    expect(t.engine.activeSteps().map((s) => s.step.id)).toEqual(['q_hub_pd_02.s01']);
  });

  it('quest pd có available_when tự active khi điều kiện đạt', () => {
    const pack = makePack();
    pack.quests.find((q) => q.id === 'q_hub_pd_02')!.available_when = { day: 'd.g06.01' };
    const t = setup(pack);
    t.engine.enterHub();
    expect(t.engine.questState('q_hub_pd_02')).toBe('locked');
    t.save.days['d.g06.01'] = { state: 'completed', replayed: false };
    t.engine.enterHub();
    expect(t.engine.questState('q_hub_pd_02')).toBe('active');
  });
});

describe('QuestEngine — truy vấn cho cảnh 3D và menu', () => {
  it('peek: biết trước tương tác có tác dụng không, mà không đổi trạng thái', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    const before = JSON.stringify(t.save);
    expect(t.engine.peek('interact', 'NPC_A')).toBe(true);        // bước Main
    expect(t.engine.peek('interact', 'NPC_B')).toBe(true);        // Side đang available
    expect(t.engine.peek('interact', 'itr.thcs.desk')).toBe(false);
    expect(t.engine.peek('arrive', 'NPC_A')).toBe(false);
    expect(JSON.stringify(t.save)).toBe(before);
  });
  it('targetsOfInterest: đích của bước đang chờ + bước đầu của Side/Daily đang mở', () => {
    const t = setup();
    t.engine.startDay('d.g06.01');
    expect(t.engine.targetsOfInterest().sort()).toEqual(['NPC_A', 'NPC_B', 'itr.thcs.board']);
    t.engine.trigger('interact', 'itr.thcs.board');
    expect(t.engine.targetsOfInterest().sort()).toEqual(['NPC_A', 'NPC_B']);
  });
  it('restartDay: chơi lại Ngày đang dở từ đầu — flag và số đếm sắc thái quay về lúc vào Ngày', () => {
    const t = setup();
    t.save.flags['m1.before'] = 'giữ';
    t.engine.startDay('d.g06.01');
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    t.engine.complete('q_m1_main_01.s02', { option_id: 'b' });
    expect(t.save.relationships['chr_duc'].tone_counts.gentle).toBe(1);
    expect(t.engine.restartDay()).toBe(true);
    expect(t.engine.mainStep()?.step.id).toBe('q_m1_main_01.s01');
    expect(t.save.flags).toEqual({ 'm1.before': 'giữ' });
    expect(t.save.relationships['chr_duc']?.tone_counts.gentle ?? 0).toBe(0);
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    t.engine.complete('q_m1_main_01.s02', { option_id: 'b' });
    expect(t.save.relationships['chr_duc'].tone_counts.gentle).toBe(1);
  });
  it('restartDay khi không ở trong Ngày → không làm gì', () => {
    expect(setup().engine.restartDay()).toBe(false);
  });
});
