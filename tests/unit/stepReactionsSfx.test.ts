import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';

if (typeof document === 'undefined') {
  const noop = () => {};
  const ctx = {
    canvas: null as unknown,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    fillText: noop,
    strokeText: noop,
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    quadraticCurveTo: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    bezierCurveTo: noop,
    arc: noop,
    stroke: noop,
    fill: noop,
    closePath: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  };
  (globalThis as unknown as { document: unknown }).document = {
    createElement: (tag: string) => {
      if (tag !== 'canvas') return {};
      const canvas = { width: 512, height: 256, getContext: () => ctx };
      ctx.canvas = canvas;
      return canvas;
    },
  };
}

import { indexContent } from '../../src/content/indexContent';
import type { DialogueLine, Step } from '../../src/content/types';
import { EventBus } from '../../src/core/eventBus';
import { newSave } from '../../src/core/save';
import { createStepHooks } from '../../src/game/runtime/stepHooks';
import { createStepReactions } from '../../src/game/runtime/stepReactions';
import { KNOWN_SFX_CUES, playSfx } from '../../src/game/sfx';
import { QuestEngine } from '../../src/systems/questEngine';
import { createUiStore } from '../../src/ui/game/store';
import type { DressingCtx } from '../../src/world/dressing';
import m1BaseSet from '../../src/world/dressing/sets/m1_base';
import m1CommonSet from '../../src/world/dressing/sets/m1_common';
import m1Trang2Set from '../../src/world/dressing/sets/m1_trang2';
import { makeStrandedPaperBoat } from '../../src/world/props/m1/paperBoats';
import type { Marker, MarkerKind } from '../../src/world/types';
import { makeConfig, makePack } from './fixtures/pack';

function makeCollectPack(opts: { showCounter?: boolean } = {}) {
  const pack = makePack();
  const baseDay = {
    ...pack.days[1],
    id: 'd.g07.02',
    title: '[PLACEHOLDER] Trang 3',
    anchor_artifact_id: 'art_m1_03',
    main_chain: ['q_m1_main_03'],
    side_quests: [],
    daily_pool: [],
    interactables: [
      { id: 'itr.thcs.base_survey_roof', label: '[PLACEHOLDER] Mái che', position: [45.3, -32.2] as [number, number], kind: 'marker' as const },
      { id: 'itr.thcs.base_survey_stump', label: '[PLACEHOLDER] Gốc cây', position: [41, -25] as [number, number], kind: 'marker' as const },
      { id: 'itr.thcs.base_survey_boxes', label: '[PLACEHOLDER] Thùng giấy', position: [49.5, -26] as [number, number], kind: 'marker' as const },
    ],
    cameras: [{ id: 'cam.d0702.base', position: [45, 1.7, -23.5] as [number, number, number], look_at: [45, 1.6, -30.5] as [number, number, number] }],
    album_page_id: 'page.d.g07.02',
    weather_by_step: {
      'q_m1_main_03.s03': 'after_rain_rainbow',
    },
  };
  pack.days.push(baseDay);
  pack.artifacts.push({
    id: 'art_m1_03',
    name: '[PLACEHOLDER] Biển tên',
    school_year_id: 'g07',
    hook_2026: '[PLACEHOLDER] hook',
    appear_when: { day: 'd.g06.01' },
    target_memory_day_id: 'd.g07.02',
    complete_when: 'day_completed',
    reward_fragment_ids: ['frag.d.g07.02.01'],
    album_entry_ids: ['alb.d.g07.02.01'],
  });
  pack.fragments.push({ id: 'frag.d.g07.02.01', memory_day_id: 'd.g07.02', kind: 'photo', media_spec: 'B' });
  pack.album_entries.push({
    id: 'alb.d.g07.02.01',
    page_id: 'page.d.g07.02',
    slot_type: 'main_photo',
    slot_index: 0,
    fragment_id: 'frag.d.g07.02.01',
    source: 'auto_snapshot',
    required_for_restore: true,
    snapshot: { camera_id: 'cam.d0702.base', at_step_id: 'q_m1_main_03.s03' },
  });
  pack.quests.push({
    id: 'q_m1_main_03',
    type: 'main',
    scope: 'm1',
    memory_day_id: 'd.g07.02',
    title: '[PLACEHOLDER] Căn cứ bí mật',
    owner: 'TBD',
    ownership_label: 'AI_PROPOSED',
    status: 'DRAFT',
    version: 'v0.1',
    blocks_main: true,
    steps: [
      {
        id: 'q_m1_main_03.s01',
        kind: 'collect',
        item: 'survey_spot',
        targets: ['itr.thcs.base_survey_roof', 'itr.thcs.base_survey_stump', 'itr.thcs.base_survey_boxes'],
        count: 3,
        show_counter: opts.showCounter,
        lines_by_target: {
          'itr.thcs.base_survey_roof': [{ speaker: 'NPC_A', text: '[PLACEHOLDER] Mái che còn chắc lắm.' }],
          'itr.thcs.base_survey_stump': [{ speaker: 'NPC_C', text: '[PLACEHOLDER] Gốc cây này ngồi mát nè.' }],
          'itr.thcs.base_survey_boxes': [{ speaker: 'NPC_B', text: '[PLACEHOLDER] Đống thùng này dọn đi là ổn.' }],
        },
      },
      {
        id: 'q_m1_main_03.s02',
        kind: 'choice',
        choice_id: 'c_m1_03_decor',
        options: [
          { id: 'paper', tone: 'playful', text: '[PLACEHOLDER] Giấy', set_flags: { 'm1.base_decor': 'paper' } },
          { id: 'flowers', tone: 'gentle', text: '[PLACEHOLDER] Hoa', set_flags: { 'm1.base_decor': 'flowers' } },
          { id: 'photos', tone: 'deep', text: '[PLACEHOLDER] Ảnh', set_flags: { 'm1.base_decor': 'photos' } },
        ],
      },
      { id: 'q_m1_main_03.s03', kind: 'cutscene', lines: [{ speaker: 'NPC_A', text: '[PLACEHOLDER] Xong.' }] },
    ],
  });
  const cfg = makeConfig({ release: { memory_day_ids: ['d.g06.01', 'd.g07.02', 'd.g07.03'], end_day_id: 'd.g07.03' } });
  return { pack, idx: indexContent(pack, cfg) };
}

