import { describe, expect, it } from 'vitest';
import { attachAnalytics } from '../../src/analytics/bridge';
import { ActivePlaytime } from '../../src/analytics/heartbeat';
import { EVENT_NAMES, FORBIDDEN_PROP_KEYS, validateBatch, type EventName, type PropValue } from '../../shared/events';
import { HubModel } from '../../src/systems/hub';
import { AlbumModel } from '../../src/systems/album';
import { QuestEngine } from '../../src/systems/questEngine';
import { ReleaseTracker } from '../../src/systems/release';
import { ALBUM_CONFIG } from '../../src/config/album';
import { HUB_CONFIG } from '../../src/config/hub';
import { EventBus } from '../../src/core/eventBus';
import { newSave } from '../../src/core/save';
import { indexContent } from '../../src/content/indexContent';
import { CONTENT, contentConfig } from '../../src/content/pack';

const NAME = 'Thảo Nguyên';

function setup() {
  const save = newSave('22222222-2222-4222-8222-222222222222');
  save.player_name = NAME; save.appearance.gender = 'female';
  const idx = indexContent(CONTENT, contentConfig('test'));
  const bus = new EventBus();
  const sent: { name: EventName; props: Record<string, PropValue> }[] = [];
  let attempt: string | null = null;
  attachAnalytics({ bus, idx, save, tracker: { track: (name, props) => sent.push({ name, props: props ?? {} }), setAttempt: (id) => { attempt = id; } } });
  const engine = new QuestEngine({ idx, save, bus });
  const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
  const hub = new HubModel({ idx, save, bus, engine, album, config: HUB_CONFIG });
  new ReleaseTracker({ idx, save, bus });
  const names = () => sent.map((e) => e.name);
  const of = (n: EventName) => sent.filter((e) => e.name === n).map((e) => e.props);
  return { save, idx, bus, engine, album, hub, sent, names, of, attempt: () => attempt };
}

/** Chơi hết gói nội dung giả bằng engine (không cần trình duyệt). */
function playAll(t: ReturnType<typeof setup>) {
  const { engine: e, hub, bus, album } = t;
  bus.emit('hub_entered', { first: true });
  e.enterHub();
  e.complete('q_hub_pd_01.s01');
  bus.emit('profile_set', { gender: 'female' });
  e.trigger('interact', 'itr.hub.memory_box'); hub.refresh();
  hub.openArtifact('art_m1_01');
  e.startDay('d.g06.01');
  e.trigger('interact', 'NPC_B'); e.complete('q_m1_side_01.s01'); e.trigger('arrive', 'itr.thcs.flagpole');
  e.trigger('interact', 'itr.thcs.duty_spot');
  e.trigger('interact', 'NPC_A'); e.complete('q_m1_main_01.s01');
  e.trigger('interact', 'itr.thcs.stone_bench'); e.complete('q_m1_main_01.s02');
  e.enterHub(); hub.refresh(); hub.runPdes();
  album.markViewed(); album.markBackViewed('alb.d.g07.03.02');
  hub.openArtifact('art_m1_05');
  e.startDay('d.g07.03');
  // Side giả 02 (thêm ở S2): đi một vòng 5 khu còn lại của bản đồ
  for (const place of ['gutter', 'blackboard', 'snack_cart', 'marble_spot', 'old_table']) e.trigger('arrive', `itr.thcs.${place}`);
  e.trigger('interact', 'NPC_A'); e.complete('q_m1_main_05.s01');
  e.complete('q_m1_main_05.s02', { option_id: 'gentle' });
  e.trigger('interact', 'itr.thcs.tripod_spot');
  bus.emit('photo_attempt', { step_id: 'q_m1_main_05.s04', mode: 'timer', retry_index: 0, all_in_frame: true, player_in_zone: false, posed_in_time: true });
  bus.emit('photo_kept', { step_id: 'q_m1_main_05.s04', mode: 'timer', retry_index: 0, all_in_frame: true, player_in_zone: false, posed_in_time: true });
  e.complete('q_m1_main_05.s04'); e.complete('q_m1_main_05.s05');
  e.enterHub(); hub.refresh(); hub.runPdes();
  e.complete('q_hub_pd_02.s01');
  e.complete('q_hub_pd_03.s01', { option_id: 'deep' });
  bus.emit('feedback_shown', { placement: 'demo_end' });
  bus.emit('feedback_skipped', { placement: 'demo_end' });
}

