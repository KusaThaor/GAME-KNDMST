/**
 * BUG-T1-B — dàn cảnh Trang 1 (d.g06.01) theo kịch bản TONG_DUYET_MOC1 (Trang 1, Cảnh 1–8).
 * Gốc lỗi: cue chỉ dời NPC, không bao giờ dời người chơi → mọi minigame chạy tại chỗ xuất hiện; Đức/Châu đứng ở tiệm cả ngày;
 * "Mấy tháng sau" không đổi ánh sáng. Test chạy cue thật của Ngày trên bản đồ map_thcs thật.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Mock tối thiểu cho Node.js (vitest) khi buildDayScene dựng sky/dressing/backdrop có dùng canvas 2D (như stageRunner.test.ts).
if (typeof document === 'undefined') {
  const ctx = {
    canvas: null as unknown,
    fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'top',
    fillRect: () => {}, strokeRect: () => {}, clearRect: () => {}, fillText: () => {},
    beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, fill: () => {}, closePath: () => {},
    arc: () => {}, ellipse: () => {}, save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {}, scale: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
  };
  const makeCanvas = (w = 256, h = 256) => {
    const c = { width: w, height: h, getContext: () => ctx };
    ctx.canvas = c;
    return c;
  };
  (globalThis as unknown as { document: unknown }).document = {
    createElement: (tag: string) => (tag === 'canvas' ? makeCanvas(512, 512) : {}),
  };
}

import { indexContent } from '../../src/content/indexContent';
import { CONTENT, contentConfig } from '../../src/content/pack';
import type { MemoryDay, StageCue, Step } from '../../src/content/types';
import { createStageRunner } from '../../src/game/runtime/stageRunner';
import { buildDayScene, type DayScene } from '../../src/game/scenes/dayScene';
import { loadWorld, type World } from '../../src/world/world';
import { readAsset } from '../../scripts/world-cli';
import { THCS, Z } from './world/helpers';

const idx = indexContent(CONTENT, contentConfig('test'));
const day = idx.days.get('d.g06.01') as MemoryDay;
const step = (n: string): Step => idx.steps.get(`q_m1_main_01.${n}`)!.step;
const lineCount = (s: Step) => ('lines' in s && s.lines ? s.lines.length : 0) + ('intro_lines' in s && s.intro_lines ? s.intro_lines.length : 0);

/** Bước → khu người chơi phải đứng ngay sau khi bước bắt đầu (kịch bản Trang 1). */
const EXPECTED_ZONE: [string, string][] = [['s02', 'classroom'], ['s03', 'yard'], ['s04', 'classroom'], ['s05', 'gate']];