function makeMockDressingCtx(
  dayId: string,
  opts: { flags?: Record<string, unknown>; markers?: Marker[]; bus?: EventBus } = {},
): DressingCtx & { bus?: EventBus; updates: ((dt: number, t: number) => void)[] } {
  const scene = new THREE.Scene();
  const updates: ((dt: number, t: number) => void)[] = [];
  const markers = opts.markers ?? [];
  return {
    scene,
    world: {
      marker: (kind: MarkerKind, id: string) => markers.find((m) => m.kind === kind && m.id === id) ?? null,
    } as unknown as DressingCtx['world'],
    dayId,
    decor: { phuongBloom: 0, puddles: true, scarf: true },
    flag: (name: string) => opts.flags?.[name],
    addUpdate: (fn) => { updates.push(fn); },
    bus: opts.bus,
    updates,
  };
}

describe('sfx.ts — tổng hợp WebAudio & an toàn headless (R-B4)', () => {
  const origAudioContext = (globalThis as { AudioContext?: unknown }).AudioContext;

  afterEach(() => {
    (globalThis as { AudioContext?: unknown }).AudioContext = origAudioContext;
  });

  it('hỗ trợ đủ 12 mã SFX yêu cầu và không lỗi khi thiếu AudioContext', () => {
    (globalThis as { AudioContext?: unknown }).AudioContext = undefined;
    const required = [
      'sfx_book_drop',
      'sfx_school_drum_3beats',
      'sfx_shuttle_kick',
      'sfx_chalk_wipe',
      'sfx_camera_shutter',
      'sfx_rain_pour',
      'sfx_summer_rain_thunder',
      'sfx_birds_after_rain',
      'sfx_tick',
      'sfx_message_sent',
      'sfx_paper_fold',
      'sfx_water_splash',
    ];
    for (const cue of required) {
      expect(KNOWN_SFX_CUES).toContain(cue);
      expect(() => playSfx(cue)).not.toThrow();
    }
    expect(() => playSfx('sfx_unknown_cue')).not.toThrow();
    expect(() => playSfx('')).not.toThrow();
  });

  it('bỏ qua im lặng nếu AudioContext ném lỗi khi khởi tạo', () => {
    (globalThis as { AudioContext?: unknown }).AudioContext = class {
      constructor() { throw new Error('AudioContext blocked'); }
    };
    expect(() => playSfx('sfx_tick')).not.toThrow();
  });
});

