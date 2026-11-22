/**
 * Kiểm tra gói nội dung (chạy trong `npm test` và khi nạp game ở môi trường test).
 * Lỗi (errors) chặn; cảnh báo (warnings) chỉ nhắc. Mỗi mục có `id` của thứ sai để người viết tìm ngay.
 * Quy tắc: FRAMEWORK_IMPLEMENTATION_HANDOFF_v1 §5 F1, §6.
 */
import { CAST_ROLES, type Condition, type ContentConfig, type ContentPack, type DialogueLine, type MemoryDay, type Quest, type Step } from './types';

export interface Issue { code: string; id: string; message: string }
export interface ValidationReport { errors: Issue[]; warnings: Issue[] }

const SLUG = '[a-z0-9_]+';
const DAY = 'd\\.g(?:0[6-9]|1[0-2])\\.\\d{2}';
const SCOPE = '(?:m1|m2|m3|hub)';
export const ID_PATTERNS = {
  day: new RegExp(`^${DAY}$`),
  quest: new RegExp(`^q_(${SCOPE})_(?:ai_)?(main|side|daily|event|pd)_\\d{2}$`),
  artifact: new RegExp(`^art_${SCOPE}_\\d{2}$`),
  page: new RegExp(`^page\\.${DAY}$`),
  entry: new RegExp(`^alb\\.${DAY}\\.(?:\\d{2}|cover)$`),
  fragment: new RegExp(`^frag\\.${DAY}\\.\\d{2}$`),
  character: new RegExp(`^chr_${SLUG}$`),
  npc: new RegExp(`^npc_${SLUG}$`),
  flag: new RegExp(`^${SCOPE}\\.${SLUG}$`),
  pde: /^pde_\d{2}$/,
  ending: /^end_\d{2}$/,
  map: new RegExp(`^map_${SLUG}$`),
  school_year: /^g(?:0[6-9]|1[0-2])$/,
  chapter: new RegExp(`^ch_${SLUG}$`),
  interactable: new RegExp(`^itr\\.${SLUG}\\.${SLUG}$`),
  camera: new RegExp(`^cam\\.${SLUG}\\.${SLUG}$`),
  thread: new RegExp(`^thread\\.${SLUG}$`),
} as const;

export const PLACEHOLDER_TAG = '[PLACEHOLDER]';
export const LINE_LIMITS = { maxChars: 90, maxLines: 2, playerNameChars: 12 } as const;

/** Độ dài dòng khi hiện ra (tên dài nhất 12 ký tự, nhánh giới tính dài nhất, bỏ nhãn [PLACEHOLDER]). */
export function renderedLength(text: string): number {
  return text
    .replace(PLACEHOLDER_TAG, '').trim()
    .replace(/\{player_name\}/g, 'x'.repeat(LINE_LIMITS.playerNameChars))
    .replace(/\{g:([^|}]*)\|([^}]*)\}/g, (_m, a: string, b: string) => (a.length >= b.length ? a : b))
    .length;
}

const hasFlagCond = (c: Condition): boolean =>
  'flag' in c ? true : 'all' in c ? c.all.some(hasFlagCond) : 'any' in c ? c.any.some(hasFlagCond) : false;

function stepLines(s: Step): DialogueLine[] {
  switch (s.kind) {
    case 'talk': case 'cutscene': return s.lines;
    case 'interact': case 'minigame': return s.lines ?? [];
    case 'choice': return s.prompt ? [s.prompt] : [];
    default: return [];
  }
}
function stepTexts(s: Step): string[] {
  const t = stepLines(s).flatMap((l) => [l.text, ...(l.fallback ? [l.fallback] : [])]);
  if (s.kind === 'choice') t.push(...s.options.map((o) => o.text));
  if (s.kind === 'compose_message') t.push(...s.openers.map((o) => o.text));
  if (s.kind === 'free' && s.prompt) t.push(s.prompt);
  if (s.objective) t.push(s.objective);
  if (s.hint) t.push(s.hint);
  return t;
}

