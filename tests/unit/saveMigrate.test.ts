import { describe, expect, it } from 'vitest';
import { MemoryKv, MemoryPhotoStore, SAVE_KEY, SAVE_VERSION, SaveStore, type KeyValueStore } from '../../src/core/save';

const ID = '11111111-1111-4111-8111-111111111111';

/** Bản lưu v2 dựng theo đúng hình dạng `SaveState` v2 sau một lượt chơi dở Trang 1. */
function fixtureV2() {
  return {
    v: 2,
    attempt_id: 'aaaaaaaa-1111-4111-8111-111111111111',
    player_name: 'Thảo',
    appearance: { gender: 'female', preset: 'default' },
    profile_done: true,
    current: { memory_day_id: 'd.g06.01', quest_id: 'q_m1_main_01', step_id: 'q_m1_main_01.s02', replay: null, zone_id: 'z.thcs.yard' },
    days: { 'd.g06.01': { state: 'in_progress', replayed: false } },
    quests: { q_m1_main_01: { state: 'active', step_id: 'q_m1_main_01.s02', progress: ['a'] }, q_m1_side_01: { state: 'completed', step_id: null, progress: [] } },
    flags: { 'm1.met_duc': true, 'm1.score': 3 },
    artifacts: { 'art.box': 'glowing' },
    album: { 'alb.d.g06.01.01': { status: 'owned', variants: ['auto:alb.d.g06.01.01'], selected: 0 } },
    relationships: { duc: { character_id: 'duc', flags: { friend: true }, tone_counts: { warm: 1, funny: 0, deep: 0 }, arc_progress: {}, bond: null, contacted_2026: false } },
    pde_done: ['pde.1'],
    phone: { duc: [{ kind: 'sent', step_id: 'q_m1_main_01.s01', option_id: 'o1' }] },
    public_demo_done: false,
    settings: { camera_mode: 'standard', free_look: true },
  };
}
const KEPT = ['attempt_id', 'player_name', 'appearance', 'profile_done', 'current', 'days', 'quests', 'flags', 'artifacts', 'album', 'relationships', 'pde_done', 'phone', 'public_demo_done', 'settings'] as const;

function seeded(raw: unknown = fixtureV2()) {
  const kv = new MemoryKv();
  const text = JSON.stringify(raw);
  kv.setItem(SAVE_KEY, text);
  return { kv, text, s: new SaveStore(kv, () => ID) };
}

