import { describe, expect, it } from 'vitest';
import { ALBUM_CONFIG } from '../../src/config/album';
import { GAME_CONFIG } from '../../src/config/game';
import { HUB_CONFIG } from '../../src/config/hub';
import { indexContent } from '../../src/content/indexContent';
import { EventBus } from '../../src/core/eventBus';
import { newSave } from '../../src/core/save';
import { albumView, boxView, formatGameText, phoneView } from '../../src/game/runtime/uiAdapters';
import { AlbumModel } from '../../src/systems/album';
import { HubModel } from '../../src/systems/hub';
import { QuestEngine } from '../../src/systems/questEngine';
import { makeConfig, makePack } from './fixtures/pack';

function setup() {
  const save = newSave('test-save');
  save.player_name = 'Minh';
  save.appearance = { gender: 'female', preset: 'default' };
  const idx = indexContent(makePack(), makeConfig());
  const bus = new EventBus();
  const engine = new QuestEngine({ idx, save, bus });
  const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
  const hub = new HubModel({ idx, save, bus, engine, album, config: HUB_CONFIG });
  const fmt = (text: string) => formatGameText(text, save);
  const intro = () => {
    engine.enterHub();
    engine.complete('q_hub_pd_01.s01');
    engine.trigger('interact', 'itr.hub.memory_box');
    hub.refresh();
  };
  const playDay1 = () => {
    engine.startDay('d.g06.01');
    engine.trigger('interact', 'NPC_A');
    engine.complete('q_m1_main_01.s01');
    engine.complete('q_m1_main_01.s02', { option_id: 'a' });
    engine.trigger('interact', 'itr.thcs.desk');
    engine.answerEndPrompt('leave');
    engine.enterHub();
    hub.refresh();
    hub.runPdes();
  };
  const playDay2 = () => {
    engine.startDay('d.g07.03');
    engine.trigger('interact', 'itr.thcs.tripod');
    engine.complete('q_m1_main_05.s02');
    engine.enterHub();
    hub.refresh();
    hub.runPdes();
  };
  return { save, idx, bus, engine, album, hub, fmt, intro, playDay1, playDay2 };
}