export function validateContent(pack: ContentPack, config: ContentConfig): ValidationReport {
  const errors: Issue[] = [], warnings: Issue[] = [];
  const err = (code: string, id: string, message: string) => errors.push({ code, id, message });
  const warn = (code: string, id: string, message: string) => warnings.push({ code, id, message });

  // ---- sổ ID: đúng mẫu + không trùng ----
  const seen = new Map<string, string>();
  const reg = (kind: keyof typeof ID_PATTERNS, id: string, extra?: RegExp) => {
    if (!(extra ?? ID_PATTERNS[kind]).test(id)) err('bad_id', id, `ID "${id}" sai mẫu của ${kind}`);
    if (seen.has(id)) err('duplicate_id', id, `ID "${id}" bị trùng (${seen.get(id)} và ${kind})`);
    seen.set(id, kind);
  };
  const ids = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));

  pack.characters.forEach((c) => reg('character', c.id));
  pack.school_years.forEach((y) => reg('school_year', y.id));
  pack.maps.forEach((m) => reg('map', m.id));
  pack.chapters.forEach((c) => reg('chapter', c.id));
  pack.days.forEach((d) => reg('day', d.id));
  pack.quests.forEach((q) => reg('quest', q.id));
  pack.artifacts.forEach((a) => reg('artifact', a.id));
  pack.fragments.forEach((f) => reg('fragment', f.id));
  pack.album_entries.forEach((e) => reg('entry', e.id));
  pack.pdes.forEach((p) => reg('pde', p.id));
  pack.endings.forEach((e) => reg('ending', e.id));
  pack.hub.threads.forEach((t) => reg('thread', t.id));
  { const m = new Set<string>(); for (const x of pack.milestones) { if (m.has(x.id)) err('duplicate_id', x.id, `Mốc "${x.id}" bị trùng`); m.add(x.id); } }

  const chars = ids(pack.characters), years = ids(pack.school_years), maps = ids(pack.maps), days = ids(pack.days);
  const quests = ids(pack.quests), artifacts = ids(pack.artifacts), fragments = ids(pack.fragments), entries = ids(pack.album_entries);
  const pdes = ids(pack.pdes), threads = ids(pack.hub.threads), milestones = ids(pack.milestones);
  const steps = new Map<string, { quest: Quest; step: Step }>();
  const need = <T>(map: Map<string, T>, id: string | undefined | null, where: string): T | undefined => {
    if (id === undefined || id === null) return undefined;
    const v = map.get(id);
    if (!v) err('missing_ref', id, `"${id}" không tồn tại (được nhắc ở ${where})`);
    return v;
  };

  // ---- điều kiện ----
  const checkCond = (c: Condition | undefined, where: string) => {
    if (!c) return;
    if ('all' in c) c.all.forEach((x) => checkCond(x, where));
    else if ('any' in c) c.any.forEach((x) => checkCond(x, where));
    else if ('flag' in c) { if (!ID_PATTERNS.flag.test(c.flag)) err('bad_id', c.flag, `flag "${c.flag}" sai mẫu <scope>.<slug> (ở ${where})`); }
    else if ('quest' in c) need(quests, c.quest, where);
    else if ('day' in c) need(days, c.day, where);
  };
  const checkFlags = (flags: Record<string, unknown> | undefined, where: string) => {
    for (const f of Object.keys(flags ?? {})) if (!ID_PATTERNS.flag.test(f)) err('bad_id', f, `flag "${f}" sai mẫu <scope>.<slug> (ở ${where})`);
  };

  // ---- vai, nhân vật ----
  for (const role of CAST_ROLES) need(chars, config.cast[role], `cast.${role}`);
  const actorOk = (ref: string) => ref === 'player' || ref === 'narrator' || (CAST_ROLES as readonly string[]).includes(ref) || chars.has(ref) || ID_PATTERNS.npc.test(ref);
  const checkActor = (ref: string, where: string) => { if (!actorOk(ref)) err('missing_ref', ref, `nhân vật/vai "${ref}" không tồn tại (ở ${where})`); };

  // ---- dữ liệu nền ----
  for (const m of pack.milestones) m.school_years.forEach((y) => need(years, y, `milestone ${m.id}`));
  for (const y of pack.school_years) { need(milestones, y.milestone_id, `school_year ${y.id}`); y.group_members.forEach((a) => checkActor(a, `school_year ${y.id}`)); }
  for (const c of pack.chapters) c.memory_day_ids.forEach((d) => need(days, d, `chapter ${c.id}`));
  for (const m of pack.maps) m.zones.forEach((z) => { if (!z.zone_id.startsWith('zone.')) err('bad_id', z.zone_id, `khu "${z.zone_id}" phải bắt đầu bằng "zone."`); });

  // ---- quest + bước ----
  for (const q of pack.quests) {
    const m = ID_PATTERNS.quest.exec(q.id);
    if (m && (m[1] !== q.scope || m[2] !== q.type)) err('id_mismatch', q.id, `quest "${q.id}" khai scope=${q.scope}, type=${q.type} không khớp ID`);
    if (q.type === 'main' || q.type === 'event') need(days, q.memory_day_id, `quest ${q.id}`);
    else if (q.memory_day_id) need(days, q.memory_day_id, `quest ${q.id}`);
    if ((q.type === 'side' || q.type === 'daily') && q.blocks_main) err('side_blocks_main', q.id, `quest ${q.type} "${q.id}" phải có blocks_main=false`);
    if (!q.steps.length) err('empty_quest', q.id, `quest "${q.id}" không có bước nào`);
    checkCond(q.available_when, `quest ${q.id}`);
    checkFlags(q.rewards?.flags, `quest ${q.id}`);
    q.rewards?.fragment_ids?.forEach((f) => need(fragments, f, `quest ${q.id}`));
    q.rewards?.album_entry_ids?.forEach((e) => need(entries, e, `quest ${q.id}`));
    const stepRe = new RegExp(`^${q.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.s\\d{2}$`);
    for (const s of q.steps) {
      if (!stepRe.test(s.id)) err('bad_id', s.id, `bước "${s.id}" phải có dạng ${q.id}.sNN`);
      if (steps.has(s.id)) err('duplicate_id', s.id, `bước "${s.id}" bị trùng`);
      steps.set(s.id, { quest: q, step: s });
      for (const l of stepLines(s)) {
        checkActor(l.speaker, `bước ${s.id}`);
        checkCond(l.when, `bước ${s.id}`);
        if (l.when && hasFlagCond(l.when) && l.fallback === undefined) err('callback_without_fallback', s.id, `bước "${s.id}": dòng callback theo flag phải có dòng dự phòng (fallback)`);
        for (const t of [l.text, l.fallback ?? '']) {
          if (renderedLength(t) > LINE_LIMITS.maxChars || t.split('\n').length > LINE_LIMITS.maxLines) warn('line_too_long', s.id, `bước "${s.id}": dòng thoại dài quá ~${LINE_LIMITS.maxChars} ký tự hoặc quá ${LINE_LIMITS.maxLines} dòng`);
        }
      }
      if (q.ownership_label === 'AI_PROPOSED' && stepTexts(s).some((t) => !t.includes(PLACEHOLDER_TAG))) {
        err('missing_placeholder_tag', s.id, `bước "${s.id}": nội dung AI_PROPOSED phải ghi ${PLACEHOLDER_TAG} ở mọi chữ`);
      }
      if (s.kind === 'choice') { s.options.forEach((o) => checkFlags(o.set_flags, `bước ${s.id}`)); s.about?.forEach((a) => checkActor(a, `bước ${s.id}`)); if (s.options.length < 2) err('bad_choice', s.id, `bước "${s.id}" cần ít nhất 2 lựa chọn`); }
      if (s.kind === 'setFlag') checkFlags({ [s.flag]: s.value }, `bước ${s.id}`);
      if (s.kind === 'compose_message') { need(threads, s.thread_id, `bước ${s.id}`); if (s.openers.length < 2) err('bad_choice', s.id, `bước "${s.id}" cần ít nhất 2 cách mở lời`); }
      if (s.kind === 'phone_ui' && s.thread_id) need(threads, s.thread_id, `bước ${s.id}`);
      if (s.kind === 'photo') { need(entries, s.album_entry_id, `bước ${s.id}`); s.subjects.forEach((a) => checkActor(a, `bước ${s.id}`)); }
      if (s.kind === 'album_restore' && !pack.days.some((d) => d.album_page_id === s.page_id)) err('missing_ref', s.page_id, `trang "${s.page_id}" không tồn tại (ở bước ${s.id})`);
      if (s.kind === 'collect' && (s.count < 1 || s.count > s.targets.length)) err('bad_collect', s.id, `bước "${s.id}": count phải từ 1 tới số điểm gom`);
    }
    if (q.ownership_label === 'AI_PROPOSED' && !q.title.includes(PLACEHOLDER_TAG)) err('missing_placeholder_tag', q.id, `quest "${q.id}": tên phải ghi ${PLACEHOLDER_TAG}`);
    q.parts?.forEach((p) => { if (!q.steps.some((s) => s.id === p.first_step_id)) err('missing_ref', p.first_step_id, `phần "${p.id}" của ${q.id} trỏ tới bước không có`); });
  }

  // ---- bước ↔ thế giới (vật tương tác, nhân vật đã đặt, máy ảnh) ----
  const checkStepWorld = (q: Quest, where: string, targets: Set<string>, placed: Set<string> | null, cameras: Set<string> | null) => {
    const tgt = (id: string) => { if (!targets.has(id)) err('missing_ref', id, `"${id}" không có trong ${where} (quest ${q.id})`); };
    const act = (a: string) => { if (placed && a !== 'player' && !placed.has(a)) err('actor_not_placed', a, `"${a}" chưa được đặt trong ${where} (quest ${q.id})`); };
    for (const s of q.steps) {
      if (s.kind === 'goto' || s.kind === 'interact' || s.kind === 'place') tgt(s.target);
      if (s.kind === 'collect') s.targets.forEach(tgt);
      if (s.kind === 'talk') act(s.with);
      if (s.kind === 'photo') { s.subjects.forEach(act); if (cameras && !cameras.has(s.camera_id)) err('missing_ref', s.camera_id, `máy ảnh "${s.camera_id}" không có trong ${where} (bước ${s.id})`); }
    }
  };

  // ---- Ngày ký ức ----
  const dayOfPage = new Map<string, MemoryDay>();
  for (const d of pack.days) {
    const where = `Ngày ${d.id}`;
    const y = need(years, d.school_year_id, where);
    const map = need(maps, d.map_id, where);
    if (map && !map.variants.some((v) => v.variant_id === d.map_variant)) err('missing_ref', d.map_variant, `biến thể "${d.map_variant}" không có trong ${d.map_id} (${where})`);
    if (map && d.spawn_point && !map.spawn_points.some((p) => p.id === d.spawn_point)) err('missing_ref', d.spawn_point, `điểm xuất hiện "${d.spawn_point}" không có trong ${d.map_id} (${where})`);
    if (y && map && d.open_zones) d.open_zones.forEach((z) => { if (!map.zones.some((x) => x.zone_id === z)) err('missing_ref', z, `khu "${z}" không có trong ${d.map_id} (${where})`); });
    if (d.album_page_id !== `page.${d.id}`) err('bad_id', d.album_page_id, `trang của ${d.id} phải là page.${d.id}`);
    dayOfPage.set(d.album_page_id, d);
    d.interactables.forEach((i) => { if (!ID_PATTERNS.interactable.test(i.id)) err('bad_id', i.id, `vật tương tác "${i.id}" sai mẫu itr.<map>.<slug>`); });
    d.cameras.forEach((c) => { if (!ID_PATTERNS.camera.test(c.id)) err('bad_id', c.id, `máy ảnh "${c.id}" sai mẫu cam.<slug>.<slug>`); });
    d.npc_placements.forEach((n) => checkActor(n.actor, where));

    const mine = pack.artifacts.filter((a) => a.target_memory_day_id === d.id);
    if (mine.length !== 1) err('day_artifact_count', d.id, `${where} phải có đúng 1 kỷ vật dẫn vào (đang có ${mine.length})`);
    const anchor = need(artifacts, d.anchor_artifact_id, where);
    if (anchor && anchor.target_memory_day_id !== d.id) err('anchor_mismatch', d.id, `${where}: kỷ vật ${anchor.id} đang trỏ tới ${anchor.target_memory_day_id}`);

    if (!d.main_chain.length) err('empty_main_chain', d.id, `${where} có chuỗi Main rỗng`);
    const targets = new Set(d.interactables.map((i) => i.id));
    const placed = new Set(d.npc_placements.map((n) => n.actor));
    const cameras = new Set(d.cameras.map((c) => c.id));
    const group: [string[], Quest['type'][]][] = [[d.main_chain, ['main', 'event']], [d.side_quests, ['side']], [d.daily_pool, ['daily']]];
    for (const [list, types] of group) for (const qid of list) {
      const q = need(quests, qid, where);
      if (!q) continue;
      if (!types.includes(q.type)) err('wrong_quest_type', q.id, `${where}: quest ${q.id} (${q.type}) đặt sai danh sách`);
      if (q.type !== 'daily' && q.memory_day_id !== d.id) err('quest_day_mismatch', q.id, `${where}: quest ${q.id} khai memory_day_id=${q.memory_day_id}`);
      checkStepWorld(q, where, targets, placed, cameras);
    }
    const pageEntries = pack.album_entries.filter((e) => e.page_id === d.album_page_id);
    if (!pageEntries.length) err('day_no_album_page', d.id, `${where} chưa có trang Album (không có ô nào thuộc ${d.album_page_id})`);
    else if (!pageEntries.some((e) => e.required_for_restore)) err('page_no_required_entry', d.album_page_id, `trang ${d.album_page_id} cần ít nhất 1 ô required_for_restore`);
  }

  // ---- Hub ----
  const hubTargets = new Set(pack.hub.interactables.map((i) => i.id));
  pack.hub.interactables.forEach((i) => { if (!ID_PATTERNS.interactable.test(i.id)) err('bad_id', i.id, `vật tương tác "${i.id}" sai mẫu itr.<map>.<slug>`); });
  for (const q of pack.quests) if (q.scope === 'hub') checkStepWorld(q, 'Hub', hubTargets, null, null);
  const intro = need(quests, pack.hub.intro_quest_id, 'hub.intro_quest_id');
  if (intro && intro.type !== 'pd') err('wrong_quest_type', intro.id, 'quest mở đầu Hub phải là loại pd');
  for (const t of pack.hub.threads) { t.members.forEach((a) => checkActor(a, `thread ${t.id}`)); t.history.forEach((l) => checkActor(l.speaker, `thread ${t.id}`)); }

  // ---- kỷ vật, mảnh, ô Album, PDE ----
  for (const a of pack.artifacts) {
    const where = `kỷ vật ${a.id}`;
    need(days, a.target_memory_day_id, where); need(years, a.school_year_id, where);
    checkCond(a.appear_when, where);
    a.reward_fragment_ids.forEach((f) => need(fragments, f, where));
    a.album_entry_ids.forEach((e) => need(entries, e, where));
    if (a.target_step_id) need(steps, a.target_step_id, where);
    if (a.new_present_action) need(pdes, a.new_present_action, where);
  }
  for (const f of pack.fragments) { need(days, f.memory_day_id, `mảnh ${f.id}`); if (f.source_quest_id) need(quests, f.source_quest_id, `mảnh ${f.id}`); }
  for (const e of pack.album_entries) {
    const where = `ô ${e.id}`;
    const d = dayOfPage.get(e.page_id);
    if (!d) err('missing_ref', e.page_id, `trang "${e.page_id}" không thuộc Ngày nào (${where})`);
    else if (!e.id.startsWith(`alb.${d.id}.`)) err('bad_id', e.id, `${where} thuộc ${e.page_id} nên phải có dạng alb.${d.id}.NN`);
    need(fragments, e.fragment_id, where);
    if (e.unlock_quest_id) need(quests, e.unlock_quest_id, where);
    if (e.snapshot) {
      need(steps, e.snapshot.at_step_id, where);
      if (d && !d.cameras.some((c) => c.id === e.snapshot!.camera_id)) err('missing_ref', e.snapshot.camera_id, `máy ảnh "${e.snapshot.camera_id}" không có trong Ngày ${d.id} (${where})`);
    } else if (e.source === 'auto_snapshot') err('snapshot_missing', e.id, `${where}: nguồn auto_snapshot phải khai máy ảnh và khoảnh khắc chụp`);
  }
  for (const p of pack.pdes) {
    const where = `PDE ${p.id}`;
    checkCond(p.trigger, where);
    for (const fx of p.effects) {
      if (fx.kind === 'restore_page' && !dayOfPage.has(fx.page_id)) err('missing_ref', fx.page_id, `trang "${fx.page_id}" không tồn tại (${where})`);
      if (fx.kind === 'shelf_artifact') need(artifacts, fx.artifact_id, where);
      if (fx.kind === 'add_fragment') need(entries, fx.album_entry_id, where);
      if (fx.kind === 'unlock_quest') need(quests, fx.quest_id, where);
      if (fx.kind === 'message') { need(threads, fx.thread_id, where); fx.lines.forEach((l) => checkActor(l.speaker, where)); }
    }
  }

  // ---- phạm vi phát hành ----
  const rel = config.release;
  rel.memory_day_ids.forEach((d) => need(days, d, 'release.memory_day_ids'));
  if (rel.end_day_id && !rel.memory_day_ids.includes(rel.end_day_id)) err('release_end_not_in_list', rel.end_day_id, `Ngày kết thúc "${rel.end_day_id}" không nằm trong danh sách phát hành`);
  if (rel.end_step_id) need(steps, rel.end_step_id, 'release.end_step_id');
  if (config.environment === 'production' && rel.memory_day_ids.length) {
    const reach = new Set<string>(pack.quests.filter((q) => q.scope === 'hub').map((q) => q.id));
    for (const id of rel.memory_day_ids) { const d = days.get(id); if (d) [...d.main_chain, ...d.side_quests, ...d.daily_pool].forEach((q) => reach.add(q)); }
    for (const id of reach) {
      const q = quests.get(id);
      if (q && (q.ownership_label === 'AI_PROPOSED' || ((q.type === 'main' || q.type === 'event') && q.ownership_label !== 'HUMAN_CANON'))) {
        err('placeholder_in_production', q.id, `quest "${q.id}" (${q.ownership_label}) không được nằm trong bản production`);
      }
    }
  }
  return { errors, warnings };
}

export function formatReport(r: ValidationReport): string {
  return [...r.errors.map((e) => `LỖI  [${e.code}] ${e.message}`), ...r.warnings.map((w) => `nhắc [${w.code}] ${w.message}`)].join('\n');
}
