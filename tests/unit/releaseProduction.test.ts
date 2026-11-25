/**
 * Bản Production Mốc 1 (N-22a): khai 4 Trang + tắt Side/Daily do AI nghĩ.
 *
 * Validator production CHỈ in lỗi ra console khi nạp game (game.ts), không chặn — nên file này là lưới an toàn duy nhất:
 * nó chặn lúc `npm test` nếu bản production lại lọt nội dung chưa duyệt (AI_PROPOSED / [PLACEHOLDER]).
 * Vitest chạy với __APP_ENV__ = 'test' nên `CONTENT` ở đây là gói ĐẦY ĐỦ; bản production lấy qua `filterPackForRelease`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALBUM_CONFIG } from '../../src/config/album';
import { HUB_CONFIG } from '../../src/config/hub';
import { HUB_BOX_LINES, HUB_DECOR } from '../../src/config/hubRoom';
import { indexContent } from '../../src/content/indexContent';
import { CONTENT, contentConfig, filterPackForRelease } from '../../src/content/pack';
import { RELEASES } from '../../src/content/release';
import type { ContentPack, Step } from '../../src/content/types';
import { formatReport, PLACEHOLDER_TAG, validateContent } from '../../src/content/validate';
import { EventBus } from '../../src/core/eventBus';
import { newSave } from '../../src/core/save';
import { AlbumModel } from '../../src/systems/album';
import { HubModel } from '../../src/systems/hub';
import { QuestEngine } from '../../src/systems/questEngine';
import { ReleaseTracker } from '../../src/systems/release';

const MOC1 = ['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03'];
const AI_SIDE_DAILY = ['q_m1_ai_daily_01', 'q_m1_ai_side_01', 'q_m1_ai_side_02', 'q_m1_ai_side_03', 'q_m1_ai_side_04'];

let cached: ContentPack | undefined;
/** Gói production (tính một lần, tính lười để test hỏng thì báo từng ca thay vì lỗi lúc nạp file). */
const production = () => (cached ??= filterPackForRelease(CONTENT, 'production'));

function stringsOf(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => stringsOf(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => stringsOf(v, path ? `${path}.${k}` : k));
  return [];
}

describe('khai báo bản production (release.ts)', () => {
  it('4 Trang Mốc 1 theo đúng thứ tự bản test, kết như bản test (Q1 = phương án A)', () => {
    expect(RELEASES.production).toEqual({ memory_day_ids: MOC1, end_day_id: 'd.g07.03', end_step_id: 'q_hub_pd_03.s01' });
  });
});

describe('(a) validator production', () => {
  it('gói đã lọc: 0 lỗi', () => {
    const r = validateContent(production(), contentConfig('production'));
    expect(formatReport({ errors: r.errors, warnings: [] })).toBe('');
  });
  it('gói CHƯA lọc bị chặn — chính bộ lọc làm nên 0 lỗi', () => {
    const r = validateContent(CONTENT, contentConfig('production'));
    const blocked = r.errors.filter((e) => e.code === 'placeholder_in_production').map((e) => e.id);
    for (const id of ['q_m1_ai_side_01', 'q_m1_ai_daily_01', 'q_m1_ai_side_02', 'q_m1_ai_side_03']) expect(blocked).toContain(id);
  });
});

