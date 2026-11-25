/**
 * Điều khiển phòng 2026 (Hub): cảnh 3D phòng trọ, Hộp Kỷ Vật, Album, Điện thoại,
 * chuỗi Present-day Event (`hubSettle`/`presentPde`) và tương tác gần/chuột ở Hub.
 */
import { HUB_CONFIG } from '../../config/hub';
import { HUB_BOX_HINTS, HUB_BOX_LINES, HUB_DECOR } from '../../config/hubRoom';
import type { ContentIndex } from '../../content/indexContent';
import type { AlbumEntry, DialogueLine } from '../../content/types';
import type { EventBus } from '../../core/eventBus';
import type { SaveState } from '../../core/save';
import type { AlbumModel } from '../../systems/album';
import type { PlayerProfile } from '../../systems/dialogue';
import type { GameFlow } from '../../systems/gameFlow';
import type { HubModel, PdePresentation } from '../../systems/hub';
import type { QuestEngine } from '../../systems/questEngine';
import type { UiState, UiStore } from '../../ui/game/store';
import type { GameInput } from '../input';
import { buildHubScene, type BoxItemView, type HubScene } from '../scenes/hubScene';
import type { GameView } from '../view';
import type { PhotoRunner } from './photoRunner';
import type { PresentationQueue } from './presentationQueue';
import { albumView, boxView, phoneView } from './uiAdapters';

export interface HubControllerDeps {
  idx: ContentIndex;
  save: SaveState;
  bus: EventBus;
  engine: QuestEngine;
  album: AlbumModel;
  hub: HubModel;
  flow: GameFlow;
  ui: UiStore;
  input: GameInput;
  view: GameView;
  queue: PresentationQueue;
  photo: PhotoRunner;
  introId: string;
  introDone: () => boolean;
  profile: () => PlayerProfile;
  fmt: (text: string) => string;
  setPrompt: (id: string | null, prompt: UiState['prompt']) => void;
  refreshHud: () => void;
  goDay: (dayId: string, replay: boolean, resume: boolean) => Promise<void>;
}

