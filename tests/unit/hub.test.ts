import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { HubModel } from '../../src/systems/hub';
import { AlbumModel } from '../../src/systems/album';
import { QuestEngine } from '../../src/systems/questEngine';
import { ReleaseTracker } from '../../src/systems/release';
import { GameFlow } from '../../src/systems/gameFlow';
import { ALBUM_CONFIG } from '../../src/config/album';
import { HUB_CONFIG, caroScore, fillCaroScore, hubLightPresetName } from '../../src/config/hub';
import { EventBus, type GameEventName } from '../../src/core/eventBus';
import { newSave, type SaveState } from '../../src/core/save';
import { formatText } from '../../src/systems/dialogue';
import { ART_M2_01, HUB, HUB_QUESTS, HUB_QUESTS_M2, PDES, PDES_M2 } from '../../src/content/hub';
import { indexContent } from '../../src/content/indexContent';
import type { ContentConfig, ContentPack, MemoryDay, Quest, Step } from '../../src/content/types';
import { ID_PATTERNS } from '../../src/content/validate';
import { buildHubScene } from '../../src/game/scenes/hubScene';
import { makeCurtain, makeDeskLamp, makeGlassFrame, makeNightWindow, makeRug, makeRulebook, makeWallFrame } from '../../src/world/props/hub/room';
import { HUB_ROOM } from '../../src/config/hubRoom';
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