describe('SaveStore: chuyển đổi v2 → v3', () => {
  it('SAVE_VERSION là 3', () => {
    expect(SAVE_VERSION).toBe(3);
  });

  it('v2 hợp lệ → status migrated, v = 3, giữ nguyên tiến trình và Album', () => {
    const { s } = seeded();
    const r = s.load();
    expect(r.status).toBe('migrated');
    expect(r.save.v).toBe(3);
    const src = fixtureV2() as Record<string, unknown>;
    for (const k of KEPT) expect(r.save[k], k).toEqual(src[k]);
  });

  it('trường mới có mặc định theo đặc tả (Mốc 2 chưa thêm, tên người chơi không lẫn vào)', () => {
    const r = seeded().s.load();
    expect(r.save.minigames).toEqual({});
    expect(r.save.minigames_story).toEqual({});
    expect(r.save.hub).toEqual({ unlocked: false });
    expect(r.save).not.toHaveProperty('story');
  });

  it('ghi v3 xuống máy ngay; lần nạp sau là loaded, không chuyển đổi lặp', () => {
    const { kv, s } = seeded();
    expect(s.load().status).toBe('migrated');
    expect(JSON.parse(kv.getItem(SAVE_KEY)!).v).toBe(3);
    const second = new SaveStore(kv, () => 'x').load();
    expect(second.status).toBe('loaded');
    expect(second.save.quests['q_m1_main_01'].step_id).toBe('q_m1_main_01.s02');
  });

  it('chuyển đổi không xóa khóa lưu và không đụng kho ảnh', async () => {
    const { kv, s } = seeded();
    const removed: string[] = [];
    const orig = kv.removeItem.bind(kv);
    kv.removeItem = (k) => { removed.push(k); orig(k); };
    const photos = new MemoryPhotoStore();
    const calls: string[] = [];
    for (const m of ['delete', 'clear'] as const) { const f = photos[m].bind(photos) as (...a: string[]) => Promise<void>; (photos as unknown as Record<string, unknown>)[m] = (...a: string[]) => { calls.push(m); return f(...a); }; }
    await photos.put('auto:alb.d.g06.01.01', new Uint8Array([7, 7]));
    const r = s.load();
    expect(r.status).toBe('migrated');
    expect(removed).toEqual([]);
    expect(calls).toEqual([]);
    expect(await photos.keys()).toEqual(['auto:alb.d.g06.01.01']);
    // tham chiếu ảnh trong Album vẫn trỏ đúng khóa còn trong kho
    const ref = r.save.album['alb.d.g06.01.01'].variants[0];
    expect(((await photos.get(ref)) as Uint8Array)[0]).toBe(7);
  });

  it('ghi v3 thất bại → bản v2 gốc còn nguyên cho lần thử lại, vẫn chơi được trong phiên', () => {
    const { kv, text, s } = seeded();
    const set = kv.setItem.bind(kv);
    kv.setItem = () => { throw new Error('QuotaExceededError'); };
    const r = s.load();
    expect(r.status).toBe('migrated');
    expect(r.save.v).toBe(3);
    expect(r.save.quests['q_m1_main_01'].step_id).toBe('q_m1_main_01.s02');
    expect(kv.getItem(SAVE_KEY)).toBe(text);
    // lần sau ghi được → chuyển đổi lại từ bản gốc và lưu v3
    kv.setItem = set;
    const retry = new SaveStore(kv, () => 'x').load();
    expect(retry.status).toBe('migrated');
    expect(JSON.parse(kv.getItem(SAVE_KEY)!).v).toBe(3);
  });

  it('lần nạp v2 không làm đổi object nguồn qua tham chiếu (bản gốc trong máy chỉ đổi khi ghi thành công)', () => {
    const { kv, text, s } = seeded();
    const blocked: KeyValueStore = { getItem: (k) => kv.getItem(k), setItem: () => { throw new Error('x'); }, removeItem: () => { throw new Error('không được xóa'); } };
    const r = new SaveStore(blocked, () => ID).load();
    expect(r.status).toBe('migrated');
    expect(kv.getItem(SAVE_KEY)).toBe(text);
    void s;
  });

  it('v1 → vẫn reset_old_version như cũ; version lạ → như baseline', () => {
    for (const v of [1, 4, undefined]) {
      const { kv, s } = seeded({ v, chapter: 3 });
      const r = s.load();
      expect(r.status).toBe('reset_old_version');
      expect(r.save.v).toBe(3);
      expect(kv.getItem(SAVE_KEY)).toBeNull();
    }
  });

  it('v3 có dữ liệu minigame → loaded, giữ nguyên', () => {
    const v3 = { ...fixtureV2(), v: 3, minigames: { 'owan.duc': { wins: 1, losses: 0, draws: 2, last_played: '2026-12-05' } }, minigames_story: { boat: { result: 'win', stars: 2 } }, hub: { unlocked: true } };
    const r = seeded(v3).s.load();
    expect(r.status).toBe('loaded');
    expect(r.save.minigames['owan.duc'].draws).toBe(2);
    expect(r.save.minigames_story['boat']).toEqual({ result: 'win', stars: 2 });
    expect(r.save.hub.unlocked).toBe(true);
  });

  it('v3 thiếu trường mới (bản ghi dở) → điền mặc định, không văng lỗi', () => {
    const r = seeded({ ...fixtureV2(), v: 3 }).s.load();
    expect(r.status).toBe('loaded');
    expect(r.save.minigames).toEqual({});
    expect(r.save.hub).toEqual({ unlocked: false });
  });
});
