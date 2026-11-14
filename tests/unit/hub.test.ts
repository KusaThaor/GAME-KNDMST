import { describe, expect, it } from 'vitest';
import { HubModel } from '../../src/systems/hub';
import { AlbumModel } from '../../src/systems/album';
import { QuestEngine } from '../../src/systems/questEngine';
import { ReleaseTracker } from '../../src/systems/release';
import { GameFlow } from '../../src/systems/gameFlow';
import { ALBUM_CONFIG } from '../../src/config/album';
import { HUB_CONFIG, hubLightPresetName } from '../../src/config/hub';
import { EventBus, type GameEventName } from '../../src/core/eventBus';
import { newSave, type SaveState } from '../../src/core/save';
import { indexContent } from '../../src/content/indexContent';
import type { ContentConfig, ContentPack } from '../../src/content/types';
import { makeConfig, makePack } from './fixtures/pack';

function setup(opts: { pack?: ContentPack; config?: ContentConfig; save?: SaveState } = {}) {
  const save = opts.save ?? newSave('a');
  const idx = indexContent(opts.pack ?? makePack(), opts.config ?? makeConfig());
  const bus = new EventBus();
  const log: { name: GameEventName; p: unknown }[] = [];
  bus.onAny((name, p) => log.push({ name, p }));
  const engine = new QuestEngine({ idx, save, bus });
  const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
  const hub = new HubModel({ idx, save, bus, engine, album, config: HUB_CONFIG });
  const release = new ReleaseTracker({ idx, save, bus });
  const of = (n: GameEventName) => log.filter((e) => e.name === n).map((e) => e.p);
  const intro = () => { engine.enterHub(); engine.complete('q_hub_pd_01.s01'); engine.trigger('interact', 'itr.hub.memory_box'); hub.refresh(); };
  const playDay1 = (leave = true) => {
    engine.startDay('d.g06.01');
    engine.trigger('interact', 'NPC_A'); engine.complete('q_m1_main_01.s01');
    engine.complete('q_m1_main_01.s02', { option_id: 'a' });
    engine.trigger('interact', 'itr.thcs.desk');
    if (leave) engine.answerEndPrompt('leave');
    engine.enterHub();
  };
  const playDay2 = () => {
    engine.startDay('d.g07.03');
    engine.trigger('interact', 'itr.thcs.tripod'); engine.complete('q_m1_main_05.s02');
    engine.enterHub();
  };
  return { save, idx, bus, engine, album, hub, release, log, of, intro, playDay1, playDay2 };
}
const states = (t: ReturnType<typeof setup>) => Object.fromEntries(t.hub.compartments().flatMap((c) => c.artifacts.map((a) => [a.artifact.id, a.state])));

describe('Hộp Kỷ Vật — trạng thái kỷ vật', () => {
  it('chưa mở đầu: ngăn Mốc 1 đóng, kỷ vật hidden', () => {
    const t = setup();
    t.engine.enterHub(); t.hub.refresh();
    expect(t.hub.compartments()[0].open).toBe(false);
    expect(states(t)).toEqual({ art_m1_01: 'hidden', art_m1_05: 'hidden' });
  });
  it('xong mở đầu: ngăn mở, kỷ vật đầu sáng, kỷ vật sau còn mờ (không mở được tương lai)', () => {
    const t = setup(); t.intro();
    expect(t.hub.compartments()[0].open).toBe(true);
    expect(states(t)).toEqual({ art_m1_01: 'glowing', art_m1_05: 'dim' });
    expect(t.hub.canOpen('art_m1_05')).toBeNull();
    expect(t.hub.canOpen('art_m1_01')).toBe('first');
  });
  it('mở kỷ vật → artifact_opened + biết Ngày đích', () => {
    const t = setup(); t.intro();
    expect(t.hub.openArtifact('art_m1_01')).toEqual({ day_id: 'd.g06.01', replay: false });
    expect(t.of('artifact_opened')).toEqual([{ artifact_id: 'art_m1_01', memory_day_id: 'd.g06.01', is_replay: false }]);
    expect(t.hub.openArtifact('art_m1_05')).toBeNull();
  });
  it('xong Ngày → visited; PDE SHELF → on_shelf; kỷ vật kế tiếp sáng; chơi lại từ kệ', () => {
    const t = setup(); t.intro(); t.playDay1();
    t.hub.refresh();
    expect(states(t)).toEqual({ art_m1_01: 'visited', art_m1_05: 'glowing' });
    t.hub.runPdes();
    expect(states(t)).toEqual({ art_m1_01: 'on_shelf', art_m1_05: 'glowing' });
    expect(t.hub.shelf().map((a) => a.id)).toEqual(['art_m1_01']);
    expect(t.hub.canOpen('art_m1_01')).toBe('replay');
    expect(t.hub.openArtifact('art_m1_01')).toEqual({ day_id: 'd.g06.01', replay: true });
    expect(t.of('artifact_opened').at(-1)).toMatchObject({ is_replay: true });
  });
  it('chỉ hiện kỷ vật của các Ngày thuộc bản phát hành', () => {
    const t = setup({ config: makeConfig({ release: { memory_day_ids: ['d.g06.01'], end_day_id: 'd.g06.01' } }) });
    t.intro();
    expect(states(t)).toEqual({ art_m1_01: 'glowing' });
  });
});

