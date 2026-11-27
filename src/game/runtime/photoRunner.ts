/**
 * Điều phối chụp ảnh trong Ngày ký ức: đếm ngược, tự sướng nhiều tấm, chọn/chụp lại,
 * cache URL ảnh từ IndexedDB và máy ảnh ảo tự chụp dự phòng khi bước hoàn thành.
 */
import { CRITERIA_LABELS, PHOTO_CONFIG, photoQuality } from '../../config/photo';
import type { ContentIndex } from '../../content/indexContent';
import type { AlbumEntry, CountdownLine, MemoryDay, StageAt, Step } from '../../content/types';
import type { EventBus, PhotoCriteria } from '../../core/eventBus';
import type { PhotoStore, SaveState } from '../../core/save';
import type { ArtStyle } from '../../render/style';
import { AlbumModel, autoPhotoKey } from '../../systems/album';
import { resolveLines, speakerName } from '../../systems/dialogue';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiStore } from '../../ui/game/store';
import { buildDayScene, type DayScene } from '../scenes/dayScene';
import type { GameView } from '../view';
import { CANCEL, type PresentationQueue } from './presentationQueue';
import type { StepHookPart } from './stepHooks';
import { formatGameText } from './uiAdapters';

/** Máy quay ngược nên khung lệch: [ngửa lên, xoay ngang] (độ) cho các lần trước tấm cuối. */
const SELFIE_OFFSETS: [number, number][] = [[14, 9], [5, -4], [-4, 6], [8, -7]];

export function selfieAimOffset(n: number, total: number): [number, number] {
  if (total <= 1 || n >= total - 1) return [0, 0];
  return SELFIE_OFFSETS[n % SELFIE_OFFSETS.length];
}

