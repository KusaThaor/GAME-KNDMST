import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';

// Mock tối thiểu cho Node.js (vitest) khi buildDayScene dựng sky/dressing/backdrop có dùng canvas 2D.
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

import { CharacterAnimator, type Motion } from '../../src/actors/character/animate';
import { buildCharacter } from '../../src/actors/character/build';
import { indexContent } from '../../src/content/indexContent';
import type { MemoryDay, Step } from '../../src/content/types';
import { createStageRunner, matchesStageAt, type StageSceneApi } from '../../src/game/runtime/stageRunner';
import { buildDayScene, type DayScene } from '../../src/game/scenes/dayScene';
import { DEFAULT_BODY } from '../../src/world/collision';
import { readAsset } from '../../scripts/world-cli';
import { makeConfig, makePack } from './fixtures/pack';

function makeMockScene(): StageSceneApi & { calls: string[]; resolveMove: (idx?: number) => void } {
  const calls: string[] = [];
  const resolvers: (() => void)[] = [];
  return {
    calls,
    resolveMove(idx = 0) { resolvers[idx]?.(); },
    moveActor(actor, to, pace = 'walk') {
      calls.push(`move:${actor}:${to}:${pace}`);
      return new Promise<void>((r) => { resolvers.push(r); });
    },
    teleportActor(actor, to) { calls.push(`teleport:${actor}:${to}`); return true; },
    faceActor(actor, toward) { calls.push(`face:${actor}:${toward}`); },
    setActorMotion(actor, motion) { calls.push(`motion:${actor}:${motion}`); },
    setActorVisible(actor, visible) { calls.push(`visible:${actor}:${visible}`); },
  };
}

function stepScene(scene: DayScene, seconds: number, dt = 1 / 30, ctlMove: { forward: number; strafe: number; run: boolean } | null = null) {
  const n = Math.ceil(seconds / dt);
  for (let i = 0; i < n; i++) scene.update(dt, i * dt, { move: ctlMove, look: null });
}

describe('stageRunner (R-B1)', () => {
  it('lọc đúng mốc at: mặc định start, end, và { line: n }', () => {
    expect(matchesStageAt(undefined, 'start')).toBe(true);
    expect(matchesStageAt(undefined, 'end')).toBe(false);
    expect(matchesStageAt('end', 'end')).toBe(true);
    expect(matchesStageAt({ line: 2 }, { line: 2 })).toBe(true);
    expect(matchesStageAt({ line: 2 }, { line: 1 })).toBe(false);
    expect(matchesStageAt({ line: 0 }, 'start')).toBe(false);
  });

  it('thực thi move/teleport/face/motion/visible và bỏ qua lặng lẽ cue của nhánh khác', async () => {
    const mock = makeMockScene();
    const runner = createStageRunner({ getDayScene: () => mock });
    const step: Step = {
      id: 'q_m1_main_01.s01',
      kind: 'talk',
      with: 'NPC_A',
      lines: [{ speaker: 'NPC_A', text: 'Chào' }],
      stage: [
        { cue: 'camera', camera_id: 'cam.a' },
        { cue: 'weather', preset: 'rain_light' },
        { cue: 'sfx', sfx: 'bell' },
        { cue: 'prop', actor: 'NPC_A', prop: 'notebook' },
        { cue: 'teleport', actor: 'NPC_A', to: 'spot.a' },
        { cue: 'face', actor: 'NPC_A', toward: 'player' },
        { cue: 'motion', actor: 'NPC_A', motion: 'pose_wave' },
        { cue: 'move', actor: 'NPC_B', to: 'spot.b', pace: 'run', at: { line: 0 } },
        { cue: 'visible', actor: 'NPC_B', visible: false, at: 'end' },
      ],
    };

    await runner.stage!(step, 'start');
    expect(mock.calls).toEqual(['teleport:NPC_A:spot.a', 'face:NPC_A:player', 'motion:NPC_A:pose_wave']);

    await runner.stage!(step, { line: 0 });
    expect(mock.calls).toContain('move:NPC_B:spot.b:run');

    await runner.stage!(step, 'end');
    expect(mock.calls).toContain('visible:NPC_B:false');
  });

  it('wait: true chặn tới khi move xong; không đặt wait thì chạy song song không chặn', async () => {
    const mock = makeMockScene();
    const runner = createStageRunner({ getDayScene: () => mock });
    const step: Step = {
      id: 'q_m1_main_01.s02',
      kind: 'cutscene',
      lines: [],
      stage: [
        { cue: 'move', actor: 'NPC_A', to: 'spot.1' },
        { cue: 'move', actor: 'NPC_B', to: 'spot.2', wait: true },
        { cue: 'visible', actor: 'NPC_B', visible: false },
      ],
    };

    let finished = false;
    const p = Promise.resolve(runner.stage!(step, 'start')).then(() => { finished = true; });
    await Promise.resolve();
    expect(mock.calls).toEqual(['move:NPC_A:spot.1:walk', 'move:NPC_B:spot.2:walk']);
    expect(finished).toBe(false);

    mock.resolveMove(1); // NPC_B xong (NPC_A không wait nên không chặn)
    await p;
    expect(finished).toBe(true);
    expect(mock.calls).toEqual(['move:NPC_A:spot.1:walk', 'move:NPC_B:spot.2:walk', 'visible:NPC_B:false']);
  });

  it('an toàn khi dayScene null hoặc bị dispose giữa chừng', async () => {
    let scene: StageSceneApi | null = null;
    const runner = createStageRunner({ getDayScene: () => scene });
    const step: Step = {
      id: 'q_m1_main_01.s03',
      kind: 'cutscene',
      lines: [],
      stage: [
        { cue: 'move', actor: 'NPC_A', to: 'spot.1', wait: true },
        { cue: 'face', actor: 'NPC_A', toward: 'player' },
      ],
    };

    await expect(runner.stage!(step, 'start')).resolves.toBeUndefined();

    const mock = makeMockScene();
    scene = mock;
    const p = runner.stage!(step, 'start');
    await Promise.resolve();
    scene = null; // giả lập dispose() giữa chừng
    mock.resolveMove(0);
    await expect(p).resolves.toBeUndefined();
    expect(mock.calls).toEqual(['move:NPC_A:spot.1:walk']);
  });
});