describe('BUG-T1-B — dữ liệu cue Trang 1', () => {
  it('s02–s05: dời người chơi ngay đầu bước', () => {
    for (const [n] of EXPECTED_ZONE) {
      const cues = step(n).stage ?? [];
      expect(cues.some((c) => c.cue === 'teleport' && c.actor === 'player' && (c.at ?? 'start') === 'start'), n).toBe(true);
    }
  });

  it('mọi lần dời người chơi đều khuất sau màn tối (fade bật trước, tắt sau, cùng mốc)', () => {
    for (const s of idx.steps.values()) {
      if (s.quest.id !== 'q_m1_main_01') continue;
      const cues = s.step.stage ?? [];
      cues.forEach((c, i) => {
        if (c.cue !== 'teleport' || c.actor !== 'player') return;
        const sameAt = (x: StageCue) => JSON.stringify(x.at ?? 'start') === JSON.stringify(c.at ?? 'start');
        const before = cues.slice(0, i).filter(sameAt).filter((x) => x.cue === 'fade');
        const after = cues.slice(i + 1).filter(sameAt).filter((x) => x.cue === 'fade');
        expect(before.at(-1), `${s.step.id}: thiếu fade bật trước khi dời người chơi`).toMatchObject({ cue: 'fade', on: true });
        expect(after[0], `${s.step.id}: thiếu fade tắt sau khi dời người chơi`).toMatchObject({ cue: 'fade', on: false });
      });
    }
  });

  it('s05 "Mấy tháng sau": đổi ánh sáng sang hoàng hôn (preset có sẵn golden_sunset) trong lúc tối', () => {
    const cues = step('s05').stage ?? [];
    const w = cues.findIndex((c) => c.cue === 'weather' && c.preset === 'golden_sunset' && (c.at ?? 'start') === 'start');
    expect(w).toBeGreaterThanOrEqual(0);
    const fadeOn = cues.findIndex((c) => c.cue === 'fade' && c.on);
    const fadeOff = cues.findIndex((c) => c.cue === 'fade' && !c.on);
    expect(fadeOn).toBeLessThan(w);
    expect(fadeOff).toBeGreaterThan(w);
  });

  it('s02: bỏ lệnh Đức đi bộ tới bảng phân lớp (bước này diễn ra trong lớp)', () => {
    expect((step('s02').stage ?? []).some((c) => c.cue === 'move' && c.to === 'spot.thcs.class_list_1')).toBe(false);
  });

  it('cue chỉ trỏ tới dòng thoại có thật (không thêm/bớt thoại)', () => {
    for (const [n] of EXPECTED_ZONE) {
      for (const c of step(n).stage ?? []) {
        if (c.at && typeof c.at === 'object') expect(c.at.line, n).toBeLessThan(lineCount(step(n)));
      }
    }
  });
});

describe('BUG-T1-B — chạy cue Trang 1 trên bản đồ map_thcs thật', () => {
  let ds: DayScene;
  let world: World;
  const fades: boolean[] = [];

  beforeAll(async () => {
    world = await loadWorld(THCS, { fetchAsset: readAsset });
    ds = await buildDayScene(day, idx, 'male', { fetchAsset: readAsset });
  }, 30_000);
  afterAll(() => ds?.dispose());

  const zoneOf = (p: { x: number; z: number }) => world.zoneAt(p.x, p.z);
  const npc = (id: string) => ds.targets.find((t) => t.id === id)!.position;
  const dist = (a: { x: number; z: number }, x: number, z: number) => Math.hypot(a.x - x, a.z - z);

  it('s01: Đức đứng gần chỗ người chơi xuất hiện (sân), không ở tiệm tạp hóa', () => {
    expect(zoneOf(ds.playerPosition)).toBe(Z('yard'));
    expect(zoneOf(npc('NPC_A'))).toBe(Z('yard'));
    expect(npc('NPC_A').distanceTo(ds.playerPosition)).toBeLessThan(4);
  });

  it('s02→s05: sau khi bước bắt đầu, người chơi + bạn đứng đúng khu; s05 ánh sáng hoàng hôn', async () => {
    const runner = createStageRunner({ getDayScene: () => ds, setFade: (on: boolean) => { fades.push(on); }, fadeMs: 0 });
    for (const [n, zone] of EXPECTED_ZONE) {
      const s = step(n);
      await runner.stage!(s, 'start');
      expect(zoneOf(ds.playerPosition), `${n}: người chơi`).toBe(Z(zone));
      expect(zoneOf(npc('NPC_A')), `${n}: Đức`).toBe(Z(zone));
      expect(zoneOf(npc('NPC_B')), `${n}: Châu`).toBe(Z(zone));
      if (n === 's03') {
        const ring = ds.markerSpot('itr.thcs.shuttle_ring')!;
        expect(dist(ds.playerPosition, ring.x, ring.z), 's03: người chơi ở vòng đá cầu').toBeLessThan(3);
        expect(dist(npc('NPC_A'), ring.x, ring.z), 's03: Đức ở vòng đá cầu').toBeLessThan(3);
      }
      if (n === 's04') {
        const board = ds.markerSpot('itr.thcs.blackboard')!;
        expect(dist(ds.playerPosition, board.x, board.z), 's04: người chơi trước bảng đen').toBeLessThan(2.5);
        expect(dist(npc('NPC_A'), board.x, board.z), 's04: Đức trước bảng đen').toBeLessThan(2.5);
      }
      if (n === 's05') {
        expect(ds.debug().weather).toBe('golden_sunset');
        // Cảnh 6: người chơi đứng gần cổng nhìn về phía tiệm (camera góc ba ở phía cổng, không lọt vào trong tiệm)
        const steps = ds.markerSpot('itr.thcs.grocery_steps')!;
        expect(dist(ds.playerPosition, steps.x, steps.z), 's05: người chơi gần tiệm').toBeLessThan(4.5);
        const facing = ds.debug().facing;
        const toSteps = Math.atan2(steps.x - ds.playerPosition.x, steps.z - ds.playerPosition.z);
        expect(Math.abs(Math.atan2(Math.sin(facing - toSteps), Math.cos(facing - toSteps))), 's05: nhìn về tiệm').toBeLessThan(0.4);
        expect(dist(npc('NPC_A'), -8.6, 27.5), 's05: Đức về spot.thcs.grocery_1').toBeLessThan(0.3);
        expect(dist(npc('NPC_B'), -6.9, 27.6), 's05: Châu về spot.thcs.grocery_2').toBeLessThan(0.3);
      }
      for (let i = 0; i < lineCount(s); i++) await runner.stage!(s, { line: i });
      await runner.stage!(s, 'end');
    }
    expect(fades.length).toBeGreaterThan(0);
    expect(fades.at(-1), 'không để màn hình tối sau khi dời').toBe(false);
  });
});