describe('Present-day Event', () => {
  it('RESTORE + SHELF sau Ngày 1; chạy lại không lặp (once)', () => {
    const t = setup(); t.intro(); t.playDay1();
    const shown = t.hub.runPdes();
    expect(shown.map((p) => p.kind)).toEqual(['album_restore', 'shelf']);
    expect(t.album.pageState('page.d.g06.01')).toBe('restored');
    expect(t.save.pde_done).toEqual(['pde_01', 'pde_02']);
    expect(t.hub.runPdes()).toEqual([]);
    expect(t.of('pde_fired')).toHaveLength(2);
  });
  it('FRAGMENT khi đã làm Side', () => {
    const t = setup(); t.intro();
    t.engine.startDay('d.g06.01');
    t.engine.trigger('interact', 'NPC_B'); t.engine.complete('q_m1_side_01.s01'); t.engine.trigger('arrive', 'itr.thcs.tree');
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01'); t.engine.complete('q_m1_main_01.s02', { option_id: 'a' }); t.engine.trigger('interact', 'itr.thcs.desk');
    t.engine.enterHub();
    expect(t.hub.runPdes().map((p) => p.kind)).toEqual(['album_restore', 'shelf', 'fragment']);
    expect(t.album.pageState('page.d.g06.01')).toBe('complete');
  });
  it('CONTACT sau Ngày cuối mở quest liên lạc; gửi tin; REPLY tới khi điều kiện đạt', () => {
    const t = setup(); t.intro(); t.playDay1(); t.hub.runPdes(); t.playDay2();
    expect(t.hub.runPdes().map((p) => p.kind)).toEqual(['album_restore', 'shelf', 'contact']);
    expect(t.engine.questState('q_hub_pd_02')).toBe('active');
    t.engine.complete('q_hub_pd_02.s01');
    t.engine.complete('q_hub_pd_02.s02', { option_id: 'b' });
    expect(t.hub.runPdes()).toEqual([]);
    t.save.flags['hub.reply_due'] = true;
    expect(t.hub.runPdes().map((p) => p.kind)).toEqual(['reply']);
    const msgs = t.hub.threadMessages('thread.group');
    expect(msgs.map((m) => [m.speaker, m.text, m.origin])).toEqual([
      ['NPC_A', '[PLACEHOLDER] tin cũ', 'history'],
      ['player', '[PLACEHOLDER] mở lời B', 'sent'],
      ['NPC_A', '[PLACEHOLDER] trả lời', 'reply'],
    ]);
  });
  it('REUNION để trống: không văng lỗi, không làm gì', () => {
    const pack = makePack();
    pack.pdes.push({ id: 'pde_08', type: 'REUNION', trigger: { always: true }, effects: [], once: true });
    const t = setup({ pack }); t.intro();
    expect(t.hub.runPdes()).toEqual([]);
  });
});

describe('tông phòng theo số Ngày đã xong (D-13, cấu hình)', () => {
  it('lấy mốc lớn nhất không vượt quá số Ngày đã xong', () => {
    expect(hubLightPresetName(HUB_CONFIG, 0)).toBe('cold');
    expect(hubLightPresetName(HUB_CONFIG, 1)).toBe('cool');
    expect(hubLightPresetName(HUB_CONFIG, 9)).toBe('warm');
    expect(hubLightPresetName({ ...HUB_CONFIG, lighting_by_days_done: [{ min_days_done: 0, preset: 'warm' }] }, 0)).toBe('warm');
  });
  it('HubModel đếm Ngày đã xong trong bản phát hành', () => {
    const t = setup(); t.intro();
    expect(t.hub.lightingPreset()).toBe('cold');
    t.playDay1();
    expect(t.hub.lightingPreset()).toBe('cool');
  });
});