describe('cầu nối analytics (F8)', () => {
  it('gắn attempt_id của file lưu', () => {
    expect(setup().attempt()).toBe('22222222-2222-4222-8222-222222222222');
  });

  it('có đủ event mới sau khi chơi hết gói giả', () => {
    const t = setup(); playAll(t);
    for (const n of ['game_started', 'appearance_selected', 'artifact_opened', 'page_started', 'page_completed', 'milestone_completed',
      'quest_started', 'quest_step_completed', 'quest_completed', 'choice_made', 'photo_attempt', 'photo_kept',
      'album_page_restored', 'album_viewed', 'photo_back_viewed', 'pd_quest_step', 'public_demo_completed', 'feedback_shown', 'feedback_skipped'] as const) {
      expect(t.names(), n).toContain(n);
    }
  });

  it('memory_day_* mang milestone_id, school_year, memory_day_id, chapter_label, is_replay', () => {
    const t = setup(); playAll(t);
    expect(t.of('page_started')[0]).toEqual({ milestone_id: 'm1', school_year: 'g06', page_id: 'd.g06.01', chapter_label: '[PLACEHOLDER] Mốc 1 · lớp 6–7', is_replay: false });
    expect(t.of('page_completed').map((p) => p.page_id)).toEqual(['d.g06.01', 'd.g07.03']);
    expect(t.of('milestone_completed')).toEqual([{ milestone_id: 'm1' }]);
  });

  it('event quest có quest_type, milestone_id (m1/hub), memory_day_id, is_replay', () => {
    const t = setup(); playAll(t);
    expect(t.of('quest_completed').find((p) => p.quest_id === 'q_m1_side_01')).toEqual({ quest_id: 'q_m1_side_01', quest_type: 'side', milestone_id: 'm1', memory_day_id: 'd.g06.01', is_replay: false });
    expect(t.of('quest_started').find((p) => p.quest_id === 'q_hub_pd_02')).toMatchObject({ quest_type: 'pd', milestone_id: 'hub', memory_day_id: null });
    expect(t.of('quest_step_completed').every((p) => typeof p.step_id === 'string' && 'is_replay' in p)).toBe(true);
  });

  it('pd_quest_step chỉ có sắc thái, không có nội dung tin nhắn', () => {
    const t = setup(); playAll(t);
    expect(t.of('pd_quest_step').at(-1)).toEqual({ quest_id: 'q_hub_pd_03', step_id: 'q_hub_pd_03.s01', choice_tone: 'deep' });
    expect(t.of('choice_made')).toEqual([{ choice_id: 'c_m1_05_tone', tone: 'gentle', memory_day_id: 'd.g07.03', is_replay: false }]);
  });

  it('public_demo_completed được ghi TRƯỚC khi form hiện; bỏ qua form không đổi trạng thái hoàn thành', () => {
    const t = setup(); playAll(t);
    const n = t.names();
    expect(n.indexOf('public_demo_completed')).toBeGreaterThan(-1);
    expect(n.indexOf('public_demo_completed')).toBeLessThan(n.indexOf('feedback_shown'));
    expect(n.filter((x) => x === 'public_demo_completed')).toHaveLength(1);
    expect(t.save.public_demo_done).toBe(true);
  });

  it('không event nào chứa tên Player hay trường cấm; server nhận hết (không bị bỏ)', () => {
    const t = setup(); playAll(t);
    expect(JSON.stringify(t.sent)).not.toContain(NAME);
    expect(JSON.stringify(t.sent)).not.toContain('Thảo');
    for (const e of t.sent) for (const k of Object.keys(e.props)) expect(FORBIDDEN_PROP_KEYS.has(k), `${e.name}.${k}`).toBe(false);
    const u = () => crypto.randomUUID();
    const batch = { batch_id: u(), build_version: '20261114-test', release_stage: 'prototype', events: t.sent.map((e) => ({ event_id: u(), name: e.name, client_time: new Date().toISOString(), visitor_id: u(), session_id: u(), attempt_id: t.save.attempt_id, props: e.props })) };
    const r = validateBatch(batch);
    expect(r.dropped).toEqual([]);
    expect(r.batch?.events).toHaveLength(t.sent.length);
  });

  it('chơi lại: event mang is_replay=true và không phát lại page_completed "thật"', () => {
    const t = setup(); playAll(t);
    t.sent.length = 0;
    t.hub.openArtifact('art_m1_01');
    t.engine.startDay('d.g06.01', { replay: true });
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    t.engine.trigger('interact', 'itr.thcs.stone_bench'); t.engine.complete('q_m1_main_01.s02');
    for (const n of ['artifact_opened', 'page_started', 'page_completed', 'quest_started', 'quest_step_completed', 'quest_completed'] as const) {
      expect(t.of(n).length, n).toBeGreaterThan(0);
      expect(t.of(n).every((p) => p.is_replay === true), n).toBe(true);
    }
    expect(t.names()).not.toContain('milestone_completed');
    expect(t.names()).not.toContain('public_demo_completed');
  });

  it('lời nhắc kết ngày → skip_prompt_answered', () => {
    const t = setup();
    t.engine.enterHub(); t.engine.complete('q_hub_pd_01.s01'); t.engine.trigger('interact', 'itr.hub.memory_box');
    t.engine.startDay('d.g06.01');
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01');
    t.engine.trigger('interact', 'itr.thcs.stone_bench'); t.engine.complete('q_m1_main_01.s02');
    t.engine.answerEndPrompt('leave');
    expect(t.of('skip_prompt_answered')).toEqual([{ answer: 'leave', open_side_quests: 1 }]);
  });
});

