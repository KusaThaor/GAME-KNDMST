import { describe, expect, it } from 'vitest';
import { AlbumModel, autoPhotoKey } from '../../src/systems/album';
import { ALBUM_CONFIG } from '../../src/config/album';
import { EventBus, type GameEventName } from '../../src/core/eventBus';
import { MemoryPhotoStore, newSave, type SaveState } from '../../src/core/save';
import { indexContent } from '../../src/content/indexContent';
import { makeConfig, makePack } from './fixtures/pack';

function setup(save: SaveState = newSave('a'), config = ALBUM_CONFIG) {
  const idx = indexContent(makePack(), makeConfig());
  const bus = new EventBus();
  const log: { name: GameEventName; p: unknown }[] = [];
  bus.onAny((name, p) => log.push({ name, p }));
  const album = new AlbumModel({ idx, save, bus, config });
  return { idx, bus, save, album, log, of: (n: GameEventName) => log.filter((e) => e.name === n).map((e) => e.p) };
}
const P1 = 'page.d.g06.01';

describe('trạng thái trang', () => {
  it('locked → faded (kỷ vật sáng) → restored (xong Ngày + phục hồi) → enriched/complete', () => {
    const t = setup();
    expect(t.album.pageState(P1)).toBe('locked');
    t.save.artifacts['art_m1_01'] = 'glowing';
    expect(t.album.pageState(P1)).toBe('faded');
    t.save.days['d.g06.01'] = { state: 'completed', replayed: false };
    expect(t.album.pageState(P1)).toBe('faded');           // xong Ngày nhưng chưa chạy phục hồi ở Hub
    expect(t.album.restorePage(P1).sort()).toEqual(['alb.d.g06.01.01', 'alb.d.g06.01.02', 'alb.d.g06.01.03']);
    expect(t.album.pageState(P1)).toBe('restored');
    t.album.grant('alb.d.g06.01.04');
    expect(t.album.pageState(P1)).toBe('complete');
  });

  it('enriched khi có thêm ô tùy chọn nhưng chưa đủ', () => {
    const t = setup();
    t.save.days['d.g07.03'] = { state: 'completed', replayed: false };
    const idx = t.idx;
    idx.pack.album_entries.push({ id: 'alb.d.g07.03.03', page_id: 'page.d.g07.03', slot_type: 'sticker', slot_index: 2, fragment_id: 'frag.d.g07.03.02', source: 'sticker_art', required_for_restore: false });
    t.album.restorePage('page.d.g07.03');
    expect(t.album.pageState('page.d.g07.03')).toBe('restored');
    t.album.grant('alb.d.g07.03.02');
    expect(t.album.pageState('page.d.g07.03')).toBe('enriched');
  });

  it('chưa xong Ngày thì không phục hồi được', () => {
    const t = setup();
    t.save.artifacts['art_m1_01'] = 'glowing';
    expect(t.album.restorePage(P1)).toEqual([]);
    expect(t.album.pageState(P1)).toBe('faded');
    expect(t.of('album_page_restored')).toEqual([]);
  });

  it('phát album_page_restored đúng một lần', () => {
    const t = setup();
    t.save.days['d.g06.01'] = { state: 'completed', replayed: false };
    t.album.restorePage(P1); t.album.restorePage(P1);
    expect(t.of('album_page_restored')).toEqual([{ page_id: P1 }]);
  });

  it('trang còn restored sau khi lưu rồi nạp lại', () => {
    const t = setup();
    t.save.days['d.g06.01'] = { state: 'completed', replayed: false };
    t.album.restorePage(P1);
    const t2 = setup(JSON.parse(JSON.stringify(t.save)));
    expect(t2.album.pageState(P1)).toBe('restored');
  });
});

describe('ô tùy chọn từ quest', () => {
  it('xong Side → nhận ô gắn với quest đó (kể cả khi chơi lại)', () => {
    const t = setup();
    t.bus.emit('quest_completed', { quest_id: 'q_m1_side_01', quest_type: 'side', memory_day_id: 'd.g06.01', is_replay: true });
    expect(t.album.owned('alb.d.g06.01.04')).toBe(true);
    expect(t.album.owned('alb.d.g06.01.01')).toBe(false);
  });
});

