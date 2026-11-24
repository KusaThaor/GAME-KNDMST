/** N-14: ảnh chụp nhiều lần chọn 1 (Trang 1) + ảnh cầu vồng lên bìa Album (Trang 4). */
import { describe, expect, it } from 'vitest';
import { AlbumModel, autoPhotoKey } from '../../src/systems/album';
import { ALBUM_CONFIG, type AlbumConfig } from '../../src/config/album';
import { EventBus } from '../../src/core/eventBus';
import { MemoryPhotoStore, newSave } from '../../src/core/save';
import { indexContent } from '../../src/content/indexContent';
import type { AlbumEntry } from '../../src/content/types';
import { makeConfig, makePack } from './fixtures/pack';

const ENTRY = 'alb.d.g06.01.01';
const COVER = 'alb.d.g07.03.cover';
const coverEntry: AlbumEntry = {
  id: COVER, page_id: 'page.d.g07.03', slot_type: 'main_photo', slot_index: 5, fragment_id: 'frag.d.g07.03.01',
  source: 'gameplay_photo', required_for_restore: true, replayable: true,
};

function setup(opts: { withCover?: boolean; config?: Partial<AlbumConfig> } = {}) {
  const pack = makePack();
  if (opts.withCover) pack.album_entries.push(coverEntry);
  const idx = indexContent(pack, makeConfig());
  const save = newSave('a');
  const album = new AlbumModel({ idx, save, bus: new EventBus(), config: { ...ALBUM_CONFIG, ...opts.config } });
  return { idx, save, album };
}

describe('chụp 3 lần chọn 1 (keepShots)', () => {
  it('chọn tấm thứ 2 → giữ cả 3 tấm, selected = 1, Album hiện tấm thứ 2', async () => {
    const t = setup();
    const store = new MemoryPhotoStore();
    const keys = ['ph_1', 'ph_2', 'ph_3'];
    for (const k of keys) await store.put(k, new Uint8Array([Number(k.slice(-1))]));
    expect(t.album.keepShots(ENTRY, keys, 1)).toEqual({ removed: [] });
    expect(t.save.album[ENTRY]).toEqual({ status: 'owned', variants: keys, selected: 1 });
    expect(t.album.photoCandidates(ENTRY)[0]).toBe('ph_2');
    const shown = await t.album.resolvePhoto(ENTRY, store);
    expect(shown?.key).toBe('ph_2');
    expect(shown?.data).toEqual(new Uint8Array([2]));
  });

  it('chọn tấm có chỉ số 2 (tấm cuối) → selected = 2; Album hiện đúng tấm đó', async () => {
    const t = setup();
    const store = new MemoryPhotoStore();
    for (const k of ['a', 'b', 'c']) await store.put(k, new Uint8Array([k.charCodeAt(0)]));
    t.album.keepShots(ENTRY, ['a', 'b', 'c'], 2);
    expect(t.save.album[ENTRY].selected).toBe(2);
    expect((await t.album.resolvePhoto(ENTRY, store))?.key).toBe('c');
  });

  it('đổi tấm trong Album sau khi giữ (selectVariant) vẫn chạy như cũ', () => {
    const t = setup();
    t.album.keepShots(ENTRY, ['a', 'b', 'c'], 0);
    expect(t.album.selectVariant(ENTRY, 2)).toBe(true);
    expect(t.album.photoCandidates(ENTRY)).toEqual(['c', 'a', 'b', autoPhotoKey(ENTRY)]);
  });

  it('chơi lại Ngày: loạt mới thay loạt cũ, trả về các khóa ảnh cũ để xóa khỏi máy', () => {
    const t = setup();
    t.album.keepShots(ENTRY, ['old1', 'old2', 'old3'], 0);
    const { removed } = t.album.keepShots(ENTRY, ['n1', 'n2', 'n3'], 1);
    expect(removed.sort()).toEqual(['old1', 'old2', 'old3']);
    expect(t.save.album[ENTRY]).toEqual({ status: 'owned', variants: ['n1', 'n2', 'n3'], selected: 1 });
  });

  it('loạt dài hơn max_variants: luôn giữ tấm được chọn, bỏ bớt tấm khác', () => {
    const t = setup({ config: { max_variants: 2 } });
    const { removed } = t.album.keepShots(ENTRY, ['a', 'b', 'c'], 2);
    expect(t.save.album[ENTRY].variants).toEqual(['a', 'c']);
    expect(t.save.album[ENTRY].selected).toBe(1);
    expect(t.album.photoCandidates(ENTRY)[0]).toBe('c');
    expect(removed).toEqual(['b']);
  });

  it('chỉ số chọn ngoài khoảng bị kẹp về tấm hợp lệ; loạt rỗng không đổi gì', () => {
    const t = setup();
    t.album.keepShots(ENTRY, ['a', 'b', 'c'], 9);
    expect(t.save.album[ENTRY].selected).toBe(2);
    expect(t.album.keepShots('alb.d.g07.03.01', [], 0)).toEqual({ removed: [] });
    expect(t.save.album['alb.d.g07.03.01']).toBeUndefined();
  });

  it('ô không có trong nội dung: không ghi gì, trả lại cả loạt để xóa', () => {
    const t = setup();
    expect(t.album.keepShots('alb.khong_co', ['a', 'b'], 0)).toEqual({ removed: ['a', 'b'] });
    expect(t.save.album['alb.khong_co']).toBeUndefined();
  });
});

describe('bìa Album (coverEntryId)', () => {
  it('cấu hình thật trỏ bìa vào ảnh cầu vồng alb.d.g07.03.cover', () => {
    expect(ALBUM_CONFIG.cover_entry_id).toBe(COVER);
  });

  it('có ô cover và đã nhận → bìa lấy đúng ô cover (không lấy ảnh nhóm)', () => {
    const t = setup({ withCover: true });
    t.album.grant('alb.d.g07.03.01');
    expect(t.album.coverEntryId()).toBeNull();              // chưa giữ ảnh cầu vồng: bìa không lấy ảnh nhóm thay
    t.album.addVariant(COVER, 'ph_rainbow');
    expect(t.album.coverEntryId()).toBe(COVER);
    expect(t.album.photoCandidates(t.album.coverEntryId()!)[0]).toBe('ph_rainbow');
  });

  it('nội dung chưa có ô cover (trước khi N-01 gộp) → dùng ô dự phòng trong cấu hình nếu đã nhận', () => {
    const t = setup();
    expect(t.album.coverEntryId()).toBeNull();
    t.album.grant('alb.d.g07.03.01');
    expect(t.album.coverEntryId()).toBe(ALBUM_CONFIG.cover_fallback_entry_id);
  });

  it('cấu hình null → bìa trống; ô không phải ô ảnh → không lên bìa', () => {
    expect(setup({ config: { cover_entry_id: null, cover_fallback_entry_id: null } }).album.coverEntryId()).toBeNull();
    const t = setup({ config: { cover_entry_id: 'alb.d.g06.01.02', cover_fallback_entry_id: null } });
    t.album.grant('alb.d.g06.01.02');
    expect(t.album.coverEntryId()).toBeNull();
  });
});