export function photoShots(s: Extract<Step, { kind: 'photo' }>): number {
  if (s.mode !== 'handheld') return 1;
  const n = Math.floor(s.shots ?? 1);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

export interface ScheduledCountdownLine {
  who: string;
  color: string;
  text: string;
  at_s: number;
}

/** Lọc `countdown_lines` theo điều kiện hiện tại và gán mốc `at_s` (tự rải đều nếu bỏ trống). */
export function resolveCountdownLines(
  lines: CountdownLine[] | undefined,
  timerSeconds: number,
  deps: { idx: ContentIndex; save: SaveState; engine: QuestEngine },
): ScheduledCountdownLine[] {
  if (!lines?.length) return [];
  const { idx, save, engine } = deps;
  const profile = { player_name: save.player_name, gender: save.appearance.gender };
  const resolved: { who: string; color: string; text: string; at_s?: number }[] = [];
  for (const line of lines) {
    const r = resolveLines([line], engine.conditions)[0];
    if (!r) continue;
    const chr = idx.resolveActor(r.speaker);
    resolved.push({
      who: speakerName(r.speaker, idx, profile),
      color: chr?.ui_color ?? '#3a2c26',
      text: formatGameText(r.text, save),
      at_s: line.at_s,
    });
  }
  const unscheduled = resolved.filter((l) => l.at_s === undefined).length;
  let uIdx = 0;
  return resolved
    .map((l, idxOrder) => ({
      who: l.who,
      color: l.color,
      text: l.text,
      at_s: l.at_s !== undefined ? l.at_s : (timerSeconds * (unscheduled - uIdx++)) / (unscheduled + 1),
      idxOrder,
    }))
    .sort((a, b) => (b.at_s !== a.at_s ? b.at_s - a.at_s : a.idxOrder - b.idxOrder))
    .map(({ who, color, text, at_s }) => ({ who, color, text, at_s }));
}

export function activeCountdownLine(
  scheduled: readonly ScheduledCountdownLine[],
  leftSeconds: number,
): { who: string; color: string; text: string } | null {
  let chosen: ScheduledCountdownLine | null = null;
  for (const item of scheduled) {
    if (leftSeconds <= item.at_s) chosen = item;
  }
  return chosen ? { who: chosen.who, color: chosen.color, text: chosen.text } : null;
}

function matchStageAt(cueAt: StageAt | undefined, at: StageAt): boolean {
  const target = cueAt ?? 'start';
  if (typeof target === 'string' || typeof at === 'string') return target === at;
  return target.line === at.line;
}

/** Điểm nối cue `'prop'` (R-B3): gắn/gỡ đạo cụ cầm tay động cho nhân vật theo `step.stage`. */
export function createPropHook(getDayScene: () => DayScene | null): StepHookPart {
  return {
    id: 'R-B3 prop',
    stage(step, at) {
      const scene = getDayScene();
      if (!scene || !step.stage?.length) return;
      for (const c of step.stage) {
        if (c.cue === 'prop' && matchStageAt(c.at, at)) {
          scene.setActorProp(c.actor, c.prop);
        }
      }
    },
  };
}

export interface PhotoRunnerDeps {
  idx: ContentIndex;
  save: SaveState;
  bus: EventBus;
  engine: QuestEngine;
  album: AlbumModel;
  photos: PhotoStore;
  view: GameView;
  ui: UiStore;
  queue: PresentationQueue;
  style: ArtStyle | undefined;
  getDayScene: () => DayScene | null;
  getCurrentDay: () => MemoryDay | null;
}

export function createPhotoRunner(deps: PhotoRunnerDeps) {
  const { idx, save, bus, engine, album, photos, view, ui, queue, style, getDayScene, getCurrentDay } = deps;
  const photoUrls = new Map<string, string>();
  let photoPosed = false;
  let photoPicked = 0;
  let activePhotoFacing: number | null = null;

  async function runPhoto(s: Extract<Step, { kind: 'photo' }>, alive: () => boolean): Promise<void> {
    const scene = getDayScene(), day = getCurrentDay();
    const point = day?.cameras.find((c) => c.id === s.camera_id);
    const cam = scene && point ? scene.cameraFor(point) : null;
    if (!scene || !point || !cam) {
      if (s.stage?.length) { await queue.hooks.stage(s, 'end'); if (!alive()) return; }
      if (!(await queue.hooks.after(s, alive))) return;
      engine.complete(s.id);
      return;
    }
    const spot = scene.standSpot(s.stand_zone);
    activePhotoFacing = spot?.facing ?? (spot ? Math.atan2(cam.position.x - spot.center[0], cam.position.z - spot.center[1]) : Math.atan2(cam.position.x - scene.playerPosition.x, cam.position.z - scene.playerPosition.z));
    const base = { mode: s.mode, url: null, marks: [], score: 0, display: PHOTO_CONFIG.quality_display, posed: false } as const;
    const marksOf = (c: PhotoCriteria) => (Object.keys(CRITERIA_LABELS) as (keyof PhotoCriteria)[]).map((k) => ({ label: CRITERIA_LABELS[k], ok: c[k] }));
    const total = photoShots(s);
    const firstLine = s.first_line;
    const hidePose = !!s.hide_pose;
    const stepPrompt = s.prompt ? formatGameText(s.prompt, save) : undefined;
    const aimed = (n: number) => {
      const [pitch, yaw] = selfieAimOffset(n, total);
      if (total === 1 || (!pitch && !yaw)) return cam;
      const c = cam.clone();
      c.rotateY((yaw * Math.PI) / 180); c.rotateX((pitch * Math.PI) / 180); c.updateMatrixWorld(true);
      return c;
    };
    for (let retry = 0; ; retry++) {
      const takes: { blob: Blob; criteria: PhotoCriteria }[] = [];
      for (let n = 0; n < total; n++) {
        photoPosed = false;
        const shotNo = total > 1 ? { shot: { index: n + 1, total } } : {};
        const rawPrompt = s.shot_prompts?.[n];
        const shotPrompt = rawPrompt ? formatGameText(rawPrompt, save) : stepPrompt;
        if (s.mode !== 'auto') {
          scene.setStandZone(spot);
          scene.lockCamera(point);                          // khung ngắm: nhìn qua máy ảnh đặt sẵn
          ui.set({
            photo: {
              ...base, ...shotNo, prompt: shotPrompt, hidePose, countdownLine: null,
              marks: [], phase: 'ready', seconds: s.mode === 'timer' ? PHOTO_CONFIG.timer_seconds : 0,
            },
          });
          const started = await queue.wait('photo_start');
          scene.lockCamera(null);                           // hẹn giờ: về góc thứ ba để chạy vào vòng sáng
          if (started === CANCEL || !alive()) return;
          if (s.mode === 'timer') {
            const scheduled = resolveCountdownLines(s.countdown_lines, PHOTO_CONFIG.timer_seconds, { idx, save, engine });
            let left = PHOTO_CONFIG.timer_seconds;
            let lastLine = activeCountdownLine(scheduled, left);
            ui.set({ photo: { ...base, prompt: stepPrompt, hidePose, countdownLine: lastLine, marks: [], phase: 'countdown', seconds: left } });
            const done = queue.wait('photo_shutter');
            const tick = (dt: number) => {
              const before = Math.ceil(left); left -= dt;
              const nextLine = activeCountdownLine(scheduled, left);
              const lineChanged = nextLine?.who !== lastLine?.who || nextLine?.text !== lastLine?.text;
              lastLine = nextLine;
              const cur = ui.get().photo;
              if (cur && (Math.ceil(left) !== before || cur.posed !== photoPosed || lineChanged)) {
                ui.set({ photo: { ...cur, seconds: left, posed: photoPosed, countdownLine: nextLine } });
              }
              if (left <= 0) { queue.deleteTicker(tick); queue.signal('photo_shutter'); }
            };
            queue.addTicker(tick);
            if ((await done) === CANCEL || !alive()) return;
          }
        }
        const shotCam = aimed(n);
        const inZone = spot ? Math.hypot(scene.playerPosition.x - spot.center[0], scene.playerPosition.z - spot.center[1]) <= spot.radius : true;
        if (s.mode === 'timer' && inZone && activePhotoFacing !== null) scene.setPlayerFacing?.(activePhotoFacing);
        const criteria: PhotoCriteria = {
          all_in_frame: scene.allInFrame(shotCam, s.subjects),
          player_in_zone: inZone,
          posed_in_time: s.mode === 'timer' && !hidePose ? photoPosed : true,
        };
        scene.setGizmosVisible(false);
        const shot = view.capture(scene.scene, shotCam, PHOTO_CONFIG.jpeg);
        scene.setGizmosVisible(true);
        const blob = await shot;
        if (!alive()) return;
        bus.emit('photo_attempt', { step_id: s.id, mode: s.mode, retry_index: retry, ...criteria });
        takes.push({ blob, criteria });
        if (n === 0 && retry === 0 && firstLine) {         // câu ngay sau lần chụp đầu (chỉ ở lượt chụp đầu)
          ui.set({ photo: null });
          if (!(await queue.playLines([firstLine])) || !alive()) return;
        }
      }
      let pick = 0;
      if (s.mode !== 'auto' && total === 1) {
        const { criteria, blob } = takes[0];
        const q = photoQuality(criteria, PHOTO_CONFIG);
        const url = URL.createObjectURL(blob);
        ui.set({ photo: { ...base, phase: 'preview', seconds: 0, url, score: q.score, display: q.display, marks: marksOf(criteria) } });
        const decide = await queue.wait<'keep' | 'retry'>('photo_decide');
        URL.revokeObjectURL(url);
        if (decide === CANCEL || !alive()) return;
        if (decide === 'retry') { scene.setPlayerMotion(null); continue; }
      } else if (total > 1) {
        // Màn chọn 1 tấm: mặc định chọn tấm cuối (đúng khung nhất); bấm tấm khác (hoặc phím 1–n) rồi "Giữ ảnh này".
        const urls = takes.map((t) => URL.createObjectURL(t.blob));
        photoPicked = total - 1;
        ui.set({
          photo: {
            ...base, marks: [], phase: 'pick', seconds: 0, picked: photoPicked,
            picks: takes.map((t, i) => ({ url: urls[i], marks: marksOf(t.criteria), score: photoQuality(t.criteria, PHOTO_CONFIG).score })),
          },
        });
        const decide = await queue.wait<'keep' | 'retry'>('photo_decide');
        urls.forEach((u) => URL.revokeObjectURL(u));
        if (decide === CANCEL || !alive()) return;
        if (decide === 'retry') { scene.setPlayerMotion(null); continue; }
        pick = Math.min(Math.max(0, photoPicked), total - 1);
      }
      // "Giữ ảnh này": hoàn thành bước — chất lượng ảnh không chặn quest.
      const keys = takes.map(() => `ph_${crypto.randomUUID()}`);
      await Promise.all(takes.map((t, i) => photos.put(keys[i], t.blob).catch(() => undefined)));
      const removed = total > 1 ? album.keepShots(s.album_entry_id, keys, pick).removed : [album.addVariant(s.album_entry_id, keys[0]).removed];
      for (const k of removed) if (k) void photos.delete(k).catch(() => undefined);
      revokeUrl(s.album_entry_id);
      bus.emit('photo_kept', { step_id: s.id, mode: s.mode, retry_index: retry, ...takes[pick].criteria });
      ui.set({ photo: null });
      if (s.after_lines?.length) {
        scene.setStandZone(null); scene.setPlayerMotion(null);
        if (!(await queue.playLines(s.after_lines)) || !alive()) return;
      }
      if (s.stage?.length) { await queue.hooks.stage(s, 'end'); if (!alive()) return; }
      if (!(await queue.hooks.after(s, alive))) return;
      engine.complete(s.id);          // ảnh tự chụp dự phòng được chụp trong lúc này (nhân vật còn đang tạo dáng)
      scene.setStandZone(null); scene.setPlayerMotion(null);
      return;
    }
  }

  // Máy ảnh ảo tự chụp ở khoảnh khắc chốt (nguồn B / ảnh dự phòng).
  bus.on('step_completed', (e) => {
    const scene = getDayScene(), day = getCurrentDay();
    if (!scene || !day) return;
    for (const entry of idx.pack.album_entries) {
      if (entry.snapshot?.at_step_id !== e.step_id) continue;
      const point = day.cameras.find((c) => c.id === entry.snapshot!.camera_id);
      const cam = point && scene.cameraFor(point);
      if (!cam) continue;
      scene.setGizmosVisible(false);
      const shot = view.capture(scene.scene, cam, PHOTO_CONFIG.jpeg);
      scene.setGizmosVisible(true);
      void shot.then((blob) => photos.put(autoPhotoKey(entry.id), blob)).then(() => {
        if (!save.album[entry.id]?.variants.length) revokeUrl(entry.id);
      }).catch(() => undefined);
    }
  });

  /** Ảnh của một ô. Nếu trong máy không còn ảnh nào (IndexedDB bị xóa) → dựng lại cảnh và chụp lại ảnh tự chụp. */
  async function photoUrl(entry: AlbumEntry): Promise<string | null> {
    const cached = photoUrls.get(entry.id);
    if (cached) return cached;
    let data = (await album.resolvePhoto(entry.id, photos))?.data ?? null;
    if (!data && entry.snapshot) {
      const day = idx.dayOfPage(entry.page_id);
      const point = day?.cameras.find((c) => c.id === entry.snapshot!.camera_id);
      if (day && point) {
        const tmp = await buildDayScene(day, idx, save.appearance.gender, { style, flag: n => engine.flag(n), stepId: entry.snapshot.at_step_id });
        const cam = tmp.cameraFor(point);
        if (cam) {
          tmp.update(0, 0, { move: null, look: null }); tmp.setGizmosVisible(false);
          data = await view.capture(tmp.scene, cam, PHOTO_CONFIG.jpeg);
          await photos.put(autoPhotoKey(entry.id), data).catch(() => undefined);
        }
        tmp.dispose();
      }
    }
    if (!data) return null;
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data as BlobPart], { type: 'image/jpeg' }));
    photoUrls.set(entry.id, url);
    return url;
  }

  function revokeUrl(entryId: string) {
    const old = photoUrls.get(entryId);
    if (old) { URL.revokeObjectURL(old); photoUrls.delete(entryId); }
  }

  function clearUrls() {
    for (const u of photoUrls.values()) URL.revokeObjectURL(u);
    photoUrls.clear();
  }

  function pose() {
    const p = ui.get().photo;
    if (p?.phase === 'countdown' && !p.hidePose && !photoPosed) {
      photoPosed = true;
      const scene = getDayScene();
      if (scene) {
        if (activePhotoFacing !== null) scene.setPlayerFacing?.(activePhotoFacing);
        scene.setPlayerMotion('pose_peace');
      }
      ui.set({ photo: { ...p, posed: true } });
    }
  }

  function pick(index: number) {
    const p = ui.get().photo;
    if (p?.phase !== 'pick' || !p.picks?.[index]) return;
    photoPicked = index;
    ui.set({ photo: { ...p, picked: index } });
  }

  return {
    photoUrls: photoUrls as ReadonlyMap<string, string>,
    runPhoto,
    photoUrl,
    revokeUrl,
    clearUrls,
    pose,
    pick,
  };
}

export type PhotoRunner = ReturnType<typeof createPhotoRunner>;