describe('danh sách event', () => {
  it('đã bỏ chapter_*, có event mới của GDD v1', () => {
    const names = new Set<string>(EVENT_NAMES);
    expect(names.has('chapter_started')).toBe(false);
    expect(names.has('chapter_completed')).toBe(false);
    for (const n of ['artifact_opened', 'page_started', 'page_completed', 'album_page_restored', 'album_viewed', 'photo_back_viewed', 'pd_quest_step', 'choice_made']) expect(names.has(n), n).toBe(true);
  });
  it('server bỏ event mang nội dung tin nhắn / ghi chú / tên', () => {
    const u = () => crypto.randomUUID();
    const ev = (props: Record<string, string>) => ({ event_id: u(), name: 'pd_quest_step', client_time: new Date().toISOString(), visitor_id: u(), session_id: u(), props });
    const r = validateBatch({ batch_id: u(), build_version: '20261114-test', release_stage: 'prototype', events: [ev({ message_text: 'alo' }), ev({ note_text: 'x' }), ev({ player_name: 'A' }), ev({ quest_id: 'q_hub_pd_03' })] });
    expect(r.batch?.events).toHaveLength(1);
    expect(r.dropped.map((d) => d.reason)).toEqual(['forbidden_key:message_text', 'forbidden_key:note_text', 'forbidden_key:player_name']);
  });
});

describe('active_heartbeat', () => {
  function clock() {
    let now = 0; const beats: number[] = [];
    const hb = new ActivePlaytime({ now: () => now, onBeat: (ms) => beats.push(ms) });
    return { hb, beats, advance: (ms: number) => { now += ms; hb.tick(); } };
  }
  it('mỗi ~15 giây khi đang chơi và có thao tác', () => {
    const c = clock();
    c.hb.setPlaying(true); c.hb.setVisible(true);
    for (let i = 0; i < 6; i++) { c.hb.markInput(); c.advance(5000); }
    expect(c.beats).toEqual([15000, 15000]);
  });
  it('không tính khi tab ẩn, khi pause/loading, khi idle quá 60 giây', () => {
    const c = clock();
    c.hb.setPlaying(true); c.hb.setVisible(false);
    c.hb.markInput(); c.advance(20000);
    expect(c.beats).toEqual([]);
    c.hb.setVisible(true); c.hb.setPlaying(false);
    c.hb.markInput(); c.advance(20000);
    expect(c.beats).toEqual([]);
    c.hb.setPlaying(true); c.hb.markInput();
    for (let i = 0; i < 30; i++) c.advance(5000);       // 150 giây không thao tác
    expect(c.beats.reduce((a, b) => a + b, 0)).toBe(60000);
  });
});