describe('filterPackForRelease', () => {
  it('(d) bản test giữ nguyên, vẫn đủ Side/Daily như cũ', () => {
    expect(filterPackForRelease(CONTENT, 'test')).toBe(CONTENT);
    const day = (id: string) => CONTENT.days.find((d) => d.id === id)!;
    expect(day('d.g06.01')).toMatchObject({ side_quests: ['q_m1_ai_side_01'], daily_pool: ['q_m1_ai_daily_01'] });
    expect(day('d.g07.01')).toMatchObject({ side_quests: ['q_m1_ai_side_03'], daily_pool: [] });
    expect(day('d.g07.02')).toMatchObject({ side_quests: [], daily_pool: [] });
    expect(day('d.g07.03')).toMatchObject({ side_quests: ['q_m1_ai_side_02'], daily_pool: [] });
    const optional = CONTENT.quests.filter((q) => q.type === 'side' || q.type === 'daily').map((q) => q.id).sort();
    expect(optional).toEqual(AI_SIDE_DAILY);
  });

  it('production: mọi Ngày bỏ side_quests và daily_pool, gói không còn quest Side/Daily', () => {
    for (const d of production().days) {
      expect(d.side_quests, d.id).toEqual([]);
      expect(d.daily_pool, d.id).toEqual([]);
    }
    expect(production().quests.filter((q) => q.type === 'side' || q.type === 'daily').map((q) => q.id)).toEqual([]);
  });

  it('production: giữ nguyên 4 Ngày, chuỗi Main, kỷ vật và các quest Hub', () => {
    expect(production().days.map((d) => d.id)).toEqual(MOC1);
    expect(production().days.map((d) => d.main_chain)).toEqual(CONTENT.days.map((d) => d.main_chain));
    expect(production().artifacts.map((a) => a.id)).toEqual(CONTENT.artifacts.map((a) => a.id));
    const kept = new Set(production().quests.map((q) => q.id));
    for (const q of CONTENT.quests.filter((x) => x.type === 'main' || x.type === 'event' || x.type === 'pd')) expect(kept.has(q.id), q.id).toBe(true);
  });

  it('production: gỡ ô Album, mảnh ký ức và PDE chỉ phục vụ Side/Daily; giữ ô bắt buộc và ảnh bìa', () => {
    const entryIds = new Set(production().album_entries.map((e) => e.id));
    for (const id of ['alb.d.g06.01.04', 'alb.d.g06.01.05', 'alb.d.g07.01.04', 'alb.d.g07.02.04', 'alb.d.g07.03.04', 'alb.d.g07.03.05']) expect(entryIds.has(id), id).toBe(false);
    for (const e of production().album_entries) expect(e.unlock_quest_id, e.id).toBeUndefined();
    const questIds = new Set(production().quests.map((q) => q.id));
    for (const f of production().fragments) if (f.source_quest_id) expect(questIds.has(f.source_quest_id), f.id).toBe(true);
    // Mọi ô bắt buộc (kể cả ảnh bìa cầu vồng) còn nguyên.
    const required = CONTENT.album_entries.filter((e) => e.required_for_restore).map((e) => e.id);
    expect(required).toContain('alb.d.g07.03.cover');
    for (const id of required) expect(entryIds.has(id), id).toBe(true);
    // Kỷ vật không còn trỏ vào ô/mảnh đã gỡ.
    const fragIds = new Set(production().fragments.map((f) => f.id));
    for (const a of production().artifacts) {
      for (const id of a.album_entry_ids) expect(entryIds.has(id), `${a.id} → ${id}`).toBe(true);
      for (const id of a.reward_fragment_ids) expect(fragIds.has(id), `${a.id} → ${id}`).toBe(true);
    }
    // PDE: chỉ pde_03 (hiện mảnh "danh sách trực nhật" khi xong Side) bị gỡ.
    expect(production().pdes.map((p) => p.id)).toEqual(CONTENT.pdes.map((p) => p.id).filter((id) => id !== 'pde_03'));
    // Gỡ đúng chừng ấy, không hơn (chặn lọc nhầm ô/mảnh của Main): 5 quest, 6 ô Album tùy chọn, 6 mảnh ký ức.
    expect(CONTENT.quests.length - production().quests.length).toBe(5);
    expect(CONTENT.album_entries.length - production().album_entries.length).toBe(6);
    expect(CONTENT.fragments.length - production().fragments.length).toBe(6);
  });

  it('không sửa gói gốc, và chạy lại trên gói đã lọc không đổi gì', () => {
    const before = JSON.stringify(CONTENT);
    const once = filterPackForRelease(CONTENT, 'production');
    expect(JSON.stringify(CONTENT)).toBe(before);
    expect(filterPackForRelease(once, 'production')).toEqual(once);
  });
});

describe('người chơi production không thấy nội dung giả', () => {
  it('(b) mọi quest đi tới được đều là HUMAN_CANON, không có AI_PROPOSED', () => {
    const pack = production();
    const idx = indexContent(pack, contentConfig('production'));
    const reachable = new Set(pack.quests.filter((q) => q.scope === 'hub').map((q) => q.id));
    for (const d of idx.releaseDays) [...d.main_chain, ...d.side_quests, ...d.daily_pool].forEach((id) => reachable.add(id));
    // Không rỗng: đã tính đủ Main của 4 Trang + 4 quest Hub (tránh test rỗng).
    for (const id of ['q_m1_main_01', 'q_m1_main_02', 'q_m1_main_03', 'q_m1_main_05', 'q_hub_pd_01', 'q_hub_pd_03']) expect(reachable.has(id), id).toBe(true);
    expect([...reachable].filter((id) => idx.quests.get(id)?.ownership_label !== 'HUMAN_CANON')).toEqual([]);
    expect(pack.quests.filter((q) => q.ownership_label !== 'HUMAN_CANON').map((q) => q.id)).toEqual([]);
    expect(JSON.stringify(pack)).not.toContain('AI_PROPOSED');
  });

  it(`(c) không chữ ${PLACEHOLDER_TAG} nào trong gói nội dung production`, () => {
    // `chapters` bị loại có chủ ý: nhãn chương chỉ đi vào event analytics (`chapter_label`), không hiện cho người chơi.
    const leaks = stringsOf({ ...production(), chapters: [] }).filter((s) => s.text.includes(PLACEHOLDER_TAG));
    expect(leaks.map((s) => `${s.path}: ${s.text}`)).toEqual([]);
  });

  /**
   * NỢ ĐÃ BIẾT (ngoài phạm vi N-22a — các file này không thuộc danh sách file chủ): bốn chỗ dưới đây vẫn hiện [PLACEHOLDER]
   * cho người chơi production. Test chỉ chặn chỗ MỚI; khi ai sửa xong một chỗ thì xóa khỏi danh sách.
   */
  const KNOWN_OUTSIDE_PACK = [
    'config/hub.ts › app_chat_name',
    'config/hubRoom.ts › HUB_DECOR',
    'config/hubRoom.ts › HUB_BOX_LINES',
    'ui/game/FeedbackForm.tsx',
  ];
  it(`${PLACEHOLDER_TAG} ngoài gói nội dung: không có chỗ mới ngoài danh sách nợ đã biết`, () => {
    const sources: Record<string, string> = {
      'config/hub.ts › app_chat_name': HUB_CONFIG.app_chat_name,
      'config/hubRoom.ts › HUB_DECOR': HUB_DECOR.flatMap((d) => [d.name, ...d.lines.map((l) => l.text)]).join('\n'),
      'config/hubRoom.ts › HUB_BOX_LINES': stringsOf(HUB_BOX_LINES).map((s) => s.text).join('\n'),
      'ui/game/FeedbackForm.tsx': readFileSync(new URL('../../src/ui/game/FeedbackForm.tsx', import.meta.url), 'utf8'),
    };
    const leaking = Object.entries(sources).filter(([, text]) => text.includes(PLACEHOLDER_TAG)).map(([name]) => name);
    expect(leaking.filter((name) => !KNOWN_OUTSIDE_PACK.includes(name))).toEqual([]);
  });
  it.todo(`gỡ ${PLACEHOLDER_TAG} ở 4 chỗ ngoài gói nội dung (KNOWN_OUTSIDE_PACK) trước khi gộp main`);
});