export function createHubController(deps: HubControllerDeps) {
  const {
    idx, save, bus, engine, album, hub, flow, ui, input, view, queue, photo,
    introId, introDone, profile, fmt, setPrompt, refreshHud, goDay,
  } = deps;

  let hubScene: HubScene | null = null;
  const flipped = new Set<string>();
  let phoneThread: string | null = null;
  let phoneDraft: string | null = null;
  // phòng 2026: con trỏ chuột (nhìn theo), vật dưới con trỏ trong tầm với, đang trình diễn một món trong hộp,
  // đã nói câu "mở hộp" trong lượt về phòng này chưa
  let hubCursor: { x: number; y: number } | null = null;
  let hubMouseHover: string | null = null;
  let boxBusy = false;
  let boxLinesSaid = false;

  const firstArtifactId = () => idx.artifactOfDay(idx.releaseDays[0]?.id ?? '')?.id ?? null;
  /** Lần đầu = kỷ vật của Trang đầu tiên đang sáng (chưa chơi Trang 1): chỉ món đó bấm được. */
  const boxFirstTime = () => { const id = firstArtifactId(); return !!id && hub.canOpen(id) === 'first'; };

  /** Các món đang nằm trong hộp: kỷ vật chưa lên kệ (theo thứ tự Trang) + đồ linh tinh. */
  function boxItems(): (BoxItemView & { clickable: boolean; name: string })[] {
    const first = boxFirstTime();
    const arts = hub.compartments().filter((c) => c.open).flatMap((c) => c.artifacts)
      .filter((x) => x.state === 'glowing' || x.state === 'dim')
      .map(({ artifact, state }) => ({
        id: artifact.id,
        kind: 'artifact' as const,
        shape: artifact.shape ?? 'box',
        name: fmt(artifact.name),
        state: state === 'glowing' ? 'glow' as const : 'dim' as const,
        clickable: state === 'glowing' || !first,                       // lần đầu: món mờ không bấm được
      }));
    const decor = HUB_DECOR.map((d) => ({ id: d.id, kind: 'decor' as const, shape: d.shape, name: d.name, state: 'normal' as const, clickable: !first }));
    return [...arts, ...decor];
  }

  function refreshBox() {
    if (ui.get().panel !== 'box3d') return;
    const first = boxFirstTime();
    ui.set({ boxView: { hint: first ? HUB_BOX_HINTS.first : HUB_BOX_HINTS.normal, hover: ui.get().boxView?.hover ?? null, first } });
  }

  function refreshHubScene() {
    if (!hubScene) return;
    hubScene.setLighting(hub.lightingPreset());
    hubScene.setShelf(hub.shelf());
    hubScene.setBoxItems(boxItems());
  }

  /** Nói vài câu khi đang nhìn vào hộp (không chuyển cảnh). */
  async function sayBox(lines: DialogueLine[]): Promise<boolean> {
    boxBusy = true;
    try { return await queue.playLines(lines); } finally { boxBusy = false; }
  }

  function currentAlbumView() {
    return albumView({ idx, album, photoUrls: photo.photoUrls, flipped, fmt });
  }

  function currentPhoneView() {
    return phoneView({ idx, hub, engine, phoneThread, phoneDraft, profile: profile(), fmt });
  }

  function loadAlbumPhotos() {
    const todo = new Map<string, AlbumEntry>();
    for (const p of album.pages()) for (const { entry, owned } of p.entries) {
      if (!owned || photo.photoUrls.has(entry.id) || (entry.slot_type !== 'main_photo' && entry.slot_type !== 'free_photo')) continue;
      todo.set(entry.id, entry);
    }
    // Ô bìa (đã kiểm owned + ô ảnh trong coverEntryId) có thể không nằm trên trang nào của bản phát hành.
    const coverId = album.coverEntryId(), cover = coverId ? idx.entries.get(coverId) : undefined;
    if (cover && !photo.photoUrls.has(cover.id)) todo.set(cover.id, cover);
    for (const entry of todo.values()) void photo.photoUrl(entry).then(() => { if (ui.get().panel === 'album') ui.set({ album: currentAlbumView() }); });
  }

  function refreshPanels() {
    const p = ui.get().panel;
    if (p === 'box') ui.set({ box: boxView({ hub, fmt }) });
    if (p === 'box3d') { refreshBox(); hubScene?.setBoxItems(boxItems()); }
    if (p === 'album') { ui.set({ album: currentAlbumView() }); loadAlbumPhotos(); }
    if (p === 'phone') ui.set({ phone: currentPhoneView() });
  }

  function presentPde(p: PdePresentation): Promise<boolean> {
    switch (p.kind) {
      case 'album_restore': return queue.notice('Album', `Trang "${fmt(idx.dayOfPage(p.page_id)?.title ?? p.page_id)}" hiện rõ trở lại.`, 'album_restore');
      case 'shelf': return queue.notice('Kệ', `${fmt(idx.artifacts.get(p.artifact_id)?.name ?? p.artifact_id)} được đặt lên kệ.`);
      case 'fragment': return (async () => (await queue.notice('Hộp Kỷ Vật', 'Một mảnh ký ức mới hiện ra trong Hộp.')) && queue.playLines(p.recall))();
      case 'contact': return queue.notice('Điện thoại', fmt(idx.quests.get(p.quest_id)?.title ?? 'Có một việc mới ở điện thoại.'));
      case 'reply': return queue.notice('Điện thoại', 'Có tin nhắn mới.');
    }
  }

  /** Việc ở Hub sau mỗi thay đổi: trình diễn bước đang chờ → chạy Present-day Event → màn kết bản thử (nếu tới). */
  async function hubSettle(): Promise<void> {
    if (engine.context?.kind !== 'hub') return;
    const ep = queue.getEpoch();
    for (let i = 0; i < 6; i++) {
      await queue.drain();
      if (ep !== queue.getEpoch()) return;
      if (flow.state === 'hub_intro' && introDone()) flow.dispatch('intro_done');
      hub.refresh();
      const shown = hub.runPdes();
      if (!shown.length) break;
      refreshHubScene();
      for (const p of shown) { if (!(await presentPde(p)) || ep !== queue.getEpoch()) return; }
    }
    refreshHubScene(); refreshPanels(); refreshHud();
    if (save.public_demo_done && !save.flags['hub.demo_end_seen']) {
      // Hoàn thành đã được ghi (public_demo_completed) TRƯỚC khi màn kết và form hiện ra.
      ui.set({ panel: null });
      if (!(await queue.playLines(idx.pack.hub.demo_end_lines)) || ep !== queue.getEpoch()) return;
      save.flags['hub.demo_end_seen'] = true;
      bus.emit('save_requested', { reason: 'demo_end_seen' });
      ui.set({ feedback: true });
      bus.emit('feedback_shown', { placement: 'demo_end' });
    }
  }

  function mount() {
    const first = !save.quests[introId];
    engine.enterHub();
    hub.refresh();
    input.setLookMode('drag');                           // phòng 2026: nhìn theo con trỏ (không kéo, không khóa chuột)
    hubCursor = null; hubMouseHover = null; boxBusy = false; boxLinesSaid = false;
    hubScene = buildHubScene(idx.pack.hub, HUB_CONFIG);
    refreshHubScene();
    view.setScene(hubScene.scene, hubScene.camera);
    ui.set({ mode: 'hub', inReplay: false, canEndDay: false, panel: null, dayEnd: null, fade: { on: false, label: '' } });
    bus.emit('hub_entered', { first });
    if (flow.state === 'to_hub') flow.dispatch('scene_ready');
    void queue.enqueue(hubSettle);
  }

  function dispose() {
    hubScene?.dispose();
    hubScene = null;
  }

  const hubLabel = (id: string | null) => (id ? idx.pack.hub.interactables.find((i) => i.id === id)?.label ?? null : null);

  /** Mỗi khung hình: vật trong tầm với + đang nhìn về phía nó → gợi ý "E"; vật dưới con trỏ (trong tầm) được ưu tiên. */
  function hubProximity() {
    if (!hubScene || engine.context?.kind !== 'hub' || ui.get().panel === 'box3d') return;
    const id = queue.locked() ? null : hubMouseHover ?? hubScene.nearest();
    hubScene.setHover(id);
    const label = hubLabel(id);
    setPrompt(id, label ? { key: 'E', text: label } : null);
  }

  function hubClick(id: string, openPanel: (p: NonNullable<UiState['panel']>) => void) {
    if (queue.locked() || engine.context?.kind !== 'hub') return;
    const r = engine.trigger('interact', id);
    if (r) { hub.refresh(); void queue.enqueue(hubSettle); }
    if (!introDone()) return;
    if (id === 'itr.hub.memory_box') openPanel('box3d');
    else if (id === 'itr.hub.shelf') openPanel('box');           // kệ: danh sách kỷ vật đã xong, xem lại ký ức
    else if (id === 'itr.hub.album') openPanel('album');
    else if (id === 'itr.hub.phone') openPanel('phone');
  }

  function interact(openPanel: (p: NonNullable<UiState['panel']>) => void) {
    if (queue.locked() || !hubScene) return;
    const id = hubMouseHover ?? hubScene.nearest();
    if (id) hubClick(id, openPanel);
  }

  function openArtifact(id: string) {
    if (flow.state !== 'hub_idle') return;
    const r = hub.openArtifact(id);
    if (!r) return;
    flow.dispatch('open_day');
    void goDay(r.day_id, r.replay, false);
  }

  function boxPick(id: string) {
    const s = ui.get();
    if (s.panel !== 'box3d' || s.dialogue || s.notice || s.choice || s.fade.on || boxBusy) return;
    const item = boxItems().find((x) => x.id === id);
    if (!item?.clickable) return;                                       // lần đầu: chỉ mẩu giấy mật lệnh bấm được
    if (item.kind === 'decor') { const d = HUB_DECOR.find((x) => x.id === id); if (d) void queue.enqueue(async () => { await sayBox(d.lines); }); return; }
    if (!hub.canOpen(id)) { void queue.enqueue(async () => { await sayBox(HUB_BOX_LINES.locked); }); return; }   // chưa tới lượt: chỉ nói, không chuyển cảnh
    if (flow.state !== 'hub_idle') return;
    // Kỷ vật đang sáng: Player nói câu móc (hook_2026) rồi về quá khứ — cùng một đường với trước đây (hub.openArtifact → goDay).
    const art = idx.artifacts.get(id);
    const introLines = idx.quests.get(introId)?.steps.flatMap((st) => (st.kind === 'cutscene' ? st.lines.map((l) => l.text) : [])) ?? [];
    const hook = art?.hook_2026 && !introLines.includes(art.hook_2026) ? [{ speaker: 'player', text: art.hook_2026 }] : [];
    boxBusy = true;
    void queue.enqueue(async () => {
      const ok = await sayBox(hook);
      boxBusy = true;
      if (!ok || engine.context?.kind !== 'hub') { boxBusy = false; return; }
      ui.set({ panel: null, boxView: null });
      hubScene?.setBoxOpen(false);
      boxBusy = false;
      openArtifact(id);
    });
  }

  function onOpenPanel(p: NonNullable<UiState['panel']>) {
    if (p === 'box') hub.refresh();
    if (p === 'album') album.markViewed();
    if (p === 'phone') { phoneThread = null; phoneDraft = null; }
    hubScene?.setBoxOpen(p === 'box3d');
    if (p === 'box3d') {
      hubMouseHover = null;
      hubScene?.setBoxItems(boxItems());
      ui.set({ boxView: { hint: '', hover: null, first: false } });
      if (!boxLinesSaid) {
        boxLinesSaid = true;
        const lines = boxFirstTime() ? HUB_BOX_LINES.open_first : HUB_BOX_LINES.open_again;
        void queue.enqueue(async () => { if (ui.get().panel === 'box3d') await sayBox(lines); });
      }
    }
    refreshPanels();
  }

  function onClosePanel() {
    hubScene?.setBoxOpen(false);
  }

  function albumFlip(pageId: string) {
    if (flipped.has(pageId)) flipped.delete(pageId);
    else {
      flipped.add(pageId);
      const back = album.pages().find((p) => p.page_id === pageId)?.entries.find((e) => e.entry.slot_type === 'back_note' && e.owned);
      if (back) album.markBackViewed(back.entry.id);
    }
    refreshPanels();
  }

  function albumSelect(entryId: string, index: number) {
    if (!album.selectVariant(entryId, index)) return;
    photo.revokeUrl(entryId);
    bus.emit('save_requested', { reason: 'album_select' });
    refreshPanels();
  }

  function phoneOpenThread(id: string | null) {
    phoneThread = id; phoneDraft = null;
    if (id) {
      const step = engine.activeSteps().map((r) => r.step).find((s) => s.kind === 'phone_ui' && (!s.thread_id || s.thread_id === id));
      if (step && engine.complete(step.id)) void queue.enqueue(hubSettle);
    }
    refreshPanels();
  }

  function phonePick(id: string) { phoneDraft = id; refreshPanels(); }
  function phoneErase() { phoneDraft = null; refreshPanels(); }
  function phoneSend() {
    const step = engine.activeSteps().map((r) => r.step).find((s) => s.kind === 'compose_message' && s.thread_id === phoneThread);
    if (!step || !phoneDraft) return;
    const ok = engine.complete(step.id, { option_id: phoneDraft });
    phoneDraft = null;
    refreshPanels();
    if (ok) void queue.enqueue(hubSettle);
  }

  function handlePointer(kind: 'move' | 'click', x: number, y: number, onInteract: () => void): boolean {
    if (!hubScene || engine.context?.kind !== 'hub') return false;
    const s = ui.get();
    if (s.panel === 'box3d') {
      // cận cảnh hộp: rê chuột lên món nào thì món đó sáng + hiện tên; bấm để chọn
      const busy = !!(s.dialogue || s.notice || s.choice || s.fade.on) || boxBusy;
      const id = busy ? null : hubScene.pick(x, y);
      const item = id ? boxItems().find((i) => i.id === id && i.clickable) ?? null : null;
      hubScene.setHover(item?.id ?? null);
      if ((item?.name ?? null) !== (s.boxView?.hover ?? null) && s.boxView) ui.set({ boxView: { ...s.boxView, hover: item?.name ?? null } });
      if (kind === 'click' && item) boxPick(item.id);
      return true;
    }
    if (kind === 'move' && input.device !== 'touch') hubCursor = { x, y };
    // đi lại trong phòng: vật dưới con trỏ chỉ tính khi đứng đủ gần; bấm chuột = tương tác (vật dưới con trỏ, hoặc vật gần nhất)
    const id = queue.locked() ? null : hubScene.pick(x, y);
    hubMouseHover = id && hubScene.reachable(id) ? id : null;
    if (kind === 'click') onInteract();
    return true;
  }

  function tick(dt: number, t: number, moveIntent: () => { forward: number; strafe: number; run: boolean }) {
    if (!hubScene) return;
    const free = !queue.locked();
    const drag = input.takeLook();                    // luôn đọc để chuyển động lúc đang khóa không dồn lại
    const touch = input.device === 'touch';
    hubScene.update(dt, t, { move: free ? moveIntent() : null, cursor: free && !touch ? hubCursor : null, drag: free && touch ? drag : null });
    hubProximity();
  }

  return {
    mount,
    dispose,
    hubSettle,
    boxItems,
    boxPick,
    sayBox,
    hubProximity,
    hubClick,
    interact,
    openArtifact,
    onOpenPanel,
    onClosePanel,
    refreshPanels,
    albumFlip,
    albumSelect,
    phoneOpenThread,
    phonePick,
    phoneErase,
    phoneSend,
    handlePointer,
    tick,
    hubPoint: (container: HTMLElement, id: string) => {
      const p = hubScene?.screenPoint(id);
      if (!p) return null;
      const r = container.getBoundingClientRect();
      return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
    },
    hubView: () => (hubScene && engine.context?.kind === 'hub'
      ? {
        player: hubScene.player,
        nearest: hubScene.nearest(),
        boxOpen: hubScene.boxOpen,
        boxBlend: hubScene.boxBlend,
        items: boxItems().map(({ id, kind, shape, state, clickable }) => ({ id, kind, shape, state, clickable })),
      }
      : null),
    hubTeleport: (x: number, z: number, yaw?: number) => {
      if (!hubScene) return false;
      hubScene.teleport(x, z, yaw);
      return true;
    },
    hubPick: (container: HTMLElement, px: number, py: number) => {
      if (!hubScene) return null;
      const r = container.getBoundingClientRect();
      return hubScene.pick(((px - r.left) / r.width) * 2 - 1, -(((py - r.top) / r.height) * 2 - 1));
    },
  };
}

export type HubController = ReturnType<typeof createHubController>;
