import { describe, expect, it } from 'vitest';
import * as d0901 from '../../src/content/days/d_g09_01';
import { renderedLength, validateContent } from '../../src/content/validate';
import { makeConfig, makePack } from './fixtures/pack';
import type { ContentPack, MapDef } from '../../src/content/types';

describe('Trang 7 (d.g09.01) — Tờ báo tường cuối cùng (N-15c)', () => {
  it('xuất đủ 5 thực thể theo PAGE_DATA_GUIDE', () => {
    expect(d0901.day).toBeDefined();
    expect(d0901.quests).toBeDefined();
    expect(d0901.artifact).toBeDefined();
    expect(d0901.fragments).toBeDefined();
    expect(d0901.entries).toBeDefined();
  });

  it('khung day: đúng ID, năm học, kỷ vật neo, chỉ có tuyến Main', () => {
    expect(d0901.day.id).toBe('d.g09.01');
    expect(d0901.day.school_year_id).toBe('g09');
    expect(d0901.day.map_id).toBe('map_thcs');
    expect(d0901.day.map_variant).toBe('g09');
    expect(d0901.day.anchor_artifact_id).toBe('art_m2_03');
    expect(d0901.day.main_chain).toEqual(['q_m2_main_07']);
    expect(d0901.day.side_quests).toEqual([]);
    expect(d0901.day.daily_pool).toEqual([]);
    expect(d0901.day.album_page_id).toBe('page.d.g09.01');
  });

  it('quest q_m2_main_07: scope m2, type main, nhãn HUMAN_CANON, blocks_main true', () => {
    expect(d0901.quests).toHaveLength(1);
    const q = d0901.quests[0];
    expect(q.id).toBe('q_m2_main_07');
    expect(q.scope).toBe('m2');
    expect(q.type).toBe('main');
    expect(q.blocks_main).toBe(true);
    expect(q.ownership_label).toBe('HUMAN_CANON');
  });

  it('chuỗi bước đúng 17 bước từ s01 đến s17, ID tuần tự', () => {
    const q = d0901.quests[0];
    expect(q.steps).toHaveLength(17);
    q.steps.forEach((s, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      expect(s.id).toBe(`q_m2_main_07.s${num}`);
    });
  });

  it('minigame: Sudoku (s08) có game: mg_sudoku, level: min', () => {
    const s08 = d0901.quests[0].steps.find((s) => s.id === 'q_m2_main_07.s08')!;
    expect(s08.kind).toBe('minigame');
    if (s08.kind === 'minigame') {
      expect(s08.game).toBe('mg_sudoku');
      expect(s08.level).toBe('min');
    }
  });

  it('lựa chọn phản ứng khi cãi nhau (s11) lưu flag m2.newspaper_truth', () => {
    const s11 = d0901.quests[0].steps.find((s) => s.id === 'q_m2_main_07.s11')!;
    expect(s11.kind).toBe('choice');
    if (s11.kind === 'choice') {
      expect(s11.choice_id).toBe('c_m2_07_truth');
      expect(s11.options).toHaveLength(2);
      expect(s11.options[0].set_flags).toEqual({ 'm2.newspaper_truth': false });
      expect(s11.options[1].set_flags).toEqual({ 'm2.newspaper_truth': true });
    }
  });

  it('lời thoại Châu (s14) dùng {g:ông|bà} đúng quy chuẩn xưng hô', () => {
    const s14 = d0901.quests[0].steps.find((s) => s.id === 'q_m2_main_07.s14')!;
    expect(s14.kind).toBe('talk');
    if (s14.kind === 'talk') {
      expect(s14.lines[0].text).toBe('Tui ngồi năm phút thôi. {g:ông|bà} đừng hỏi gì hết nha.');
    }
  });

  it('mọi dòng thoại không dài quá 90 ký tự, không quá 2 dòng', () => {
    const q = d0901.quests[0];
    for (const s of q.steps) {
      const texts: string[] = [];
      if ('lines' in s && s.lines) {
        texts.push(...s.lines.flatMap((l) => [l.text, ...(l.fallback ? [l.fallback] : [])]));
      }
      if ('prompt' in s && s.prompt) {
        texts.push(typeof s.prompt === 'string' ? s.prompt : s.prompt.text);
      }
      for (const t of texts) {
        expect(renderedLength(t)).toBeLessThanOrEqual(90);
        expect(t.split('\n').length).toBeLessThanOrEqual(2);
      }
    }
  });

  it('kỷ vật art_m2_03 xuất hiện sau Trang 6 (d.g08.02), dẫn vào d.g09.01', () => {
    expect(d0901.artifact.id).toBe('art_m2_03');
    expect(d0901.artifact.school_year_id).toBe('g09');
    expect(d0901.artifact.target_memory_day_id).toBe('d.g09.01');
    expect(d0901.artifact.appear_when).toEqual({ day: 'd.g08.02' });
    expect(d0901.artifact.shape).toBe('paper');
  });

  it('Album: đủ 4 ô (ảnh chính báo tường, ghi chú, kỷ vật, sticker)', () => {
    expect(d0901.entries).toHaveLength(4);
    const mainPhoto = d0901.entries.find((e) => e.slot_type === 'main_photo')!;
    expect(mainPhoto.id).toBe('alb.d.g09.01.01');
    expect(mainPhoto.required_for_restore).toBe(true);
    expect(mainPhoto.snapshot?.camera_id).toBe('cam.d0901.newspaper');
    expect(mainPhoto.snapshot?.at_step_id).toBe('q_m2_main_07.s16');

    const note = d0901.entries.find((e) => e.slot_type === 'note')!;
    expect(note.id).toBe('alb.d.g09.01.02');
    expect(note.required_for_restore).toBe(true);

    const art = d0901.entries.find((e) => e.slot_type === 'artifact')!;
    expect(art.id).toBe('alb.d.g09.01.03');
    expect(art.required_for_restore).toBe(true);

    const sticker = d0901.entries.find((e) => e.slot_type === 'sticker')!;
    expect(sticker.id).toBe('alb.d.g09.01.04');
    expect(sticker.required_for_restore).toBe(false);
  });

  it('hợp lệ 100% khi nạp vào validateContent cùng mock pack Mốc 2', () => {
    const p: ContentPack = makePack();
    // Bổ sung dữ liệu Mốc 2 cho mock pack
    p.milestones.push({ id: 'm2', title: 'Mốc 2', school_years: ['g08', 'g09'], box_compartment: 2 });
    p.school_years.push(
      {
        id: 'g08',
        milestone_id: 'm2',
        start_year: 2016,
        end_year: 2017,
        age_range: [13, 14],
        age_variant: 'AGE_G8_9',
        group_members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        map_variant: 'g08',
      },
      {
        id: 'g09',
        milestone_id: 'm2',
        start_year: 2017,
        end_year: 2018,
        age_range: [14, 15],
        age_variant: 'AGE_G8_9',
        group_members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        map_variant: 'g09',
      },
    );

    const map = p.maps.find((m) => m.id === 'map_thcs') as MapDef;
    map.variants.push(
      { variant_id: 'g08', decor_set: 'g08', lighting_preset: 'late_afternoon' },
      { variant_id: 'g09', decor_set: 'g09', lighting_preset: 'late_afternoon' },
    );
    map.zones.push(
      { zone_id: 'zone.thcs.classroom', name: 'Lớp học' },
      { zone_id: 'zone.thcs.corridor', name: 'Hành lang' },
      { zone_id: 'zone.thcs.field', name: 'Bãi đất trống' },
      { zone_id: 'zone.thcs.base', name: 'Căn cứ bí mật' },
    );
    map.spawn_points.push({ id: 'spawn.thcs.classroom' });

    // Thêm ngày tiền đề Trang 6 (d.g08.02) để thỏa appear_when của art_m2_03
    p.days.push({
      id: 'd.g08.02',
      title: 'Trang 6: Valentine',
      school_year_id: 'g08',
      map_id: 'map_thcs',
      map_variant: 'g08',
      anchor_artifact_id: 'art_m2_02',
      main_chain: ['q_m2_main_06'],
      side_quests: [],
      daily_pool: [],
      npc_placements: [],
      interactables: [],
      cameras: [],
      album_page_id: 'page.d.g08.02',
      completion: 'main_chain',
    });
    p.quests.push({
      id: 'q_m2_main_06',
      type: 'main',
      scope: 'm2',
      memory_day_id: 'd.g08.02',
      title: 'Valentine',
      owner: 'TBD',
      ownership_label: 'HUMAN_CANON',
      status: 'SPEC_READY',
      version: 'v1.4',
      blocks_main: true,
      steps: [{ id: 'q_m2_main_06.s01', kind: 'cutscene', lines: [] }],
    });
    p.artifacts.push({
      id: 'art_m2_02',
      name: 'Kỷ vật Trang 6',
      school_year_id: 'g08',
      hook_2026: 'hook',
      appear_when: { day: 'd.g07.03' },
      target_memory_day_id: 'd.g08.02',
      complete_when: 'day_completed',
      reward_fragment_ids: ['frag.d.g08.02.01'],
      album_entry_ids: ['alb.d.g08.02.01'],
      shape: 'paper',
    });
    p.fragments.push({ id: 'frag.d.g08.02.01', memory_day_id: 'd.g08.02', kind: 'photo' });
    p.album_entries.push({
      id: 'alb.d.g08.02.01',
      page_id: 'page.d.g08.02',
      slot_type: 'main_photo',
      slot_index: 0,
      fragment_id: 'frag.d.g08.02.01',
      source: 'gameplay_photo',
      required_for_restore: true,
    });

    // Nạp Trang 7 vào mock pack
    p.days.push(d0901.day);
    p.quests.push(...d0901.quests);
    p.artifacts.push(d0901.artifact);
    p.fragments.push(...d0901.fragments);
    p.album_entries.push(...d0901.entries);
    p.chapters.push({ id: 'ch_g09', label: 'Mốc 2 · lớp 9', memory_day_ids: ['d.g09.01'] });

    const config = makeConfig({ environment: 'test' });
    const r = validateContent(p, config);

    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });
});