describe('ReleaseTracker — public_demo_completed', () => {
  it('phát khi xong Ngày kết thúc VÀ bước gửi tin (nếu khai); chỉ một lần', () => {
    const t = setup(); t.intro(); t.playDay1(); t.hub.runPdes(); t.playDay2();
    expect(t.of('public_demo_completed')).toEqual([]);
    t.hub.runPdes();
    t.engine.complete('q_hub_pd_02.s01');
    expect(t.of('public_demo_completed')).toEqual([]);
    t.engine.complete('q_hub_pd_02.s02', { option_id: 'a' });
    expect(t.of('public_demo_completed')).toHaveLength(1);
    expect(t.save.public_demo_done).toBe(true);
    t.release.check();
    expect(t.of('public_demo_completed')).toHaveLength(1);
  });
  it('không khai bước gửi tin → phát ngay khi xong Ngày kết thúc', () => {
    const t = setup({ config: makeConfig({ release: { memory_day_ids: ['d.g06.01'], end_day_id: 'd.g06.01' } }) });
    t.intro(); t.playDay1();
    expect(t.of('public_demo_completed')).toHaveLength(1);
  });
  it('chơi lại Ngày kết thúc không phát lại', () => {
    const t = setup({ config: makeConfig({ release: { memory_day_ids: ['d.g06.01'], end_day_id: 'd.g06.01' } }) });
    t.intro(); t.playDay1();
    t.engine.startDay('d.g06.01', { replay: true });
    t.engine.trigger('interact', 'NPC_A'); t.engine.complete('q_m1_main_01.s01'); t.engine.complete('q_m1_main_01.s02', { option_id: 'a' }); t.engine.trigger('interact', 'itr.thcs.desk');
    t.engine.answerEndPrompt('leave');
    expect(t.of('public_demo_completed')).toHaveLength(1);
  });
  it('đổi release.ts (bỏ Ngày, đổi điểm dừng) không cần sửa engine', () => {
    const t = setup({ config: makeConfig({ release: { memory_day_ids: [], end_day_id: null } }) });
    t.intro();
    expect(t.hub.compartments().flatMap((c) => c.artifacts)).toEqual([]);
    expect(t.of('public_demo_completed')).toEqual([]);
  });
});

describe('GameFlow — máy trạng thái', () => {
  const flow = () => { const bus = new EventBus(); const seen: string[] = []; bus.on('flow_changed', (e) => seen.push(`${e.from}>${e.to}`)); return { f: new GameFlow(bus), seen }; };
  it('Boot → Hub(intro) → Hub(idle) → Transition → MemoryDay → DayEnd → Transition → Hub', () => {
    const { f, seen } = flow();
    expect(f.state).toBe('boot');
    for (const a of ['boot_new', 'intro_done', 'open_day', 'scene_ready', 'day_completed', 'continue', 'scene_ready'] as const) expect(f.dispatch(a)).toBe(true);
    expect(seen).toEqual(['boot>hub_intro', 'hub_intro>hub_idle', 'hub_idle>to_day', 'to_day>memory_day', 'memory_day>day_end', 'day_end>to_hub', 'to_hub>hub_idle']);
  });
  it('nạp file lưu đang dở Ngày: Boot → Transition → MemoryDay', () => {
    const { f } = flow();
    f.dispatch('boot_resume_day'); f.dispatch('scene_ready');
    expect(f.state).toBe('memory_day');
  });
  it('rời Ngày giữa chừng (bỏ lượt chơi lại) → về Hub', () => {
    const { f } = flow();
    f.dispatch('boot_idle'); f.dispatch('open_day'); f.dispatch('scene_ready');
    expect(f.dispatch('leave_day')).toBe(true);
    expect(f.state).toBe('to_hub');
  });
  it('chuyển không hợp lệ bị từ chối, trạng thái giữ nguyên', () => {
    const { f, seen } = flow();
    expect(f.dispatch('open_day')).toBe(false);
    f.dispatch('boot_idle');
    expect(f.dispatch('day_completed')).toBe(false);
    expect(f.dispatch('scene_ready')).toBe(false);
    expect(f.state).toBe('hub_idle');
    expect(seen).toEqual(['boot>hub_idle']);
  });
});