describe('chơi thử bản production bằng engine', () => {
  /** Làm hết chuỗi Main hiện tại; không phụ thuộc số bước từng Trang. Kẹt thì báo đúng bước. */
  function playMainChain(e: QuestEngine) {
    for (let guard = 0; guard < 300; guard++) {
      const ref = e.mainStep();
      if (!ref) return;
      const s: Step = ref.step;
      switch (s.kind) {
        case 'talk': e.trigger('interact', s.with); e.complete(s.id); break;
        case 'interact': if (e.trigger('interact', s.target)?.action === 'present') e.complete(s.id); break;
        case 'goto': e.trigger('arrive', s.target); break;
        case 'place': e.trigger('interact', s.target); break;
        case 'collect': for (const t of s.targets.slice(0, s.count)) e.trigger('interact', t); break;
        case 'choice': e.complete(s.id, { option_id: s.options[0].id }); break;
        case 'compose_message': e.complete(s.id, { option_id: s.openers[0].id }); break;
        default: e.complete(s.id);
      }
      if (e.mainStep()?.step.id === s.id) throw new Error(`Kẹt ở bước ${s.id} (${s.kind})`);
    }
    throw new Error('Chuỗi Main không kết thúc sau 300 vòng');
  }

  it('xong 4 Trang → public_demo_completed đúng một lần, không hỏi "còn nhiệm vụ phụ", mọi trang Album đủ', () => {
    const idx = indexContent(production(), contentConfig('production'));
    const save = newSave('33333333-3333-4333-8333-333333333333');
    save.player_name = 'Thảo Nguyên'; save.appearance.gender = 'female';
    const bus = new EventBus();
    const seen = { demo: 0, prompt: 0, pdes: [] as string[], optional: [] as string[] };
    bus.on('public_demo_completed', () => { seen.demo++; });
    bus.on('day_end_prompt', () => { seen.prompt++; });
    bus.on('pde_fired', (ev) => { seen.pdes.push(ev.pde_id); });
    bus.on('quest_started', (ev) => { if (ev.quest_type === 'side' || ev.quest_type === 'daily') seen.optional.push(ev.quest_id); });
    const engine = new QuestEngine({ idx, save, bus });
    const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
    const hub = new HubModel({ idx, save, bus, engine, album, config: HUB_CONFIG });
    new ReleaseTracker({ idx, save, bus });

    engine.enterHub();
    engine.complete('q_hub_pd_01.s01');
    engine.trigger('interact', 'itr.hub.memory_box');
    expect(idx.releaseDays.map((d) => d.id)).toEqual(MOC1);
    for (const day of idx.releaseDays) {
      hub.refresh();
      const art = idx.artifactOfDay(day.id)!;
      expect(hub.openArtifact(art.id), art.id).toMatchObject({ day_id: day.id, replay: false });
      engine.startDay(day.id);
      playMainChain(engine);
      expect(save.days[day.id]?.state, day.id).toBe('completed');
      engine.enterHub(); hub.refresh(); hub.runPdes();
    }
    engine.complete('q_hub_pd_02.s01');
    engine.complete('q_hub_pd_03.s01', { option_id: 'deep' });

    expect(seen.demo).toBe(1);
    expect(save.public_demo_done).toBe(true);
    expect(seen.prompt).toBe(0);
    expect(seen.optional).toEqual([]);
    expect(seen.pdes).not.toContain('pde_03');
    expect(seen.pdes).toHaveLength(production().pdes.length);
    for (const d of idx.releaseDays) expect(album.pageState(d.album_page_id), d.id).toBe('complete');
    expect(album.coverEntryId()).toBe('alb.d.g07.03.cover');
  });
});