describe('stepReactions — collect lines_by_target, bộ đếm 0/3 và StageCue/event SFX (R-B4)', () => {
  it('phát lines_by_target theo từng điểm, SFX tick, và cập nhật bộ đếm 0/3 → 1/3 → 2/3 → 3/3 → null', async () => {
    const { idx } = makeCollectPack();
    const bus = new EventBus();
    const save = newSave('test');
    const engine = new QuestEngine({ idx, save, bus });
    const ui = createUiStore();
    const playedLines: DialogueLine[][] = [];
    const sfxLog: string[] = [];
    let releaseLastLine!: () => void;
    let chain = Promise.resolve();

    const queue = {
      enqueue(fn: () => Promise<void>) {
        chain = chain.then(fn);
        return chain;
      },
      async playLines(lines: DialogueLine[]) {
        playedLines.push(lines);
        if (playedLines.length === 3) {
          await new Promise<void>((r) => { releaseLastLine = r; });
        }
        return true;
      },
    };

    const reactions = createStepReactions({
      idx,
      bus,
      engine,
      ui,
      getQueue: () => queue,
      getDayScene: () => null,
      sfx: (c) => sfxLog.push(c),
    });

    const progressLog: { done: number; total: number; target?: string }[] = [];
    bus.on('step_progress', (e) => progressLog.push({ done: e.done, total: e.total, target: e.target }));

    engine.startDay('d.g07.02');
    expect(ui.get().collectProgress).toEqual({ done: 0, total: 3 });

    expect(engine.trigger('interact', 'itr.thcs.base_survey_roof')?.action).toBe('progress');
    expect(ui.get().collectProgress).toEqual({ done: 1, total: 3 });

    expect(engine.trigger('interact', 'itr.thcs.base_survey_stump')?.action).toBe('progress');
    expect(ui.get().collectProgress).toEqual({ done: 2, total: 3 });

    expect(engine.trigger('interact', 'itr.thcs.base_survey_boxes')?.action).toBe('completed');
    // Ở điểm 3/3, bộ đếm giữ 3/3 trong lúc thoại điểm cuối đang chạy
    expect(ui.get().collectProgress).toEqual({ done: 3, total: 3 });

    await new Promise((r) => setTimeout(r, 0));
    expect(playedLines.map((l) => l[0].text)).toEqual([
      '[PLACEHOLDER] Mái che còn chắc lắm.',
      '[PLACEHOLDER] Gốc cây này ngồi mát nè.',
      '[PLACEHOLDER] Đống thùng này dọn đi là ổn.',
    ]);
    expect(progressLog).toEqual([
      { done: 1, total: 3, target: 'itr.thcs.base_survey_roof' },
      { done: 2, total: 3, target: 'itr.thcs.base_survey_stump' },
      { done: 3, total: 3, target: 'itr.thcs.base_survey_boxes' },
    ]);
    expect(sfxLog).toEqual(['sfx_tick', 'sfx_tick', 'sfx_tick']);

    // Khi dòng thoại điểm 3 kết thúc, collectProgress tự xóa về null
    releaseLastLine();
    await chain;
    expect(ui.get().collectProgress).toBeNull();
    reactions.dispose();
  });

  it('không hiện bộ đếm khi show_counter: false', () => {
    const { idx } = makeCollectPack({ showCounter: false });
    const bus = new EventBus();
    const engine = new QuestEngine({ idx, save: newSave('test'), bus });
    const ui = createUiStore();
    const reactions = createStepReactions({
      idx, bus, engine, ui,
      getQueue: () => ({ enqueue: (fn) => fn(), playLines: async () => true }),
      getDayScene: () => null,
      sfx: () => {},
    });

    engine.startDay('d.g07.02');
    expect(ui.get().collectProgress).toBeNull();
    engine.trigger('interact', 'itr.thcs.base_survey_roof');
    expect(ui.get().collectProgress).toBeNull();
    reactions.dispose();
  });

  it('thực thi StageCue sfx, photo_attempt/photo_kept, và weather_by_step after_rain_rainbow', async () => {
    const { idx } = makeCollectPack();
    const bus = new EventBus();
    const engine = new QuestEngine({ idx, save: newSave('test'), bus });
    const ui = createUiStore();
    const sfxLog: string[] = [];
    const reactions = createStepReactions({
      idx, bus, engine, ui,
      getQueue: () => ({ enqueue: (fn) => fn(), playLines: async () => true }),
      getDayScene: () => null,
      sfx: (c) => sfxLog.push(c),
    });

    const hooks = createStepHooks([reactions]);
    const step: Step = {
      id: 'q_m1_main_03.s03',
      kind: 'cutscene',
      lines: [{ speaker: 'NPC_A', text: 'x' }, { speaker: 'NPC_B', text: 'y' }],
      stage: [
        { cue: 'sfx', sfx: 'sfx_book_drop' },
        { cue: 'sfx', sfx: 'sfx_school_drum_3beats', at: { line: 1 } },
        { cue: 'sfx', sfx: 'sfx_water_splash', at: 'end' },
      ],
    };
    await hooks.stage(step, 'start');
    await hooks.stage(step, { line: 0 });
    await hooks.stage(step, { line: 1 });
    await hooks.stage(step, 'end');

    bus.emit('photo_attempt', { step_id: 's07', mode: 'timer', retry_index: 0, all_in_frame: true, player_in_zone: true, posed_in_time: true });
    bus.emit('photo_kept', { step_id: 's07', mode: 'timer', retry_index: 0, all_in_frame: true, player_in_zone: true, posed_in_time: true });
    bus.emit('step_activated', { quest_id: 'q_m1_main_03', step_id: 'q_m1_main_03.s03', kind: 'cutscene', is_replay: false, resumed: false });

    expect(sfxLog).toEqual([
      'sfx_book_drop',
      'sfx_school_drum_3beats',
      'sfx_water_splash',
      'sfx_camera_shutter',
      'sfx_tick',
      'sfx_birds_after_rain',
    ]);
    reactions.dispose();
  });
});

