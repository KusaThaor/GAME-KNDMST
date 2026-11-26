import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { buildCharacter } from '../../src/actors/character/build';
import { attachProp, HAND_PROP_IDS } from '../../src/actors/character/props';
import { rigAvatar } from '../../src/actors/player/avatar';
import { ALBUM_CONFIG } from '../../src/config/album';
import { PHOTO_CONFIG } from '../../src/config/photo';
import { indexContent } from '../../src/content/indexContent';
import type { StandZone, Step } from '../../src/content/types';
import { EventBus } from '../../src/core/eventBus';
import { MemoryPhotoStore, newSave } from '../../src/core/save';
import {
  activeCountdownLine,
  createPhotoRunner,
  createPropHook,
  photoShots,
  resolveCountdownLines,
  selfieAimOffset,
} from '../../src/game/runtime/photoRunner';
import { createPresentationQueue } from '../../src/game/runtime/presentationQueue';
import { createStepHooks } from '../../src/game/runtime/stepHooks';
import type { DayScene } from '../../src/game/scenes/dayScene';
import type { GameView } from '../../src/game/view';
import { AlbumModel, autoPhotoKey } from '../../src/systems/album';
import { QuestEngine } from '../../src/systems/questEngine';
import { createUiStore } from '../../src/ui/game/store';
import { makeConfig, makePack } from './fixtures/pack';

function countTriangles(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.geometry) {
      const tris = m.geometry.index ? m.geometry.index.count / 3 : (m.geometry.attributes.position?.count ?? 0) / 3;
      count += tris;
    }
  });
  return count;
}

function makeRunnerHarness(opts: { flag?: Record<string, string>; step02?: Step } = {}) {
  const pack = makePack();
  pack.days[0].cameras.push({ id: 'cam.d0601.grocery', position: [0, 1.5, 4], look_at: [0, 1, 0], fov: 42 });
  if (opts.step02) pack.quests[0].steps[1] = opts.step02;
  pack.album_entries[0].snapshot = { camera_id: 'cam.d0601.desk', at_step_id: 'q_m1_main_01.s02' };
  const idx = indexContent(pack, makeConfig());
  const save = newSave('attempt-1');
  save.player_name = 'Minh';
  save.appearance.gender = 'female';
  if (opts.flag) Object.assign(save.flags, opts.flag);

  const bus = new EventBus();
  const engine = new QuestEngine({ idx, save, bus });
  engine.startDay(pack.days[0].id);
  const album = new AlbumModel({ idx, save, bus, config: ALBUM_CONFIG });
  const photos = new MemoryPhotoStore();
  const ui = createUiStore();

  const cam = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 100);
  cam.position.set(0, 1.5, 4);
  cam.lookAt(0, 1, 0);
  cam.updateMatrixWorld(true);

  const motions: (string | null)[] = [];
  const propsLog: { actor: string; prop: string | null }[] = [];
  const sceneStub = {
    scene: new THREE.Scene(),
    camera: cam,
    playerPosition: new THREE.Vector3(0, 0, 0),
    standSpot: (z: StandZone | null | undefined) => (z ? { center: z.center ?? [0, 0], y: 0, radius: z.radius } : null),
    setStandZone: vi.fn(),
    lockCamera: vi.fn(),
    cameraFor: () => cam,
    allInFrame: () => true,
    setGizmosVisible: vi.fn(),
    setPlayerMotion: (m: string | null) => { motions.push(m); },
    setActorProp: (actor: string, prop: string | null) => { propsLog.push({ actor, prop }); },
  } as unknown as DayScene;

  let captureSeq = 0;
  const view = {
    capture: vi.fn(async () => new Blob([`shot-${++captureSeq}`], { type: 'image/jpeg' })),
  } as unknown as GameView;

  const hookOrder: string[] = [];
  const stepHooks = createStepHooks([
    {
      id: 'spy',
      stage(_step, at) { hookOrder.push(`stage:${JSON.stringify(at)}`); },
      after() { hookOrder.push('after'); return true; },
    },
  ]);

  let runner!: ReturnType<typeof createPhotoRunner>;
  const queue = createPresentationQueue({
    idx, save, engine, ui,
    introId: idx.pack.hub.intro_quest_id,
    profile: () => ({ player_name: save.player_name, gender: save.appearance.gender }),
    fmt: (t) => t.replace(/\{player_name\}/g, save.player_name),
    getDayScene: () => sceneStub,
    refreshHud: vi.fn(),
    runPhoto: (s, alive) => runner.runPhoto(s, alive),
    runMinigame: async () => {},
    hooks: stepHooks,
  });

  runner = createPhotoRunner({
    idx, save, bus, engine, album, photos, view, ui, queue, style: undefined,
    getDayScene: () => sceneStub,
    getCurrentDay: () => pack.days[0],
  });

  return { pack, idx, save, bus, engine, album, photos, ui, queue, runner, sceneStub, view, motions, propsLog, hookOrder };
}