describe('uiAdapters', () => {
  it('formatGameText thay {player_name}, {g:...|...} và {quan}–{duc}', () => {
    const { save } = setup();
    save.caro.series = { quan: 4, duc: 2 };
    expect(formatGameText('Chào {player_name} ({g:cậu|cô}) — caro {quan}–{duc}', save))
      .toBe('Chào Minh (cô) — caro 4–2');
  });

  it('boxView phản ánh đúng trạng thái ngăn, hành động first/replay và văn bản đã định dạng', () => {
    const t = setup();
    t.engine.enterHub();
    t.hub.refresh();
    const locked = boxView({ hub: t.hub, fmt: t.fmt });
    expect(locked.compartments[0].open).toBe(false);
    expect(locked.compartments[0].artifacts.map((a) => [a.id, a.state, a.action])).toEqual([
      ['art_m1_01', 'hidden', null],
      ['art_m1_05', 'hidden', null],
    ]);

    t.intro();
    const afterIntro = boxView({ hub: t.hub, fmt: t.fmt });
    expect(afterIntro.compartments[0].open).toBe(true);
    expect(afterIntro.compartments[0].artifacts.map((a) => [a.id, a.state, a.action])).toEqual([
      ['art_m1_01', 'glowing', 'first'],
      ['art_m1_05', 'dim', null],
    ]);

    t.playDay1();
    const afterDay1 = boxView({ hub: t.hub, fmt: t.fmt });
    expect(afterDay1.compartments[0].artifacts.map((a) => [a.id, a.state, a.action])).toEqual([
      ['art_m1_01', 'on_shelf', 'replay'],
      ['art_m1_05', 'glowing', 'first'],
    ]);
  });

  it('albumView dựng đúng tiến độ, URL ảnh, variants, ghi chú định dạng và mặt sau khi lật', () => {
    const t = setup();
    t.intro();
    t.playDay1();
    t.album.addVariant('alb.d.g06.01.01', 'ph_1');
    t.album.addVariant('alb.d.g06.01.01', 'ph_2');
    t.album.selectVariant('alb.d.g06.01.01', 0);
    t.album.grant('alb.d.g07.03.02');
    // Cover fallback trong ALBUM_CONFIG là alb.d.g07.03.01 khi pack test chưa có alb.d.g07.03.cover
    t.album.grant('alb.d.g07.03.01');

    const urls = new Map<string, string>([
      ['alb.d.g06.01.01', 'blob:photo-1'],
      ['alb.d.g07.03.01', 'blob:cover'],
    ]);
    const flipped = new Set<string>(['page.d.g07.03']);

    const view = albumView({ idx: t.idx, album: t.album, photoUrls: urls, flipped, fmt: t.fmt });
    expect(view.progress).toBe('1/2 trang');
    expect(view.coverUrl).toBe('blob:cover');

    const page1 = view.pages[0];
    expect(page1.state).toBe('restored');
    expect(page1.flipped).toBe(false);
    expect(page1.back).toBeNull();
    expect(page1.entries[0]).toMatchObject({
      id: 'alb.d.g06.01.01',
      owned: true,
      isPhoto: true,
      url: 'blob:photo-1',
      variants: 2,
      selected: 0,
    });
    expect(page1.entries[1]).toMatchObject({
      id: 'alb.d.g06.01.02',
      owned: true,
      isPhoto: false,
      text: '[PLACEHOLDER] ghi chú của Minh',
    });

    const page2 = view.pages[1];
    expect(page2.flipped).toBe(true);
    expect(page2.back).toEqual({ entry_id: 'alb.d.g07.03.02', text: '[PLACEHOLDER] mặt sau' });
  });

  it('phoneView dựng danh sách thread, lịch sử, status nhóm trống và compose_message', () => {
    const t = setup();
    t.intro();
    t.playDay1();
    t.playDay2();

    const listOnly = phoneView({
      idx: t.idx, hub: t.hub, engine: t.engine,
      phoneThread: null, phoneDraft: null,
      profile: { player_name: t.save.player_name, gender: t.save.appearance.gender }, fmt: t.fmt,
    });
    expect(listOnly.app).toBe(HUB_CONFIG.app_chat_name);
    expect(listOnly.threads).toEqual([{ id: 'thread.group', title: '[PLACEHOLDER] nhóm chat cũ' }]);
    expect(listOnly.thread).toBeNull();

    // Mở thread hoàn thành bước phone_ui → mở sang compose_message
    t.engine.complete('q_hub_pd_02.s01');
    const opened = phoneView({
      idx: t.idx, hub: t.hub, engine: t.engine,
      phoneThread: 'thread.group', phoneDraft: 'b',
      profile: { player_name: t.save.player_name, gender: t.save.appearance.gender }, fmt: t.fmt,
    });
    expect(opened.thread).toEqual({
      id: 'thread.group',
      title: '[PLACEHOLDER] nhóm chat cũ',
      status: null,
      messages: [{ who: 'Đức', text: '[PLACEHOLDER] tin cũ', mine: false }],
      compose: {
        draft: 'b',
        openers: [
          { id: 'a', text: '[PLACEHOLDER] mở lời A', tone: GAME_CONFIG.tone_labels.playful },
          { id: 'b', text: '[PLACEHOLDER] mở lời B', tone: GAME_CONFIG.tone_labels.gentle },
          { id: 'c', text: '[PLACEHOLDER] mở lời C', tone: GAME_CONFIG.tone_labels.deep },
        ],
      },
    });

    // Nhóm không có tin nhắn cũ hiện status từ HUB_CONFIG
    t.idx.pack.hub.threads.push({ id: 'thread.empty', title: 'Nhóm trống', members: ['player'], history: [] });
    const emptyThread = phoneView({
      idx: t.idx, hub: t.hub, engine: t.engine,
      phoneThread: 'thread.empty', phoneDraft: null,
      profile: { player_name: t.save.player_name, gender: t.save.appearance.gender }, fmt: t.fmt,
    });
    expect(emptyThread.thread?.status).toBe(HUB_CONFIG.old_chat_last_label);
    expect(emptyThread.thread?.compose).toBeNull();
  });
});
