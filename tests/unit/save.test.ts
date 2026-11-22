import { describe, expect, it } from 'vitest';
import { MemoryKv, MemoryPhotoStore, PLAYER_NAME_MAX, SAVE_KEY, SaveStore, attachAutosave, getMg, migrate, newSave, recordMg, reconcileSave, sanitizePlayerName } from '../../src/core/save';
import { EventBus } from '../../src/core/eventBus';
import { indexContent } from '../../src/content/indexContent';
import { makeConfig, makePack } from './fixtures/pack';

const store = (kv = new MemoryKv()) => ({ kv, s: new SaveStore(kv, () => '11111111-1111-4111-8111-111111111111') });

describe('SaveStore v3', () => {
  it('chưa có gì → tạo file lưu mới v3, chưa ghi xuống máy', () => {
    const { kv, s } = store();
    const r = s.load();
    expect(r.status).toBe('new');
    expect(r.save.v).toBe(3);
    expect(r.save.attempt_id).toBe('11111111-1111-4111-8111-111111111111');
    expect(kv.getItem(SAVE_KEY)).toBeNull();
  });

  it('ghi rồi đọc lại đúng nội dung (theo ID)', () => {
    const { kv, s } = store();
    const save = s.load().save;
    save.player_name = 'Thảo';
    save.quests['q_m1_main_01'] = { state: 'active', step_id: 'q_m1_main_01.s02', progress: [] };
    save.current = { memory_day_id: 'd.g06.01', quest_id: 'q_m1_main_01', step_id: 'q_m1_main_01.s02', replay: null };
    s.persist(save);
    const again = new SaveStore(kv, () => 'x').load();
    expect(again.status).toBe('loaded');
    expect(again.save.current.step_id).toBe('q_m1_main_01.s02');
    expect(again.save.player_name).toBe('Thảo');
  });

  it('nạp checkpoint v2 của một lượt chơi Trang 1 rồi lưu v3 một lần', () => {
    // Chụp từ localStorage khi chơi bản 3a99748 tới bước thứ hai của Trang 1.
    const old = {
      v: 2, attempt_id: '225e2326-563e-4c7f-9d2d-06251a638b60', player_name: 'Mai',
      appearance: { gender: 'male', preset: 'default' }, profile_done: true,
      current: { memory_day_id: 'd.g06.01', quest_id: 'q_m1_main_01', step_id: 'q_m1_main_01.s02',
        replay: null, day_start: { flags: {}, relationships: {} }, zone_id: 'zone.thcs.yard' },
      days: { 'd.g06.01': { state: 'in_progress', replayed: false } },
      quests: {
        q_hub_pd_01: { state: 'completed', step_id: null, progress: [] },
        q_hub_pd_02: { state: 'locked', step_id: null, progress: [] },
        q_hub_pd_03: { state: 'locked', step_id: null, progress: [] },
        q_m1_main_01: { state: 'active', step_id: 'q_m1_main_01.s02', progress: [] },
        q_m1_side_01: { state: 'completed', step_id: null, progress: [] },
        'q_m1_daily_01@d.g06.01': { state: 'completed', step_id: null, progress: [] },
      },
      artifacts: { art_m1_01: 'glowing', art_m1_02: 'dim', art_m1_03: 'dim', art_m1_05: 'dim' },
      album: {
        'alb.d.g06.01.04': { status: 'owned', variants: [], selected: 0 },
        'alb.d.g06.01.05': { status: 'owned', variants: [], selected: 0 },
      },
      flags: {}, relationships: {}, pde_done: [], phone: {}, public_demo_done: false, settings: { camera_mode: 'standard' },
    };
    const { kv, s } = store();
    kv.setItem(SAVE_KEY, JSON.stringify(old));
    const { save, status } = s.load();
    expect(status).toBe('migrated');
    expect(save).toMatchObject({ ...old, v: 3 });
    expect(save).toMatchObject({
      minigames: {}, minigames_story: {}, caro: { series: { quan: 3, duc: 3 }, story_result: null },
      sudoku: { best: {}, story_result: null }, story: { valentine: {} }, hub: { unlocked: false },
      settings: { volume: 1, text_speed: 'normal', difficulty: 'normal', caro_rule: 'freestyle', sudoku_mistake_mode: 'off' },
    });
    expect(s.load()).toEqual({ save, status: 'loaded' });
  });

  it('giữ lựa chọn ảnh, cờ và thiết lập camera cũ kể cả khi thiếu trường', () => {
    const old = { v: 2, flags: { 'm1.base_decor': 'paper' }, public_demo_done: true,
      album: { photo: { status: 'owned', variants: ['ph_1', 'ph_2'], selected: 1 } },
      settings: { camera_mode: 'B', free_look: true } };
    expect(migrate(old)).toMatchObject({ ...old, v: 3, settings: { ...old.settings, volume: 1 } });
  });

  it('ghi v3 thất bại vẫn dùng được trong phiên và giữ nguyên v2 để thử lại', () => {
    const { kv, s } = store();
    const raw = JSON.stringify({ v: 2, player_name: 'Mai' });
    kv.setItem(SAVE_KEY, raw);
    kv.setItem = () => { throw new Error('QuotaExceededError'); };
    expect(s.load()).toMatchObject({ status: 'migrated', save: { v: 3, player_name: 'Mai' } });
    expect(kv.getItem(SAVE_KEY)).toBe(raw);
  });

  it('bản lưu từ phiên bản mới hơn được giữ nguyên trên máy', () => {
    const { kv, s } = store();
    const raw = JSON.stringify({ v: 4, days: {} });
    kv.setItem(SAVE_KEY, raw);
    expect(() => s.load()).toThrow('v4');
    expect(kv.getItem(SAVE_KEY)).toBe(raw);
  });

  it('gặp file lưu v1 → xóa và tạo mới', () => {
    const { kv, s } = store();
    kv.setItem(SAVE_KEY, JSON.stringify({ v: 1, chapter: 3, name: 'cũ' }));
    const r = s.load();
    expect(r.status).toBe('reset_old_version');
    expect(r.save.v).toBe(3);
    expect(r.save.player_name).toBe('');
    expect(kv.getItem(SAVE_KEY)).toBeNull();
  });

  it('file lưu hỏng → tạo mới, không văng lỗi', () => {
    const { kv, s } = store();
    kv.setItem(SAVE_KEY, '{không phải json');
    expect(s.load().status).toBe('reset_corrupt');
  });

  it.each([{ v: 2, quests: { broken: null } }, { v: 2, album: [] }, { v: 3, current: { replay: {} } }])(
    'JSON đúng cú pháp nhưng cấu trúc hỏng → tạo mới', invalid => {
      const { kv, s } = store();
      kv.setItem(SAVE_KEY, JSON.stringify(invalid));
      expect(s.load().status).toBe('reset_corrupt');
      expect(kv.getItem(SAVE_KEY)).toBeNull();
    });

  it('xóa tiến trình: mất file lưu và ảnh, attempt mới', async () => {
    const kv = new MemoryKv();
    let n = 0;
    const s = new SaveStore(kv, () => `0000000${++n}-1111-4111-8111-111111111111`);
    const photos = new MemoryPhotoStore();
    const save = s.load().save;
    s.persist(save);
    await photos.put('ph_1', new Uint8Array([1, 2, 3]));
    const fresh = await s.wipe(photos);
    expect(kv.getItem(SAVE_KEY)).toBeNull();
    expect(await photos.keys()).toEqual([]);
    expect(fresh.attempt_id).not.toBe(save.attempt_id);
  });

  it('bộ nhớ trình duyệt bị chặn/đầy → không văng lỗi, báo persist thất bại', () => {
    const kv = new MemoryKv();
    kv.setItem = () => { throw new Error('QuotaExceededError'); };
    const s = new SaveStore(kv, () => 'x');
    expect(s.persist(newSave('x'))).toBe(false);
  });
});