describe('tông phòng (BG-4: ấm từ đầu, ấm dần; K2: không ám vàng; cấu hình được)', () => {
  const presets = HUB_CONFIG.lighting_by_days_done.map((r) => HUB_CONFIG.presets[r.preset]);
  it('ấm từ đầu: buổi tối, đèn bàn đã sáng ngay khi vào game; mọi hàng trỏ tới preset có thật', () => {
    expect(HUB_CONFIG.lighting_by_days_done[0].min_days_done).toBe(0);
    for (const p of presets) { expect(p).toBeDefined(); expect(p.lamp).toBeGreaterThan(0); }
    expect(presets[0].window).not.toBe('sunny');                                 // lời dẫn mở đầu: "Buổi tối, ánh đèn bàn…"
  });
  it('ấm dần theo số Ngày: đèn bàn không tối đi; sau nhiều Ngày là đêm, đèn sáng hết cỡ', () => {
    for (let i = 1; i < presets.length; i++) expect(presets[i].lamp).toBeGreaterThanOrEqual(presets[i - 1].lamp);
    expect(HUB_CONFIG.presets[hubLightPresetName(HUB_CONFIG, 9)]).toMatchObject({ window: 'night', lamp: 1 });
  });
  it('K2 khử ám vàng: ánh sáng chung không vàng hơn #fff1df (B/R ≥ 0,87), không sáng hơn 1,35', () => {
    const br = (hex: string) => { const c = new THREE.Color(hex); return c.b / c.r; };
    const limit = br('#fff1df');
    for (const name of new Set(HUB_CONFIG.lighting_by_days_done.map((r) => r.preset))) {
      const p = HUB_CONFIG.presets[name];
      expect(br(p.key), `${name}.key`).toBeGreaterThanOrEqual(limit - 1e-9);
      expect(br(p.ambient), `${name}.ambient`).toBeGreaterThanOrEqual(limit - 1e-9);
      expect(p.keyIntensity, `${name}.keyIntensity`).toBeLessThanOrEqual(1.35);
    }
  });
  it('bảng vẫn là cấu hình: đổi hàng → đổi preset, lấy mốc lớn nhất không vượt quá số Ngày đã xong', () => {
    const cfg = { ...HUB_CONFIG, lighting_by_days_done: [{ min_days_done: 0, preset: 'cold' }, { min_days_done: 2, preset: 'warm' }] };
    expect(hubLightPresetName(cfg, 0)).toBe('cold');
    expect(hubLightPresetName(cfg, 1)).toBe('cold');
    expect(hubLightPresetName(cfg, 5)).toBe('warm');
  });
  it('HubModel: preset theo số Ngày đã xong (0 Ngày → evening; 1 Ngày vẫn evening)', () => {
    const t = setup(); t.intro();
    expect(t.hub.lightingPreset()).toBe(hubLightPresetName(HUB_CONFIG, 0));
    t.playDay1();
    expect(t.hub.lightingPreset()).toBe(hubLightPresetName(HUB_CONFIG, 1));
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

// ---------------------------------------------------------------------------
// N-08 — nội dung Hub 2026 (Mục 0.2 bảng việc, nhãn HUMAN_CANON)
// ---------------------------------------------------------------------------
const stepLines = (s: Step) => ('lines' in s && s.lines ? s.lines : []);
const questOf = (list: Quest[], id: string) => list.find((q) => q.id === id)!;
const allTexts = (list: Quest[]) => list.flatMap((q) => q.steps.flatMap((s) => [...stepLines(s).map((l) => l.text), ...(s.kind === 'compose_message' ? s.openers.map((o) => o.text) : [])]));

describe('Hub 2026 — thứ tự mở đầu (B10)', () => {
  it('quest mở đầu: lời dẫn → mở thùng; độc thoại của Player KHÔNG nằm trước khi mở thùng', () => {
    const q = questOf(HUB_QUESTS, 'q_hub_pd_01');
    expect(q.steps.map((s) => s.kind)).toEqual(['cutscene', 'interact']);
    expect(q.steps[1]).toMatchObject({ kind: 'interact', target: 'itr.hub.memory_box' });
    expect(stepLines(q.steps[0]).map((l) => l.speaker)).not.toContain('player');
  });
  it('độc thoại (nguyên văn kịch bản) tới sau khi mở thùng: quest riêng tự mở khi quest mở đầu xong', () => {
    const q = questOf(HUB_QUESTS, 'q_hub_pd_04');
    expect(q.available_when).toEqual({ quest: 'q_hub_pd_01' });
    expect(stepLines(q.steps[0])).toEqual([
      { speaker: 'narrator', text: 'Mẩu giấy gấp tư đầy hình vẽ mũi tên, nét mực tím nguệch ngoạc kèm dòng mực đỏ nắn nót: "Mật lệnh số 01 – Chỉ dành cho người đủ can đảm tham gia!"' },
      { speaker: 'player', text: 'Mật lệnh số 01… Mực đỏ này nhìn quen ghê, là chữ ai ta?' },
      { speaker: 'player', text: 'Không biết ngày đó… tụi mình bắt đầu chơi chung từ lúc nào nhỉ?' },
    ]);
  });
  it('engine: mở thùng xong → kỷ vật đầu sáng và độc thoại bắt đầu', () => {
    const t = setup({ pack: m2Pack(), config: m2Config() });
    t.engine.enterHub();
    expect(t.engine.questState('q_hub_pd_04')).toBe('locked');
    t.engine.complete('q_hub_pd_01.s01');
    expect(t.engine.questState('q_hub_pd_04')).toBe('locked');          // chưa mở thùng → chưa độc thoại
    t.engine.trigger('interact', 'itr.hub.memory_box'); t.hub.refresh();
    expect(t.engine.questState('q_hub_pd_01')).toBe('completed');
    expect(t.engine.questState('q_hub_pd_04')).toBe('active');
    expect(t.engine.activeSteps().map((r) => r.step.id)).toEqual(['q_hub_pd_04.s01']);
    expect(t.hub.canOpen('art_m1_01')).toBe('first');
  });
});

describe('Hub 2026 — chữ đã duyệt (Mục 0.2: B8, B9, D5), nhãn HUMAN_CANON', () => {
  it('ba tin kết đúng nguyên văn; tin Rộn ràng mang {quan}–{duc}', () => {
    const s = questOf(HUB_QUESTS, 'q_hub_pd_03').steps[0];
    if (s.kind !== 'compose_message') throw new Error('q_hub_pd_03.s01 phải là compose_message');
    expect(s.openers.map((o) => [o.id, o.tone, o.text])).toEqual([
      ['playful', 'playful', 'Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?'],
      ['gentle', 'gentle', 'Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?'],
      ['deep', 'deep', 'Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha.'],
    ]);
  });
  it('nhóm chat cũ không có dòng chat nào; chỉ có nhãn trạng thái trong config', () => {
    expect(HUB.threads.find((t) => t.id === 'thread.old_group')!.history).toEqual([]);
    expect(HUB_CONFIG.old_chat_last_label).toBe('tin cuối cùng đã từ rất lâu');
  });
  it('màn kết: "Đã gửi." → "(còn tiếp)", không còn câu cảm ơn', () => {
    expect(HUB.demo_end_lines).toEqual([{ speaker: 'narrator', text: 'Đã gửi.' }, { speaker: 'narrator', text: '(còn tiếp)' }]);
  });
  it('timeskip: thẻ "Tám năm sau." rồi hai độc thoại đúng chữ; quest event, HUMAN_CANON', () => {
    const q = questOf(HUB_QUESTS_M2, 'q_hub_event_01');
    expect(q.type).toBe('event');
    expect(q.ownership_label).toBe('HUMAN_CANON');
    expect(q.available_when).toEqual({ day: 'd.g09.03' });
    expect(stepLines(q.steps[0])).toEqual([
      { speaker: 'narrator', text: 'Tám năm sau.' },
      { speaker: 'player', text: 'Hồi đó tụi mình hứa mỗi tháng gặp nhau một lần…' },
      { speaker: 'player', text: 'Lần cuối cả năm đứa ngồi chung với nhau là khi nào nhỉ?' },
    ]);
  });
  it('sổ luật (Kết demo Bước 1): lấy sổ xuống rồi độc thoại; thẻ chuyển Mốc "Mấy năm sau…"', () => {
    const b = questOf(HUB_QUESTS_M2, 'q_hub_pd_05');
    expect(b.available_when).toEqual({ quest: 'q_hub_event_01' });
    expect(b.steps[0]).toMatchObject({ kind: 'interact', target: 'itr.hub.rulebook' });
    expect(stepLines(b.steps[1])).toEqual([{ speaker: 'player', text: 'Được dời, không được hủy…' }]);
    expect(stepLines(questOf(HUB_QUESTS_M2, 'q_hub_event_02').steps[0])).toEqual([{ speaker: 'narrator', text: 'Mấy năm sau…' }]);
  });
  it('không có chữ nào ngoài danh sách đã duyệt (không viết thêm thoại), không [PLACEHOLDER], mọi quest HUMAN_CANON', () => {
    expect(allTexts(HUB_QUESTS_M2).sort()).toEqual([
      'Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?',
      'Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?',
      'Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha.',
      'Phòng trọ năm 2026. Buổi tối, ánh đèn bàn hắt lên một góc phòng tĩnh lặng.',
      'Trên sàn có một chiếc thùng carton cũ dán băng keo ngả vàng: "Đồ cũ – đừng vứt."',
      'Mẩu giấy gấp tư đầy hình vẽ mũi tên, nét mực tím nguệch ngoạc kèm dòng mực đỏ nắn nót: "Mật lệnh số 01 – Chỉ dành cho người đủ can đảm tham gia!"',
      'Mật lệnh số 01… Mực đỏ này nhìn quen ghê, là chữ ai ta?',
      'Không biết ngày đó… tụi mình bắt đầu chơi chung từ lúc nào nhỉ?',
      'Mấy năm sau…',
      'Tám năm sau.',
      'Hồi đó tụi mình hứa mỗi tháng gặp nhau một lần…',
      'Lần cuối cả năm đứa ngồi chung với nhau là khi nào nhỉ?',
      'Được dời, không được hủy…',
    ].sort());
    expect(JSON.stringify([HUB, HUB_QUESTS_M2, ART_M2_01])).not.toContain('[PLACEHOLDER]');
    expect(HUB_QUESTS_M2.every((q) => q.ownership_label === 'HUMAN_CANON')).toBe(true);
  });
  it('mã quest/PDE/kỷ vật mới hợp mẫu của validator (q_hub_pd_timeskip trong thẻ N-08 thì không)', () => {
    for (const q of HUB_QUESTS_M2) expect(ID_PATTERNS.quest.test(q.id), q.id).toBe(true);
    expect(ID_PATTERNS.quest.test('q_hub_pd_timeskip')).toBe(false);
    expect(ID_PATTERNS.artifact.test(ART_M2_01.id)).toBe(true);
    for (const p of PDES_M2) expect(ID_PATTERNS.pde.test(p.id), p.id).toBe(true);
    expect(HUB_QUESTS_M2.filter((q) => q.type === 'event').map((q) => q.scope)).toEqual(['hub', 'hub']);
  });
  it('mọi bước interact ở Hub trỏ tới vật có trong hub.interactables, và không mang `lines` (Hub không phát)', () => {
    const ids = new Set(HUB.interactables.map((i) => i.id));
    for (const q of HUB_QUESTS_M2) for (const s of q.steps) if (s.kind === 'interact') { expect(ids.has(s.target), s.id).toBe(true); expect(s.lines, s.id).toBeUndefined(); }
  });
});

describe('Tỉ số caro động (B9b): lấy từ caro.series, mặc định 3–3', () => {
  it('chưa có kết quả → 3–3; có kết quả → theo series', () => {
    expect(caroScore(HUB_CONFIG)).toEqual({ quan: 3, duc: 3 });
    expect(caroScore(HUB_CONFIG, null)).toEqual({ quan: 3, duc: 3 });
    expect(caroScore(HUB_CONFIG, { quan: 4, duc: 3 })).toEqual({ quan: 4, duc: 3 });
    expect(caroScore(HUB_CONFIG, { quan: 3, duc: 4 })).toEqual({ quan: 3, duc: 4 });
  });
  it('dữ liệu hỏng/thiếu rơi về mặc định, không văng lỗi', () => {
    expect(caroScore(HUB_CONFIG, { quan: Number.NaN, duc: -1 })).toEqual({ quan: 3, duc: 3 });
    expect(caroScore(HUB_CONFIG, { quan: 5 })).toEqual({ quan: 5, duc: 3 });
    expect(caroScore({ ...HUB_CONFIG, caro_series_default: { quan: 0, duc: 0 } })).toEqual({ quan: 0, duc: 0 });
  });
  it('fillCaroScore thay {quan}–{duc} trong tin Rộn ràng, không đụng tin khác', () => {
    const s = questOf(HUB_QUESTS, 'q_hub_pd_03').steps[0];
    if (s.kind !== 'compose_message') throw new Error('sai kiểu bước');
    const [playful, gentle, deep] = s.openers.map((o) => o.text);
    expect(fillCaroScore(playful, HUB_CONFIG)).toBe('Ê. Ván caro hồi lớp 8 vẫn đang 3–3 đó nha. Ai gỡ?');
    expect(fillCaroScore(playful, HUB_CONFIG, { quan: 4, duc: 3 })).toBe('Ê. Ván caro hồi lớp 8 vẫn đang 4–3 đó nha. Ai gỡ?');
    expect(fillCaroScore(playful, HUB_CONFIG, { quan: 3, duc: 4 })).toBe('Ê. Ván caro hồi lớp 8 vẫn đang 3–4 đó nha. Ai gỡ?');
    expect(fillCaroScore(gentle, HUB_CONFIG, { quan: 9, duc: 9 })).toBe(gentle);
    expect(fillCaroScore(deep, HUB_CONFIG, { quan: 9, duc: 9 })).toBe(deep);
  });
  it('fmt của game (formatText rồi fillCaroScore với save.caro.series): bản lưu mới → tin Rộn ràng hiện "3–3"', () => {
    const save = newSave('t');
    const s = questOf(HUB_QUESTS, 'q_hub_pd_03').steps[0];
    if (s.kind !== 'compose_message') throw new Error('sai kiểu bước');
    // cùng công thức với `fmt` trong src/game/game.ts
    const fmt = (text: string) => fillCaroScore(formatText(text, { player_name: save.player_name, gender: save.appearance.gender }), HUB_CONFIG, save.caro.series);
    expect(fmt(s.openers[0].text)).toBe('Ê. Ván caro hồi lớp 8 vẫn đang 3–3 đó nha. Ai gỡ?');
    save.caro.series = { quan: 4, duc: 3 };
    expect(fmt(s.openers[0].text)).toBe('Ê. Ván caro hồi lớp 8 vẫn đang 4–3 đó nha. Ai gỡ?');
  });
});

// ---------------------------------------------------------------------------
// Chuyển Mốc + kết demo bản 9 Trang. Pack thật chưa có Trang 5–9 (N-15), nên dựng pack giả: fixture 4 Trang + hai Ngày Mốc 2 giả,
// dùng nguyên nội dung Hub thật (HUB, HUB_QUESTS_M2, ART_M2_01, pde_06 của PDES_M2).
// ---------------------------------------------------------------------------
function m2Pack(): ContentPack {
  const p = makePack();
  p.milestones.push({ id: 'm2', title: '[PLACEHOLDER] Mốc 2', school_years: ['g08', 'g09'], box_compartment: 2 });
  p.school_years.push(
    { id: 'g08', milestone_id: 'm2', start_year: 2016, end_year: 2017, age_range: [13, 14], age_variant: 'AGE_G8_9', group_members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'], map_variant: 'g06' },
    { id: 'g09', milestone_id: 'm2', start_year: 2017, end_year: 2018, age_range: [14, 15], age_variant: 'AGE_G8_9', group_members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'], map_variant: 'g07' },
  );
  const stubDay = (id: string, year: string, quest: string): MemoryDay => ({
    ...structuredClone(p.days[1]), id, school_year_id: year, main_chain: [quest], side_quests: [], daily_pool: [], album_page_id: `page.${id}`,
  });
  p.days.push(stubDay('d.g08.01', 'g08', 'q_m2_main_05'), stubDay('d.g09.03', 'g09', 'q_m2_main_09'));
  const m2Quest = (id: string, day: string): Quest => ({
    id, type: 'main', scope: 'm2', memory_day_id: day, title: `[PLACEHOLDER] ${id}`, owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0', blocks_main: true,
    steps: [{ id: `${id}.s01`, kind: 'interact', target: 'itr.thcs.tripod' }],
  });
  // Quest Hub thật thay quest Hub giả của fixture; hub.threads/interactables cũng là bản thật.
  p.quests = [...p.quests.filter((q) => q.scope !== 'hub'), m2Quest('q_m2_main_05', 'd.g08.01'), m2Quest('q_m2_main_09', 'd.g09.03'), ...HUB_QUESTS_M2];
  p.artifacts.push(ART_M2_01);
  p.pdes = [...p.pdes.filter((d) => d.id !== 'pde_06' && d.id !== 'pde_07'), PDES_M2.find((d) => d.id === 'pde_06')!];
  p.hub = HUB;
  return p;
}
const m2Config = () => makeConfig({ release: { memory_day_ids: ['d.g06.01', 'd.g07.03', 'd.g08.01', 'd.g09.03'], end_day_id: 'd.g09.03', end_step_id: 'q_hub_pd_03.s01' } });
const playM2Day = (t: ReturnType<typeof setup>, dayId: string) => { t.engine.startDay(dayId); t.engine.trigger('interact', 'itr.thcs.tripod'); t.engine.enterHub(); t.hub.refresh(); };

describe('Hub 2026 — PDE bản 9 Trang', () => {
  it('pde_06 chỉ đổi trigger (sang Trang 9 + đã lật sổ luật); các PDE khác và bản 4 Trang giữ nguyên', () => {
    expect(PDES.find((p) => p.id === 'pde_06')!.trigger).toEqual({ day: 'd.g07.03' });
    expect(PDES_M2.find((p) => p.id === 'pde_06')!.trigger).toEqual({ all: [{ day: 'd.g09.03' }, { quest: 'q_hub_pd_05' }] });
    expect(PDES_M2.find((p) => p.id === 'pde_06')!.effects).toEqual(PDES.find((p) => p.id === 'pde_06')!.effects);
    expect(PDES_M2.filter((p) => p.id !== 'pde_06')).toEqual(PDES.filter((p) => p.id !== 'pde_06'));
  });
});

describe('Chuyển Mốc: sau Trang 4 → thẻ "Mấy năm sau…" → hộp phấn sáng → mở Trang 5', () => {
  it('hộp phấn là kỷ vật Mốc 2: ẩn khi chưa mở đầu và khi Trang 4 chưa xong', () => {
    const t = setup({ pack: m2Pack(), config: m2Config() });
    t.engine.enterHub(); t.hub.refresh();
    expect(states(t).art_m2_01).toBe('hidden');
    t.intro(); t.playDay1(); t.hub.runPdes();
    expect(states(t).art_m2_01).toBe('hidden');
    expect(t.engine.questState('q_hub_event_02')).toBe('locked');
  });
  it('xong Trang 4: thẻ chữ tự mở, hộp phấn sáng và mở được Trang 5 (d.g08.01)', () => {
    const t = setup({ pack: m2Pack(), config: m2Config() });
    t.intro(); t.playDay1(); t.hub.runPdes(); t.playDay2(); t.hub.refresh();
    expect(t.engine.questState('q_hub_event_02')).toBe('active');
    expect(t.engine.activeSteps().map((r) => r.step.id)).toContain('q_hub_event_02.s01');
    expect(states(t).art_m2_01).toBe('glowing');
    expect(t.hub.canOpen('art_m2_01')).toBe('first');
    expect(t.hub.openArtifact('art_m2_01')).toEqual({ day_id: 'd.g08.01', replay: false });
    expect(t.hub.runPdes().map((p) => p.kind)).toContain('shelf');            // PDE của Trang 4 vẫn chạy
    expect(t.engine.questState('q_hub_pd_02')).toBe('locked');                // chưa tới kết demo
  });
});

describe('Kết demo bản 9 Trang: chỉ mở sau Trang 9, theo thứ tự timeskip → sổ luật → điện thoại → gửi tin', () => {
  it('chạy trọn: Trang 5 xong chưa mở kết; Trang 9 xong mới có timeskip; hoàn thành demo đúng một lần', () => {
    const t = setup({ pack: m2Pack(), config: m2Config() });
    t.intro(); t.playDay1(); t.hub.runPdes(); t.playDay2(); t.hub.runPdes();
    playM2Day(t, 'd.g08.01');
    expect(t.hub.runPdes().map((p) => p.kind)).toEqual([]);
    expect(t.engine.questState('q_hub_event_01')).toBe('locked');
    expect(t.engine.questState('q_hub_pd_02')).toBe('locked');
    expect(t.of('public_demo_completed')).toEqual([]);

    playM2Day(t, 'd.g09.03');                                                  // Trang 9 xong → về phòng 2026
    expect(t.engine.questState('q_hub_event_01')).toBe('active');              // timeskip trước
    expect(t.engine.questState('q_hub_pd_05')).toBe('locked');
    expect(t.hub.runPdes()).toEqual([]);                                       // chưa tới điện thoại
    t.engine.complete('q_hub_event_01.s01');
    expect(t.engine.questState('q_hub_pd_05')).toBe('active');                 // rồi tới sổ luật
    expect(t.hub.runPdes()).toEqual([]);
    expect(t.engine.trigger('interact', 'itr.hub.rulebook')).toMatchObject({ action: 'completed' });
    expect(t.hub.runPdes()).toEqual([]);                                       // mới lấy sổ xuống, chưa độc thoại xong
    t.engine.complete('q_hub_pd_05.s02');
    expect(t.hub.runPdes().map((p) => p.kind)).toEqual(['contact']);           // rồi mới tới điện thoại
    expect(t.engine.questState('q_hub_pd_02')).toBe('active');
    t.engine.complete('q_hub_pd_02.s01');
    expect(t.of('public_demo_completed')).toEqual([]);                         // còn bước gửi tin
    t.engine.complete('q_hub_pd_03.s01', { option_id: 'playful' });
    expect(t.of('public_demo_completed')).toHaveLength(1);
    expect(t.save.public_demo_done).toBe(true);
    expect(t.save.phone['thread.old_group']).toEqual([{ kind: 'sent', step_id: 'q_hub_pd_03.s01', option_id: 'playful' }]);
  });
  it('tin đã gửi hiện đúng trong nhóm chat cũ (không có dòng chat nào trước đó)', () => {
    const t = setup({ pack: m2Pack(), config: m2Config() });
    t.intro(); t.playDay1(); t.hub.runPdes(); t.playDay2(); t.hub.runPdes();
    playM2Day(t, 'd.g08.01'); playM2Day(t, 'd.g09.03');
    t.engine.complete('q_hub_event_01.s01'); t.engine.trigger('interact', 'itr.hub.rulebook'); t.engine.complete('q_hub_pd_05.s02');
    t.hub.runPdes(); t.engine.complete('q_hub_pd_02.s01');
    expect(t.hub.threadMessages('thread.old_group')).toEqual([]);
    t.engine.complete('q_hub_pd_03.s01', { option_id: 'deep' });
    expect(t.hub.threadMessages('thread.old_group').map((m) => [m.speaker, m.text, m.origin])).toEqual([
      ['player', 'Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha.', 'sent'],
    ]);
  });
});

// ---------------------------------------------------------------------------
// Đồ trong phòng dựng procedural (D3, PX-50): gốc min.y = 0, toon, không texture
// ---------------------------------------------------------------------------
describe('Phòng 2026 — đồ procedural (PX-50)', () => {
  it('mọi đồ dựng mới có đáy đúng y = 0 và cao hợp lý (mét)', () => {
    const win = makeNightWindow(1.5, 1.1);
    const winAll = new THREE.Group(); winAll.add(win.frame, win.pane, win.sky);
    const things: [string, THREE.Object3D, number][] = [
      ['đèn bàn', makeDeskLamp(), 0.43],
      ['khung ảnh tường', makeWallFrame(0.46, 0.34, '#9db7c9'), 0.34],
      ['khung kính', makeGlassFrame(0.2, 0.15), 0.165],
      ['thảm', makeRug(1.5, 1.0), 0.028],
      ['rèm', makeCurtain(0.4, 1.72), 1.72],
      ['sổ luật', makeRulebook(), 0.3],
      ['cửa sổ đêm', winAll, 1.1 + 0.16],
    ];
    for (const [name, obj, height] of things) {
      const b = new THREE.Box3().setFromObject(obj);
      expect(b.min.y, `${name}: min.y`).toBeCloseTo(0, 6);
      expect(b.max.y, `${name}: cao`).toBeCloseTo(height, 2);
    }
  });
  it('vật liệu là toon (đồ khối) hoặc phẳng không viền (trời/sao/trăng); không có texture nào', () => {
    for (const root of [makeDeskLamp(), makeRug(), makeRulebook(), makeWallFrame(0.3, 0.3, '#ffffff'), makeGlassFrame()]) {
      root.traverse((o) => {
        const m = o as THREE.Mesh; if (!m.isMesh) return;
        const mat = m.material as THREE.MeshToonMaterial | THREE.MeshBasicMaterial;
        expect(['MeshToonMaterial', 'MeshBasicMaterial']).toContain(mat.type);
        expect(mat.map ?? null).toBeNull();
      });
    }
    expect(makeNightWindow().pane.material.userData.outlineParameters).toEqual({ visible: false });   // trời: tắt viền
  });
  it('vật lặp ≥ 5 dùng InstancedMesh: sao (14) và nếp rèm (6)', () => {
    const stars = makeNightWindow().sky.children.find((c) => (c as THREE.InstancedMesh).isInstancedMesh) as THREE.InstancedMesh;
    expect(stars.count).toBe(14);
    const cur = makeCurtain(0.4, 1.7);
    expect(cur.isInstancedMesh).toBe(true); expect(cur.count).toBe(6);
  });

  const hubScene = () => { const s = buildHubScene(HUB, HUB_CONFIG); s.scene.updateMatrixWorld(true); s.camera.updateMatrixWorld(true); return s; };
  /** Đèn bàn là vật tự sáng: chụp đèn `lamp:shade` (emissive). Cảnh không có PointLight nào (K2: tránh biên dịch lại shader). */
  const lampOf = (s: ReturnType<typeof hubScene>) => (s.scene.getObjectByName('lamp:shade') as THREE.Mesh<THREE.BufferGeometry, THREE.MeshToonMaterial> | undefined) ?? null;
  const lightTypes = (s: ReturnType<typeof hubScene>) => { const t: string[] = []; s.scene.traverse((o) => { if ((o as THREE.Light).isLight) t.push(o.type); }); return t.sort(); };
  const skyVisible = (s: ReturnType<typeof hubScene>) => {
    let vis = false;
    s.scene.traverse((o) => {
      if (!(o as THREE.InstancedMesh).isInstancedMesh || (o as THREE.InstancedMesh).count !== 14) return;
      let a: THREE.Object3D | null = o; vis = true;
      while (a) { vis = vis && a.visible; a = a.parent; }
    });
    return vis;
  };
  it('dựng cảnh: đồ tĩnh gộp (mergeStatic), có đèn bàn, mọi vật tương tác bấm chọn được khi đi tới gần', () => {
    const s = hubScene();
    const merged = s.scene.getObjectByName('static:merged');
    expect(merged, 'decor đã gộp').toBeDefined();
    expect(merged!.children.length).toBeLessThan(40);                          // hàng chục khối → ít mesh theo vật liệu
    expect(lampOf(s)).not.toBeNull();
    // chỉ đúng bộ đèn của cảnh Trang (bán cầu + một đèn hướng) — không PointLight
    expect(lightTypes(s)).toEqual(['DirectionalLight', 'HemisphereLight']);
    const layout = HUB_ROOM.layout as Record<string, { x: number; z: number }>;
    for (const it of HUB.interactables) {
      // đứng lùi về phía giữa phòng 2 m, nhìn thẳng về tường cửa sổ (mọi vật tương tác nằm ở nửa phòng đó)
      const spot = layout[it.id.replace('itr.hub.', '')];
      expect(spot, `${it.id} có vị trí trong hubRoom.ts`).toBeDefined();
      s.teleport(spot.x, spot.z + 2, 0); s.update(0, 0); s.camera.updateMatrixWorld(true);
      const p = s.screenPoint(it.id)!;
      expect(p, it.id).not.toBeNull();
      expect(Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1, `${it.id} trong khung hình`).toBe(true);
      // Kệ là hai tấm ván cách nhau 0,55 m: tâm khung bao của nó rơi vào khoảng trống nên bấm đúng tâm là trượt (có từ trước N-08).
      if (it.id !== 'itr.hub.shelf') expect(s.pick(p.x, p.y), `bấm vào ${it.id}`).toBe(it.id);
    }
    s.dispose();
  });
  it('preset ấm: nền, đèn bàn sáng, cửa sổ đêm hiện trăng sao; preset lạnh tắt đèn và ẩn trời đêm', () => {
    const s = hubScene();
    s.setLighting('warm');
    expect((s.scene.background as THREE.Color).getHexString()).toBe(new THREE.Color(HUB_CONFIG.presets.warm.background).getHexString());
    expect(lampOf(s)!.material.emissiveIntensity).toBeGreaterThan(0);
    expect(skyVisible(s)).toBe(true);
    s.setLighting('cold');
    expect(lampOf(s)!.material.emissiveIntensity).toBe(0);
    expect(skyVisible(s)).toBe(false);
    s.dispose();
  });
  it('hộp phấn (shape "box") lên kệ: đáy nằm trên ván kệ, không lọt xuống', () => {
    const s = hubScene();
    s.setShelf([ART_M2_01]);
    let shelfItems: THREE.Object3D | null = null;
    const sz = -HUB_ROOM.size.d / 2 + 0.16;
    s.scene.traverse((o) => { if (o.type === 'Group' && o.position.x === HUB_ROOM.layout.shelf.x && Math.abs(o.position.y - 1.48) < 1e-9 && Math.abs(o.position.z - sz) < 1e-9) shelfItems = o; });
    expect(shelfItems, 'nhóm đồ trên kệ').not.toBeNull();
    const b = new THREE.Box3().setFromObject(shelfItems as unknown as THREE.Object3D);
    expect(b.min.y).toBeGreaterThanOrEqual(1.48 - 1e-6);
    expect(b.max.y - b.min.y).toBeLessThan(0.2);
    s.dispose();
  });
});
