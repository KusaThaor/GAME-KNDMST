import { describe, expect, it } from 'vitest';
import { MemoryKv, MemoryPhotoStore, PLAYER_NAME_MAX, SAVE_KEY, SaveStore, attachAutosave, newSave, reconcileSave, sanitizePlayerName } from '../../src/core/save';
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