describe('tên Player', () => {
  it('giữ dấu tiếng Việt, cắt còn 12 ký tự, không đổi hoa/thường', () => {
    expect(sanitizePlayerName('  Nguyễn  Thị Ánh Tuyết ')).toBe('Nguyễn Thị Á');
    expect(Array.from(sanitizePlayerName('Đặng Thùy Trâm Anh')).length).toBe(PLAYER_NAME_MAX);
    expect(sanitizePlayerName('thảo')).toBe('thảo');
  });
  it('tên gõ kiểu tổ hợp (NFD) vẫn đếm đúng số chữ', () => {
    const nfd = 'Ánh Tuyết Ngọc'.normalize('NFD');
    expect(sanitizePlayerName(nfd)).toBe('Ánh Tuyết Ng');
  });
  it('bỏ ký tự điều khiển và ngoặc nhọn (tránh phá mẫu thoại)', () => {
    expect(sanitizePlayerName('A{b}\n<c>')).toBe('Ab c');
  });
});

describe('reconcileSave — nội dung đổi sau khi đã lưu', () => {
  const idx = indexContent(makePack(), makeConfig());
  it('checkpoint trỏ tới bước đã bị xóa → về đầu quest đó', () => {
    const save = newSave('a');
    save.quests['q_m1_main_01'] = { state: 'active', step_id: 'q_m1_main_01.s77', progress: [] };
    save.current = { memory_day_id: 'd.g06.01', quest_id: 'q_m1_main_01', step_id: 'q_m1_main_01.s77', replay: null };
    reconcileSave(save, idx);
    expect(save.quests['q_m1_main_01'].step_id).toBe('q_m1_main_01.s01');
    expect(save.current.step_id).toBe('q_m1_main_01.s01');
  });
  it('Ngày đã completed không bao giờ bị mở lại; Ngày không còn tồn tại thì bỏ con trỏ hiện tại', () => {
    const save = newSave('a');
    save.days['d.g06.01'] = { state: 'completed', replayed: false };
    save.current = { memory_day_id: 'd.g99.01', quest_id: null, step_id: null, replay: null };
    reconcileSave(save, idx);
    expect(save.days['d.g06.01'].state).toBe('completed');
    expect(save.current.memory_day_id).toBeNull();
  });
  it('giữ lại ID lạ trong file lưu (nội dung deprecated), không xóa', () => {
    const save = newSave('a');
    save.quests['q_m1_side_42'] = { state: 'completed', step_id: null, progress: [] };
    reconcileSave(save, idx);
    expect(save.quests['q_m1_side_42'].state).toBe('completed');
  });
});