describe('DayScene actor director & CharacterAnimator', () => {
  it('CharacterAnimator hỗ trợ đủ 8 motion và pose(t) lặp lại được', () => {
    const rig = buildCharacter('duc', 6);
    const anim = new CharacterAnimator(rig, 1);
    const motions: Motion[] = ['idle', 'walk', 'run', 'talk', 'pose_peace', 'pose_wave', 'pose_tada', 'cheer'];
    for (const m of motions) {
      anim.setMotion(m);
      anim.update(0.05);
      expect(anim.motion).toBe(m);
    }
    anim.setMotion('pose_wave');
    expect(rig.eyes.happy[0].visible).toBe(true);
    anim.pose(0.4);
    const first = rig.armL.rotation.z;
    anim.setMotion('idle');
    anim.setMotion('pose_wave');
    anim.pose(0.4);
    expect(rig.armL.rotation.z).toBeCloseTo(first, 6);
  });

  describe('trên bản đồ map_thcs thật', () => {
    let ds: DayScene;

    beforeAll(async () => {
      const pack = makePack();
      const day: MemoryDay = {
        ...pack.days[0],
        spawn_point: 'spawn.thcs.yard',
        npc_placements: [
          { actor: 'NPC_A', marker: 'spot.thcs.phuong_group', motion: 'idle' },
          { actor: 'NPC_B', marker: 'spot.thcs.class_list_1', motion: 'idle' },
        ],
      };
      pack.days[0] = day;
      const idx = indexContent(pack, makeConfig());
      ds = await buildDayScene(day, idx, 'male', { fetchAsset: readAsset });
    }, 20_000);

    afterAll(() => {
      ds?.dispose();
    });

    it('đọc marker, di chuyển mượt tới nơi, cập nhật target & collider', async () => {
      const m2 = ds.markerSpot('spot.thcs.phuong_group_4')!;
      expect(m2).not.toBeNull();
      expect(ds.markerSpot('spot.thcs.class_door')).not.toBeNull();

      const npcATarget = ds.targets.find((t) => t.id === 'NPC_A')!;
      const oldPos = npcATarget.position.clone();
      let doneA = false;
      const moveA = ds.moveActor('NPC_A', 'spot.thcs.phuong_group_4', 'walk').then(() => { doneA = true; });
      stepScene(ds, 0.1);
      expect(doneA).toBe(false);
      stepScene(ds, 4);
      await moveA;
      expect(doneA).toBe(true);
      expect(Math.hypot(npcATarget.position.x - m2.x, npcATarget.position.z - m2.z)).toBeLessThan(0.35);
      expect(Math.hypot(npcATarget.position.x - oldPos.x, npcATarget.position.z - oldPos.z)).toBeGreaterThan(0.5);
    });

    it('tránh vật cản (NPC khác) và dừng an toàn nếu kẹt quá lâu', async () => {
      const npcATarget = ds.targets.find((t) => t.id === 'NPC_A')!;
      ds.teleportActor('NPC_A', 'spot.thcs.phuong_group_1');
      ds.teleportActor('NPC_B', 'spot.thcs.phuong_group_2');
      let doneAvoid = false;
      const moveAvoid = ds.moveActor('NPC_A', 'spot.thcs.phuong_group_3', 'run').then(() => { doneAvoid = true; });
      stepScene(ds, 5);
      await moveAvoid;
      expect(doneAvoid).toBe(true);
      const m3 = ds.markerSpot('spot.thcs.phuong_group_3')!;
      expect(Math.hypot(npcATarget.position.x - m3.x, npcATarget.position.z - m3.z)).toBeLessThan(0.35);

      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      let doneStuck = false;
      const moveStuck = ds.moveActor('NPC_A', 'spot.thcs.desk3_1', 'run', { maxDuration: 1.5 }).then(() => { doneStuck = true; });
      stepScene(ds, 2.0);
      await moveStuck;
      expect(doneStuck).toBe(true);
      warn.mockRestore();
    });

    it('leadPlayer: tạm dừng chờ nếu player tụt lại, không khóa player và có timeout an toàn', async () => {
      ds.teleportActor('player', 'spot.thcs.phuong_group');
      ds.teleportActor('NPC_A', 'spot.thcs.phuong_group_1');
      let doneLead = false;
      const moveLead = ds.moveActor('NPC_A', 'spot.thcs.gutter_photo', 'walk', {
        leadPlayer: true,
        leadDistance: 0.5,
        leadTimeout: 0.5,
      }).then(() => { doneLead = true; });
      const pBefore = ds.playerPosition.clone();
      stepScene(ds, 0.25, 1 / 30, { forward: 1, strafe: 0, run: false });
      expect(ds.playerPosition.distanceTo(pBefore)).toBeGreaterThan(0.2);
      stepScene(ds, 10);
      await moveLead;
      expect(doneLead).toBe(true);
    });

    it('faceActor quay đúng hướng và setActorMotion trả player về điều khiển tự do khi idle', () => {
      const npcATarget = ds.targets.find((t) => t.id === 'NPC_A')!;
      ds.teleportActor('player', 'spot.thcs.phuong_group');
      ds.teleportActor('NPC_A', 'spot.thcs.phuong_group_1');
      ds.faceActor('NPC_A', 'player');
      const npcMesh = ds.scene.children.find((o) => o.position.distanceTo(npcATarget.position) < 0.01 && o.name === 'avatar')!;
      const expectedYaw = Math.atan2(ds.playerPosition.x - npcATarget.position.x, ds.playerPosition.z - npcATarget.position.z);
      expect(Math.abs(Math.atan2(Math.sin(npcMesh.rotation.y - expectedYaw), Math.cos(npcMesh.rotation.y - expectedYaw)))).toBeLessThan(0.05);

      ds.setActorMotion('player', 'pose_peace');
      stepScene(ds, 0.05);
      ds.setActorMotion('player', 'idle');
      stepScene(ds, 0.2, 1 / 30, { forward: 1, strafe: 0, run: false });
      expect(ds.debug().state).toBe('walk');
    });

    it('setActorVisible ẩn/hiện NPC, đồng thời bật/tắt target và collider; hủy moveActor khi có lệnh mới hoặc dispose', async () => {
      ds.teleportActor('NPC_B', 'spot.thcs.phuong_group_2');
      const npcBTarget = ds.targets.find((t) => t.id === 'NPC_B')!;
      const bPos = npcBTarget.position.clone();
      ds.setActorVisible('NPC_B', false);
      expect(ds.targets.some((t) => t.id === 'NPC_B')).toBe(false);
      const bSpot = ds.markerSpot('spot.thcs.phuong_group_2')!;
      expect(new THREE.Vector3(bPos.x, bPos.y, bPos.z).distanceTo(new THREE.Vector3(bSpot.x, bSpot.y, bSpot.z))).toBeLessThan(0.5);
      ds.teleportActor('player', 'spot.thcs.phuong_group_2');
      expect(Math.hypot(ds.playerPosition.x - bPos.x, ds.playerPosition.z - bPos.z)).toBeLessThan(0.2);

      ds.setActorVisible('NPC_B', true);
      expect(ds.targets.some((t) => t.id === 'NPC_B')).toBe(true);
      expect(DEFAULT_BODY.radius).toBeGreaterThan(0);

      let firstDone = false;
      const firstMove = ds.moveActor('NPC_A', 'spot.thcs.gutter_photo', 'walk').then(() => { firstDone = true; });
      const secondMove = ds.moveActor('NPC_A', 'spot.thcs.phuong_group_1', 'walk');
      await firstMove;
      expect(firstDone).toBe(true);
      stepScene(ds, 0.1);
      ds.dispose();
      await secondMove;
    });
  });
});
