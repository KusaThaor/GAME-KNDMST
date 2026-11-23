import { describe, expect, it } from 'vitest';
import * as d0801 from '../../src/content/days/d_g08_01';
import { renderedLength, validateContent } from '../../src/content/validate';
import { makeConfig, makePack } from './fixtures/pack';
import type { ContentPack, MapDef } from '../../src/content/types';

describe('Trang 5 (d.g08.01) — Lên lớp 8 (N-15a)', () => {
  it('xuất đủ 5 thực thể theo PAGE_DATA_GUIDE', () => {
    expect(d0801.day).toBeDefined();
    expect(d0801.quests).toBeDefined();
    expect(d0801.artifact).toBeDefined();
    expect(d0801.fragments).toBeDefined();
    expect(d0801.entries).toBeDefined();
  });

  it('khung day: đúng ID, năm học, kỷ vật neo, chỉ có tuyến Main', () => {
    expect(d0801.day.id).toBe('d.g08.01');
    expect(d0801.day.school_year_id).toBe('g08');
    expect(d0801.day.map_id).toBe('map_thcs');
    expect(d0801.day.map_variant).toBe('g08');
    expect(d0801.day.anchor_artifact_id).toBe('art_m2_01');
    expect(d0801.day.main_chain).toEqual(['q_m2_main_05']);
    expect(d0801.day.side_quests).toEqual([]);
    expect(d0801.day.daily_pool).toEqual([]);
    expect(d0801.day.album_page_id).toBe('page.d.g08.01');
  });

  it('quest q_m2_main_05: scope m2, type main, nhãn HUMAN_CANON', () => {
    expect(d0801.quests).toHaveLength(1);
    const q = d0801.quests[0];
    expect(q.id).toBe('q_m2_main_05');
    expect(q.scope).toBe('m2');
    expect(q.type).toBe('main');
    expect(q.blocks_main).toBe(true);
    expect(q.ownership_label).toBe('HUMAN_CANON');
  });

  it('chuỗi bước đúng 15 bước từ s01 đến s15, ID tuần tự', () => {
    const q = d0801.quests[0];
    expect(q.steps).toHaveLength(15);
    q.steps.forEach((s, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      expect(s.id).toBe(`q_m2_main_05.s${num}`);
    });
  });

  it('minigame: caro (s08) có đối thủ chr_duc, lau bảng lần hai (s12)', () => {
    const s08 = d0801.quests[0].steps.find((s) => s.id === 'q_m2_main_05.s08')!;
    expect(s08.kind).toBe('minigame');
    if (s08.kind === 'minigame') {
      expect(s08.game).toBe('mg_caro');
      expect(s08.level).toBe('min');
      expect(s08.opponent).toBe('chr_duc');
    }

    const s12 = d0801.quests[0].steps.find((s) => s.id === 'q_m2_main_05.s12')!;
    expect(s12.kind).toBe('minigame');
    if (s12.kind === 'minigame') {
      expect(s12.game).toBe('mg_wipe_board');
      expect(s12.level).toBe('min');
    }
  });

  it('lựa chọn bạn trực nhật (s06) lưu flag m2.duty_partner', () => {
    const s06 = d0801.quests[0].steps.find((s) => s.id === 'q_m2_main_05.s06')!;
    expect(s06.kind).toBe('choice');
    if (s06.kind === 'choice') {
      expect(s06.choice_id).toBe('c_m2_05_duty');
      expect(s06.options).toHaveLength(3);
      expect(s06.options.map((o) => o.id)).toEqual(['duc', 'ha', 'quan']);
      expect(s06.options[0].set_flags).toEqual({ 'm2.duty_partner': 'duc' });
      expect(s06.options[1].set_flags).toEqual({ 'm2.duty_partner': 'ha' });
      expect(s06.options[2].set_flags).toEqual({ 'm2.duty_partner': 'quan' });
    }
  });

  it('lời thoại điều kiện theo m2.duty_partner (s07) có fallback rỗng', () => {
    const s07 = d0801.quests[0].steps.find((s) => s.id === 'q_m2_main_05.s07')!;
    expect(s07.kind).toBe('interact');
    if (s07.kind === 'interact' && s07.lines) {
      const condLines = s07.lines.filter((l) => l.when);
      expect(condLines).toHaveLength(3);
      condLines.forEach((l) => {
        expect(l.fallback).toBe('');
      });
    }
  });

  it('mọi dòng thoại không dài quá 90 ký tự, không quá 2 dòng', () => {
    const q = d0801.quests[0];
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

  it('kỷ vật art_m2_01 xuất hiện sau Trang 4 (d.g07.03), dẫn vào d.g08.01', () => {
    expect(d0801.artifact.id).toBe('art_m2_01');
    expect(d0801.artifact.school_year_id).toBe('g08');
    expect(d0801.artifact.target_memory_day_id).toBe('d.g08.01');
    expect(d0801.artifact.appear_when).toEqual({ day: 'd.g07.03' });
    expect(d0801.artifact.shape).toBe('box');
  });

  it('Album: đủ 4 ô (ảnh chính bàn caro, ảnh phụ khai giảng, ghi chú, kỷ vật)', () => {
    expect(d0801.entries).toHaveLength(4);
    const mainPhoto = d0801.entries.find((e) => e.slot_type === 'main_photo')!;
    expect(mainPhoto.id).toBe('alb.d.g08.01.01');
    expect(mainPhoto.required_for_restore).toBe(true);
    expect(mainPhoto.snapshot?.camera_id).toBe('cam.d0801.caro');

    const openingPhoto = d0801.entries.find((e) => e.slot_type === 'free_photo')!;
    expect(openingPhoto.id).toBe('alb.d.g08.01.02');
    expect(openingPhoto.required_for_restore).toBe(false);
    expect(openingPhoto.snapshot?.camera_id).toBe('cam.d0801.opening');
  });

  it('hợp lệ 100% khi nạp vào validateContent cùng mock pack Mốc 2', () => {
    const p: ContentPack = makePack();
    // Bổ sung dữ liệu Mốc 2 cho mock pack
    p.milestones.push({ id: 'm2', title: 'Mốc 2', school_years: ['g08'], box_compartment: 2 });
    p.school_years.push({
      id: 'g08',
      milestone_id: 'm2',
      start_year: 2016,
      end_year: 2017,
      age_range: [13, 14],
      age_variant: 'AGE_G8_9',
      group_members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
      map_variant: 'g08',
    });

    const map = p.maps.find((m) => m.id === 'map_thcs') as MapDef;
    map.variants.push({ variant_id: 'g08', decor_set: 'g08', lighting_preset: 'late_afternoon' });
    map.zones.push(
      { zone_id: 'zone.thcs.corridor', name: 'Hành lang' },
      { zone_id: 'zone.thcs.gate', name: 'Cổng trường' },
      { zone_id: 'zone.thcs.classroom', name: 'Lớp học' },
    );
    map.spawn_points.push({ id: 'spawn.thcs.yard' });

    // Nạp Trang 5 vào mock pack
    p.days.push(d0801.day);
    p.quests.push(...d0801.quests);
    p.artifacts.push(d0801.artifact);
    p.fragments.push(...d0801.fragments);
    p.album_entries.push(...d0801.entries);
    p.chapters.push({ id: 'ch_g08', label: 'Mốc 2 · lớp 8', memory_day_ids: ['d.g08.01'] });

    const config = makeConfig({ environment: 'test' });
    const r = validateContent(p, config);

    // Không có lỗi cấu trúc nội dung nào
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });
});