describe('MemoryPhotoStore', () => {
  it('lưu, đọc, xóa theo khóa', async () => {
    const p = new MemoryPhotoStore();
    await p.put('auto:alb.d.g06.01.01', new Uint8Array([9]));
    expect(((await p.get('auto:alb.d.g06.01.01')) as Uint8Array)[0]).toBe(9);
    expect(await p.get('nope')).toBeNull();
    await p.delete('auto:alb.d.g06.01.01');
    expect(await p.keys()).toEqual([]);
  });
});

describe('tự lưu', () => {
  it('ghi xuống máy mỗi khi engine báo checkpoint, và khi về Hub', () => {
    const kv = new MemoryKv();
    const s = new SaveStore(kv, () => 'a');
    const save = s.load().save;
    const bus = new EventBus();
    const stop = attachAutosave(bus, s, () => save);
    expect(kv.getItem(SAVE_KEY)).toBeNull();
    save.flags['m1.x'] = 1;
    bus.emit('save_requested', { reason: 'step_boundary' });
    expect(JSON.parse(kv.getItem(SAVE_KEY)!).flags['m1.x']).toBe(1);
    save.flags['m1.x'] = 2;
    bus.emit('hub_entered', { first: false });
    expect(JSON.parse(kv.getItem(SAVE_KEY)!).flags['m1.x']).toBe(2);
    save.flags['m1.x'] = 3;
    bus.emit('part_started', { quest_id: 'q_m2_event_01', part_id: 'p2' });
    expect(JSON.parse(kv.getItem(SAVE_KEY)!).flags['m1.x']).toBe(3);
    stop();
    save.flags['m1.x'] = 4;
    bus.emit('save_requested', { reason: 'x' });
    expect(JSON.parse(kv.getItem(SAVE_KEY)!).flags['m1.x']).toBe(3);
  });
});

describe('kết quả minigame', () => {
  it('thống kê riêng theo đối thủ; chơi lại vẫn giữ sao và kết quả truyện đầu tiên', () => {
    const save = newSave('game');
    expect(getMg(save, 'boat')).toEqual({ wins: 0, losses: 0, draws: 0, last_played: null });
    recordMg(save, 'boat', { result: 'win', stars: 3 });
    recordMg(save, 'boat', 'draw');
    recordMg(save, 'boat', 'quit', 'quan');
    expect(save.minigames_story.boat).toEqual({ result: 'win', stars: 3 });
    expect(getMg(save, 'boat')).toMatchObject({ wins: 1, draws: 1, losses: 0 });
    expect(save.minigames['boat.quan']).toMatchObject({ wins: 0, draws: 0, losses: 1 });
    expect(new Date(save.minigames['boat.-'].last_played!).toISOString()).toBe(getMg(save, 'boat').last_played);
  });

  it.each([
    ['duc', 'win', 4, 3], ['duc', 'lose', 3, 4], ['quan', 'win', 3, 4],
    ['quan', 'lose', 4, 3], ['duc', 'draw', 3, 3], ['quan', 'quit', 4, 3],
  ] as const)('Caro với %s, kết quả %s: Quân %i – Đức %i sau cả lần chơi lại', (opp, result, quan, duc) => {
    const save = newSave('game');
    recordMg(save, 'mg_caro', result, opp);
    recordMg(save, 'mg_caro', 'win', opp);
    expect(save.caro).toEqual({ series: { quan, duc }, story_result: { result: result === 'quit' ? 'lose' : result, opponent: opp } });
  });

  it('ván ngoài truyện chỉ cập nhật thống kê; bỏ Sudoku trong truyện tính là thua', () => {
    const save = newSave('game');
    recordMg(save, 'mg_sudoku', 'complete', null, 'hub');
    expect(save.minigames_story).toEqual({});
    expect(getMg(save, 'mg_sudoku')).toMatchObject({ wins: 0, losses: 0, draws: 0, last_played: expect.any(String) });
    recordMg(save, 'mg_sudoku', 'quit');
    recordMg(save, 'mg_sudoku', 'win');
    expect(save.sudoku.story_result).toBe('lose');
    expect(save.minigames_story.mg_sudoku).toEqual({ result: 'quit', stars: null });
  });
});