describe('photoRunner (R-B3) — bỏ MULTI_SHOT hardcode, shot_prompts, countdown_lines & after_lines', () => {
  it('photoShots đọc trực tiếp s.shots (không hardcode cam.d0601.grocery)', () => {
    const base: Extract<Step, { kind: 'photo' }> = { id: 'q_m1_main_01.s07', kind: 'photo', mode: 'handheld', camera_id: 'cam.d0601.grocery', subjects: ['player'], album_entry_id: 'alb.d.g06.01.01' };
    expect(photoShots({ ...base })).toBe(1);
    expect(photoShots({ ...base, shots: 1 })).toBe(1);
    expect(photoShots({ ...base, shots: 0 })).toBe(1);
    expect(photoShots({ ...base, shots: 3 })).toBe(3);
    expect(photoShots({ ...base, mode: 'timer', shots: 3 })).toBe(1);
    expect(photoShots({ ...base, mode: 'auto', shots: 3 })).toBe(1);
  });

  it('selfieAimOffset trả [0, 0] khi 1 tấm hoặc tấm cuối, và lệch khung hợp lý cho các tấm trước', () => {
    expect(selfieAimOffset(0, 1)).toEqual([0, 0]);
    expect(selfieAimOffset(0, 3)).not.toEqual([0, 0]);
    expect(selfieAimOffset(1, 3)).not.toEqual([0, 0]);
    expect(selfieAimOffset(2, 3)).toEqual([0, 0]);
    expect(selfieAimOffset(3, 4)).toEqual([0, 0]);
  });

  it('resolveCountdownLines lọc theo flag và rải đều khi bỏ trống at_s', () => {
    const h = makeRunnerHarness({ flag: { 'm1.group_photo_style': 'gentle' } });
    const lines = [
      { speaker: 'NPC_A', text: 'Làm mặt hề!', when: { flag: 'm1.group_photo_style', equals: 'playful' }, fallback: '' },
      { speaker: 'NPC_C', text: 'Cười tự nhiên nha {player_name}.', when: { flag: 'm1.group_photo_style', equals: 'gentle' }, fallback: '' },
      { speaker: 'NPC_B', text: 'Chuẩn bị xong chưa?', at_s: 3 },
    ];
    const scheduled = resolveCountdownLines(lines, 10, { idx: h.idx, save: h.save, engine: h.engine });
    expect(scheduled).toHaveLength(2);
    expect(scheduled[0]).toMatchObject({ who: 'Hạ', text: 'Cười tự nhiên nha Minh.', at_s: 5 });
    expect(scheduled[1]).toMatchObject({ who: 'Minh Châu', text: 'Chuẩn bị xong chưa?', at_s: 3 });

    expect(activeCountdownLine(scheduled, 8)).toBeNull();
    expect(activeCountdownLine(scheduled, 5)).toEqual({ who: 'Hạ', color: scheduled[0].color, text: 'Cười tự nhiên nha Minh.' });
    expect(activeCountdownLine(scheduled, 2.5)).toEqual({ who: 'Minh Châu', color: scheduled[1].color, text: 'Chuẩn bị xong chưa?' });
  });

  it('chụp handheld nhiều lần phát shot_prompts, first_line (chỉ lượt đầu) và giữ ảnh thật', async () => {
    const h = makeRunnerHarness();
    const seenDialogues: string[] = [];
    const seenPrompts: (string | undefined)[] = [];
    const kept: unknown[] = [];
    h.bus.on('photo_kept', (e) => kept.push(e));
    const off = h.ui.subscribe((s) => {
      if (s.dialogue) seenDialogues.push(`${s.dialogue.who}: ${s.dialogue.text}`);
      if (s.photo?.phase === 'ready') seenPrompts.push(s.photo.prompt);
    });

    const step: Extract<Step, { kind: 'photo' }> = {
      id: 'q_m1_main_01.s02',
      kind: 'photo',
      mode: 'handheld',
      camera_id: 'cam.d0601.grocery',
      subjects: ['player', 'NPC_A'],
      album_entry_id: 'alb.d.g06.01.01',
      shots: 3,
      shot_prompts: ['Lần 1 cho {player_name}', 'Lần 2 chỉnh góc', 'Lần 3 chốt'],
      first_line: { speaker: 'NPC_B', text: 'Khoan! Tóc dựng kìa!' },
    };

    const done = h.runner.runPhoto(step, () => true);

    // Lần 1
    await vi.waitFor(() => expect(h.ui.get().photo?.phase).toBe('ready'));
    h.queue.signal('photo_start');
    // Câu first_line hiện sau lần 1
    await vi.waitFor(() => expect(h.ui.get().dialogue?.text).toBe('Khoan! Tóc dựng kìa!'));
    h.queue.signal('next');
    // Lần 2
    await vi.waitFor(() => expect(h.ui.get().photo?.shot?.index).toBe(2));
    h.queue.signal('photo_start');
    // Lần 3
    await vi.waitFor(() => expect(h.ui.get().photo?.shot?.index).toBe(3));
    h.queue.signal('photo_start');
    // Chọn tấm 1 rồi giữ
    await vi.waitFor(() => expect(h.ui.get().photo?.phase).toBe('pick'));
    h.runner.pick(1);
    h.queue.signal('photo_decide', 'keep');
    await done;
    off();

    expect(seenPrompts).toEqual(['Lần 1 cho Minh', 'Lần 2 chỉnh góc', 'Lần 3 chốt']);
    expect(seenDialogues).toEqual(['Minh Châu: Khoan! Tóc dựng kìa!']);
    expect(kept).toHaveLength(1);
    const resolved = await h.album.resolvePhoto('alb.d.g06.01.01', h.photos);
    expect(resolved?.key).toMatch(/^ph_/);
    expect(resolved?.key).not.toBe(autoPhotoKey('alb.d.g06.01.01'));
  });

  it('hẹn giờ 10s với hide_pose, countdown_lines, after_lines lọc flag và gọi hooks.stage(end)/after trước complete', async () => {
    const step: Extract<Step, { kind: 'photo' }> = {
      id: 'q_m1_main_01.s02',
      kind: 'photo',
      mode: 'timer',
      camera_id: 'cam.d0601.desk',
      subjects: ['player', 'NPC_A'],
      album_entry_id: 'alb.d.g06.01.01',
      stand_zone: { center: [0, 0], radius: 1.5 },
      prompt: 'Cầu vồng còn đó, {player_name} bấm hẹn giờ đi',
      hide_pose: true,
      stage: [{ cue: 'prop', actor: 'player', prop: null, at: 'end' }],
      countdown_lines: [
        { speaker: 'NPC_A', text: 'Làm mặt hề nha!', at_s: 7, when: { flag: 'm1.group_photo_style', equals: 'playful' }, fallback: '' },
        { speaker: 'NPC_B', text: 'Nghiêm trang nào.', at_s: 7, when: { flag: 'm1.group_photo_style', equals: 'deep' }, fallback: '' },
      ],
      after_lines: [
        { speaker: 'NPC_A', text: 'Chưa kịp làm mặt hề!', when: { flag: 'm1.group_photo_style', equals: 'playful' }, fallback: '' },
        { speaker: 'NPC_B', text: 'Đúng kiểu ảnh thẻ.', when: { flag: 'm1.group_photo_style', equals: 'deep' }, fallback: '' },
      ],
    };
    const h = makeRunnerHarness({ flag: { 'm1.group_photo_style': 'playful' }, step02: step });
    h.engine.trigger('interact', 'NPC_A');
    h.engine.complete(h.pack.quests[0].steps[0].id); // tới bước s02 để engine.complete(s02) phát step_completed
    const completeSpy = vi.spyOn(h.engine, 'complete');
    const seenAfter: string[] = [];
    const off = h.ui.subscribe((s) => { if (s.dialogue) seenAfter.push(s.dialogue.text); });

    const done = h.runner.runPhoto(step, () => true);
    await vi.waitFor(() => expect(h.ui.get().photo?.phase).toBe('ready'));
    expect(h.ui.get().photo?.prompt).toBe('Cầu vồng còn đó, Minh bấm hẹn giờ đi');
    expect(h.ui.get().photo?.hidePose).toBe(true);

    h.queue.signal('photo_start');
    await vi.waitFor(() => expect(h.ui.get().photo?.phase).toBe('countdown'));
    // Khi hidePose = true, bấm pose() không ép pose_peace
    h.runner.pose();
    expect(h.ui.get().photo?.posed).toBe(false);
    expect(h.motions).not.toContain('pose_peace');

    // Chạy ticker 4s (còn 6s <= 7s) → hiện thoại chen lọc đúng theo flag 'playful'
    h.queue.runTickers(4);
    expect(h.ui.get().photo?.countdownLine).toMatchObject({ who: 'Đức', text: 'Làm mặt hề nha!' });

    // Hết giờ đếm ngược → preview → giữ ảnh
    h.queue.runTickers(PHOTO_CONFIG.timer_seconds);
    await vi.waitFor(() => expect(h.ui.get().photo?.phase).toBe('preview'));
    h.queue.signal('photo_decide', 'keep');

    // Sau giữ ảnh phát after_lines lọc theo flag, rồi mới stage('end'), after, complete
    await vi.waitFor(() => expect(h.ui.get().dialogue?.text).toBe('Chưa kịp làm mặt hề!'));
    expect(completeSpy).not.toHaveBeenCalled();
    h.queue.signal('next');
    await done;
    off();

    expect(seenAfter).toEqual(['Chưa kịp làm mặt hề!']);
    expect(h.hookOrder).toEqual(['stage:"end"', 'after']);
    expect(completeSpy).toHaveBeenCalledWith(step.id);

    // Ảnh thật người chơi vừa chụp phải được ưu tiên hơn auto_snapshot sau step_completed
    await vi.waitFor(async () => expect(await h.photos.get(autoPhotoKey('alb.d.g06.01.01'))).not.toBeNull());
    const resolved = await h.album.resolvePhoto('alb.d.g06.01.01', h.photos);
    expect(resolved?.key).toMatch(/^ph_/);
    expect(resolved?.key).not.toBe(autoPhotoKey('alb.d.g06.01.01'));
  });
});