describe('m1_base / m1_trang2 / m1_common — biến đổi 3D tức thì & vị trí marker (R-B4)', () => {
  it('m1_base (d.g07.02): ẩn đồ ban đầu, hiện ngay decor theo choice_made, hiện sổ/biển theo tiến trình', async () => {
    const { idx } = makeCollectPack();
    const bus = new EventBus();
    const save = newSave('test');
    const engine = new QuestEngine({ idx, save, bus });
    const ui = createUiStore();

    const dressingRoot = new THREE.Group();
    const ctx = makeMockDressingCtx('d.g07.02');
    const m1BaseObj = (await m1BaseSet.build(ctx)) as THREE.Group;
    dressingRoot.add(m1BaseObj);
    ctx.scene.add(dressingRoot);

    const reactions = createStepReactions({
      idx, bus, engine, ui,
      getQueue: () => ({ enqueue: (fn) => fn(), playLines: async () => true }),
      getDayScene: () => ({ scene: ctx.scene }),
      sfx: vi.fn(),
    });

    const sign = m1BaseObj.getObjectByName('baseSign:merged')!;
    const book = m1BaseObj.getObjectByName('ruleBook:merged')!;
    const decor = m1BaseObj.getObjectByName('m1_base:decor')!;
    expect(sign.visible).toBe(false);
    expect(book.visible).toBe(false);
    expect(decor.visible).toBe(false);

    // Chạy vào Trang 3, gom 3 điểm khảo sát → chọn kiểu 'flowers'
    engine.startDay('d.g07.02');
    engine.trigger('interact', 'itr.thcs.base_survey_roof');
    engine.trigger('interact', 'itr.thcs.base_survey_stump');
    engine.trigger('interact', 'itr.thcs.base_survey_boxes');
    engine.complete('q_m1_main_03.s02', { option_id: 'flowers' });

    expect(decor.visible).toBe(true);
    expect(decor.children[0].name).toBe('baseDecor:flowers:merged');

    // Chọn/đổi kiểu khác trực tiếp qua bus (choice_made 'photos')
    bus.emit('choice_made', { step_id: 'q_m1_main_03.s02', choice_id: 'c_m1_03_decor', option_id: 'photos', tone: 'deep', measured: true, is_replay: false });
    expect(decor.children[0].name).toBe('baseDecor:photos:merged');

    // Sau mg_base_build → hiện sổ luật; qua cập nhật frame scale đạt 1
    bus.emit('minigame_finished', { game_id: 'mg_base_build', context: 'story', page_id: 'd.g07.02', opponent_id: null, difficulty: null, result: 'complete', duration_s: 5, stars: 3, hints_used: 0, score: null });
    expect(book.visible).toBe(true);
    for (const u of ctx.updates) u(0.5, 0.5);
    expect(book.scale.x).toBeCloseTo(1, 5);

    // Tới bước treo biển / xong mg_rules → hiện biển tên
    bus.emit('minigame_finished', { game_id: 'mg_rules', context: 'story', page_id: 'd.g07.02', opponent_id: null, difficulty: null, result: 'complete', duration_s: 5, stars: 3, hints_used: 0, score: null });
    expect(sign.visible).toBe(true);

    reactions.dispose();
  });

  it('m1_base hỗ trợ nhận bus trực tiếp qua DressingCtx và gỡ listener khi dispose', async () => {
    const bus = new EventBus();
    const ctx = makeMockDressingCtx('d.g07.02', { bus });
    const obj = (await m1BaseSet.build(ctx)) as THREE.Group;
    ctx.scene.add(obj);

    const decor = obj.getObjectByName('m1_base:decor')!;
    expect(decor.visible).toBe(false);
    bus.emit('choice_made', { step_id: 'q_m1_main_03.s03', choice_id: 'c_m1_03_decor', option_id: 'paper', tone: 'playful', measured: true, is_replay: false });
    expect(decor.visible).toBe(true);
    expect(decor.children[0].name).toBe('baseDecor:paper:merged');

    // Gỡ khỏi scene → listener tự dọn, không đổi tiếp
    obj.removeFromParent();
    bus.emit('choice_made', { step_id: 'q_m1_main_03.s03', choice_id: 'c_m1_03_decor', option_id: 'flowers', tone: 'gentle', measured: true, is_replay: false });
    expect(decor.children[0].name).toBe('baseDecor:paper:merged');
  });

  it('m1_trang2 & makeStrandedPaperBoat: 5 thuyền ở mép rãnh ban đầu → 1 thuyền Hạ ở itr.thcs.gutter_end sau đua', async () => {
    const strandedProp = makeStrandedPaperBoat();
    const box = new THREE.Box3().setFromObject(strandedProp);
    expect(Math.abs(box.min.y)).toBeLessThanOrEqual(0.015);

    const bus = new EventBus();
    const gutterEndMarker: Marker = { id: 'itr.thcs.gutter_end', kind: 'interact', zone: 'zone.thcs.yard', position: [-6.0, 0, -17.6], facing: Math.PI, props: {} };
    const ctx = makeMockDressingCtx('d.g07.01', { bus, markers: [gutterEndMarker] });
    const obj = (await m1Trang2Set.build(ctx)) as THREE.Group;
    ctx.scene.add(obj);

    const boats = obj.getObjectByName('m1_trang2:boats')!;
    const stranded = obj.getObjectByName('m1_trang2:strandedBoat')!;
    expect(boats.visible).toBe(true);
    expect(stranded.visible).toBe(false);
    expect(stranded.position.toArray()).toEqual([-6.0, 0, -17.6]);

    bus.emit('minigame_finished', { game_id: 'mg_boat', context: 'story', page_id: 'd.g07.01', opponent_id: null, difficulty: null, result: 'complete', duration_s: 12, stars: 2, hints_used: 0, score: null });
    expect(boats.visible).toBe(false);
    expect(stranded.visible).toBe(true);

    // Chơi lại ngày → reset lại 5 thuyền
    bus.emit('day_started', { day_id: 'd.g07.01', is_replay: false, resumed: false });
    expect(boats.visible).toBe(true);
    expect(stranded.visible).toBe(false);
  });

  it('m1_common dời cụm quả cầu makeFootbagSpot sang marker itr.thcs.shuttle_bush', async () => {
    const bushMarker: Marker = { id: 'itr.thcs.shuttle_bush', kind: 'interact', zone: 'zone.thcs.yard', position: [14.6, 0, 9.2], facing: 0.86, props: {} };
    const ctx = makeMockDressingCtx('d.g06.01', { markers: [bushMarker] });
    const obj = (await m1CommonSet.build(ctx)) as THREE.Group;
    const spot = obj.getObjectByName('footbagSpot:merged')!;
    expect(spot.position.x).toBeCloseTo(14.6, 5);
    expect(spot.position.z).toBeCloseTo(9.2, 5);
  });
});
