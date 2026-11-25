/**
 * Điều phối chụp ảnh trong Ngày ký ức: đếm ngược, tự sướng nhiều tấm, chọn/chụp lại,
 * cache URL ảnh từ IndexedDB và máy ảnh ảo tự chụp dự phòng khi bước hoàn thành.
 */
import { CRITERIA_LABELS, PHOTO_CONFIG, photoQuality } from '../../config/photo';
import type { ContentIndex } from '../../content/indexContent';
import type { AlbumEntry, DialogueLine, MemoryDay, Step } from '../../content/types';
import type { EventBus, PhotoCriteria } from '../../core/eventBus';
import type { PhotoStore, SaveState } from '../../core/save';
import type { ArtStyle } from '../../render/style';
import { AlbumModel, autoPhotoKey } from '../../systems/album';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiStore } from '../../ui/game/store';
import { buildDayScene, type DayScene } from '../scenes/dayScene';
import type { GameView } from '../view';
import { CANCEL, type PresentationQueue } from './presentationQueue';

/**
 * Ảnh cầm tay chụp nhiều lần rồi chọn 1 (N-14 · kịch bản Trang 1 cảnh B Bước 2: "Có ba lần chụp… chọn một tấm để giữ").
 * Bước ảnh khai `shots` thì dùng `shots`; chưa khai thì lấy mặc định theo máy ảnh ở đây (tới khi dữ liệu Trang có `shots: 3` — N-01).
 * `first_line`: câu sau lần chụp đầu (nguyên văn kịch bản; NPC_B = Châu theo cast A).
 */
const MULTI_SHOT: Record<string, { shots: number; first_line?: DialogueLine }> = {
  'cam.d0601.grocery': { shots: 3, first_line: { speaker: 'NPC_B', text: 'Khoan! Đức, tóc ông dựng kìa!' } },
};
/** Máy quay ngược nên khung lệch: [ngửa lên, xoay ngang] (độ) cho từng lần — lần 1 chỉ thấy trán, lần 2 lệch nhẹ, lần 3 đúng khung. */
const SELFIE_AIM: [number, number][] = [[14, 9], [5, -4], [0, 0]];

export function photoShots(s: Extract<Step, { kind: 'photo' }>): number {
  if (s.mode !== 'handheld') return 1;
  const n = Math.floor(s.shots ?? MULTI_SHOT[s.camera_id]?.shots ?? 1);
  return Number.isFinite(n) && n > 1 ? n : 1;
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

  async function runPhoto(s: Extract<Step, { kind: 'photo' }>, alive: () => boolean): Promise<void> {
    const scene = getDayScene(), day = getCurrentDay();
    const point = day?.cameras.find((c) => c.id === s.camera_id);
    if (!scene || !point) { engine.complete(s.id); return; }
    const cam = scene.cameraFor(point);
    if (!cam) { engine.complete(s.id); return; }        // bản đồ thiếu marker máy ảnh: không chặn quest
    const spot = scene.standSpot(s.stand_zone);
    const base = { mode: s.mode, url: null, marks: [], score: 0, display: PHOTO_CONFIG.quality_display, posed: false } as const;
    const marksOf = (c: PhotoCriteria) => (Object.keys(CRITERIA_LABELS) as (keyof PhotoCriteria)[]).map((k) => ({ label: CRITERIA_LABELS[k], ok: c[k] }));
    // Chụp nhiều lần (N-14): mỗi lần lệch khung theo SELFIE_AIM, xong cả loạt thì người chơi chọn 1 tấm.
    const total = photoShots(s);
    const firstLine = total > 1 ? MULTI_SHOT[s.camera_id]?.first_line : undefined;
    const aimed = (n: number) => {
      const [pitch, yaw] = SELFIE_AIM[n] ?? [0, 0];
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
        if (s.mode !== 'auto') {
          scene.setStandZone(spot);
          scene.lockCamera(point);                          // khung ngắm: nhìn qua máy ảnh đặt sẵn
          ui.set({ photo: { ...base, ...shotNo, marks: [], phase: 'ready', seconds: s.mode === 'timer' ? PHOTO_CONFIG.timer_seconds : 0 } });
          const started = await queue.wait('photo_start');
          scene.lockCamera(null);                           // hẹn giờ: về góc thứ ba để chạy vào vòng sáng
          if (started === CANCEL || !alive()) return;
          if (s.mode === 'timer') {
            let left = PHOTO_CONFIG.timer_seconds;
            ui.set({ photo: { ...base, marks: [], phase: 'countdown', seconds: left } });
            const done = queue.wait('photo_shutter');
            const tick = (dt: number) => {
              const before = Math.ceil(left); left -= dt;
              const cur = ui.get().photo;
              if (cur && (Math.ceil(left) !== before || cur.posed !== photoPosed)) ui.set({ photo: { ...cur, seconds: left, posed: photoPosed } });
              if (left <= 0) { queue.deleteTicker(tick); queue.signal('photo_shutter'); }
            };
            queue.addTicker(tick);
            if ((await done) === CANCEL || !alive()) return;
          }
        }
        const shotCam = aimed(n);
        const criteria: PhotoCriteria = {
          all_in_frame: scene.allInFrame(shotCam, s.subjects),
          player_in_zone: spot ? Math.hypot(scene.playerPosition.x - spot.center[0], scene.playerPosition.z - spot.center[1]) <= spot.radius : true,
          posed_in_time: s.mode === 'timer' ? photoPosed : true,
        };
        scene.setGizmosVisible(false);
        const shot = view.capture(scene.scene, shotCam, PHOTO_CONFIG.jpeg);
        scene.setGizmosVisible(true);
        const blob = await shot;
        if (!alive()) return;
        bus.emit('photo_attempt', { step_id: s.id, mode: s.mode, retry_index: retry, ...criteria });
        takes.push({ blob, criteria });
        if (n === 0 && retry === 0 && firstLine) {         // lần 1 lệch khung → câu của Châu (chỉ ở lượt chụp đầu)
          ui.set({ photo: null });
          if (!(await queue.playLines([firstLine]))) return;
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
      void shot.then((blob) => photos.put(autoPhotoKey(entry.id), blob)).then(() => { photoUrls.delete(entry.id); }).catch(() => undefined);
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
    if (p?.phase === 'countdown' && !photoPosed) {
      photoPosed = true;
      getDayScene()?.setPlayerMotion('pose_peace');
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