describe('đạo cụ cầm tay động & cue prop (R-B3)', () => {
  it('attachProp và rig.setProp gắn đủ mọi đạo cụ mới trong ngân sách tam giác và gỡ sạch về tay không', () => {
    const expectedIds = [
      'prop.notebook', 'prop.shuttle', 'prop.paper_boat', 'prop.paper_stack',
      'prop.red_pen', 'prop.rulebook', 'prop.base_sign', 'prop.camera',
    ];
    for (const id of expectedIds) expect(HAND_PROP_IDS).toContain(id);

    const rig = buildCharacter('chau', 6);
    const baseHold = rig.armR.userData.holdIn as number;
    expect(baseHold).toBeGreaterThan(0);

    for (const id of expectedIds) {
      const attached = attachProp(buildCharacter('duc', 6), id);
      expect(attached, `attachProp(${id})`).not.toBeNull();
      expect(countTriangles(attached!)).toBeLessThanOrEqual(300);

      const dyn = rig.setProp(id);
      expect(dyn, `setProp(${id})`).not.toBeNull();
      expect(rig.handPropSlot.children).toHaveLength(1);
      expect(rig.root.userData.currentProp).toBe(id);
    }

    // Gỡ tay không → slot trống, khôi phục holdIn ban đầu
    expect(rig.setProp(null)).toBeNull();
    expect(rig.handPropSlot.children).toHaveLength(0);
    expect(rig.root.userData.currentProp).toBeNull();
    expect(rig.armR.userData.holdIn).toBe(baseHold);

    // Avatar.setProp nối xuống rig.setProp
    const avatar = rigAvatar(rig);
    avatar.setProp?.('prop.camera');
    expect(rig.root.userData.currentProp).toBe('prop.camera');
    avatar.setProp?.(null);
    expect(rig.handPropSlot.children).toHaveLength(0);
  });

  it('createPropHook thực thi cue prop tại start, line và end (trao máy ảnh Đức ↔ player)', async () => {
    const calls: { actor: string; prop: string | null }[] = [];
    const scene = { setActorProp: (actor: string, prop: string | null) => calls.push({ actor, prop }) } as unknown as DayScene;
    const hooks = createStepHooks([createPropHook(() => scene)]);
    const step: Step = {
      id: 'q_m1_main_01.s01',
      kind: 'talk',
      with: 'NPC_A',
      lines: [{ speaker: 'NPC_A', text: 'Cầm máy đi!' }],
      stage: [
        { cue: 'prop', actor: 'NPC_A', prop: 'prop.camera' },
        { cue: 'prop', actor: 'NPC_A', prop: null, at: { line: 0 } },
        { cue: 'prop', actor: 'player', prop: 'prop.camera', at: { line: 0 } },
        { cue: 'prop', actor: 'player', prop: null, at: 'end' },
      ],
    };

    await hooks.stage(step, 'start');
    await hooks.stage(step, { line: 0 });
    await hooks.stage(step, 'end');
    expect(calls).toEqual([
      { actor: 'NPC_A', prop: 'prop.camera' },
      { actor: 'NPC_A', prop: null },
      { actor: 'player', prop: 'prop.camera' },
      { actor: 'player', prop: null },
    ]);
  });
});