describe('BUG-T1-B — tiếp tục Ngày giữa chừng (tải lại trang ở s06/s07)', () => {
  for (const n of ['s06', 's07']) {
    it(`${n}: Đức/Châu về bậc thềm tiệm + ánh sáng hoàng hôn dù không chạy lại s05`, async () => {
      const ds = await buildDayScene(day, idx, 'male', { fetchAsset: readAsset });
      try {
        const runner = createStageRunner({ getDayScene: () => ds, fadeMs: 0 });
        await runner.stage!(step(n), 'start');
        const at = (id: string) => ds.targets.find((t) => t.id === id)!.position;
        expect(Math.hypot(at('NPC_A').x + 8.6, at('NPC_A').z - 27.5), 'Đức ở spot.thcs.grocery_1').toBeLessThan(0.3);
        expect(Math.hypot(at('NPC_B').x + 6.9, at('NPC_B').z - 27.6), 'Châu ở spot.thcs.grocery_2').toBeLessThan(0.3);
        expect(ds.debug().weather).toBe('golden_sunset');
        if (n === 's07') {
          // Cảnh 8: người chơi đứng giữa hai bạn trên bậc thềm cho ảnh tự sướng (cả khi tải lại giữa chừng)
          const steps = ds.markerSpot('itr.thcs.grocery_steps')!;
          expect(Math.hypot(ds.playerPosition.x - steps.x, ds.playerPosition.z - steps.z), 's07: người chơi ở bậc thềm').toBeLessThan(1);
          // hết ảnh (s07 'end'): quay sang Đức và camera ra sau lưng (phía cổng), không nằm lại trong tiệm cho thoại s08
          await runner.stage!(step(n), 'end');
          const a = ds.targets.find((t) => t.id === 'NPC_A')!.position;
          const { facing, yaw } = ds.debug();
          const diff = (x: number, y: number) => Math.abs(Math.atan2(Math.sin(x - y), Math.cos(x - y)));
          expect(diff(facing, Math.atan2(a.x - ds.playerPosition.x, a.z - ds.playerPosition.z)), 's07 end: nhìn Đức').toBeLessThan(0.05);
          expect(diff(yaw, facing + Math.PI), 's07 end: camera sau lưng người chơi').toBeLessThan(0.05);
        }
      } finally {
        ds.dispose();
      }
    }, 30_000);
  }
});