describe('ô của Daily (dùng chung nhiều Ngày)', () => {
  it('chỉ nhận ô nằm trên trang của Ngày vừa chơi', () => {
    const t = setup();
    t.idx.pack.album_entries.push(
      { id: 'alb.d.g06.01.05', page_id: 'page.d.g06.01', slot_type: 'quest_record', slot_index: 4, fragment_id: 'frag.d.g06.01.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_daily_01' },
      { id: 'alb.d.g07.03.03', page_id: 'page.d.g07.03', slot_type: 'quest_record', slot_index: 2, fragment_id: 'frag.d.g07.03.02', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_daily_01' },
    );
    for (const e of t.idx.pack.album_entries.slice(-2)) t.idx.entries.set(e.id, e);
    t.bus.emit('quest_completed', { quest_id: 'q_m1_daily_01', quest_type: 'daily', memory_day_id: 'd.g07.03', is_replay: false });
    expect(t.album.owned('alb.d.g07.03.03')).toBe(true);
    expect(t.album.owned('alb.d.g06.01.05')).toBe(false);
  });
});

describe('ảnh: tối đa 3 phiên bản, chọn ảnh hiển thị, ảnh dự phòng', () => {
  const E = 'alb.d.g07.03.01';
  it('ảnh mới thành ảnh hiển thị; ảnh thứ 4 đẩy ảnh cũ nhất không được chọn ra', () => {
    const t = setup();
    expect(t.album.addVariant(E, 'ph_1')).toEqual({ removed: null });
    t.album.addVariant(E, 'ph_2'); t.album.addVariant(E, 'ph_3');
    expect(t.album.selectVariant(E, 0)).toBe(true);
    expect(t.album.addVariant(E, 'ph_4')).toEqual({ removed: 'ph_2' });
    expect(t.save.album[E].variants).toEqual(['ph_1', 'ph_3', 'ph_4']);
    expect(t.save.album[E].variants[t.save.album[E].selected]).toBe('ph_4');
    expect(t.album.owned(E)).toBe(true);
  });
  it('chọn ảnh hiển thị sai chỉ số → bỏ qua', () => {
    const t = setup();
    t.album.addVariant(E, 'ph_1');
    expect(t.album.selectVariant(E, 5)).toBe(false);
    expect(t.save.album[E].selected).toBe(0);
  });
  it('thứ tự tìm ảnh: ảnh đang chọn → các ảnh khác → ảnh tự chụp', () => {
    const t = setup();
    t.album.addVariant(E, 'ph_1'); t.album.addVariant(E, 'ph_2'); t.album.selectVariant(E, 0);
    expect(t.album.photoCandidates(E)).toEqual(['ph_1', 'ph_2', autoPhotoKey(E)]);
  });
  it('IndexedDB mất ảnh của người chơi → dùng ảnh tự chụp; mất hết → null (cảnh sẽ chụp lại)', async () => {
    const t = setup();
    const store = new MemoryPhotoStore();
    t.album.addVariant(E, 'ph_1');
    await store.put(autoPhotoKey(E), new Uint8Array([7]));
    expect((await t.album.resolvePhoto(E, store))?.key).toBe(autoPhotoKey(E));
    await store.put('ph_1', new Uint8Array([1]));
    expect((await t.album.resolvePhoto(E, store))?.key).toBe('ph_1');
    await store.clear();
    expect(await t.album.resolvePhoto(E, store)).toBeNull();
  });
  it('ô không phải ảnh thì không có ứng viên ảnh', () => {
    expect(setup().album.photoCandidates('alb.d.g06.01.02')).toEqual([]);
  });
});

describe('tiến độ và sự kiện xem', () => {
  it('đếm số trang đã phục hồi; phần trăm luôn tính ngầm', () => {
    const t = setup();
    expect(t.album.progress()).toMatchObject({ pages_restored: 0, pages_total: 2, percent: 0, display: 'pages' });
    t.save.days['d.g06.01'] = { state: 'completed', replayed: false };
    t.album.restorePage(P1);
    const p = t.album.progress();
    expect(p.pages_restored).toBe(1);
    // ảnh 1/2 (60) + sticker 0/1 (25) + ghi chú 2/3 (15) → 30 + 0 + 10 = 40
    expect(p.percent).toBe(40);
  });
  it('cờ hiển thị đổi được bằng cấu hình (D-20)', () => {
    expect(setup(newSave('a'), { ...ALBUM_CONFIG, progress_display: 'percent' }).album.progress().display).toBe('percent');
  });
  it('mở Album → album_viewed; lật mặt sau ảnh → photo_back_viewed', () => {
    const t = setup();
    t.album.markViewed();
    t.album.markBackViewed('alb.d.g07.03.02');
    expect(t.of('album_viewed')).toEqual([{ pages_restored: 0 }]);
    expect(t.of('photo_back_viewed')).toEqual([{ album_entry_id: 'alb.d.g07.03.02' }]);
  });
  it('danh sách trang theo thứ tự phát hành, kèm ô và trạng thái', () => {
    const pages = setup().album.pages();
    expect(pages.map((p) => p.page_id)).toEqual([P1, 'page.d.g07.03']);
    expect(pages[0].entries.map((e) => e.entry.slot_type)).toEqual(['main_photo', 'note', 'artifact', 'sticker']);
    expect(pages[0].milestone_id).toBe('m1');
  });
});
